import React, { useState } from 'react'
import SongLibrary from './components/SongLibrary'
import SongEditor from './components/SongEditor'
import SongView from './components/SongView'
import Player from './components/Player'
import RightPane from './components/RightPane'
import ChromaticTuner from './components/ChromaticTuner'
import ChordChartPanel from './components/ChordChartPanel'

const VIEWS = { library: 'library', edit: 'edit', view: 'view' }

export default function App() {
  const [view, setView] = useState(VIEWS.library)
  const [selectedSong, setSelectedSong] = useState(null)
  const [editSong, setEditSong] = useState(null)
  const [playerSong, setPlayerSong] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [pendingYtUrl, setPendingYtUrl] = useState(null)

  // Playlist coordination — activePlaylistId is owned here so SongCards can reach it
  const [activePlaylistId, setActivePlaylistId] = useState(null)
  const [playlistRefreshKey, setPlaylistRefreshKey] = useState(0)
  const [tunerOpen, setTunerOpen] = useState(false)
  const [instrument, setInstrument] = useState('guitar')

  const refresh = () => setRefreshKey(k => k + 1)

  const openView = (song) => { setSelectedSong(song); setView(VIEWS.view) }
  const openEdit = (song) => { setEditSong(song); setPendingYtUrl(null); setView(VIEWS.edit) }
  const openNew  = () => { setEditSong(null); setPendingYtUrl(null); setView(VIEWS.edit) }

  const openPrefilled = (prefill, ytUrl) => {
    setEditSong(prefill)
    setPendingYtUrl(ytUrl || null)
    setView(VIEWS.edit)
  }

  const onSaved = (song) => {
    refresh()
    setSelectedSong(song)
    if (pendingYtUrl) {
      fetch('/youtube/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: pendingYtUrl, song_id: song.id }),
      })
      setPendingYtUrl(null)
    }
    setView(VIEWS.view)
  }

  const onDeleted = () => {
    refresh()
    setSelectedSong(null)
    setView(VIEWS.library)
  }

  const addSongToPlaylist = async (songId) => {
    if (!activePlaylistId) return
    await fetch(`/playlists/${activePlaylistId}/songs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ song_id: songId }),
    })
    setPlaylistRefreshKey(k => k + 1)
  }

  const songTempo = selectedSong?.tempo ?? 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Header setView={setView} openNew={openNew} onTuner={() => setTunerOpen(true)} />
      {tunerOpen && <ChromaticTuner onClose={() => setTunerOpen(false)} />}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <ChordChartPanel instrument={instrument} setInstrument={setInstrument} />
        <main style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
          {view === VIEWS.library && (
            <SongLibrary
              key={refreshKey}
              onSelect={openView}
              onEdit={openEdit}
              onNew={openNew}
              onPrefillNew={openPrefilled}
              setPlayerSong={setPlayerSong}
              onAddToPlaylist={activePlaylistId ? addSongToPlaylist : null}
            />
          )}
          {view === VIEWS.edit && (
            <SongEditor
              song={editSong}
              pendingDownload={!!pendingYtUrl}
              onSaved={onSaved}
              onCancel={() => setView(selectedSong ? VIEWS.view : VIEWS.library)}
            />
          )}
          {view === VIEWS.view && selectedSong && (
            <SongView
              songId={selectedSong.id}
              onEdit={() => openEdit(selectedSong)}
              onDeleted={onDeleted}
              setPlayerSong={setPlayerSong}
              instrument={instrument}
              setInstrument={setInstrument}
            />
          )}
        </main>
        <RightPane
          songTempo={songTempo}
          onSelectSong={openView}
          setPlayerSong={setPlayerSong}
          onActivePlaylistChange={setActivePlaylistId}
          playlistRefreshKey={playlistRefreshKey}
          onAddSong={addSongToPlaylist}
        />
      </div>
      <Player song={playerSong} onClose={() => setPlayerSong(null)} />
    </div>
  )
}

function Header({ setView, openNew, onTuner }) {
  const openTerminal = () => fetch('/launch-terminal', { method: 'POST' })
  return (
    <header style={{
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      padding: '10px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      flexShrink: 0,
    }}>
      <span style={{ fontSize: 22, marginRight: 4 }}>🎸</span>
      <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent)', marginRight: 'auto' }}>
        Guitar Song Book
      </h1>
      <button className="btn-ghost btn-sm" onClick={() => setView('library')}>Library</button>
      <button className="btn-ghost btn-sm" onClick={onTuner}>Tuner</button>
      <button className="btn-ghost btn-sm" onClick={openTerminal} title="Open terminal in project folder">🖥️ Terminal</button>
      <button className="btn-primary btn-sm" onClick={openNew}>+ New Song</button>
    </header>
  )
}
