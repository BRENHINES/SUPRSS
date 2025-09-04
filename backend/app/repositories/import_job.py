from typing import Optional
from collections.abc import Sequence

from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from ..models.import_job import FileFormat, ImportJob, ImportStatus


class ImportJobRepository:
    def __init__(self, db: Session):
        self.db = db

    def get(self, job_id: int) -> ImportJob | None:
        return self.db.get(ImportJob, job_id)

    def list_for_user(self, user_id: int, limit: int = 50) -> Sequence[ImportJob]:
        stmt = (
            select(ImportJob)
            .where(ImportJob.user_id == user_id)
            .order_by(desc(ImportJob.created_at))
            .limit(limit)
        )
        return self.db.execute(stmt).scalars().all()

    def create(
        self,
        *,
        user_id: int,
        filename: str,
        file_format: FileFormat,
        file_size: int | None,
        target_collection_id: int | None,
        override_existing: bool
    ) -> ImportJob:
        job = ImportJob(
            user_id=user_id,
            filename=filename,
            file_format=file_format,
            file_size=file_size,
            status=ImportStatus.PENDING,
            progress_percentage=0,
            target_collection_id=target_collection_id,
            override_existing=override_existing,
        )
        self.db.add(job)
        self.db.flush()
        return job

    def set_processing(self, job: ImportJob):
        job.status = ImportStatus.PROCESSING
        self.db.add(job)

    def set_progress(
        self, job: ImportJob, *, imported: int, failed: int, skipped: int, total: int
    ):
        job.imported_feeds = imported
        job.failed_feeds = failed
        job.skipped_feeds = skipped
        job.total_feeds = total
        pct = int((imported + failed + skipped) * 100 / total) if total else 100
        job.progress_percentage = min(100, pct)
        self.db.add(job)

    def set_success(self, job: ImportJob, *, message: str | None = None):
        job.status = ImportStatus.COMPLETED
        job.success_message = message
        self.db.add(job)

    def set_failed(
        self, job: ImportJob, *, error_message: str, error_log: str | None = None
    ):
        job.status = ImportStatus.FAILED
        job.error_message = error_message
        job.error_log = error_log
        self.db.add(job)

    def cancel(self, job: ImportJob):
        job.status = ImportStatus.CANCELLED
        self.db.add(job)
