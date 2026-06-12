import React from 'react'
import PlaylistPanel from './PlaylistPanel'

export default function RightPane({
  onSelectSong,
  setPlayerSong,
  onActivePlaylistChange,
  playlistRefreshKey,
  onAddSong,
  onRunSetlist,
}) {
  return (
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
  )
}
