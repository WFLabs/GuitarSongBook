import React, { useState, useEffect, useRef } from 'react'

export default function PlaylistPanel({
  onSelectSong,
  setPlayerSong,
  onActiveIdChange,
  refreshKey,
  onAddSong,
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

  // Notify parent whenever activeId settles (e.g. after initial load)
  useEffect(() => { onActiveIdChange?.(activeId) }, [activeId])

  // Re-fetch when parent signals an external add occurred
  useEffect(() => {
    if (refreshKey > 0) load()
  }, [refreshKey])

  const changeActive = (id) => {
    setActiveId(id)
    onActiveIdChange?.(id)
  }

  const active = playlists.find(p => p.id === activeId) ?? null

  const createPlaylist = async () => {
    const name = newName.trim()
    if (!name) return
    try {
      const r = await fetch('/playlists/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      const pl = await r.json()
      if (!pl.id) { console.error('Create failed', pl); return }
      setPlaylists(prev => [...prev, pl])
      changeActive(pl.id)
      setNewName('')
      setCreating(false)
    } catch (e) { console.error('Create playlist error:', e) }
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

  // ── Drag handlers ──────────────────────────────────────────────────────
  const onPaneDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    setIsDragOver(true)
  }

  const onPaneDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setIsDragOver(false)
  }

  const onPaneDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    setDragOverIdx(null)
    // Only handle external drops here (internal drags set 'internal' key)
    if (e.dataTransfer.getData('internal')) { dragFromIdx.current = null; return }
    const songId = parseInt(e.dataTransfer.getData('song_id'), 10)
    if (songId) onAddSong?.(songId)
    dragFromIdx.current = null
  }

  const onSongDragStart = (e, idx) => {
    dragFromIdx.current = idx
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('internal', '1')
  }

  const onSongDragOver = (e, idx) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIdx(idx)
  }

  const onSongDrop = async (e, toIdx) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverIdx(null)
    setIsDragOver(false)

    if (e.dataTransfer.getData('internal') === '1' && dragFromIdx.current !== null) {
      // Reorder within playlist
      const fromIdx = dragFromIdx.current
      dragFromIdx.current = null
      if (!active || fromIdx === toIdx) return
      const entries = [...active.entries]
      const [moved] = entries.splice(fromIdx, 1)
      entries.splice(toIdx, 0, moved)
      const r = await fetch(`/playlists/${active.id}/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ song_ids: entries.map(en => en.song_id) }),
      })
      const updated = await r.json()
      setPlaylists(prev => prev.map(p => p.id === active.id ? updated : p))
    } else {
      // External drop onto a row
      const songId = parseInt(e.dataTransfer.getData('song_id'), 10)
      if (songId) onAddSong?.(songId)
      dragFromIdx.current = null
    }
  }

  const onSongDragEnd = () => { setDragOverIdx(null); setIsDragOver(false); dragFromIdx.current = null }

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}
      onDragOver={onPaneDragOver}
      onDragLeave={onPaneDragLeave}
      onDrop={onPaneDrop}
    >
      {/* Playlist selector */}
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 8 }}>
        <select
          value={activeId ?? ''}
          onChange={e => changeActive(Number(e.target.value))}
          style={{ flex: 1, minWidth: 0, fontSize: 12 }}
        >
          {playlists.length === 0 && <option value="">No playlists</option>}
          {playlists.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <button className="btn-ghost btn-sm" title="New playlist" onClick={() => setCreating(v => !v)}>+</button>
        {active && (
          <button className="btn-ghost btn-sm" title="Delete playlist"
            onClick={() => deletePlaylist(active.id)}
            style={{ color: '#e74c3c' }}>✕</button>
        )}
      </div>

      {/* Create form */}
      {creating && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
          <input
            autoFocus
            placeholder="Playlist name…"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') createPlaylist(); if (e.key === 'Escape') setCreating(false) }}
            style={{ flex: 1, fontSize: 12 }}
          />
          <button className="btn-primary btn-sm" onClick={createPlaylist}>OK</button>
        </div>
      )}

      {/* Drop zone */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        background: isDragOver ? 'var(--surface2)' : 'var(--surface)',
        borderRadius: 'var(--radius)',
        border: isDragOver ? '2px dashed var(--accent)' : '1px solid var(--border)',
        minHeight: 100,
        transition: 'background 0.12s, border-color 0.12s',
      }}>
        {!active ? (
          <p style={{ padding: 14, color: 'var(--text2)', fontSize: 12, textAlign: 'center', margin: 0 }}>
            Create a playlist, then drag songs here.
          </p>
        ) : active.entries.length === 0 ? (
          <p style={{ padding: 14, color: isDragOver ? 'var(--accent)' : 'var(--text2)',
            fontSize: 12, textAlign: 'center', margin: 0 }}>
            {isDragOver ? 'Drop to add ↓' : 'Drag songs here or use + on a card.'}
          </p>
        ) : (
          <div style={{ padding: 4 }}>
            {active.entries.map((entry, idx) => (
              <div
                key={entry.id}
                draggable
                onDragStart={e => onSongDragStart(e, idx)}
                onDragOver={e => onSongDragOver(e, idx)}
                onDrop={e => onSongDrop(e, idx)}
                onDragEnd={onSongDragEnd}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 6px',
                  borderRadius: 4,
                  cursor: 'grab',
                  background: 'transparent',
                  borderTop: dragOverIdx === idx ? '2px solid var(--accent)' : '2px solid transparent',
                }}
              >
                <span style={{ color: 'var(--text2)', fontSize: 11, userSelect: 'none', flexShrink: 0 }}>⠿</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{ fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    onClick={() => onSelectSong?.(entry.song)}
                  >
                    {entry.song.title}
                  </div>
                  {entry.song.artist && (
                    <div style={{ fontSize: 11, color: 'var(--text2)', overflow: 'hidden',
                      textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {entry.song.artist}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
                  {entry.song.media_file && (
                    <button className="btn-ghost btn-sm" style={{ padding: '2px 5px', fontSize: 11 }}
                      onClick={() => setPlayerSong?.(entry.song)}>▶</button>
                  )}
                  <button className="btn-ghost btn-sm"
                    style={{ padding: '2px 5px', fontSize: 11, color: 'var(--text2)' }}
                    onClick={() => removeSong(active.id, entry.song_id)}>✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
