from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
import os, tempfile
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Preformatted
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER

router = APIRouter(prefix="/pdf", tags=["pdf"])


def build_pdf(song, out_path: str):
    doc = SimpleDocTemplate(
        out_path,
        pagesize=letter,
        rightMargin=0.75 * inch,
        leftMargin=0.75 * inch,
        topMargin=0.75 * inch,
        bottomMargin=0.75 * inch,
    )
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle("Title", parent=styles["Title"], fontSize=20, textColor=colors.HexColor("#2c3e50"))
    sub_style = ParagraphStyle("Sub", parent=styles["Normal"], fontSize=11, textColor=colors.HexColor("#555555"), alignment=TA_CENTER)
    section_style = ParagraphStyle("Section", parent=styles["Heading2"], fontSize=13, textColor=colors.HexColor("#1a5276"), spaceBefore=12)
    tab_style = ParagraphStyle("Tab", parent=styles["Code"], fontName="Courier", fontSize=9, leading=13)

    story = []

    story.append(Paragraph(song.title or "Untitled", title_style))
    story.append(Spacer(1, 4))

    meta_parts = []
    if song.artist:
        meta_parts.append(song.artist)
    if song.genre:
        meta_parts.append(song.genre)
    if song.key:
        meta_parts.append(f"Key of {song.key}")
    if song.tuning and song.tuning != "Standard":
        meta_parts.append(f"Tuning: {song.tuning}")
    if song.capo:
        meta_parts.append(f"Capo {song.capo}")
    if song.tempo:
        meta_parts.append(f"{song.tempo} BPM")
    if meta_parts:
        story.append(Paragraph(" • ".join(meta_parts), sub_style))

    story.append(Spacer(1, 16))

    if song.tabs and song.tabs.strip():
        story.append(Paragraph("Tabs", section_style))
        story.append(Spacer(1, 4))
        for line in song.tabs.split("\n"):
            story.append(Preformatted(line, tab_style))

    if song.lyrics and song.lyrics.strip():
        story.append(Spacer(1, 8))
        story.append(Paragraph("Lyrics", section_style))
        story.append(Spacer(1, 4))
        for line in song.lyrics.split("\n"):
            if line.strip():
                story.append(Paragraph(line.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"), styles["Normal"]))
            else:
                story.append(Spacer(1, 8))

    if song.notes and song.notes.strip():
        story.append(Spacer(1, 8))
        story.append(Paragraph("Notes", section_style))
        story.append(Paragraph(song.notes.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"), styles["Normal"]))

    doc.build(story)


@router.get("/{song_id}")
def export_pdf(song_id: int):
    from sqlalchemy.orm import Session as OrmSession
    import sys
    sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
    from models import Song, get_engine
    db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "songs.db")
    engine = get_engine(db_path)
    with OrmSession(engine) as db:
        song = db.get(Song, song_id)
        if not song:
            raise HTTPException(404, "Song not found")
        tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
        tmp.close()
        build_pdf(song, tmp.name)
        safe_title = "".join(c for c in (song.title or "song") if c.isalnum() or c in " _-").strip().replace(" ", "_")
        return FileResponse(tmp.name, media_type="application/pdf", filename=f"{safe_title}.pdf")
