import React, { useState, useEffect } from 'react'
import SongLibrary from './components/SongLibrary'
import SongEditor from './components/SongEditor'
import SongView from './components/SongView'
import Player from './components/Player'
import RightPane from './components/RightPane'
import SetlistView from './components/SetlistView'
import ChromaticTuner from './components/ChromaticTuner'

const GUITAR_SVG = (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.5 3.3c-.7-.7-1.9-.6-2.8.3l-3.1 3.1c-.5.5-.8 1.2-.8 1.9v.6l-5.7 5.7a3.2 3.2 0 1 0 1.5 1.5l5.7-5.7h.6c.7 0 1.4-.3 1.9-.8l3.1-3.1c.9-.9 1-2.1.3-2.8Zm-12 15.4a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4Z"/>
  </svg>
)

function getStoredTheme() {
  try { return localStorage.getItem('gsb-theme') || 'dark' } catch { return 'dark' }
}

export default function App() {
  const [view, setView] = useState('library')
  const [selectedSong, setSelectedSong] = useState(null)
  const [editSong, setEditSong] = useState(null)
  const [playerSong, setPlayerSong] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [pendingYtUrl, setPendingYtUrl] = useState(null)
  const [activePlaylistId, setActivePlaylistId] = useState(null)
  const [playlistRefreshKey, setPlaylistRefreshKey] = useState(0)
  const [tunerOpen, setTunerOpen] = useState(false)
  const [theme, setTheme] = useState(getStoredTheme)
  const [songCount, setSongCount] = useState(0)
  const [gridMode, setGridMode] = useState('grid')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try { localStorage.setItem('gsb-theme', theme) } catch {}
  }, [theme])

  useEffect(() => {
    fetch('/songs/?').then(r => r.json()).then(d => setSongCount(Array.isArray(d) ? d.length : 0)).catch(() => {})
  }, [refreshKey])

  const refresh = () => setRefreshKey(k => k + 1)

  const openView = (song) => {
    setSelectedSong(song)
    setView('song')
    if (song.media_file) setPlayerSong(song)
  }
  const openEdit = (song) => { setEditSong(song); setPendingYtUrl(null); setView('edit') }
  const openNew  = () => { setEditSong(null); setPendingYtUrl(null); setView('edit') }

  const openPrefilled = (prefill, ytUrl) => {
    setEditSong(prefill); setPendingYtUrl(ytUrl || null); setView('edit')
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
    setView('song')
  }

  const onDeleted = () => { refresh(); setSelectedSong(null); setView('library') }

  const addSongToPlaylist = async (songId) => {
    if (!activePlaylistId) return
    await fetch(`/playlists/${activePlaylistId}/songs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ song_id: songId }),
    })
    setPlaylistRefreshKey(k => k + 1)
  }

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Header
        view={view}
        setView={setView}
        openNew={openNew}
        onTuner={() => setTunerOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
        songCount={songCount}
      />

      {tunerOpen && <ChromaticTuner onClose={() => setTunerOpen(false)} />}

      <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
        {view === 'library' && (
          <div className="lib-wrap view-fade">
            <div className="lib-main">
              <SongLibrary
                key={refreshKey}
                onSelect={openView}
                onEdit={openEdit}
                onNew={openNew}
                onPrefillNew={openPrefilled}
                setPlayerSong={setPlayerSong}
                onAddToPlaylist={activePlaylistId ? addSongToPlaylist : null}
                gridMode={gridMode}
                setGridMode={setGridMode}
              />
            </div>
            <aside className="rail">
              <RightPane
                songTempo={selectedSong?.tempo ?? 0}
                onSelectSong={openView}
                setPlayerSong={setPlayerSong}
                onActivePlaylistChange={setActivePlaylistId}
                playlistRefreshKey={playlistRefreshKey}
                onAddSong={addSongToPlaylist}
                onRunSetlist={() => setView('setlist')}
              />
            </aside>
          </div>
        )}

        {view === 'edit' && (
          <div style={{ maxWidth: 860, margin: '0 auto', padding: '24px 24px 80px' }} className="view-fade">
            <SongEditor
              song={editSong}
              pendingDownload={!!pendingYtUrl}
              onSaved={onSaved}
              onCancel={() => setView(selectedSong ? 'song' : 'library')}
            />
          </div>
        )}

        {view === 'song' && selectedSong && (
          <div className="song-wrap view-fade">
            <SongView
              songId={selectedSong.id}
              onEdit={() => openEdit(selectedSong)}
              onDeleted={onDeleted}
              setPlayerSong={setPlayerSong}
              onBack={() => setView('library')}
            />
          </div>
        )}

        {view === 'setlist' && (
          <div className="view-fade">
            <SetlistView
              playlistId={activePlaylistId}
              onBack={() => setView('library')}
            />
          </div>
        )}
      </div>

      <Player song={playerSong} onClose={() => setPlayerSong(null)} />
    </div>
  )
}

function Header({ view, setView, openNew, onTuner, theme, onToggleTheme, songCount }) {
  const openTerminal = () => fetch('/launch-terminal', { method: 'POST' })

  const SunIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="4.5"/>
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>
    </svg>
  )
  const MoonIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3 6.6 6.6 0 0 0 21 12.8Z"/>
    </svg>
  )

  return (
    <header className="topbar">
      <div className="brand">
        <span className="logo">{GUITAR_SVG}</span>
        <div>
          <b>Guitar Songbook</b>
          <span className="tag">{songCount} songs</span>
        </div>
      </div>

      <nav className="topnav">
        <a className={view === 'library' || view === 'song' || view === 'edit' ? 'active' : ''}
          onClick={() => setView('library')}>Library</a>
        <a className={view === 'setlist' ? 'active' : ''} onClick={() => setView('setlist')}>Setlist</a>
        <a onClick={onTuner}>Tuner</a>
        <a onClick={openTerminal}>Terminal</a>
      </nav>

      <div className="spacer" />

      <button className="iconbtn" onClick={onToggleTheme} title="Toggle theme">
        {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
      </button>

      <button className="btn primary" onClick={openNew}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        New Song
      </button>
    </header>
  )
}
