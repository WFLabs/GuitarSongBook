import React, { useMemo } from 'react'

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

const SECTION_WORDS = ['verse', 'chorus', 'bridge', 'intro', 'outro', 'pre-chorus', 'prechoruse', 'interlude', 'hook', 'tag', 'coda', 'solo', 'refrain', 'break']

function isSectionHeader(name) {
  const lower = name.toLowerCase()
  return SECTION_WORDS.some(s => lower.startsWith(s))
}

function parseLyrics(text) {
  const lines = []

  for (const raw of text.split('\n')) {
    const matches = [...raw.matchAll(/\[([^\]]+)\]/g)]

    if (matches.length === 0) {
      lines.push({ type: 'plain', text: raw })
      continue
    }

    if (matches.length === 1 && raw.trim() === matches[0][0] && isSectionHeader(matches[0][1])) {
      lines.push({ type: 'section', name: matches[0][1] })
      continue
    }

    const segments = []
    const pre = raw.slice(0, matches[0].index)
    if (pre) segments.push({ chord: null, text: pre })

    for (let i = 0; i < matches.length; i++) {
      const m = matches[i]
      const start = m.index + m[0].length
      const end = i + 1 < matches.length ? matches[i + 1].index : raw.length
      const txt = raw.slice(start, end)
      segments.push({ chord: m[1], text: txt || ' ' })
    }

    lines.push({ type: 'chord-lyric', segments })
  }

  return lines
}

function SectionBlock({ sec }) {
  return (
    <div className="section">
      {sec.name && <div className="section-name">{sec.name}</div>}
      {sec.lines.map((line, li) => {
        if (line.type === 'plain') {
          return <div key={li} className="lyrics-plain">{line.text || ' '}</div>
        }

        let chordRow = ''
        let wordRow = ''
        for (const seg of line.segments) {
          const chord = seg.chord || ''
          const word = seg.text || ''
          const len = Math.max(chord.length + 1, word.length)
          chordRow += chord.padEnd(len)
          wordRow += word.padEnd(len)
        }

        const hasChords = line.segments.some(s => s.chord)
        const hasWords = wordRow.trim().length > 0

        return (
          <div key={li} className="lyric-line">
            {hasChords && <div className="chord-row">{chordRow}</div>}
            {hasWords && <div className="word-row">{wordRow.trimEnd()}</div>}
          </div>
        )
      })}
    </div>
  )
}

export default function LyricsView({ lyrics, transpose = 0, twoCol = false }) {
  const effective = useMemo(() => transposeLyrics(lyrics || '', transpose), [lyrics, transpose])
  const lines = useMemo(() => parseLyrics(effective), [effective])

  const sections = useMemo(() => {
    const result = []
    let current = { name: null, lines: [] }
    for (const line of lines) {
      if (line.type === 'section') {
        if (current.lines.length > 0 || current.name) result.push(current)
        current = { name: line.name, lines: [] }
      } else {
        current.lines.push(line)
      }
    }
    if (current.lines.length > 0 || current.name) result.push(current)
    return result
  }, [lines])

  if (twoCol && sections.length > 0) {
    const mid = Math.ceil(sections.length / 2)
    return (
      <div className="lyrics two-col">
        <div className="lyrics-col">
          {sections.slice(0, mid).map((sec, i) => <SectionBlock key={i} sec={sec} />)}
        </div>
        <div className="lyrics-col">
          {sections.slice(mid).map((sec, i) => <SectionBlock key={i} sec={sec} />)}
        </div>
      </div>
    )
  }

  return (
    <div className="lyrics">
      {sections.map((sec, i) => <SectionBlock key={i} sec={sec} />)}
    </div>
  )
}
