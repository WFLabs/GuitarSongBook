import React, { useState, useEffect } from 'react'
import PracticeTracker from './PracticeTracker'
import YoutubePanel from './YoutubePanel'
import LyricsView, { transposeLyrics } from './LyricsView'
import { CHORD_DB, UKU_CHORD_DB } from './ChordDiagram'
import ChordDiagramSVG from './ChordDiagram'
import PianoChordDiagram from './PianoChordDiagram'

function extractChords(lyrics, transpose) {
  if (!lyrics) return []
  const text = transpose ? transposeLyrics(lyrics, transpose) : lyrics
  const seen = new Set()
  for (const m of text.matchAll(/\[([^\]]+)\]/g)) {
    const name = m[1]
    if (CHORD_DB[name] || UKU_CHORD_DB[name]) seen.add(name)
  }
  return [...seen]
}

const BackIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6"/>
  </svg>
)
const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M7 5.5v13a1 1 0 0 0 1.5.87l11-6.5a1 1 0 0 0 0-1.74l-11-6.5A1 1 0 0 0 7 5.5Z"/>
  </svg>
)
const YTIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M22 7.5a3 3 0 0 0-2.1-2.1C18 5 12 5 12 5s-6 0-7.9.4A3 3 0 0 0 2 7.5 31 31 0 0 0 1.7 12 31 31 0 0 0 2 16.5a3 3 0 0 0 2.1 2.1C6 19 12 19 12 19s6 0 7.9-.4a3 3 0 0 0 2.1-2.1A31 31 0 0 0 22.3 12 31 31 0 0 0 22 7.5ZM10 15V9l5.2 3Z"/>
  </svg>
)
const PDFIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z"/>
    <path d="M14 3v5h5"/>
  </svg>
)
const ChevronIcon = ({ open }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ width: 14, height: 14, transform: open ? 'rotate(180deg)' : 'none', transition: '.2s' }}>
    <path d="M6 9l6 6 6-6"/>
  </svg>
)

