import React, { useState } from 'react'
import Metronome from './Metronome'
import PlaylistPanel from './PlaylistPanel'

const PANE_WIDTH = 260

export default function RightPane({
  songTempo,
  onSelectSong,
  setPlayerSong,
  onActivePlaylistChange,
  playlistRefreshKey,
  onAddSong,
}) {
  const [open, setOpen] = useState(true)

  return (
    <div style={{ display: 'flex', flexShrink: 0, position: 'relative' }}>
      {/* Toggle tab */}
      <button
        onClick={() => setOpen(v => !v)}
        title={open ? 'Collapse panel' : 'Expand panel'}
        style={{
          position: 'absolute',
          left: -22,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 10,
          width: 22,
          height: 48,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRight: 'none',
          borderRadius: '6px 0 0 6px',
          cursor: 'pointer',
          color: 'var(--text2)',
          fontSize: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
        }}
      >
        {open ? '›' : '‹'}
      </button>

      {/* Panel body */}
      <div style={{
        width: open ? PANE_WIDTH : 0,
        overflow: 'hidden',
        transition: 'width 0.2s ease',
        borderLeft: open ? '1px solid var(--border)' : 'none',
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{
          width: PANE_WIDTH,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '12px 12px 12px 14px',
          overflowY: 'auto',
        }}>

          <Section title="Metronome">
            <Metronome defaultTempo={songTempo} />
          </Section>

          <Section title="Playlists" flex>
            <PlaylistPanel
              onSelectSong={onSelectSong}
              setPlayerSong={setPlayerSong}
              onActiveIdChange={onActivePlaylistChange}
              refreshKey={playlistRefreshKey}
              onAddSong={onAddSong}
            />
          </Section>

        </div>
      </div>
    </div>
  )
}

function Section({ title, children, flex }) {
  return (
    <div style={flex
      ? { display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, marginBottom: 8 }
      : { marginBottom: 16 }
    }>
      <div style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'var(--text2)',
        marginBottom: 8,
        borderBottom: '1px solid var(--border)',
        paddingBottom: 4,
      }}>
        {title}
      </div>
      {children}
    </div>
  )
}
