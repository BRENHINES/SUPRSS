from .config import settings
from sqlalchemy import create_engine, MetaData
from sqlalchemy.orm import declarative_base, sessionmaker
from contextlib import contextmanager

"""
Connexion SQLAlchemy + session pour FastAPI
"""

# ------------------------------------------------------------------ #
# Nommage cohérent des contraintes
# ------------------------------------------------------------------ #
NAMING_CONVENTION = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}

metadata = MetaData(naming_convention=NAMING_CONVENTION)

# ------------------------------------------------------------------ #
# Engine
# ------------------------------------------------------------------ #
engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=settings.DEBUG,
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

Base = declarative_base(metadata=metadata)

def get_db():
    """
    Dépendance FastAPI : ouvre une session, l’éteint proprement après usage.
    Usage :
        def endpoint(db: Session = Depends(get_db)):
            ...
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