export default function SongView({ songId, transpose, onTransposeChange, onEdit, onDeleted, setPlayerSong, onBack }) {
  const [song, setSong]         = useState(null)
  const [tab, setTab]           = useState('lyrics')
  const [showYT, setShowYT]     = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [twoCol, setTwoCol]     = useState(true)
  const [chordsOpen, setChordsOpen] = useState(true)
  const [chordDisplay, setChordDisplay] = useState('guitar')

  const load = () => fetch(`/songs/${songId}`).then(r => r.json()).then(setSong)
  useEffect(() => { load() }, [songId])
  useEffect(() => { setTab('lyrics') }, [songId])

  if (!song) return (
    <div className="song-main" style={{ color: 'var(--text-3)', fontFamily: 'var(--f-mono)' }}>Loading…</div>
  )

  const deleteSong = async () => {
    if (!confirm(`Delete "${song.title}"?`)) return
    setDeleting(true)
    await fetch(`/songs/${song.id}`, { method: 'DELETE' })
    onDeleted()
  }

  const exportPdf = () => {
    const a = document.createElement('a')
    a.href = `/pdf/${song.id}`
    a.download = `${song.title}.pdf`
    a.click()
  }

  const transposeVal = transpose > 0 ? `+${transpose}` : String(transpose)
  const chords = extractChords(song.lyrics, transpose)

  return (
      <div className="song-main view-fade">
        <button className="backlink" onClick={onBack}>
          <BackIcon /> Library
        </button>

        <div className="song-head">
          <div>
            <h1 className="song-title">{song.title}</h1>
            {song.artist && <div className="song-artist">{song.artist}</div>}
            <div className="song-meta">
              {song.genre && <span className="chip">{song.genre}</span>}
              {song.key && <span className="chip key">Key of {song.key}</span>}
              {song.tuning && song.tuning !== 'Standard' && <span className="chip mono">{song.tuning}</span>}
              {song.capo > 0 && <span className="chip">Capo {song.capo}</span>}
              {song.tempo > 0 && <span className="chip mono">{song.tempo} bpm</span>}
            </div>
          </div>
          <div className="song-acts">
            {song.media_file && (
              <button className="btn primary" onClick={() => setPlayerSong(song)}>
                <PlayIcon /> Play
              </button>
            )}
            <button className="btn" onClick={() => setShowYT(v => !v)}>
              <YTIcon /> YouTube
            </button>
            <button className="btn" onClick={exportPdf}>
              <PDFIcon /> PDF
            </button>
            <button className="btn ghost" onClick={onEdit}>Edit</button>
            <button className="btn ghost danger" onClick={deleteSong} disabled={deleting}>Delete</button>
          </div>
        </div>

        {showYT && (
          <div style={{ marginTop: 20 }}>
            <YoutubePanel song={song} onDownloaded={load} />
          </div>
        )}

        {/* Tabs */}
        <div className="tabs">
          {[['tabs','Tabs'],['lyrics','Lyrics'],['notes','Notes'],['practice','Practice']].map(([id, label]) => (
            <button key={id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}>
              {label}{id === 'practice' && song.practice_count > 0 ? ` (${song.practice_count})` : ''}
            </button>
          ))}
        </div>

        {/* Song toolbar — only for lyrics tab */}
        {tab === 'lyrics' && (
          <div className="song-toolbar">
            <div className="tool-group">
              <span className="tiny">Transpose</span>
              <div className="stepper">
                <button onClick={() => onTransposeChange(t => Math.max(-11, t - 1))}>−</button>
                <span className="val">{transposeVal}</span>
                <button onClick={() => onTransposeChange(t => Math.min(11, t + 1))}>+</button>
              </div>
            </div>
            <div className="tool-group">
              <div className="segmented">
                <button className={!twoCol ? 'on' : ''} onClick={() => setTwoCol(false)}>1 col</button>
                <button className={twoCol ? 'on' : ''} onClick={() => setTwoCol(true)}>2 col</button>
              </div>
            </div>
          </div>
        )}

        {/* Chord panel — collapsible, above lyrics */}
        {tab === 'lyrics' && chords.length > 0 && (
          <div className="chord-panel">
            <button className="chord-panel-toggle" onClick={() => setChordsOpen(v => !v)}>
              <span>Chords <span className="chord-panel-count">({chords.length})</span></span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div className="segmented" onClick={e => e.stopPropagation()} style={{ padding: '2px', gap: '2px' }}>
                  <button className={chordDisplay === 'guitar' ? 'on' : ''} onClick={() => setChordDisplay('guitar')}>Guitar</button>
                  <button className={chordDisplay === 'ukulele' ? 'on' : ''} onClick={() => setChordDisplay('ukulele')}>Ukulele</button>
                  <button className={chordDisplay === 'piano' ? 'on' : ''} onClick={() => setChordDisplay('piano')}>Piano</button>
                </div>
                <ChevronIcon open={chordsOpen} />
              </div>
            </button>
            {chordsOpen && (
              <div className={`chord-panel-grid${chordDisplay === 'piano' ? ' piano' : ''}`}>
                {chords.map(name => (
                  <div className="chord" key={name}>
                    <span className="cname">{name}</span>
                    {chordDisplay === 'guitar' && CHORD_DB[name] && <ChordDiagramSVG name={name} {...CHORD_DB[name]} />}
                    {chordDisplay === 'ukulele' && UKU_CHORD_DB[name] && <ChordDiagramSVG name={name} {...UKU_CHORD_DB[name]} strings={4} />}
                    {chordDisplay === 'piano' && <PianoChordDiagram name={name} />}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Content panels */}
        {tab === 'tabs' && (
          song.tabs
            ? <pre className="tabs-content">{song.tabs}</pre>
            : <EmptyMsg>No tabs added yet. Click Edit to add tabs.</EmptyMsg>
        )}
        {tab === 'lyrics' && (
          song.lyrics
            ? <LyricsView lyrics={song.lyrics} transpose={transpose} twoCol={twoCol} />
            : <EmptyMsg>No lyrics added yet.</EmptyMsg>
        )}
        {tab === 'notes' && (
          song.notes
            ? <div className="notes-content">{song.notes}</div>
            : <EmptyMsg>No notes added yet.</EmptyMsg>
        )}
        {tab === 'practice' && <PracticeTracker songId={song.id} />}
      </div>

  )
}

function EmptyMsg({ children }) {
  return <p style={{ color: 'var(--text-3)', fontStyle: 'italic', padding: '20px 0', fontFamily: 'var(--f-ui)' }}>{children}</p>
}
