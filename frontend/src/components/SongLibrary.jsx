import React, { useState, useEffect, useRef } from 'react'

const UG_SEARCH_LINK = q =>
  `https://www.ultimate-guitar.com/search.php?search_type=title&value=${encodeURIComponent(q)}`

function fmtDuration(sec) {
  if (!sec) return ''
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

function stars(n) {
  const full = Math.round(n)
  return '★'.repeat(full) + '☆'.repeat(5 - full)
}

export default function SongLibrary({ onSelect, onEdit, onNew, onPrefillNew, setPlayerSong, onAddToPlaylist }) {
  const [songs, setSongs]     = useState([])
  const [genres, setGenres]   = useState([])
  const [keys, setKeys]       = useState([])
  const [artists, setArtists] = useState([])
  const [filter, setFilter]   = useState({ genre: '', key: '', artist: '', search: '' })
  const [loading, setLoading] = useState(true)

  const [onlineOpen, setOnlineOpen]     = useState(false)
  const [tabResults, setTabResults]     = useState([])
  const [tabLoading, setTabLoading]     = useState(false)
  const [tabError, setTabError]         = useState('')
  const [importing, setImporting]       = useState({})  // { tab_url: 'loading'|'done'|'error' }

  const searchRef = useRef(null)

  useEffect(() => {
    Promise.all([
      fetch('/songs/meta/genres').then(r => r.json()),
      fetch('/songs/meta/keys').then(r => r.json()),
      fetch('/songs/meta/artists').then(r => r.json()),
    ]).then(([g, k, a]) => { setGenres(g); setKeys(k); setArtists(a) })
  }, [])

  useEffect(() => {
    setLoading(true)
    const p = new URLSearchParams()
    if (filter.genre)  p.set('genre', filter.genre)
    if (filter.key)    p.set('key', filter.key)
    if (filter.artist) p.set('artist', filter.artist)
    if (filter.search) p.set('search', filter.search)
    fetch('/songs/?' + p).then(r => r.json()).then(d => { setSongs(d); setLoading(false) })
  }, [filter])

  useEffect(() => {
    if (!filter.search) { setOnlineOpen(false); setTabResults([]) }
  }, [filter.search])

  const searchOnline = async () => {
    if (!filter.search.trim()) return
    setOnlineOpen(true)
    setTabLoading(true)
    setTabError('')
    setTabResults([])
    try {
      const r = await fetch(`/tabs/search?q=${encodeURIComponent(filter.search)}`)
      const data = await r.json()
      if (data.error) setTabError(data.error)
      else setTabResults(Array.isArray(data) ? data : [])
    } catch (e) {
      setTabError('Search failed. Check your connection.')
    }
    setTabLoading(false)
  }

  const importTab = async (tab) => {
    const key = tab.tab_url
    setImporting(m => ({ ...m, [key]: 'loading' }))
    try {
      const r = await fetch(`/tabs/content?tab_url=${encodeURIComponent(tab.tab_url)}`)
      const data = await r.json()
      if (data.error) { setImporting(m => ({ ...m, [key]: 'error' })); return }
      setImporting(m => ({ ...m, [key]: 'done' }))
      // Open editor pre-filled; user can add YouTube audio from the song view
      onPrefillNew({
        title:    data.title  || tab.song_name,
        artist:   data.artist || tab.artist_name,
        tabs:     data.tabs     || '',
        lyrics:   data.lyrics   || '',
        notes:    data.notes    || '',
        key:      data.key      || '',
        capo:     data.capo     || 0,
        tuning:   data.tuning   || 'Standard',
        tempo:    data.tempo    || 0,
        youtube_url: '',
      }, null)
    } catch {
      setImporting(m => ({ ...m, [key]: 'error' }))
    }
  }

  return (
    <div>
      {/* ── Filter bar ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: '1 1 200px' }}>
          <label>Search</label>
          <input
            ref={searchRef}
            placeholder="Title or artist…"
            value={filter.search}
            onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && searchOnline()}
          />
        </div>
        <div style={{ flex: '0 1 180px' }}>
          <label>Artist</label>
          <select value={filter.artist} onChange={e => setFilter(f => ({ ...f, artist: e.target.value }))}>
            <option value="">All artists</option>
            {artists.map(a => <option key={a}>{a}</option>)}
          </select>
        </div>
        <div style={{ flex: '0 1 160px' }}>
          <label>Genre</label>
          <select value={filter.genre} onChange={e => setFilter(f => ({ ...f, genre: e.target.value }))}>
            <option value="">All genres</option>
            {genres.map(g => <option key={g}>{g}</option>)}
          </select>
        </div>
        <div style={{ flex: '0 1 140px' }}>
          <label>Key</label>
          <select value={filter.key} onChange={e => setFilter(f => ({ ...f, key: e.target.value }))}>
            <option value="">All keys</option>
            {keys.map(k => <option key={k}>{k}</option>)}
          </select>
        </div>
        {filter.search && (
          <button className="btn-secondary btn-sm" style={{ flexShrink: 0, marginBottom: 1 }}
            onClick={searchOnline}>
            Search online
          </button>
        )}
        <button className="btn-ghost btn-sm"
          onClick={() => { setFilter({ genre: '', key: '', artist: '', search: '' }); setOnlineOpen(false); setTabResults([]) }}>
          Clear
        </button>
      </div>

      {/* ── Local results ── */}
      {loading ? (
        <p style={{ color: 'var(--text2)' }}>Loading…</p>
      ) : songs.length === 0 && !filter.search ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text2)' }}>
          <p style={{ fontSize: 40, marginBottom: 12 }}>🎵</p>
          <p>No songs yet.
            <button className="btn-primary btn-sm" style={{ marginLeft: 8 }} onClick={onNew}>
              Add your first song
            </button>
          </p>
        </div>
      ) : songs.length === 0 && filter.search ? (
        <p style={{ color: 'var(--text2)', marginBottom: 16 }}>
          Not in your library.{' '}
          {!onlineOpen && (
            <button className="btn-secondary btn-sm" style={{ marginLeft: 6 }} onClick={searchOnline}>
              Search online
            </button>
          )}
        </p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12, marginBottom: 24 }}>
          {songs.map(s => (
            <SongCard key={s.id} song={s} onSelect={onSelect} onEdit={onEdit} setPlayerSong={setPlayerSong} onAddToPlaylist={onAddToPlaylist} />
          ))}
        </div>
      )}

      {/* ── Online results panel ── */}
      {onlineOpen && (
        <div style={{ marginTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14,
            paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent2)' }}>
              Online results
            </span>
            <span style={{ fontSize: 12, color: 'var(--text2)' }}>for "{filter.search}"</span>
            <a href={UG_SEARCH_LINK(filter.search)} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 12, color: 'var(--text2)', marginLeft: 'auto', textDecoration: 'none',
                border: '1px solid var(--border)', borderRadius: 4, padding: '2px 8px' }}>
              Open UG ↗
            </a>
            <button className="btn-ghost btn-sm"
              onClick={() => { setOnlineOpen(false); setTabResults([]) }}>✕</button>
          </div>

          {/* Tab results */}
          {tabLoading && <p style={{ color: 'var(--text2)' }}>Searching Ultimate Guitar…</p>}

          {tabError && (
            <div style={{ fontSize: 13, color: '#e67e22', marginBottom: 12, padding: '8px 12px',
              background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <strong>Tab search unavailable:</strong> {tabError}
              <br />
              <a href={UG_SEARCH_LINK(filter.search)} target="_blank" rel="noopener noreferrer"
                style={{ color: 'var(--accent2)' }}>
                Search Ultimate Guitar manually ↗
              </a>
            </div>
          )}

          {!tabLoading && tabResults.length === 0 && !tabError && (
            <p style={{ color: 'var(--text2)', marginBottom: 12 }}>
              No tab results found. <a href={UG_SEARCH_LINK(filter.search)} target="_blank"
                rel="noopener noreferrer" style={{ color: 'var(--accent2)' }}>Try Ultimate Guitar ↗</a>
            </p>
          )}

          {tabResults.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {tabResults.map(t => {
                const state = importing[t.tab_url]
                return (
                  <div key={t.tab_url} style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>
                        {t.artist_name} — {t.song_name}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>
                        <span style={{ background: 'var(--surface2)', borderRadius: 3,
                          padding: '1px 6px', marginRight: 8 }}>{t.type}</span>
                        {t.rating > 0 && (
                          <span style={{ color: '#f5c518' }}>{stars(t.rating)}</span>
                        )}
                        {t.votes > 0 && (
                          <span style={{ marginLeft: 6 }}>{t.votes} votes</span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <a href={t.tab_url} target="_blank" rel="noopener noreferrer"
                        className="btn-ghost btn-sm"
                        style={{ textDecoration: 'none', padding: '4px 10px', fontSize: 12 }}>
                        View ↗
                      </a>
                      {state === 'done' ? (
                        <span style={{ fontSize: 12, color: '#2ecc71', padding: '4px 0' }}>✓ Imported</span>
                      ) : state === 'error' ? (
                        <span style={{ fontSize: 12, color: '#e74c3c', padding: '4px 0' }}>Failed</span>
                      ) : (
                        <button className="btn-primary btn-sm"
                          disabled={state === 'loading'}
                          onClick={() => importTab(t)}>
                          {state === 'loading' ? 'Importing…' : '⬇ Import'}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* How to add audio note */}
          {tabResults.length > 0 && (
            <p style={{ fontSize: 12, color: 'var(--text2)', fontStyle: 'italic' }}>
              After importing, open the song and use the YouTube panel to add audio.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function SongCard({ song: s, onSelect, onEdit, setPlayerSong, onAddToPlaylist }) {
  const [added, setAdded] = useState(false)

  const onDragStart = (e) => {
    e.dataTransfer.setData('song_id', String(s.id))
    e.dataTransfer.effectAllowed = 'copy'
  }

  const handleAdd = async (e) => {
    e.stopPropagation()
    await onAddToPlaylist(s.id)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={() => onSelect(s)}
      style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: '14px', cursor: 'pointer', transition: 'border-color 0.15s',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{s.title}</div>
          {s.artist && <div style={{ color: 'var(--text2)', fontSize: 12, marginTop: 2 }}>{s.artist}</div>}
        </div>
        <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
          {onAddToPlaylist && (
            <button
              className="btn-ghost btn-sm"
              title="Add to playlist"
              onClick={handleAdd}
              style={{ color: added ? '#2ecc71' : 'var(--text2)', fontWeight: 700 }}
            >
              {added ? '✓' : '+'}
            </button>
          )}
          {s.media_file && (
            <button className="btn-ghost btn-sm" title="Play" onClick={() => setPlayerSong(s)}>▶</button>
          )}
          <button className="btn-ghost btn-sm" onClick={() => onEdit(s)}>Edit</button>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
        {s.genre   && <Tag>{s.genre}</Tag>}
        {s.key     && <Tag accent>{s.key}</Tag>}
        {s.capo > 0 && <Tag>Capo {s.capo}</Tag>}
        {s.tuning && s.tuning !== 'Standard' && <Tag>{s.tuning}</Tag>}
      </div>
      <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text2)', display: 'flex', gap: 12 }}>
        <span>{s.practice_count} session{s.practice_count !== 1 ? 's' : ''}</span>
        {s.last_practiced && <span>Last: {new Date(s.last_practiced).toLocaleDateString()}</span>}
      </div>
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
