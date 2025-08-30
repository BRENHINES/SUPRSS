from __future__ import annotations

from typing import Callable, Dict, List, Optional

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..models.import_job import FileFormat, ImportJob, ImportStatus
from ..repositories.feed import FeedRepository
from ..repositories.import_job import ImportJobRepository
from ..services.feed_service import FeedService  # tu l'as déjà
from .import_utils import parse_csv_feeds, parse_json_feeds, parse_opml_feeds

PARSERS: dict[FileFormat, Callable[[bytes], List[Dict[str, str]]]] = {
    FileFormat.OPML: parse_opml_feeds,
    FileFormat.JSON: parse_json_feeds,
    FileFormat.CSV: parse_csv_feeds,
}


class ImportService:
    def __init__(self, db: Session):
        self.db = db
        self.jobs = ImportJobRepository(db)
        self.feeds = FeedRepository(db)
        self.feed_service = FeedService(db)

    def create_job(
        self,
        *,
        user_id: int,
        filename: str,
        file_format: FileFormat,
        file_size: Optional[int],
        target_collection_id: Optional[int],
        override_existing: bool,
    ) -> ImportJob:
        if not target_collection_id:
            raise HTTPException(status_code=400, detail="target_collection_id required")
        job = self.jobs.create(
            user_id=user_id,
            filename=filename,
            file_format=file_format,
            file_size=file_size,
            target_collection_id=target_collection_id,
            override_existing=override_existing,
        )
        self.db.commit()
        self.db.refresh(job)
        return job

    # appelé en tâche de fond
    def process_bytes(self, *, job_id: int, data: bytes) -> None:
        job = self.jobs.get(job_id)
        if not job or job.status in (ImportStatus.CANCELLED, ImportStatus.COMPLETED):
            return
        self.jobs.set_processing(job)
        self.db.commit()

        try:
            parser = PARSERS.get(job.file_format)
            if not parser:
                raise ValueError(f"Unsupported format: {job.file_format}")
            items = parser(data)  # [{"title","url"}, ...]
            total = len(items)

            imported = failed = skipped = 0
            # **boucle d’import**
            for it in items:
                url = (it["url"] or "").strip()
                title = (it.get("title") or url).strip()
                if not url:
                    failed += 1
                    continue
                # unicité par collection (déjà gérée dans FeedService) :
                try:
                    self.feed_service.create(
                        title=title,
                        url=url,
                        collection_id=job.target_collection_id,
                        created_by=job.user_id,
                        language=Optional[str],
                        update_frequency=Optional[int],
                        priority=Optional[int],
                    )
                    imported += 1
                except IntegrityError:
                    self.db.rollback()
                    skipped += 1
                except Exception as e:
                    self.db.rollback()
                    failed += 1

                self.jobs.set_progress(
                    job, imported=imported, failed=failed, skipped=skipped, total=total
                )
                self.db.commit()

            self.jobs.set_success(
                job, message=f"Imported={imported}, skipped={skipped}, failed={failed}"
            )
            self.db.commit()
        except Exception as e:
            self.db.rollback()
            self.jobs.set_failed(job, error_message=str(e))
            self.db.commit()
