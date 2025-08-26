from fastapi import APIRouter, Depends, Query, HTTPException, status, Response
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..api.deps import get_current_user, require_admin
from ..schemas.collection import (
    CollectionCreate, CollectionUpdate, CollectionOut,
    MemberAdd, MemberUpdate, MemberOut,
)
from ..repositories.collection import CollectionRepository
from ..repositories.collection_member import CollectionMemberRepository
from ..services.collection_service import CollectionService

router = APIRouter(prefix="/api/collections", tags=["Collections"])

# ---- Collections ----
@router.post("", response_model=CollectionOut, status_code=201)
def create_collection(data: CollectionCreate, db: Session = Depends(get_db), user = Depends(get_current_user)):
    svc = CollectionService(db)
    c = svc.create(
        owner_id=user.id,
        name=data.name,
        description=data.description,
        slug=data.slug,
        is_public=data.is_public,
        is_personal=data.is_personal,
        allow_comments=data.allow_comments,
        allow_chat=data.allow_chat,
        auto_fetch_feeds=data.auto_fetch_feeds,
    )
    return c

@router.get("", response_model=list[CollectionOut])
def list_my_collections(
    q: str | None = Query(None),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    response: Response = None,
    db: Session = Depends(get_db),
    user = Depends(get_current_user),
):
    items, total = CollectionRepository(db).list_for_user(user_id=user.id, q=q, page=page, size=size)
    if response is not None:
        response.headers["X-Total-Count"] = str(total)
    return items

@router.get("/all", response_model=list[CollectionOut], dependencies=[Depends(require_admin)])
def list_all_collections(
    q: str | None = Query(None),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    response: Response = None,
    db: Session = Depends(get_db),
):
    items, total = CollectionRepository(db).list_all(q=q, page=page, size=size)
    if response is not None:
        response.headers["X-Total-Count"] = str(total)
    return items

@router.get("/{collection_id}", response_model=CollectionOut)
def get_collection(collection_id: int, db: Session = Depends(get_db), user = Depends(get_current_user)):
    c = CollectionRepository(db).get_by_id(collection_id)
    if not c:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collection not found")
    # lecture: soit public, soit membre/owner
    if not c.is_public:
        # vérifie membership
        m = CollectionMemberRepository(db).get_membership(collection_id=collection_id, user_id=user.id)
        if not (m and m.is_active) and c.owner_id != user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")
    return c

@router.patch("/{collection_id}", response_model=CollectionOut)
def update_collection(collection_id: int, data: CollectionUpdate, db: Session = Depends(get_db), user = Depends(get_current_user)):
    svc = CollectionService(db)
    c = svc.update(collection_id=collection_id, actor_id=user.id, **data.model_dump(exclude_unset=True))
    return c

@router.delete("/{collection_id}", status_code=204)
def delete_collection(collection_id: int, db: Session = Depends(get_db), user = Depends(get_current_user)):
    CollectionService(db).delete(collection_id=collection_id, actor_id=user.id)
    return

# ---- Members ----
@router.get("/{collection_id}/members", response_model=list[MemberOut])
def list_members(
    collection_id: int,
    page: int = Query(1, ge=1),
    size: int = Query(50, ge=1, le=200),
    response: Response = None,
    db: Session = Depends(get_db),
    user = Depends(get_current_user),
):
    c = CollectionRepository(db).get_by_id(collection_id)
    if not c:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collection not found")
    # lecture membres: owner/admin seulement
    svc = CollectionService(db)
    svc._assert_owner_or_admin(collection=c, user_id=user.id)

    items, total = CollectionMemberRepository(db).list_for_collection(collection_id=collection_id, page=page, size=size)
    if response is not None:
        response.headers["X-Total-Count"] = str(total)
    return items

@router.post("/{collection_id}/members", response_model=MemberOut, status_code=201)
def add_member(collection_id: int, data: MemberAdd, db: Session = Depends(get_db), user = Depends(get_current_user)):
    payload = data.model_dump(exclude_unset=True)
    m = CollectionService(db).add_member(collection_id=collection_id, actor_id=user.id, **payload)
    return m

@router.patch("/{collection_id}/members/{member_id}", response_model=MemberOut)
def update_member(collection_id: int, member_id: int, data: MemberUpdate, db: Session = Depends(get_db), user = Depends(get_current_user)):
    m = CollectionService(db).update_member(collection_id=collection_id, member_id=member_id, actor_id=user.id, **data.model_dump(exclude_unset=True))
    return m

@router.delete("/{collection_id}/members/{member_id}", status_code=204)
def remove_member(collection_id: int, member_id: int, db: Session = Depends(get_db), user = Depends(get_current_user)):
    CollectionService(db).remove_member(collection_id=collection_id, member_id=member_id, actor_id=user.id)
    return
