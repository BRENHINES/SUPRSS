# backend/app/db/uow.py
from contextlib import AbstractContextManager
from typing import Callable, Generator

from sqlalchemy.orm import Session

from ..core.database import SessionLocal  # ta factory de sessions sync
from ..repositories.user import UserRepository


class UnitOfWork(AbstractContextManager):
    """
    Ouvre une session/transaction, expose les repositories,
    commit si succès, rollback sinon, ferme la session.
    """

    def __init__(self, session_factory: Callable[[], Session] = SessionLocal):
        self._session_factory = session_factory
        self.session: Session | None = None

        # Repositories (initialisés dans __enter__)
        self.users: UserRepository | None = None

    def __enter__(self):
        self.session = self._session_factory()
        # instancie ici tes repos
        self.users = UserRepository(self.session)
        return self

    def __exit__(self, exc_type, exc, tb):
        try:
            if exc_type is None:
                self.session.commit()
            else:
                self.session.rollback()
        finally:
            self.session.close()
        # Ne supprime pas l'exception : laisse FastAPI la gérer si besoin
        return False


def get_uow() -> Generator[UnitOfWork, None, None]:
    # Utilisation en contexte, mais FastAPI gère le yield proprement
    with UnitOfWork() as uow:
        yield uow
