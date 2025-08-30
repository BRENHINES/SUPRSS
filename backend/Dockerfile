# backend/Dockerfile
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# libs pour psycopg2 & cie
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libpq-dev curl && \
    rm -rf /var/lib/apt/lists/*

# Dépendances (depuis backend/)
COPY backend/requirements.txt /app/requirements.txt
RUN python -m pip install --upgrade pip && \
    pip install --no-cache-dir -r /app/requirements.txt

# Code applicatif
COPY backend/ /app/

# Alembic: le INI est à la racine du repo, les migrations dans backend/
COPY alembic.ini /app/alembic.ini
COPY backend/migrations/ /app/migrations/

# Imports & Alembic
ENV PYTHONPATH=/app \
    ALEMBIC_CONFIG=/app/alembic.ini \
    PORT=8000

EXPOSE 8000

# 👉 utilise le module Python (fiable même si le binaire 'alembic' n'est pas sur le PATH)
CMD ["sh","-c","python -m alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
