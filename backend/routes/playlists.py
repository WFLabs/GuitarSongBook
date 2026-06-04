from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from models import Playlist, PlaylistSong, Song

router = APIRouter(prefix="/playlists", tags=["playlists"])


class PlaylistIn(BaseModel):
    name: str

class SongBrief(BaseModel):
    id: int
    title: str
    artist: str = ""
    tempo: int = 0
    media_file: str = ""
    class Config:
        from_attributes = True

class PlaylistSongOut(BaseModel):
    id: int
    song_id: int
    position: int
    song: SongBrief
    class Config:
        from_attributes = True

class PlaylistOut(BaseModel):
    id: int
    name: str
    created_at: datetime
    entries: list[PlaylistSongOut] = []
    class Config:
        from_attributes = True

class ReorderIn(BaseModel):
    song_ids: list[int]

class AddSongIn(BaseModel):
    song_id: int


def get_db():
    from main import SessionLocal
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/", response_model=list[PlaylistOut])
def list_playlists(db: Session = Depends(get_db)):
    playlists = db.query(Playlist).order_by(Playlist.created_at).all()
    for pl in playlists:
        pl.entries = [e for e in pl.entries if e.song is not None]
    return playlists


@router.post("/", response_model=PlaylistOut)
def create_playlist(data: PlaylistIn, db: Session = Depends(get_db)):
    pl = Playlist(name=data.name)
    db.add(pl)
    db.commit()
    db.refresh(pl)
    return pl


@router.delete("/{playlist_id}")
def delete_playlist(playlist_id: int, db: Session = Depends(get_db)):
    pl = db.get(Playlist, playlist_id)
    if not pl:
        raise HTTPException(404, "Not found")
    db.delete(pl)
    db.commit()
    return {"ok": True}


@router.patch("/{playlist_id}", response_model=PlaylistOut)
def rename_playlist(playlist_id: int, data: PlaylistIn, db: Session = Depends(get_db)):
    pl = db.get(Playlist, playlist_id)
    if not pl:
        raise HTTPException(404, "Not found")
    pl.name = data.name
    db.commit()
    db.refresh(pl)
    return pl


@router.post("/{playlist_id}/songs", response_model=PlaylistOut)
def add_song(playlist_id: int, data: AddSongIn, db: Session = Depends(get_db)):
    pl = db.get(Playlist, playlist_id)
    if not pl:
        raise HTTPException(404, "Playlist not found")
    if not db.get(Song, data.song_id):
        raise HTTPException(404, "Song not found")
    already = any(e.song_id == data.song_id for e in pl.entries)
    if not already:
        pos = max((e.position for e in pl.entries), default=-1) + 1
        pl.entries.append(PlaylistSong(song_id=data.song_id, position=pos))
        db.commit()
    db.refresh(pl)
    return pl


@router.delete("/{playlist_id}/songs/{song_id}", response_model=PlaylistOut)
def remove_song(playlist_id: int, song_id: int, db: Session = Depends(get_db)):
    pl = db.get(Playlist, playlist_id)
    if not pl:
        raise HTTPException(404, "Not found")
    entry = next((e for e in pl.entries if e.song_id == song_id), None)
    if entry:
        db.delete(entry)
        db.commit()
    db.refresh(pl)
    return pl


@router.put("/{playlist_id}/reorder", response_model=PlaylistOut)
def reorder_songs(playlist_id: int, data: ReorderIn, db: Session = Depends(get_db)):
    pl = db.get(Playlist, playlist_id)
    if not pl:
        raise HTTPException(404, "Not found")
    entry_map = {e.song_id: e for e in pl.entries}
    for i, song_id in enumerate(data.song_ids):
        if song_id in entry_map:
            entry_map[song_id].position = i
    db.commit()
    db.refresh(pl)
    return pl
