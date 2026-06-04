import React, { useMemo } from 'react'
import ChordDiagram, { CHORD_DB, UKU_CHORD_DB } from './ChordDiagram'

const NOTES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']
const NOTE_INDEX = {
  'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
  'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
  'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
}

function transposeNote(note, semitones) {
  const idx = NOTE_INDEX[note]
  if (idx === undefined) return note
  return NOTES[(idx + semitones + 120) % 12]
}

function isChordName(name) {
  const root2 = name.slice(0, 2)
  const root1 = name[0]
  const rest = NOTE_INDEX[root2] !== undefined ? name.slice(2) : NOTE_INDEX[root1] !== undefined ? name.slice(1) : null
  if (rest === null) return false
  return rest === '' || /^[m7Msad/+#b°\d]/.test(rest)
}

export function transposeChord(chord, semitones) {
  if (semitones === 0 || !isChordName(chord)) return chord
  let root, rest
  if (NOTE_INDEX[chord.slice(0, 2)] !== undefined) {
    root = chord.slice(0, 2); rest = chord.slice(2)
  } else {
    root = chord[0]; rest = chord.slice(1)
  }
  const slashIdx = rest.indexOf('/')
  if (slashIdx !== -1) {
    const quality = rest.slice(0, slashIdx)
    const bass = rest.slice(slashIdx + 1)
    const newBass = NOTE_INDEX[bass.slice(0, 2)] !== undefined
      ? transposeNote(bass.slice(0, 2), semitones) + bass.slice(2)
      : transposeNote(bass[0], semitones) + bass.slice(1)
    return transposeNote(root, semitones) + quality + '/' + newBass
  }
  return transposeNote(root, semitones) + rest
}

export function transposeLyrics(lyrics, semitones) {
  if (!semitones) return lyrics
  return lyrics.replace(/\[([^\]]+)\]/g, (_, c) => `[${transposeChord(c, semitones)}]`)
}

// Parse [Chord] inline markers.
// Each segment: { chord: string|null, text: string }
// The chord floats above the text that immediately follows it.
function parseLyrics(text) {
  const chords = new Set()
  const lines = []

  for (const raw of text.split('\n')) {
    const matches = [...raw.matchAll(/\[([^\]]+)\]/g)]
    if (matches.length === 0) {
      lines.push({ type: 'plain', text: raw })
      continue
    }

    matches.forEach(m => chords.add(m[1]))

    const segments = []

    // Text before the first chord marker
    const pre = raw.slice(0, matches[0].index)
    if (pre) segments.push({ chord: null, text: pre })

    // Each chord paired with the text up to the next chord (or end of line)
    for (let i = 0; i < matches.length; i++) {
      const m = matches[i]
      const start = m.index + m[0].length
      const end = i + 1 < matches.length ? matches[i + 1].index : raw.length
      const txt = raw.slice(start, end)
      segments.push({ chord: m[1], text: txt || ' ' })
    }

    lines.push({ type: 'chord-lyric', segments })
  }

  return { chords, lines }
}

export default function LyricsView({ lyrics, transpose = 0, twoCol = false, instrument = 'guitar', setInstrument }) {
  const effective = useMemo(() => transposeLyrics(lyrics || '', transpose), [lyrics, transpose])
  const { chords, lines } = useMemo(() => parseLyrics(effective), [effective])
  const [chordsOpen, setChordsOpen] = React.useState(true)

  const db = instrument === 'ukulele' ? UKU_CHORD_DB : CHORD_DB
  const strings = instrument === 'ukulele' ? 4 : 6
  const knownChords = [...chords].filter(c => db[c])
  const unknownChords = [...chords].filter(c => !db[c])

  return (
    <div>
      {/* Chord diagram strip */}
      {(knownChords.length > 0 || unknownChords.length > 0) && (
        <div style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius)',
          padding: '10px 20px',
          marginBottom: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: chordsOpen ? 12 : 0 }}>
            <button
              onClick={() => setChordsOpen(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '4px 0', color: 'var(--text2)', fontSize: 12, fontWeight: 600,
              }}
            >
              <span style={{ fontSize: 10 }}>{chordsOpen ? '▾' : '▸'}</span>
              Chords
            </button>
            {setInstrument && (
              <button
                onClick={() => setInstrument(v => v === 'guitar' ? 'ukulele' : 'guitar')}
                style={{
                  background: instrument === 'ukulele' ? 'var(--accent)' : 'none',
                  border: '1px solid var(--text2)', borderRadius: 4,
                  cursor: 'pointer', padding: '2px 8px',
                  color: instrument === 'ukulele' ? '#fff' : 'var(--text2)',
                  fontSize: 11, fontWeight: 600,
                }}
              >
                {instrument === 'guitar' ? 'Guitar' : 'Ukulele'}
              </button>
            )}
          </div>
          {chordsOpen && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
              {knownChords.map(name => {
                const def = db[name]
                return (
                  <ChordDiagram key={name} name={name} frets={def.frets} baseFret={def.baseFret} strings={strings} />
                )
              })}
              {unknownChords.length > 0 && (
                <div style={{ fontSize: 11, color: 'var(--text2)', alignSelf: 'center' }}>
                  No diagram: {unknownChords.join(', ')}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Lyrics with inline chords */}
      <div style={{
        background: 'var(--surface)',
        borderRadius: 'var(--radius)',
        padding: '18px 22px',
        fontFamily: 'var(--mono)',
        fontSize: 14,
        columnWidth: twoCol ? '480px' : undefined,
        columnGap: twoCol ? '32px' : undefined,
      }}>
        {lines.map((line, i) => {
          if (line.type === 'plain') {
            return (
              <div key={i} style={{ lineHeight: '1.8em', minHeight: '1.8em', breakInside: 'avoid' }}>
                {line.text || ' '}
              </div>
            )
          }

          return (
            <div key={i} style={{ display: 'flex', flexWrap: 'wrap', marginBottom: 4, breakInside: 'avoid' }}>
              {line.segments.map((seg, j) => (
                <span key={j} style={{
                  display: 'inline-flex',
                  flexDirection: 'column',
                  whiteSpace: 'pre',
                }}>
                  <span style={{
                    color: seg.chord ? '#f5a623' : 'transparent',
                    fontWeight: 700,
                    fontSize: 12,
                    lineHeight: '1.5em',
                    fontFamily: 'sans-serif',
                    userSelect: 'none',
                  }}>
                    {seg.chord || ' '}
                  </span>
                  <span style={{ color: 'var(--text)', lineHeight: '1.7em' }}>
                    {seg.text}
                  </span>
                </span>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
