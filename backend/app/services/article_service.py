from typing import Optional, Tuple
from collections.abc import Sequence

from fastapi import HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.orm import Session

from ..models.article import Article, UserArticle
from ..models.feed import Feed
from ..repositories.article import ArticleRepository
from ..repositories.collection_member import CollectionMemberRepository
from ..repositories.user_article import UserArticleRepository


class ArticleService:
    def __init__(self, db: Session):
        self.db = db
        self.articles = ArticleRepository(db)
        self.ua_repo = UserArticleRepository(db)
        self.members = CollectionMemberRepository(db)

    # ---- helpers permissions ----
    def _assert_member_for_article(self, *, article: Article, user_id: int) -> int:
        # via feed -> collection
        feed: Feed = self.db.get(Feed, article.feed_id)
        if not feed:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Feed not found"
            )
        if feed.collection_id is None:
            raise HTTPException(
                status_code=400, detail="Invalid article feed/collection"
            )
        if (
            self.members.get_membership(
                collection_id=feed.collection_id, user_id=user_id
            )
            or feed.collection.owner_id == user_id
        ):
            return feed.collection_id
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")

    # ---- queries ----
    def get_article(self, *, article_id: int, user_id: int | None = None) -> Article:
        a = self.articles.get_by_id(article_id)
        if not a:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Article not found"
            )
        # si user_id fourni, vérifier appartenance
        if user_id is not None:
            self._assert_member_for_article(article=a, user_id=user_id)
        return a

    def list_feed_articles(
        self, *, feed_id: int, q: str | None, from_date, page: int, size: int
    ):
        return self.articles.list_by_feed(
            feed_id=feed_id, q=q, from_date=from_date, page=page, size=size
        )

    # ---- interactions ----
    def patch_interaction(
        self,
        *,
        article_id: int,
        user_id: int,
        is_read: bool | None,
        is_favorite: bool | None,
        is_archived: bool | None,
        user_notes: str | None,
        user_rating: int | None,
    ) -> UserArticle:
        a = self.get_article(article_id=article_id, user_id=user_id)
        ua = self.ua_repo.get_or_create(user_id=user_id, article_id=a.id)

        # garder les anciennes valeurs pour calculer le delta
        prev_read = bool(ua.is_read)
        prev_fav = bool(ua.is_favorite)

        # appliquer les updates demandés
        if is_read is not None:
            ua.is_read = is_read
        if is_favorite is not None:
            ua.is_favorite = is_favorite
        if is_archived is not None:
            ua.is_archived = is_archived
        if user_notes is not None:
            ua.user_notes = (user_notes or "").strip() or None
        if user_rating is not None:
            ua.user_rating = user_rating

        self.ua_repo.save(ua)

        # calcul des deltas
        read_delta = (
            1
            if (not prev_read and ua.is_read)
            else (-1 if (prev_read and not ua.is_read) else 0)
        )
        fav_delta = (
            1
            if (not prev_fav and ua.is_favorite)
            else (-1 if (prev_fav and not ua.is_favorite) else 0)
        )

        # updates atomiques côté DB
        if read_delta:
            self.db.execute(
                update(Article)
                .where(Article.id == a.id)
                .values(total_reads=Article.total_reads + read_delta)
            )
        if fav_delta:
            self.db.execute(
                update(Article)
                .where(Article.id == a.id)
                .values(total_favorites=Article.total_favorites + fav_delta)
            )

        self.db.commit()
        self.db.refresh(ua)
        return ua

    def list_user_articles_in_collection(
        self,
        *,
        user_id: int,
        collection_id: int,
        only_unread: bool,
        only_favorites: bool,
        page: int,
        size: int,
    ):
        # vérif membership
        if not (
            self.members.get_membership(collection_id=collection_id, user_id=user_id)
        ):
            # autoriser si owner
            from ..repositories.collection import CollectionRepository

            c = CollectionRepository(self.db).get_by_id(collection_id)
            if not c or (c.owner_id != user_id and not c.is_public):
                raise HTTPException(status_code=403, detail="Not allowed")
        return self.articles.list_for_user_by_collection(
            user_id=user_id,
            collection_id=collection_id,
            only_unread=only_unread,
            only_favorites=only_favorites,
            page=page,
            size=size,
        )
