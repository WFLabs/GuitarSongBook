from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from models import Song, PracticeSession

router = APIRouter(prefix="/songs", tags=["songs"])


class SongIn(BaseModel):
    title: str
    artist: str = ""
    genre: str = ""
    key: str = ""
    tuning: str = "Standard"
    capo: int = 0
    tempo: int = 0
    lyrics: str = ""
    tabs: str = ""
    notes: str = ""
    youtube_url: str = ""

class SongOut(SongIn):
    id: int
    media_file: str = ""
    created_at: datetime
    updated_at: datetime
    practice_count: int = 0
    last_practiced: Optional[datetime] = None

    class Config:
        from_attributes = True

class PracticeIn(BaseModel):
    duration_minutes: int = 0
    rating: int = 0
    notes: str = ""

class PracticeOut(PracticeIn):
    id: int
    song_id: int
    date: datetime

    class Config:
        from_attributes = True


def get_db():
    from main import SessionLocal
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/", response_model=list[SongOut])
def list_songs(genre: str = "", key: str = "", artist: str = "", search: str = "", db: Session = Depends(get_db)):
    q = db.query(Song)
    if genre:
        q = q.filter(Song.genre == genre)
    if key:
        q = q.filter(Song.key == key)
    if artist:
        q = q.filter(Song.artist == artist)
    if search:
        q = q.filter(Song.title.ilike(f"%{search}%") | Song.artist.ilike(f"%{search}%"))
    songs = q.order_by(Song.title).all()
    result = []
    for s in songs:
        count = db.query(func.count(PracticeSession.id)).filter(PracticeSession.song_id == s.id).scalar()
        last = db.query(func.max(PracticeSession.date)).filter(PracticeSession.song_id == s.id).scalar()
        d = SongOut.model_validate(s)
        d.practice_count = count or 0
        d.last_practiced = last
        result.append(d)
    return result


@router.post("/", response_model=SongOut)
def create_song(song: SongIn, db: Session = Depends(get_db)):
    s = Song(**song.model_dump())
    db.add(s)
    db.commit()
    db.refresh(s)
    out = SongOut.model_validate(s)
    out.practice_count = 0
    return out


@router.get("/{song_id}", response_model=SongOut)
def get_song(song_id: int, db: Session = Depends(get_db)):
    s = db.query(Song).get(song_id)
    if not s:
        raise HTTPException(404, "Not found")
    count = db.query(func.count(PracticeSession.id)).filter(PracticeSession.song_id == s.id).scalar()
    last = db.query(func.max(PracticeSession.date)).filter(PracticeSession.song_id == s.id).scalar()
    out = SongOut.model_validate(s)
    out.practice_count = count or 0
    out.last_practiced = last
    return out


@router.put("/{song_id}", response_model=SongOut)
def update_song(song_id: int, song: SongIn, db: Session = Depends(get_db)):
    s = db.query(Song).get(song_id)
    if not s:
        raise HTTPException(404, "Not found")
    for k, v in song.model_dump().items():
        setattr(s, k, v)
    s.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(s)
    count = db.query(func.count(PracticeSession.id)).filter(PracticeSession.song_id == s.id).scalar()
    last = db.query(func.max(PracticeSession.date)).filter(PracticeSession.song_id == s.id).scalar()
    out = SongOut.model_validate(s)
    out.practice_count = count or 0
    out.last_practiced = last
    return out


@router.delete("/{song_id}")
def delete_song(song_id: int, db: Session = Depends(get_db)):
    s = db.query(Song).get(song_id)
    if not s:
        raise HTTPException(404, "Not found")
    db.delete(s)
    db.commit()
    return {"ok": True}


@router.get("/meta/genres")
def get_genres(db: Session = Depends(get_db)):
    rows = db.query(Song.genre).distinct().filter(Song.genre != "").all()
    return sorted([r[0] for r in rows])


@router.get("/meta/keys")
def get_keys(db: Session = Depends(get_db)):
    rows = db.query(Song.key).distinct().filter(Song.key != "").all()
    return sorted([r[0] for r in rows])


@router.get("/meta/artists")
def get_artists(db: Session = Depends(get_db)):
    rows = db.query(Song.artist).distinct().filter(Song.artist != "").all()
    return sorted([r[0] for r in rows])


@router.post("/{song_id}/practice", response_model=PracticeOut)
def log_practice(song_id: int, data: PracticeIn, db: Session = Depends(get_db)):
    s = db.query(Song).get(song_id)
    if not s:
        raise HTTPException(404, "Not found")
    p = PracticeSession(song_id=song_id, **data.model_dump())
    db.add(p)
    db.commit()
    db.refresh(p)
    return p


@router.get("/{song_id}/practice", response_model=list[PracticeOut])
def get_practice(song_id: int, db: Session = Depends(get_db)):
    return db.query(PracticeSession).filter(PracticeSession.song_id == song_id).order_by(PracticeSession.date.desc()).all()
