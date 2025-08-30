# backend/Dockerfile
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# libs système utiles (psycopg2, compilation)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libpq-dev curl && \
    rm -rf /var/lib/apt/lists/*

# Dépendances
COPY backend/requirements.txt /app/requirements.txt
RUN python -m pip install --upgrade pip && \
    pip install --no-cache-dir -r /app/requirements.txt

# Code
COPY backend/ /app/

# Pour être sûr que `import app` marche et qu'Alembic trouve son ini
ENV PYTHONPATH=/app \
    ALEMBIC_CONFIG=/app/alembic.ini \
    PORT=8000

# Expose (informative)
EXPOSE 8000

# Migrations + serveur. Render fournit $PORT : on s'aligne dessus.
CMD [ "sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}" ]
