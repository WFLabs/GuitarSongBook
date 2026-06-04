import os
import subprocess
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import sessionmaker
from models import Base, get_engine

DB_PATH = os.path.join(os.path.dirname(__file__), "songs.db")
MEDIA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "media")

engine = get_engine(DB_PATH)
Base.metadata.create_all(engine)
SessionLocal = sessionmaker(bind=engine)

app = FastAPI(title="Guitar Song Book")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:4173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

from routes.songs import router as songs_router
from routes.youtube import router as youtube_router
from routes.pdf import router as pdf_router
from routes.lyrics import router as lyrics_router
from routes.tabs import router as tabs_router
from routes.playlists import router as playlists_router

app.include_router(songs_router)
app.include_router(youtube_router)
app.include_router(pdf_router)
app.include_router(lyrics_router)
app.include_router(tabs_router)
app.include_router(playlists_router)

os.makedirs(MEDIA_DIR, exist_ok=True)
app.mount("/media", StaticFiles(directory=MEDIA_DIR), name="media")

@app.get("/health")
def health():
    return {"ok": True}

PROJECT_DIR = os.path.dirname(os.path.dirname(__file__))

@app.post("/launch-terminal")
def launch_terminal():
    subprocess.Popen(
        ["konsole", "--workdir", PROJECT_DIR],
        start_new_session=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    return {"ok": True}
