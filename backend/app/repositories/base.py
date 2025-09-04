from __future__ import annotations

from typing import Any, Generic, Type, TypeVar
from collections.abc import Mapping, Sequence

from sqlalchemy import select
from sqlalchemy.orm import Session

ModelT = TypeVar("ModelT")


class SQLRepository(Generic[ModelT]):
    """Repo générique sync pour une entité SQLAlchemy."""

    model: type[ModelT]

    def __init__(self, session: Session):
        self.session = session

    # R
    def get(self, id_: int) -> ModelT | None:
        return self.session.get(self.model, id_)

    def list(self, *, limit: int | None = None, offset: int = 0) -> Sequence[ModelT]:
        stmt = select(self.model).offset(offset)
        if limit is not None:
            stmt = stmt.limit(limit)
        return list(self.session.scalars(stmt))

    # C
    def create(self, **data: Any) -> ModelT:
        obj = self.model(**data)  # type: ignore[arg-type]
        self.session.add(obj)
        return obj

    # U
    def update(self, obj: ModelT, data: Mapping[str, Any]) -> ModelT:
        for k, v in data.items():
            setattr(obj, k, v)
        # pas de commit ici
        return obj

    # D
    def delete(self, obj: ModelT) -> None:
        self.session.delete(obj)
