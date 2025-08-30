from typing import Optional

from fastapi import (APIRouter, BackgroundTasks, Depends, File, Form,
                     HTTPException, UploadFile, status)
from sqlalchemy.orm import Session

from ..api.deps import get_current_user
from ..core.database import (  # SessionLocal pour la tâche de fond
    SessionLocal, get_db)
from ..models.import_job import FileFormat, ImportStatus
from ..repositories.import_job import ImportJobRepository
from ..services.import_service import ImportService

router = APIRouter(prefix="/api/imports", tags=["Imports"])


@router.post("", status_code=201)
async def create_import_job(
    background: BackgroundTasks,
    file: UploadFile = File(...),
    target_collection_id: int = Form(...),
    override_existing: bool = Form(False),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    # déduire format par extension simple
    ext = (file.filename.split(".")[-1] or "").lower()
    fmt_map = {"opml": FileFormat.OPML, "json": FileFormat.JSON, "csv": FileFormat.CSV}
    file_format = fmt_map.get(ext)
    if not file_format:
        raise HTTPException(status_code=415, detail="Unsupported file format")

    data = await file.read()
    svc = ImportService(db)
    job = svc.create_job(
        user_id=user.id,
        filename=file.filename,
        file_format=file_format,
        file_size=len(data),
        target_collection_id=target_collection_id,
        override_existing=override_existing,
    )

    # tâche de fond : on OUVRE une nouvelle session dans la task
    def _worker(job_id: int, payload: bytes):
        db2 = SessionLocal()
        try:
            ImportService(db2).process_bytes(job_id=job_id, data=payload)
        finally:
            db2.close()

    background.add_task(_worker, job.id, data)
    return {"id": job.id, "status": job.status, "progress": job.progress_percentage}


@router.get("", summary="Liste des imports (user)")
def list_my_imports(db: Session = Depends(get_db), user=Depends(get_current_user)):
    items = ImportJobRepository(db).list_for_user(user.id)
    return [
        {
            "id": j.id,
            "filename": j.filename,
            "format": j.file_format.value,
            "status": j.status.value,
            "progress": j.progress_percentage,
            "imported": j.imported_feeds,
            "failed": j.failed_feeds,
            "skipped": j.skipped_feeds,
            "total": j.total_feeds,
            "created_at": j.created_at,
            "completed_at": j.completed_at,
        }
        for j in items
    ]


@router.get("/{job_id}")
def get_import(
    job_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)
):
    repo = ImportJobRepository(db)
    job = repo.get(job_id)
    if not job or job.user_id != user.id:
        raise HTTPException(status_code=404, detail="Import job not found")
    return {
        "id": job.id,
        "filename": job.filename,
        "format": job.file_format.value,
        "status": job.status.value,
        "progress": job.progress_percentage,
        "imported": job.imported_feeds,
        "failed": job.failed_feeds,
        "skipped": job.skipped_feeds,
        "total": job.total_feeds,
        "message": job.success_message,
        "error": job.error_message,
    }


@router.post("/{job_id}/cancel", status_code=202)
def cancel_import(
    job_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)
):
    repo = ImportJobRepository(db)
    job = repo.get(job_id)
    if not job or job.user_id != user.id:
        raise HTTPException(status_code=404, detail="Import job not found")
    if job.status not in (ImportStatus.PENDING, ImportStatus.PROCESSING):
        raise HTTPException(status_code=409, detail="Job not cancellable")
    repo.cancel(job)
    db.commit()
    return {"ok": True}
