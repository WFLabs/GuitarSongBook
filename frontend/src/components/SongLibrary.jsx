import React, { useState, useEffect } from 'react'

const UG_SEARCH_LINK = q =>
  `https://www.ultimate-guitar.com/search.php?search_type=title&value=${encodeURIComponent(q)}`

const STD_TUNING = 'Standard'

function stars(n) {
  const full = Math.round(n)
  return '★'.repeat(full) + '☆'.repeat(5 - full)
}

function getFavorites() {
  try { return JSON.parse(localStorage.getItem('gsb-favorites') || '{}') } catch { return {} }
}
function setFavorites(favs) {
  try { localStorage.setItem('gsb-favorites', JSON.stringify(favs)) } catch {}
}

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/>
  </svg>
)
const GridIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/>
    <rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/>
  </svg>
)
const ListIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>
  </svg>
)
const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M12 5v14M5 12h14"/>
  </svg>
)
const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M7 5.5v13a1 1 0 0 0 1.5.87l11-6.5a1 1 0 0 0 0-1.74l-11-6.5A1 1 0 0 0 7 5.5Z"/>
  </svg>
)
const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>
  </svg>
)
const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 20s-7-4.3-9.3-8.4C1 8.5 2.4 5 5.8 5 8 5 9.4 6.6 12 9c2.6-2.4 4-4 6.2-4 3.4 0 4.8 3.5 3.1 6.6C19 15.7 12 20 12 20Z"/>
  </svg>
)
const HeartFilledIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 20s-7-4.3-9.3-8.4C1 8.5 2.4 5 5.8 5 8 5 9.4 6.6 12 9c2.6-2.4 4-4 6.2-4 3.4 0 4.8 3.5 3.1 6.6C19 15.7 12 20 12 20Z"/>
  </svg>
)

