from typing import Optional, Sequence, Tuple

from fastapi import HTTPException, status
from sqlalchemy import update
from sqlalchemy.orm import Session

from ..models.article import Article
from ..models.comment import Comment
from ..repositories.article import ArticleRepository  # tu l’as déjà
from ..repositories.comment import CommentRepository


class CommentService:
    def __init__(self, db: Session):
        self.db = db
        self.comments = CommentRepository(db)
        self.articles = ArticleRepository(db)

    def _ensure_article(self, article_id: int) -> Article:
        a = self.articles.get_by_id(article_id)
        if not a:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Article not found"
            )
        return a

    def _ensure_parent_in_same_article(
        self, article_id: int, parent_id: Optional[int]
    ) -> Tuple[Optional[Comment], int]:
        if not parent_id:
            return None, 0
        p = self.comments.get_by_id(parent_id)
        if not p or p.article_id != article_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid parent comment"
            )
        return p, (p.thread_level + 1)

    def list_for_article(
        self, article_id: int, *, page: int = 1, size: int = 50
    ) -> Tuple[Sequence[Comment], int]:
        self._ensure_article(article_id)
        return self.comments.list_for_article(article_id, page=page, size=size)

    def create(
        self, *, article_id: int, author_id: int, content: str, parent_id: Optional[int]
    ) -> Comment:
        self._ensure_article(article_id)
        parent, level = self._ensure_parent_in_same_article(article_id, parent_id)
        c = self.comments.create(
            article_id=article_id,
            author_id=author_id,
            content=content.strip(),
            parent_id=parent.id if parent else None,
            thread_level=level,
        )
        # incrémenter total_comments de l’article
        from ..models.article import Article as ArticleModel

        self.db.execute(
            update(ArticleModel)
            .where(ArticleModel.id == article_id)
            .values(total_comments=ArticleModel.total_comments + 1)
        )
        self.db.commit()
        self.db.refresh(c)
        return c

    def update(
        self, *, comment_id: int, author_id: int, content: str, is_admin: bool
    ) -> Comment:
        c = self.comments.get_by_id(comment_id)
        if not c:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found"
            )
        if not is_admin and c.author_id != author_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed"
            )
        c = self.comments.update_content(c, content=content.strip())
        self.db.commit()
        self.db.refresh(c)
        return c

    def delete(self, *, comment_id: int, author_id: int, is_admin: bool) -> None:
        c = self.comments.get_by_id(comment_id)
        if not c:
            return
        if not is_admin and c.author_id != author_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed"
            )
        self.comments.soft_delete(c)
        # on ne décrémente pas total_comments (souvent on garde le compteur)
        self.db.commit()

    def vote(
        self, *, comment_id: int, author_id: int, kind: str, delta: int
    ) -> Comment:
        # garde-fou basique : delta doit être +1 ou -1
        if delta not in (1, -1):
            raise HTTPException(status_code=400, detail="delta must be +1 or -1")
        if kind not in ("up", "down"):
            raise HTTPException(status_code=400, detail="kind must be 'up' or 'down'")

        c = self.comments.get_by_id(comment_id)
        if not c:
            raise HTTPException(status_code=404, detail="Comment not found")

        # (optionnel) Empêcher un utilisateur de voter plusieurs fois dans le même sens → nécessite table votes
        self.comments.vote(c, kind=kind, delta=delta)
        self.db.commit()
        self.db.refresh(c)
        return c
