from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from .core.database import get_db

app = FastAPI()

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "Database connected successfully!"}
    except Exception as e:
        return {"status": "Database connection failed", "error": str(e)}
