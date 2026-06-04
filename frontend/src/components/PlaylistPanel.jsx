import React, { useState, useEffect, useRef } from 'react'

const GripIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <circle cx="9" cy="6" r="1.6"/><circle cx="15" cy="6" r="1.6"/>
    <circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/>
    <circle cx="9" cy="18" r="1.6"/><circle cx="15" cy="18" r="1.6"/>
  </svg>
)
const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M6 6l12 12M18 6 6 18"/>
  </svg>
)
const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M7 5.5v13a1 1 0 0 0 1.5.87l11-6.5a1 1 0 0 0 0-1.74l-11-6.5A1 1 0 0 0 7 5.5Z"/>
  </svg>
)
const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M12 5v14M5 12h14"/>
  </svg>
)

export default function PlaylistPanel({
  onSelectSong,
  setPlayerSong,
  onActiveIdChange,
  refreshKey,
  onAddSong,
  onRunSetlist,
}) {
  const [playlists, setPlaylists]     = useState([])
  const [activeId, setActiveId]       = useState(null)
  const [newName, setNewName]         = useState('')
  const [creating, setCreating]       = useState(false)
  const [dragOverIdx, setDragOverIdx] = useState(null)
  const [isDragOver, setIsDragOver]   = useState(false)
  const dragFromIdx = useRef(null)

  const load = () =>
    fetch('/playlists/')
      .then(r => r.json())
      .then(data => {
        setPlaylists(data)
        setActiveId(prev => {
          const valid = prev != null && data.some(p => p.id === prev) ? prev : (data[0]?.id ?? null)
          return valid
        })
      })
      .catch(err => console.error('Playlist load failed:', err))

  useEffect(() => { load() }, [])
  useEffect(() => { onActiveIdChange?.(activeId) }, [activeId])
  useEffect(() => { if (refreshKey > 0) load() }, [refreshKey])

  const changeActive = (id) => { setActiveId(id); onActiveIdChange?.(id) }

  const active = playlists.find(p => p.id === activeId) ?? null

  const createPlaylist = async () => {
    const name = newName.trim()
    if (!name) return
    const r = await fetch('/playlists/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    const pl = await r.json()
    if (!pl.id) return
    setPlaylists(prev => [...prev, pl])
    changeActive(pl.id)
    setNewName(''); setCreating(false)
  }

  const deletePlaylist = async (id) => {
    if (!confirm('Delete this playlist?')) return
    await fetch(`/playlists/${id}`, { method: 'DELETE' })
    setPlaylists(prev => {
      const rest = prev.filter(p => p.id !== id)
      changeActive(rest[0]?.id ?? null)
      return rest
    })
  }

  const removeSong = async (playlistId, songId) => {
    const r = await fetch(`/playlists/${playlistId}/songs/${songId}`, { method: 'DELETE' })
    const updated = await r.json()
    setPlaylists(prev => prev.map(p => p.id === playlistId ? updated : p))
  }

  const onPaneDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; setIsDragOver(true) }
  const onPaneDragLeave = (e) => { if (!e.currentTarget.contains(e.relatedTarget)) setIsDragOver(false) }
  const onPaneDrop = (e) => {
    e.preventDefault(); setIsDragOver(false); setDragOverIdx(null)
    if (e.dataTransfer.getData('internal')) { dragFromIdx.current = null; return }
    const songId = parseInt(e.dataTransfer.getData('song_id'), 10)
    if (songId) onAddSong?.(songId)
    dragFromIdx.current = null
  }
  const onSongDragStart = (e, idx) => { dragFromIdx.current = idx; e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('internal', '1') }
  const onSongDragOver = (e, idx) => { e.preventDefault(); e.stopPropagation(); e.dataTransfer.dropEffect = 'move'; setDragOverIdx(idx) }
  const onSongDrop = async (e, toIdx) => {
    e.preventDefault(); e.stopPropagation(); setDragOverIdx(null); setIsDragOver(false)
    if (e.dataTransfer.getData('internal') === '1' && dragFromIdx.current !== null) {
      const fromIdx = dragFromIdx.current; dragFromIdx.current = null
      if (!active || fromIdx === toIdx) return
      const entries = [...active.entries]
      const [moved] = entries.splice(fromIdx, 1)
      entries.splice(toIdx, 0, moved)
      const r = await fetch(`/playlists/${active.id}/reorder`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ song_ids: entries.map(en => en.song_id) }),
      })
      const updated = await r.json()
      setPlaylists(prev => prev.map(p => p.id === active.id ? updated : p))
    } else {
      const songId = parseInt(e.dataTransfer.getData('song_id'), 10)
      if (songId) onAddSong?.(songId)
      dragFromIdx.current = null
    }
  }
  const onSongDragEnd = () => { setDragOverIdx(null); setIsDragOver(false); dragFromIdx.current = null }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
      onDragOver={onPaneDragOver}
      onDragLeave={onPaneDragLeave}
      onDrop={onPaneDrop}
    >
      {/* Playlist selector */}
      <div className="pl-select">
        <select
          className="selectbox"
          value={activeId ?? ''}
          onChange={e => changeActive(Number(e.target.value))}
          style={{ height: 38 }}
        >
          {playlists.length === 0 && <option value="">No playlists</option>}
          {playlists.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <button className="iconbtn" style={{ width: 30, height: 30 }} title="New playlist" onClick={() => setCreating(v => !v)}>
          <PlusIcon />
        </button>
        {active && (
          <button className="iconbtn" style={{ width: 30, height: 30, color: 'var(--coral-text)' }}
            title="Delete playlist" onClick={() => deletePlaylist(active.id)}>
            <XIcon />
          </button>
        )}
      </div>

      {/* Create form */}
      {creating && (
        <div style={{ display: 'flex', gap: 6 }}>
          <input
            autoFocus
            placeholder="Playlist name…"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') createPlaylist(); if (e.key === 'Escape') setCreating(false) }}
            style={{ flex: 1, fontSize: 13, height: 36 }}
          />
          <button className="btn sm primary" onClick={createPlaylist}>OK</button>
        </div>
      )}

      {/* Song list */}
      <div style={{
        minHeight: 80, background: isDragOver ? 'var(--surface-2)' : undefined,
        borderRadius: 'var(--r-md)', border: isDragOver ? '2px dashed var(--coral)' : '1px dashed var(--line)', transition: '.12s',
      }}>
        {!active ? (
          <p style={{ padding: 14, color: 'var(--text-3)', fontSize: 12, textAlign: 'center', margin: 0 }}>
            Create a playlist, then drag songs here.
          </p>
        ) : active.entries.length === 0 ? (
          <p style={{ padding: 14, color: isDragOver ? 'var(--coral-text)' : 'var(--text-3)', fontSize: 12, textAlign: 'center', margin: 0 }}>
            {isDragOver ? 'Drop to add ↓' : 'Drag songs here or use + on a card.'}
          </p>
        ) : (
          <div className="pl-list" style={{ padding: 4 }}>
            {active.entries.map((entry, idx) => (
              <div
                key={entry.id}
                draggable
                onDragStart={e => onSongDragStart(e, idx)}
                onDragOver={e => onSongDragOver(e, idx)}
                onDrop={e => onSongDrop(e, idx)}
                onDragEnd={onSongDragEnd}
                className="pl-item"
                style={{ borderTop: dragOverIdx === idx ? '2px solid var(--coral)' : '2px solid transparent' }}
              >
                <span className="grip"><GripIcon /></span>
                <span className="num">{String(idx + 1).padStart(2, '0')}</span>
                <div className="info">
                  <b style={{ cursor: 'pointer' }} onClick={() => onSelectSong?.(entry.song)}>{entry.song.title}</b>
                  {entry.song.artist && <span>{entry.song.artist}</span>}
                </div>
                <div className="row-acts">
                  {entry.song.media_file && (
                    <button title="Play" onClick={() => setPlayerSong?.(entry.song)}><PlayIcon /></button>
                  )}
                  <button title="Remove" onClick={() => removeSong(active.id, entry.song_id)}><XIcon /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Run setlist */}
      {active && active.entries.length > 0 && (
        <button className="btn primary" style={{ marginTop: 2 }} onClick={onRunSetlist}>
          <PlayIcon /> Run setlist
        </button>
      )}
    </div>
  )
}
