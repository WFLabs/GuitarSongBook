import React from 'react'
import Metronome from './Metronome'
import PlaylistPanel from './PlaylistPanel'

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M12 5v14M5 12h14"/>
  </svg>
)

export default function RightPane({
  songTempo,
  onSelectSong,
  setPlayerSong,
  onActivePlaylistChange,
  playlistRefreshKey,
  onAddSong,
  onRunSetlist,
}) {
  return (
    <>
      <div className="panel">
        <div className="sec-label">Metronome</div>
        <div className="metro">
          <Metronome defaultTempo={songTempo} />
        </div>
      </div>

      <div className="panel" style={{ flex: 1, minHeight: 0 }}>
        <div className="panel-head">
          <div className="sec-label">Playlists</div>
        </div>
        <PlaylistPanel
          onSelectSong={onSelectSong}
          setPlayerSong={setPlayerSong}
          onActiveIdChange={onActivePlaylistChange}
          refreshKey={playlistRefreshKey}
          onAddSong={onAddSong}
          onRunSetlist={onRunSetlist}
        />
      </div>
    </>
  )
}
