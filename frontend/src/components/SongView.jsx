import React, { useState, useEffect } from 'react'
import PracticeTracker from './PracticeTracker'
import YoutubePanel from './YoutubePanel'
import LyricsView from './LyricsView'

export default function SongView({ songId, onEdit, onDeleted, setPlayerSong, instrument, setInstrument }) {
  const [song, setSong] = useState(null)
  const [tab, setTab] = useState('tabs')
  const [showYT, setShowYT] = useState(false)
  const [showPractice, setShowPractice] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [transpose, setTranspose] = useState(0)
  const [twoCol, setTwoCol] = useState(false)

  const load = () =>
    fetch(`/songs/${songId}`).then(r => r.json()).then(setSong)

  useEffect(() => { load() }, [songId])
  useEffect(() => { setTranspose(0) }, [songId])

  if (!song) return <p style={{ color: 'var(--text2)' }}>Loading…</p>

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

  return (
    <div style={{ maxWidth: twoCol ? 'none' : 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700 }}>{song.title}</h2>
          {song.artist && <div style={{ color: 'var(--text2)', marginTop: 2 }}>{song.artist}</div>}
          <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            {song.genre && <Tag>{song.genre}</Tag>}
            {song.key && <Tag accent>Key of {song.key}</Tag>}
            {song.tuning && song.tuning !== 'Standard' && <Tag>Tuning: {song.tuning}</Tag>}
            {song.capo > 0 && <Tag>Capo {song.capo}</Tag>}
            {song.tempo > 0 && <Tag>{song.tempo} BPM</Tag>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {song.media_file && (
            <button className="btn-secondary btn-sm" onClick={() => setPlayerSong(song)}>▶ Play</button>
          )}
          <button
            className={song.media_file ? 'btn-ghost btn-sm' : 'btn-secondary btn-sm'}
            onClick={() => setShowYT(v => !v)}>
            {showYT ? 'Hide YouTube' : (song.media_file ? '🔍 YouTube' : '+ Add Audio')}
          </button>
          <button className="btn-ghost btn-sm" onClick={exportPdf}>⬇ PDF</button>
          <button className="btn-ghost btn-sm" onClick={onEdit}>Edit</button>
          <button className="btn-danger btn-sm" onClick={deleteSong} disabled={deleting}>Delete</button>
        </div>
      </div>

      {showYT && <YoutubePanel song={song} onDownloaded={load} />}

      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', marginBottom: 12 }}>
        {[['tabs','Tabs'],['lyrics','Lyrics'],['notes','Notes'],['practice','Practice']].map(([id, label]) => (
          <button key={id} onClick={() => { setTab(id); if (id === 'practice') setShowPractice(true) }} style={{
            background: tab === id ? 'var(--surface2)' : 'transparent',
            color: tab === id ? 'var(--text)' : 'var(--text2)',
            borderRadius: '6px 6px 0 0',
            padding: '7px 18px',
            fontWeight: tab === id ? 600 : 400,
            borderBottom: tab === id ? '2px solid var(--accent)' : '2px solid transparent',
          }}>
            {label}{id === 'practice' && song.practice_count > 0 ? ` (${song.practice_count})` : ''}
          </button>
        ))}
      </div>

      {tab === 'tabs' && (
        song.tabs ? (
          <pre style={{
            fontFamily: 'var(--mono)',
            fontSize: 13,
            lineHeight: 1.6,
            background: 'var(--surface)',
            padding: '16px',
            borderRadius: 'var(--radius)',
            overflow: 'auto',
            whiteSpace: 'pre',
          }}>{song.tabs}</pre>
        ) : <Empty>No tabs added yet. Click Edit to add tabs.</Empty>
      )}
      {tab === 'lyrics' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: 'var(--text2)' }}>Transpose</span>
            <button className="btn-ghost btn-sm" onClick={() => setTranspose(t => t - 1)}>−</button>
            <span style={{
              fontSize: 13, fontWeight: 600, minWidth: 32, textAlign: 'center',
              color: transpose !== 0 ? 'var(--accent)' : 'var(--text2)',
            }}>
              {transpose > 0 ? `+${transpose}` : transpose}
            </span>
            <button className="btn-ghost btn-sm" onClick={() => setTranspose(t => t + 1)}>+</button>
            {transpose !== 0 && (
              <button className="btn-ghost btn-sm" onClick={() => setTranspose(0)}>Reset</button>
            )}
            <div style={{ width: 1, height: 16, background: 'var(--border)', margin: '0 4px' }} />
            <button
              className="btn-ghost btn-sm"
              onClick={() => setTwoCol(v => !v)}
              style={{ color: twoCol ? 'var(--accent)' : undefined, fontWeight: twoCol ? 600 : undefined }}
            >
              {twoCol ? '1 col' : '2 col'}
            </button>
          </div>
          {song.lyrics ? <LyricsView lyrics={song.lyrics} transpose={transpose} twoCol={twoCol} instrument={instrument} setInstrument={setInstrument} /> : <Empty>No lyrics added yet.</Empty>}
        </>
      )}
      {tab === 'notes' && (
        song.notes ? (
          <div style={{
            background: 'var(--surface)',
            borderRadius: 'var(--radius)',
            padding: '16px',
            lineHeight: 1.7,
            whiteSpace: 'pre-wrap',
          }}>{song.notes}</div>
        ) : <Empty>No notes added yet.</Empty>
      )}
      {tab === 'practice' && (
        <PracticeTracker songId={song.id} />
      )}
    </div>
  )
}

function Tag({ children, accent }) {
  return (
    <span style={{
      background: accent ? 'var(--accent)' : 'var(--surface2)',
      color: accent ? '#fff' : 'var(--text2)',
      borderRadius: 4, padding: '2px 7px', fontSize: 11,
      fontWeight: accent ? 600 : 400,
    }}>{children}</span>
  )
}

function Empty({ children }) {
  return <p style={{ color: 'var(--text2)', fontStyle: 'italic', padding: '20px 0' }}>{children}</p>
}
