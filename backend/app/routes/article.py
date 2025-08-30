from datetime import datetime
from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import and_, func, or_, select
from sqlalchemy.orm import Session

from ..api.deps import get_current_user
from ..core.database import get_db
from ..models.article import Article, UserArticle
from ..models.collection import Collection, CollectionMember
from ..models.feed import Feed
from ..repositories.user_article import UserArticleRepository
from ..schemas.article import (
    ArticleOut,
    ArticleUserState,
    ArticleWithState,
    InteractionUpdate,
)
from ..services.article_service import ArticleService

router = APIRouter(prefix="/api", tags=["Articles"])


@router.get("/feeds/{feed_id}/articles", response_model=list[ArticleOut])
def list_feed_articles(
    feed_id: int,
    q: Optional[str] = Query(None),
    from_date: Optional[datetime] = Query(None),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _user=Depends(get_current_user),
):
    items, _total = ArticleService(db).list_feed_articles(
        feed_id=feed_id, q=q, from_date=from_date, page=page, size=size
    )
    return items


@router.get("/articles/{article_id}", response_model=ArticleOut)
def get_article(
    article_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)
):
    a = ArticleService(db).get_article(article_id=article_id, user_id=user.id)
    return a


@router.patch("/articles/{article_id}/interactions", response_model=ArticleWithState)
def patch_interaction(
    article_id: int,
    payload: InteractionUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    ua = ArticleService(db).patch_interaction(
        article_id=article_id,
        user_id=user.id,
        **payload.model_dump(exclude_unset=True),
    )
    # recharger l’article
    a = ArticleService(db).get_article(article_id=article_id, user_id=user.id)
    state = ArticleUserState(
        is_read=ua.is_read,
        is_favorite=ua.is_favorite,
        is_archived=ua.is_archived,
        user_notes=ua.user_notes,
        user_rating=ua.user_rating,
    )
    return {"article": a, "state": state}


@router.get("/collections/{collection_id}/articles", response_model=list[ArticleOut])
def list_collection_articles_for_me(
    collection_id: int,
    only_unread: bool = Query(False),
    only_favorites: bool = Query(False),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    items, _total = ArticleService(db).list_user_articles_in_collection(
        user_id=user.id,
        collection_id=collection_id,
        only_unread=only_unread,
        only_favorites=only_favorites,
        page=page,
        size=size,
    )
    return items


def _can_read_clause(user_id):
    # autorisé si collection publique, owner, ou membre actif
    return or_(
        Collection.is_public == True,
        Collection.owner_id == user_id,
        and_(
            CollectionMember.user_id == user_id,
            CollectionMember.is_active == True,
        ),
    )


def _apply_article_filters(stmt, *, q, language, date_from, date_to):
    if q:
        like = f"%{q.strip()}%"
        stmt = stmt.where(or_(Article.title.ilike(like), Article.summary.ilike(like)))
    if language:
        stmt = stmt.where(Article.language == language)
    if date_from:
        stmt = stmt.where(Article.published_at >= date_from)
    if date_to:
        stmt = stmt.where(Article.published_at <= date_to)
    return stmt


def _apply_sort(stmt, sort: str | None):
    # ex: sort='-published_at' (defaut) / 'published_at' / '-created_at'
    col = Article.published_at
    desc = True
    if sort:
        desc = sort.startswith("-")
        key = sort[1:] if desc else sort
        col = getattr(Article, key, Article.published_at)
    return stmt.order_by(col.desc() if desc else col.asc())


@router.get("/articles", response_model=list[ArticleOut])
def list_articles(
    collection_id: Optional[int] = None,
    feed_id: Optional[int] = None,
    q: Optional[str] = None,
    language: Optional[str] = None,
    date_from: Optional[datetime] = Query(None),
    date_to: Optional[datetime] = Query(None),
    unread_only: bool = False,
    favorite_only: bool = False,
    archived_only: bool = False,
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    sort: Optional[str] = "-published_at",
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    # base: Article -> Feed -> Collection (+ left join CollectionMember pour droits)
    base = (
        select(Article)
        .join(Feed, Feed.id == Article.feed_id)
        .join(Collection, Collection.id == Feed.collection_id)
        .join(
            CollectionMember,
            CollectionMember.collection_id == Collection.id,
            isouter=True,
        )
        .where(_can_read_clause(user.id))
    )

    if collection_id:
        base = base.where(Feed.collection_id == collection_id)
    if feed_id:
        base = base.where(Article.feed_id == feed_id)

    # filtres texte/date/lang
    base = _apply_article_filters(
        base, q=q, language=language, date_from=date_from, date_to=date_to
    )

    # filtres user-specific (UserArticle)
    if unread_only or favorite_only or archived_only:
        base = base.join(
            UserArticle, UserArticle.article_id == Article.id, isouter=True
        ).where(UserArticle.user_id == user.id)
        if unread_only:
            base = base.where(
                or_(UserArticle.is_read == False, UserArticle.is_read.is_(None))
            )
        if favorite_only:
            base = base.where(UserArticle.is_favorite == True)
        if archived_only:
            base = base.where(UserArticle.is_archived == True)

    # total + pagination
    total = db.scalar(select(func.count()).select_from(base.subquery()))
    items = db.scalars(
        _apply_sort(base, sort).offset((page - 1) * size).limit(size)
    ).all()
    # Réponse simple (X-Total-Count header si tu veux) : ici on renvoie juste la liste
    return items


# Aliases conviviaux :
@router.get("/collections/{cid}/articles", response_model=list[ArticleOut])
def list_collection_articles(cid: int, **kwargs):
    kwargs["collection_id"] = cid
    return list_articles(**kwargs)  # FastAPI passe les Depends communs


@router.get("/feeds/{fid}/articles", response_model=list[ArticleOut])
def list_feed_articles(fid: int, **kwargs):
    kwargs["feed_id"] = fid
    return list_articles(**kwargs)


# -------- Bulk actions --------
class BulkIds(BaseModel):
    ids: list[int] = Field(..., min_items=1)
    value: Optional[bool] = True  # pour read/archive: True par défaut


@router.post("/articles/bulk/read")
def bulk_read(
    payload: BulkIds,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    # Sécurise: ne traiter que les articles accessibles
    sub = (
        select(Article.id)
        .join(Feed, Feed.id == Article.feed_id)
        .join(Collection, Collection.id == Feed.collection_id)
        .join(
            CollectionMember,
            CollectionMember.collection_id == Collection.id,
            isouter=True,
        )
        .where(_can_read_clause(user.id))
        .where(Article.id.in_(payload.ids))
    )
    allowed_ids = set(db.scalars(sub).all())

    updated = 0
    for aid in allowed_ids:
        ua = db.query(UserArticle).filter_by(user_id=user.id, article_id=aid).first()
        if not ua:
            ua = UserArticle(user_id=user.id, article_id=aid)
            db.add(ua)
        ua.is_read = bool(payload.value)
        # (optionnel) compteur article.total_reads
        art = db.get(Article, aid)
        if hasattr(art, "total_reads") and payload.value:
            art.total_reads = (art.total_reads or 0) + 1
        updated += 1
    db.commit()
    return {"updated": updated}


@router.post("/articles/bulk/archive")
def bulk_archive(
    payload: BulkIds,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    sub = (
        select(Article.id)
        .join(Feed, Feed.id == Article.feed_id)
        .join(Collection, Collection.id == Feed.collection_id)
        .join(
            CollectionMember,
            CollectionMember.collection_id == Collection.id,
            isouter=True,
        )
        .where(_can_read_clause(user.id))
        .where(Article.id.in_(payload.ids))
    )
    allowed_ids = set(db.scalars(sub).all())

    updated = 0
    for aid in allowed_ids:
        ua = db.query(UserArticle).filter_by(user_id=user.id, article_id=aid).first()
        if not ua:
            ua = UserArticle(user_id=user.id, article_id=aid)
            db.add(ua)
        ua.is_archived = bool(payload.value)
        updated += 1
    db.commit()
    return {"updated": updated}
