import React, { useState, useMemo } from 'react'
import ChordDiagram, { CHORD_DB, UKU_CHORD_DB } from './ChordDiagram'

const PANEL_WIDTH = 350

const ROOTS = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']

const FAMILIES = [
  { id: 'all',    label: 'All' },
  { id: 'major',  label: 'Major',  match: n => /^[A-G][b#]?$/.test(n) },
  { id: 'minor',  label: 'Minor',  match: n => /m$|m[679]$/.test(n) && !n.includes('maj') },
  { id: 'dom7',   label: '7th',    match: n => /[^a-z]7/.test(n) || n.endsWith('7') },
  { id: 'maj7',   label: 'Maj7',   match: n => n.includes('maj7') },
  { id: 'sus',    label: 'Sus',    match: n => n.includes('sus') },
  { id: 'add',    label: 'Add9',   match: n => n.includes('add') },
]

function chordRoot(name) {
  if (name.length >= 2 && (name[1] === '#' || name[1] === 'b')) return name.slice(0, 2)
  return name[0]
}

function normalizeRoot(root) {
  const map = { 'Db': 'C#', 'D#': 'Eb', 'Gb': 'F#', 'G#': 'Ab', 'A#': 'Bb' }
  return map[root] || root
}

export default function ChordChartPanel({ instrument, setInstrument }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [family, setFamily] = useState('all')

  const db = instrument === 'ukulele' ? UKU_CHORD_DB : CHORD_DB
  const strings = instrument === 'ukulele' ? 4 : 6

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return Object.entries(db).filter(([name]) => {
      if (q && !name.toLowerCase().includes(q)) return false
      if (family !== 'all') {
        const fam = FAMILIES.find(f => f.id === family)
        if (fam && !fam.match(name)) return false
      }
      return true
    })
  }, [db, search, family])

  const grouped = useMemo(() => {
    const groups = {}
    for (const root of ROOTS) groups[root] = []
    for (const [name, def] of filtered) {
      const r = normalizeRoot(chordRoot(name))
      if (groups[r]) groups[r].push([name, def])
    }
    return groups
  }, [filtered])

  return (
    <div style={{ display: 'flex', flexShrink: 0, position: 'relative' }}>
      {/* Toggle tab on right edge of panel */}
      <button
        onClick={() => setOpen(v => !v)}
        title={open ? 'Close chord chart' : 'Open chord chart'}
        style={{
          position: 'absolute',
          right: -22,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 10,
          width: 22,
          height: 48,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderLeft: 'none',
          borderRadius: '0 6px 6px 0',
          cursor: 'pointer',
          color: 'var(--text2)',
          fontSize: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
        }}
      >
        {open ? '‹' : '›'}
      </button>

      {/* Panel body */}
      <div style={{
        width: open ? PANEL_WIDTH : 0,
        overflow: 'hidden',
        transition: 'width 0.2s ease',
        borderRight: open ? '1px solid var(--border)' : 'none',
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{
          width: PANEL_WIDTH,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Header */}
          <div style={{
            padding: '10px 12px 8px',
            borderBottom: '1px solid var(--border)',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text2)' }}>
                Chord Chart
              </span>
              <button
                onClick={() => setInstrument(v => v === 'guitar' ? 'ukulele' : 'guitar')}
                style={{
                  background: instrument === 'ukulele' ? 'var(--accent)' : 'var(--surface2)',
                  border: '1px solid var(--border)',
                  borderRadius: 4,
                  cursor: 'pointer',
                  padding: '2px 9px',
                  color: instrument === 'ukulele' ? '#fff' : 'var(--text2)',
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                {instrument === 'guitar' ? '🎸 Guitar' : '🪗 Ukulele'}
              </button>
            </div>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search chords…"
              style={{ marginBottom: 8, fontSize: 12, padding: '5px 8px' }}
            />
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {FAMILIES.map(f => (
                <button
                  key={f.id}
                  onClick={() => setFamily(f.id)}
                  style={{
                    background: family === f.id ? 'var(--accent)' : 'var(--surface)',
                    color: family === f.id ? '#fff' : 'var(--text2)',
                    border: '1px solid var(--border)',
                    borderRadius: 4,
                    padding: '2px 7px',
                    fontSize: 10,
                    fontWeight: family === f.id ? 700 : 400,
                    cursor: 'pointer',
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chord grid */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 10px' }}>
            {ROOTS.map(root => {
              const chords = grouped[root]
              if (!chords || chords.length === 0) return null
              return (
                <div key={root} style={{ marginBottom: 12 }}>
                  <div style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--accent)',
                    marginBottom: 6,
                    paddingBottom: 3,
                    borderBottom: '1px solid var(--border)',
                  }}>
                    {root}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {chords.map(([name, def]) => (
                      <ChordDiagram
                        key={name}
                        name={name}
                        frets={def.frets}
                        baseFret={def.baseFret}
                        strings={strings}
                        compact
                      />
                    ))}
                  </div>
                </div>
              )
            })}
            {ROOTS.every(r => !grouped[r] || grouped[r].length === 0) && (
              <p style={{ color: 'var(--text2)', fontSize: 12, padding: '12px 0', textAlign: 'center' }}>
                No chords match
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
