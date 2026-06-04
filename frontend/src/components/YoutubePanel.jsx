import React, { useState, useEffect } from 'react'

export default function YoutubePanel({ song, onDownloaded }) {
  const [query, setQuery] = useState(`${song.artist} ${song.title}`.trim())
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [dlStatus, setDlStatus] = useState(null)
  const [polling, setPolling] = useState(false)

  useEffect(() => {
    if (!polling) return
    const id = setInterval(async () => {
      const r = await fetch(`/youtube/status/${song.id}`)
      const s = await r.json()
      setDlStatus(s)
      if (s.status === 'done' || s.status === 'error') {
        clearInterval(id)
        setPolling(false)
        if (s.status === 'done') onDownloaded()
      }
    }, 1500)
    return () => clearInterval(id)
  }, [polling])

  const search = async () => {
    if (!query.trim()) return
    setSearching(true)
    const r = await fetch('/youtube/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    })
    const data = await r.json()
    setResults(data)
    setSearching(false)
  }

  const download = async (url) => {
    setDlStatus({ status: 'queued' })
    await fetch('/youtube/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, song_id: song.id }),
    })
    setPolling(true)
  }

  const fmt = (sec) => {
    if (!sec) return ''
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m}:${String(s).padStart(2, '0')}`
  }

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: 16,
      marginBottom: 16,
    }}>
      <h3 style={{ fontSize: 14, marginBottom: 10, color: 'var(--text2)' }}>YouTube — Find &amp; Download Audio</h3>

      {song.media_file && (
        <p style={{ fontSize: 12, color: '#27ae60', marginBottom: 8 }}>
          ✓ Audio already downloaded. Search again to replace it.
        </p>
      )}

      {dlStatus && (
        <div style={{ fontSize: 12, padding: '6px 10px', borderRadius: 4, marginBottom: 10,
          background: dlStatus.status === 'done' ? '#1a3a1a' : dlStatus.status === 'error' ? '#3a1a1a' : 'var(--surface2)',
          color: dlStatus.status === 'done' ? '#2ecc71' : dlStatus.status === 'error' ? '#e74c3c' : 'var(--text)',
        }}>
          {dlStatus.status === 'queued' && '⏳ Queued…'}
          {dlStatus.status === 'downloading' && '⬇ Downloading…'}
          {dlStatus.status === 'processing' && '⚙ Converting to MP3…'}
          {dlStatus.status === 'done' && '✓ Download complete! Audio is ready.'}
          {dlStatus.status === 'error' && `Error: ${dlStatus.error}`}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input value={query} onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && search()}
          placeholder="Search YouTube…" style={{ flex: 1 }} />
        <button className="btn-secondary btn-sm" onClick={search} disabled={searching} style={{ flexShrink: 0 }}>
          {searching ? 'Searching…' : 'Search'}
        </button>
      </div>

      {results.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 320, overflow: 'auto' }}>
          {results.map(r => (
            <div key={r.id} style={{
              display: 'flex', gap: 10, alignItems: 'center',
              background: 'var(--bg)', borderRadius: 'var(--radius)', padding: '8px 10px',
            }}>
              {r.thumbnail && (
                <img src={r.thumbnail} alt="" style={{ width: 64, height: 36, objectFit: 'cover', borderRadius: 3, flexShrink: 0 }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {r.title}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text2)' }}>
                  {r.channel}{r.duration ? ` • ${fmt(r.duration)}` : ''}
                </div>
              </div>
              <button className="btn-primary btn-sm" style={{ flexShrink: 0 }}
                onClick={() => download(r.url)} disabled={polling}>
                ⬇ Download
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
