from __future__ import annotations
from typing import Optional, Tuple
from datetime import datetime, timezone
import httpx
import feedparser
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from ..core.config import settings
from ..models.feed import Feed
from ..models.article import Article
from ..repositories.feed import FeedRepository

class FetchService:
    def __init__(self, db: Session):
        self.db = db
        self.feeds = FeedRepository(db)

    def _now(self) -> datetime:
        return datetime.now(timezone.utc)

    def fetch_one(self, feed_id: int) -> dict:
        feed = self.feeds.get_by_id(feed_id)
        if not feed:
            raise ValueError("Feed not found")

        headers = {"User-Agent": settings.RSS_USER_AGENT}
        if feed.etag:
            headers["If-None-Match"] = feed.etag
        if feed.last_modified:
            headers["If-Modified-Since"] = feed.last_modified

        try:
            with httpx.Client(timeout=settings.RSS_FETCH_TIMEOUT) as client:
                resp = client.get(feed.url, headers=headers)
        except Exception as e:
            self._mark_error(feed, f"Network error: {e}")
            return {"ok": False, "error": str(e)}

        if resp.status_code == 304:
            # pas de nouveauté
            self._mark_success(feed, 0)
            return {"ok": True, "inserted": 0, "status": 304}

        if resp.status_code >= 400:
            self._mark_error(feed, f"HTTP {resp.status_code}")
            return {"ok": False, "error": f"HTTP {resp.status_code}"}

        # sauvegarder etag/last-modified
        feed.etag = resp.headers.get("ETag") or feed.etag
        feed.last_modified = resp.headers.get("Last-Modified") or feed.last_modified

        parsed = feedparser.parse(resp.content)
        inserted = 0
        for entry in parsed.entries[: settings.RSS_MAX_ARTICLES_PER_FEED]:
            guid = entry.get("id") or entry.get("guid") or entry.get("link") or ""
            if not guid:
                continue
            try:
                art = Article(
                    title=entry.get("title") or "(no title)",
                    url=entry.get("link") or "",
                    guid=guid,
                    summary=entry.get("summary"),
                    content=None,
                    author=(entry.get("author") or None),
                    published_at=self._coerce_date(entry),
                    language=None,
                    word_count=None,
                    reading_time=None,
                    image_url=(entry.get("media_thumbnail",[{}])[0].get("url") if entry.get("media_thumbnail") else None),
                    enclosure_url=None,
                    enclosure_type=None,
                    enclosure_length=None,
                    feed_id=feed.id,
                )
                self.db.add(art)
                self.db.flush()  # déclenche l’unicité (guid, feed_id)
                inserted += 1
            except IntegrityError:
                self.db.rollback()
                continue  # doublon guid/feed => on skip

        feed.total_articles = (feed.total_articles or 0) + inserted
        self._mark_success(feed, inserted)
        return {"ok": True, "inserted": inserted, "status": 200}

    def _coerce_date(self, entry) -> Optional[datetime]:
        dt = entry.get("published_parsed") or entry.get("updated_parsed")
        if not dt:
            return None
        try:
            return datetime(*dt[:6], tzinfo=timezone.utc)
        except Exception:
            return None

    def _mark_success(self, feed: Feed, inserted: int):
        feed.successful_fetches = (feed.successful_fetches or 0) + 1
        feed.consecutive_failures = 0
        feed.last_error_message = None
        feed.last_error_at = None
        feed.last_fetched_at = self._now()
        self.db.add(feed)
        self.db.commit()

    def _mark_error(self, feed: Feed, message: str):
        feed.failed_fetches = (feed.failed_fetches or 0) + 1
        feed.consecutive_failures = (feed.consecutive_failures or 0) + 1
        feed.last_error_message = message
        feed.last_error_at = self._now()
        feed.last_fetched_at = self._now()
        self.db.add(feed)
        self.db.commit()