export default function SongLibrary({ onSelect, onEdit, onNew, onPrefillNew, setPlayerSong, onAddToPlaylist }) {
  const [songs, setSongs]     = useState([])
  const [genres, setGenres]   = useState([])
  const [keys, setKeys]       = useState([])
  const [artists, setArtists] = useState([])
  const [filter, setFilter]   = useState({ genre: '', key: '', artist: '', search: '' })
  const [loading, setLoading] = useState(true)
  const [gridMode, setGridMode] = useState('grid')

  const [onlineOpen, setOnlineOpen]  = useState(false)
  const [tabResults, setTabResults]  = useState([])
  const [tabLoading, setTabLoading]  = useState(false)
  const [tabError, setTabError]      = useState('')
  const [importing, setImporting]    = useState({})

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
    setOnlineOpen(true); setTabLoading(true); setTabError(''); setTabResults([])
    try {
      const r = await fetch(`/tabs/search?q=${encodeURIComponent(filter.search)}`)
      const data = await r.json()
      if (data.error) setTabError(data.error)
      else setTabResults(Array.isArray(data) ? data : [])
    } catch { setTabError('Search failed. Check your connection.') }
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
      onPrefillNew({
        title: data.title || tab.song_name, artist: data.artist || tab.artist_name,
        tabs: data.tabs || '', lyrics: data.lyrics || '', notes: data.notes || '',
        key: data.key || '', capo: data.capo || 0,
        tuning: data.tuning || 'Standard', tempo: data.tempo || 0, youtube_url: '',
      }, null)
    } catch { setImporting(m => ({ ...m, [key]: 'error' })) }
  }

  return (
    <div>
      {/* toolbar */}
      <div className="toolbar">
        <label className="search">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search title or artist…"
            value={filter.search}
            onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && searchOnline()}
          />
        </label>
        <select className="selectbox" value={filter.artist} onChange={e => setFilter(f => ({ ...f, artist: e.target.value }))}>
          <option value="">All artists</option>
          {artists.map(a => <option key={a}>{a}</option>)}
        </select>
        <select className="selectbox" value={filter.genre} onChange={e => setFilter(f => ({ ...f, genre: e.target.value }))}>
          <option value="">All genres</option>
          {genres.map(g => <option key={g}>{g}</option>)}
        </select>
        <select className="selectbox" value={filter.key} onChange={e => setFilter(f => ({ ...f, key: e.target.value }))}>
          <option value="">All keys</option>
          {keys.map(k => <option key={k}>{k}</option>)}
        </select>
      </div>

      {/* toolbar foot */}
      <div className="toolbar-foot">
        <span className="tiny">{songs.length} songs</span>
        <div className="tool-group">
          {filter.search && (
            <button className="btn sm ghost" onClick={searchOnline} style={{ marginRight: 8 }}>Search online</button>
          )}
          <span className="tiny" style={{ marginRight: 4 }}>Sort A–Z</span>
          <div className="viewtoggle">
            <button className={gridMode === 'grid' ? 'on' : ''} onClick={() => setGridMode('grid')}>
              <GridIcon /> Grid
            </button>
            <button className={gridMode === 'list' ? 'on' : ''} onClick={() => setGridMode('list')}>
              <ListIcon /> List
            </button>
          </div>
        </div>
      </div>

      {/* song grid */}
      {loading ? (
        <p style={{ color: 'var(--text-3)', fontFamily: 'var(--f-mono)' }}>Loading…</p>
      ) : songs.length === 0 && !filter.search ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p style={{ fontSize: 40, marginBottom: 12 }}>🎸</p>
          <p style={{ color: 'var(--text-2)' }}>
            No songs yet.{' '}
            <button className="btn primary btn-sm" style={{ marginLeft: 8 }} onClick={onNew}>Add your first song</button>
          </p>
        </div>
      ) : songs.length === 0 ? (
        <p style={{ color: 'var(--text-2)', marginBottom: 16 }}>
          Not in your library.{' '}
          {!onlineOpen && <button className="btn sm" style={{ marginLeft: 6 }} onClick={searchOnline}>Search online</button>}
        </p>
      ) : (
        <div className={`songgrid${gridMode === 'list' ? ' list' : ''}`}>
          {songs.map(s => (
            <SongCard
              key={s.id}
              song={s}
              onSelect={onSelect}
              onEdit={onEdit}
              setPlayerSong={setPlayerSong}
              onAddToPlaylist={onAddToPlaylist}
            />
          ))}
        </div>
      )}

      {/* online results */}
      {onlineOpen && (
        <div style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid var(--line)' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--amber)' }}>Online results</span>
            <span style={{ fontSize: 12, color: 'var(--text-2)' }}>for "{filter.search}"</span>
            <a href={UG_SEARCH_LINK(filter.search)} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 12, color: 'var(--text-2)', marginLeft: 'auto', textDecoration: 'none', border: '1px solid var(--line)', borderRadius: 6, padding: '2px 8px' }}>
              Open UG ↗
            </a>
            <button className="btn sm ghost" onClick={() => { setOnlineOpen(false); setTabResults([]) }}>✕</button>
          </div>

          {tabLoading && <p style={{ color: 'var(--text-3)' }}>Searching Ultimate Guitar…</p>}
          {tabError && (
            <div style={{ fontSize: 13, color: 'var(--amber)', marginBottom: 12, padding: '8px 12px', background: 'var(--surface)', borderRadius: 'var(--r-md)', border: '1px solid var(--line)' }}>
              <strong>Tab search unavailable:</strong> {tabError}<br/>
              <a href={UG_SEARCH_LINK(filter.search)} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--amber)' }}>Search Ultimate Guitar manually ↗</a>
            </div>
          )}
          {!tabLoading && tabResults.length === 0 && !tabError && (
            <p style={{ color: 'var(--text-2)' }}>No results. <a href={UG_SEARCH_LINK(filter.search)} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--amber)' }}>Try Ultimate Guitar ↗</a></p>
          )}
          {tabResults.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {tabResults.map(t => {
                const state = importing[t.tab_url]
                return (
                  <div key={t.tab_url} style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-md)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{t.artist_name} — {t.song_name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2 }}>
                        <span style={{ background: 'var(--surface-2)', borderRadius: 4, padding: '1px 6px', marginRight: 8 }}>{t.type}</span>
                        {t.rating > 0 && <span style={{ color: 'var(--amber)' }}>{stars(t.rating)}</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <a href={t.tab_url} target="_blank" rel="noopener noreferrer" className="btn sm ghost" style={{ textDecoration: 'none' }}>View ↗</a>
                      {state === 'done' ? <span style={{ fontSize: 12, color: '#2ecc71', padding: '4px 0' }}>✓ Imported</span>
                        : state === 'error' ? <span style={{ fontSize: 12, color: 'var(--coral)', padding: '4px 0' }}>Failed</span>
                        : <button className="btn sm primary" disabled={state === 'loading'} onClick={() => importTab(t)}>{state === 'loading' ? 'Importing…' : '⬇ Import'}</button>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          {tabResults.length > 0 && (
            <p style={{ fontSize: 12, color: 'var(--text-3)', fontStyle: 'italic' }}>After importing, open the song and use the YouTube panel to add audio.</p>
          )}
        </div>
      )}
    </div>
  )
}

function SongCard({ song: s, onSelect, onEdit, setPlayerSong, onAddToPlaylist }) {
  const [favorites, setFavState] = useState(getFavorites)
  const isFav = !!favorites[s.id]

  const toggleFav = (e) => {
    e.stopPropagation()
    const next = { ...getFavorites(), [s.id]: !isFav || undefined }
    if (!next[s.id]) delete next[s.id]
    setFavorites(next)
    setFavState(next)
  }

  const [added, setAdded] = useState(false)
  const handleAdd = async (e) => {
    e.stopPropagation()
    if (!onAddToPlaylist) return
    await onAddToPlaylist(s.id)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const onDragStart = (e) => {
    e.dataTransfer.setData('song_id', String(s.id))
    e.dataTransfer.effectAllowed = 'copy'
  }

  return (
    <div className="card" draggable onDragStart={onDragStart} onClick={() => onSelect(s)}>
      <div className="card-top">
        <div>
          <div className="card-title">{s.title}</div>
          {s.artist && <div className="card-artist">{s.artist}</div>}
        </div>
        <button className={`fav${isFav ? ' on' : ''}`} onClick={toggleFav} title="Favorite">
          {isFav ? <HeartFilledIcon /> : <HeartIcon />}
        </button>
      </div>

      <div className="card-meta">
        {s.genre && <span className="chip">{s.genre}</span>}
        {s.key && <span className="chip key">{s.key}</span>}
        {s.capo > 0 && <span className="chip">Capo {s.capo}</span>}
        {s.tuning && s.tuning !== STD_TUNING && <span className="chip mono">{s.tuning}</span>}
      </div>

      <div className="card-foot">
        <span className="sessions">{s.practice_count} session{s.practice_count !== 1 ? 's' : ''}</span>
        <div className="card-acts">
          {onAddToPlaylist && (
            <button className="mini" title="Add to playlist" onClick={handleAdd}
              style={{ color: added ? 'var(--coral)' : undefined }}>
              {added ? '✓' : <PlusIcon />}
            </button>
          )}
          {s.media_file && (
            <button className="mini play" title="Play" onClick={e => { e.stopPropagation(); setPlayerSong(s) }}>
              <PlayIcon />
            </button>
          )}
          <button className="mini" title="Edit" onClick={e => { e.stopPropagation(); onEdit(s) }}>
            <EditIcon />
          </button>
        </div>
      </div>
    </div>
  )
}
