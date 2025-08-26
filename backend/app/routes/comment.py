from fastapi import APIRouter, Depends, Query, Body, HTTPException
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..api.deps import get_current_user
from ..models import Comment
from ..schemas.comment import CommentCreate, CommentUpdate, CommentOut
from ..services.comment_service import CommentService

from pydantic import BaseModel

router = APIRouter(prefix="/api", tags=["Comments"])

@router.get("/articles/{article_id}/comments", response_model=list[CommentOut])
def list_comments(
    article_id: int,
    page: int = Query(1, ge=1),
    size: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    _user = Depends(get_current_user),  # lecture protégée ? à ajuster selon besoin
):
    items, _ = CommentService(db).list_for_article(article_id, page=page, size=size)
    return items

@router.post("/articles/{article_id}/comments", response_model=CommentOut, status_code=201)
def create_comment(
    article_id: int,
    data: CommentCreate,
    db: Session = Depends(get_db),
    user = Depends(get_current_user),
):
    c = CommentService(db).create(
        article_id=article_id,
        author_id=user.id,
        content=data.content,
        parent_id=data.parent_id,
    )
    return c

@router.patch("/comments/{comment_id}", response_model=CommentOut)
def update_comment(
    comment_id: int,
    data: CommentUpdate,
    db: Session = Depends(get_db),
    user = Depends(get_current_user),
):
    c = CommentService(db).update(
        comment_id=comment_id,
        author_id=user.id,
        content=data.content,
        is_admin=bool(user.is_superuser),
    )
    return c

@router.delete("/comments/{comment_id}", status_code=204)
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    user = Depends(get_current_user),
):
    CommentService(db).delete(
        comment_id=comment_id,
        author_id=user.id,
        is_admin=bool(user.is_superuser),
    )
    return

class VoteIn(BaseModel):
    kind: str  # "up" | "down"
    delta: int # +1 or -1

@router.post("/comments/{comment_id}/vote")
def vote_comment(comment_id: int, value: int = Body(..., embed=True), db: Session = Depends(get_db), user = Depends(get_current_user)):
    c = db.get(Comment, comment_id)
    if not c:
        raise HTTPException(status_code=404, detail="Comment not found")
    if hasattr(c, "upvotes") and hasattr(c, "downvotes"):
        if value not in (-1, 1):
            raise HTTPException(status_code=422, detail="value must be -1 or 1")
        if value == 1:
            c.upvotes = (c.upvotes or 0) + 1
        else:
            c.downvotes = (c.downvotes or 0) + 1
        db.commit()
        db.refresh(c)
        return {"score": (c.upvotes or 0) - (c.downvotes or 0)}
    raise HTTPException(status_code=501, detail="Voting not implemented in DB")

@router.post("/comments/{comment_id}/flag")
def flag_comment(comment_id: int, reason: str = Body("", embed=True), db: Session = Depends(get_db), user = Depends(get_current_user)):
    c = db.get(Comment, comment_id)
    if not c:
        raise HTTPException(status_code=404, detail="Comment not found")
    if hasattr(c, "flags_count"):
        c.flags_count = (c.flags_count or 0) + 1
        db.commit()
        return {"flags_count": c.flags_count}
    raise HTTPException(status_code=501, detail="Flagging not implemented in DB")
