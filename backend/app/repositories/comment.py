from typing import Optional, Sequence, Tuple
from sqlalchemy import select, update
from sqlalchemy.orm import Session

from ..models.comment import Comment

class CommentRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, comment_id: int) -> Optional[Comment]:
        return self.db.get(Comment, comment_id)

    def list_for_article(self, article_id: int, *, page: int = 1, size: int = 50) -> Tuple[Sequence[Comment], int]:
        stmt = select(Comment).where(Comment.article_id == article_id).order_by(Comment.created_at.asc())
        total = self.db.execute(
            select(Comment).where(Comment.article_id == article_id).with_only_columns(Comment.id)
        ).all()
        items = self.db.execute(stmt.offset((page - 1) * size).limit(size)).scalars().all()
        return items, len(total)

    def create(self, *, article_id: int, author_id: int, content: str, parent_id: Optional[int], thread_level: int) -> Comment:
        c = Comment(
            article_id=article_id,
            author_id=author_id,
            content=content,
            parent_id=parent_id,
            thread_level=thread_level,
        )
        self.db.add(c)
        self.db.flush()
        return c

    def update_content(self, c: Comment, *, content: str) -> Comment:
        c.content = content
        c.is_edited = True
        self.db.add(c)
        return c

    def soft_delete(self, c: Comment) -> None:
        c.is_deleted = True
        # Optionnel : masquer le contenu
        # c.content = None
        self.db.add(c)

    def vote(self, c: Comment, *, kind: str, delta: int) -> Comment:
        # kind in {"up","down"}, delta in {+1,-1}
        if kind == "up":
            self.db.execute(
                update(Comment).where(Comment.id == c.id).values(upvotes=Comment.upvotes + delta)
            )
        elif kind == "down":
            self.db.execute(
                update(Comment).where(Comment.id == c.id).values(downvotes=Comment.downvotes + delta)
            )
        return c
