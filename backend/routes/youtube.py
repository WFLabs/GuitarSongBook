from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
import yt_dlp
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

router = APIRouter(prefix="/youtube", tags=["youtube"])

MEDIA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "media")
os.makedirs(MEDIA_DIR, exist_ok=True)


class SearchRequest(BaseModel):
    query: str


class DownloadRequest(BaseModel):
    url: str
    song_id: int


def _search_yt(query: str, max_results: int = 8):
    ydl_opts = {
        "quiet": True,
        "no_warnings": True,
        "extract_flat": True,
        "default_search": "ytsearch",
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(f"ytsearch{max_results}:{query}", download=False)
        entries = info.get("entries", [])
        return [
            {
                "id": e.get("id"),
                "title": e.get("title"),
                "url": f"https://www.youtube.com/watch?v={e.get('id')}",
                "duration": e.get("duration"),
                "thumbnail": e.get("thumbnail"),
                "channel": e.get("channel") or e.get("uploader"),
            }
            for e in entries if e.get("id")
        ]


@router.post("/search")
def search_youtube(req: SearchRequest):
    try:
        return _search_yt(req.query)
    except Exception as e:
        raise HTTPException(500, str(e))


download_status: dict[int, dict] = {}


def _do_download(url: str, song_id: int, out_dir: str):
    download_status[song_id] = {"status": "downloading", "file": None, "error": None}

    def progress_hook(d):
        if d["status"] == "finished":
            download_status[song_id]["status"] = "processing"

    ydl_opts = {
        "format": "bestaudio/best",
        "outtmpl": os.path.join(out_dir, f"{song_id}.%(ext)s"),
        "postprocessors": [{"key": "FFmpegExtractAudio", "preferredcodec": "mp3", "preferredquality": "192"}],
        "quiet": True,
        "no_warnings": True,
        "progress_hooks": [progress_hook],
    }
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
        mp3_path = os.path.join(out_dir, f"{song_id}.mp3")
        if os.path.exists(mp3_path):
            from sqlalchemy.orm import Session
            from models import Song, get_engine
            engine = get_engine(os.path.join(os.path.dirname(out_dir), "backend", "songs.db"))
            with Session(engine) as db:
                s = db.get(Song, song_id)
                if s:
                    s.media_file = f"{song_id}.mp3"
                    s.youtube_url = url
                    db.commit()
            download_status[song_id] = {"status": "done", "file": f"{song_id}.mp3", "error": None}
        else:
            download_status[song_id] = {"status": "error", "file": None, "error": "mp3 not found after download"}
    except Exception as e:
        download_status[song_id] = {"status": "error", "file": None, "error": str(e)}


@router.post("/download")
def download_audio(req: DownloadRequest, background_tasks: BackgroundTasks):
    download_status[req.song_id] = {"status": "queued", "file": None, "error": None}
    background_tasks.add_task(_do_download, req.url, req.song_id, MEDIA_DIR)
    return {"status": "queued"}


@router.get("/status/{song_id}")
def get_status(song_id: int):
    return download_status.get(song_id, {"status": "unknown", "file": None, "error": None})
