from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, create_engine
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime, timezone

Base = declarative_base()

class Song(Base):
    __tablename__ = "songs"
    id = Column(Integer, primary_key=True)
    title = Column(String, nullable=False)
    artist = Column(String, default="")
    genre = Column(String, default="")
    key = Column(String, default="")
    tuning = Column(String, default="Standard")
    capo = Column(Integer, default=0)
    tempo = Column(Integer, default=0)
    lyrics = Column(Text, default="")
    tabs = Column(Text, default="")
    notes = Column(Text, default="")
    media_file = Column(String, default="")
    youtube_url = Column(String, default="")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    sessions = relationship("PracticeSession", back_populates="song", cascade="all, delete-orphan")

class PracticeSession(Base):
    __tablename__ = "practice_sessions"
    id = Column(Integer, primary_key=True)
    song_id = Column(Integer, ForeignKey("songs.id"), nullable=False)
    date = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    duration_minutes = Column(Integer, default=0)
    rating = Column(Integer, default=0)
    notes = Column(Text, default="")
    song = relationship("Song", back_populates="sessions")


class Playlist(Base):
    __tablename__ = "playlists"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    entries = relationship("PlaylistSong", back_populates="playlist", cascade="all, delete-orphan",
                           order_by="PlaylistSong.position")

class PlaylistSong(Base):
    __tablename__ = "playlist_songs"
    id = Column(Integer, primary_key=True)
    playlist_id = Column(Integer, ForeignKey("playlists.id"), nullable=False)
    song_id = Column(Integer, ForeignKey("songs.id"), nullable=False)
    position = Column(Integer, default=0)
    playlist = relationship("Playlist", back_populates="entries")
    song = relationship("Song")


def get_engine(db_path="songs.db"):
    return create_engine(f"sqlite:///{db_path}", connect_args={"check_same_thread": False})
