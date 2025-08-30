from __future__ import annotations

import csv
import io
import json
import xml.etree.ElementTree as ET
from typing import Dict, List


def parse_opml_feeds(data: bytes) -> List[Dict[str, str]]:
    """
    Retourne une liste de {title, url} depuis un contenu OPML.
    On extrait les attributs 'xmlUrl' des <outline>.
    """
    root = ET.fromstring(data)
    out: List[Dict[str, str]] = []
    for node in root.iter("outline"):
        url = node.attrib.get("xmlUrl") or node.attrib.get("xmlurl")
        if url:
            title = node.attrib.get("title") or node.attrib.get("text") or url
            out.append({"title": title, "url": url})
    return out


def parse_json_feeds(data: bytes) -> List[Dict[str, str]]:
    js = json.loads(data.decode("utf-8"))
    # attend soit {"feeds":[{"title":..., "url":...}, ...]} soit liste directe
    items = js.get("feeds", js)
    out = []
    for it in items:
        url = it.get("url")
        if url:
            out.append({"title": it.get("title") or url, "url": url})
    return out


def parse_csv_feeds(data: bytes) -> List[Dict[str, str]]:
    f = io.StringIO(data.decode("utf-8"))
    reader = csv.DictReader(f)
    out = []
    for row in reader:
        url = row.get("url") or row.get("feed_url")
        if url:
            out.append({"title": row.get("title") or url, "url": url})
    return out
