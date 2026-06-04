from fastapi import APIRouter
import urllib.request
import urllib.parse
import json

router = APIRouter(prefix="/lyrics", tags=["lyrics"])

@router.get("/{artist}/{title}")
def get_lyrics(artist: str, title: str):
    encoded = f"{urllib.parse.quote(artist)}/{urllib.parse.quote(title)}"
    url = f"https://api.lyrics.ovh/v1/{encoded}"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "GuitarSongBook/1.0"})
        with urllib.request.urlopen(req, timeout=8) as r:
            return json.loads(r.read())
    except Exception:
        return {"lyrics": None}
