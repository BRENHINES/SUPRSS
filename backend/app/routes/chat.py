from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..api.deps import get_current_user
from ..core.database import get_db
from ..schemas.chat import ChatCreate, ChatOut, ChatUpdate, ReactionRequest
from ..services.chat_service import ChatService

router = APIRouter(prefix="/api", tags=["Chat"])


@router.post(
    "/collections/{collection_id}/chat/messages",
    response_model=ChatOut,
    status_code=201,
)
def post_message(
    collection_id: int,
    payload: ChatCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    m = ChatService(db).post(
        collection_id=collection_id,
        author_id=user.id,
        content=payload.content,
        reply_to_id=payload.reply_to_id,
    )
    return m


@router.patch("/chat/messages/{message_id}", response_model=ChatOut)
def update_message(
    message_id: int,
    payload: ChatUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    m = ChatService(db).update(
        message_id=message_id,
        actor_id=user.id,
        **payload.model_dump(exclude_unset=True)
    )
    return m


def _serialize(msg, counts: dict[str, int]) -> ChatOut:
    return ChatOut(
        id=msg.id,
        collection_id=msg.collection_id,
        author_id=msg.author_id,
        reply_to_id=msg.reply_to_id,
        message_type=msg.message_type,
        content=None if msg.is_deleted else msg.content,
        is_edited=msg.is_edited,
        is_deleted=msg.is_deleted,
        created_at=msg.created_at,
        updated_at=msg.updated_at,
        reactions=counts or {},
    )


@router.get("/collections/{collection_id}/chat/messages", response_model=list[ChatOut])
def list_messages(
    collection_id: int,
    limit: int = Query(50, ge=1, le=200),
    before: datetime | None = Query(None),
    after: datetime | None = Query(None),
    top_level_only: bool = Query(True),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    svc = ChatService(db)
    items, counts_map = svc.list_messages(
        collection_id=collection_id,
        user_id=user.id,
        limit=limit,
        before=before,
        after=after,
        top_level_only=top_level_only,
    )
    return [_serialize(m, counts_map.get(m.id, {})) for m in items]


@router.get(
    "/collections/{collection_id}/chat/messages/{message_id}/thread",
    response_model=list[ChatOut],
)
def list_thread(
    collection_id: int,
    message_id: int,
    limit: int = Query(100, ge=1, le=500),
    after: datetime | None = Query(None),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    svc = ChatService(db)
    items, counts_map = svc.list_thread(
        collection_id=collection_id,
        root_id=message_id,
        user_id=user.id,
        limit=limit,
        after=after,
    )
    return [_serialize(m, counts_map.get(m.id, {})) for m in items]


@router.post(
    "/collections/{collection_id}/chat/messages",
    response_model=ChatOut,
    status_code=201,
)
def create_message(
    collection_id: int,
    payload: ChatCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    svc = ChatService(db)
    m = svc.create(
        collection_id=collection_id,
        author_id=user.id,
        content=payload.content,
        message_type=payload.message_type,
        reply_to_id=payload.reply_to_id,
        metadata_json=payload.metadata_json,
    )
    return _serialize(m, counts={})


@router.patch(
    "/collections/{collection_id}/chat/messages/{message_id}", response_model=ChatOut
)
def edit_message(
    collection_id: int,
    message_id: int,
    payload: ChatUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    svc = ChatService(db)
    m = svc.update(
        message_id=message_id,
        collection_id=collection_id,
        author_id=user.id,
        content=payload.content,
        is_admin=bool(user.is_superuser),
    )
    counts = svc.messages.reaction_counts_for([message_id]).get(message_id, {})
    return _serialize(m, counts)


@router.delete(
    "/collections/{collection_id}/chat/messages/{message_id}", status_code=204
)
def delete_message(
    collection_id: int,
    message_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    ChatService(db).delete(
        message_id=message_id,
        collection_id=collection_id,
        author_id=user.id,
        is_admin=bool(user.is_superuser),
    )
    return


@router.post(
    "/collections/{collection_id}/chat/messages/{message_id}/reactions",
    response_model=ChatOut,
)
def react_message(
    collection_id: int,
    message_id: int,
    payload: ReactionRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    svc = ChatService(db)
    counts = svc.react(
        message_id=message_id,
        collection_id=collection_id,
        user_id=user.id,
        emoji=payload.emoji,
    )
    m = svc.messages.get_by_id(message_id)
    if not m:
        raise HTTPException(status_code=404, detail="Message not found")
    return _serialize(m, counts)
