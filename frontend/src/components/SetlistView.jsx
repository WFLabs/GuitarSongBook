import React, { useState, useEffect } from 'react'

const BackIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6"/>
  </svg>
)
const GripIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <circle cx="9" cy="6" r="1.6"/><circle cx="15" cy="6" r="1.6"/>
    <circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/>
    <circle cx="9" cy="18" r="1.6"/><circle cx="15" cy="18" r="1.6"/>
  </svg>
)
const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M7 5.5v13a1 1 0 0 0 1.5.87l11-6.5a1 1 0 0 0 0-1.74l-11-6.5A1 1 0 0 0 7 5.5Z"/>
  </svg>
)
const PauseIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="5" width="4" height="14" rx="1"/>
    <rect x="14" y="5" width="4" height="14" rx="1"/>
  </svg>
)
const ShuffleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>
  </svg>
)

export default function SetlistView({ playlistId, onBack }) {
  const [playlists, setPlaylists] = useState([])
  const [loading, setLoading] = useState(true)
  const [metroRunning, setMetroRunning] = useState(false)

  useEffect(() => {
    fetch('/playlists/')
      .then(r => r.json())
      .then(data => { setPlaylists(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [playlistId])

  const playlist = playlists.find(p => p.id === playlistId) ?? null
  const songs = playlist?.entries ?? []
  const first = songs[0]?.song ?? null

  const firstTempo = first?.tempo ?? 100
  const pct = Math.max(4, Math.min(96, ((firstTempo - 40) / 160) * 100))

  if (loading) return (
    <div className="set-wrap">
      <button className="backlink" onClick={onBack}><BackIcon /> Library</button>
      <p style={{ color: 'var(--text-3)', fontFamily: 'var(--f-mono)', marginTop: 24 }}>Loading…</p>
    </div>
  )

  if (!playlistId || !playlist) return (
    <div className="set-wrap">
      <button className="backlink" onClick={onBack}><BackIcon /> Library</button>
      <p style={{ color: 'var(--text-3)', marginTop: 24 }}>
        No playlist selected. Choose a playlist in the Library and click "Run setlist".
      </p>
    </div>
  )

  return (
    <div className="set-wrap">
      <button className="backlink" onClick={onBack}><BackIcon /> Library</button>

      <div className="set-head">
        <div>
          <h1 className="set-title">{playlist.name}</h1>
          <div className="set-sub">{songs.length} song{songs.length !== 1 ? 's' : ''}</div>
        </div>
        <div className="tool-group">
          <button className="btn"><ShuffleIcon /> Shuffle</button>
          <button className="btn primary"><PlayIcon /> Start set</button>
        </div>
      </div>

      {first && (
        <div className="now-card">
          <div className="now-tag">Now · up next</div>
          <div className="now-row">
            <div>
              <div className="now-title">{first.title}</div>
              <div className="now-meta">{first.artist}</div>
            </div>
            <div className="now-metro">
              {firstTempo > 0 && (
                <div className="bpm">
                  <b>{firstTempo}</b>
                  <span>bpm</span>
                </div>
              )}
              <button
                className={`startbtn${metroRunning ? ' on' : ''}`}
                onClick={() => setMetroRunning(v => !v)}
              >
                {metroRunning ? <PauseIcon /> : <PlayIcon />}
              </button>
            </div>
          </div>
          {firstTempo > 0 && (
            <div className="slider" style={{ marginTop: 18 }}>
              <div className="fill" style={{ width: pct + '%' }} />
              <div className="knob" style={{ left: pct + '%' }} />
            </div>
          )}
        </div>
      )}

      <div className="set-list">
        {songs.map((entry, i) => (
          <div key={entry.id} className="set-row">
            <span className="grip"><GripIcon /></span>
            <span className="idx">{String(i + 1).padStart(2, '0')}</span>
            <div className="s-info">
              <b>{entry.song.title}</b>
              <span>{entry.song.artist}</span>
            </div>
            {entry.song.tempo > 0 && (
              <span className="chip mono">{entry.song.tempo} bpm</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
