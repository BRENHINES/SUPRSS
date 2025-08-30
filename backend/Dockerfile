# backend/Dockerfile  (contexte = backend/)
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libpq-dev curl && \
    rm -rf /var/lib/apt/lists/*

# le contexte est backend/, donc requirements.txt est ici
COPY backend/requirements.txt /app/requirements.txt
RUN python -m pip install --upgrade pip && pip install -r /app/requirements.txt

# copie tout le code backend
COPY . /app
COPY backend /app/backend
COPY alembic.ini /app/alembic.ini

# IMPORTANT: ici le package est "app" (pas "backend.app"), car on a /app/app/...
ENV PYTHONPATH=/app
EXPOSE 8000

# Render fournit $PORT ; on le respecte. On essaie les migrations mais on ne crash pas si ça échoue.
CMD bash -lc "alembic upgrade head || true; uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"
