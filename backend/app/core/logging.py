# backend/app/core/logging.py
import json
import logging
import os
import sys


def configure_logging():
    level = os.getenv("LOG_LEVEL", "INFO").upper()
    logging.basicConfig(
        level=level,
        stream=sys.stdout,
        format=(
            "%(message)s"
            if os.getenv("LOG_FORMAT") == "json"
            else "%(levelname)s %(name)s: %(message)s"
        ),
    )
    # Optionnel: adapter pour JSON
    if os.getenv("LOG_FORMAT") == "json":

        class JsonFormatter(logging.Formatter):
            def format(self, record):
                payload = {
                    "level": record.levelname,
                    "logger": record.name,
                    "msg": record.getMessage(),
                }
                return json.dumps(payload, ensure_ascii=False)

        for h in logging.getLogger().handlers:
            h.setFormatter(JsonFormatter())
