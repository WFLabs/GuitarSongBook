import React from 'react'

const NOTE_SEMITONES = {
  'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
  'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
  'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
}

function qualityToIntervals(q) {
  const map = {
    '':        [0,4,7],
    'M':       [0,4,7],
    'm':       [0,3,7],
    '5':       [0,7],
    '6':       [0,4,7,9],
    'm6':      [0,3,7,9],
    '7':       [0,4,7,10],
    'M7':      [0,4,7,11],
    'maj7':    [0,4,7,11],
    'm7':      [0,3,7,10],
    'mM7':     [0,3,7,11],
    'mmaj7':   [0,3,7,11],
    'dim':     [0,3,6],
    'dim7':    [0,3,6,9],
    'aug':     [0,4,8],
    'sus2':    [0,2,7],
    'sus4':    [0,5,7],
    's2':      [0,2,7],
    's4':      [0,5,7],
    '7sus4':   [0,5,7,10],
    '7s4':     [0,5,7,10],
    '9':       [0,4,7,10,2],
    'maj9':    [0,4,7,11,2],
    'm9':      [0,3,7,10,2],
    'add9':    [0,4,7,2],
    'add2':    [0,4,7,2],
    'add4':    [0,4,5,7],
    'm7b5':    [0,3,6,10],
  }
  if (map[q] !== undefined) return map[q]

  if (q.startsWith('m')) {
    const r = q.slice(1)
    if (r === '7b5' || r === 'ø7') return [0,3,6,10]
    if (r === 'M7' || r === 'maj7') return [0,3,7,11]
    if (r === '7') return [0,3,7,10]
    if (r === '9') return [0,3,7,10,2]
    if (r === '6') return [0,3,7,9]
    if (r === 'add9' || r === 'add2') return [0,3,7,2]
  }
  if (q.startsWith('maj')) {
    const r = q.slice(3)
    if (r === '7') return [0,4,7,11]
    if (r === '9') return [0,4,7,11,2]
  }
  if (q.startsWith('7')) {
    const r = q.slice(1)
    if (r === 'sus4' || r === 's4') return [0,5,7,10]
    if (r === 'sus2' || r === 's2') return [0,2,7,10]
    if (r === 'b5') return [0,4,6,10]
    if (r === '#5') return [0,4,8,10]
    if (r === 'b9') return [0,4,7,10,1]
    if (r === '#9') return [0,4,7,10,3]
  }

  return [0,4,7]
}

function parseChord(name) {
  if (!name) return { root: 0, intervals: [0,4,7] }
  const chord = name.split('/')[0]
  let root, quality
  const two = chord.slice(0, 2)
  if (NOTE_SEMITONES[two] !== undefined) {
    root = NOTE_SEMITONES[two]; quality = chord.slice(2)
  } else {
    root = NOTE_SEMITONES[chord[0]] ?? 0; quality = chord.slice(1)
  }
  return { root, intervals: qualityToIntervals(quality) }
}

// Key dimensions
const W   = 10   // white key width
const PAD = 1    // gap between white keys
const H   = 34   // white key height
const BW  = 6.5  // black key width
const BH  = 21   // black key height
const R   = 1.5  // corner radius
const OCT_GAP = 5  // gap between the two octaves

const WHITE_KEYS = [
  { s: 0,  x: 0           },  // C
  { s: 2,  x: W + PAD     },  // D
  { s: 4,  x: 2*(W+PAD)   },  // E
  { s: 5,  x: 3*(W+PAD)   },  // F
  { s: 7,  x: 4*(W+PAD)   },  // G
  { s: 9,  x: 5*(W+PAD)   },  // A
  { s: 11, x: 6*(W+PAD)   },  // B
]

const BLACK_KEYS = [
  { s: 1,  x: (W + PAD) - BW/2 - PAD/2    },  // C#
  { s: 3,  x: 2*(W+PAD) - BW/2 - PAD/2    },  // D#
  { s: 6,  x: 4*(W+PAD) - BW/2 - PAD/2    },  // F#
  { s: 8,  x: 5*(W+PAD) - BW/2 - PAD/2    },  // G#
  { s: 10, x: 6*(W+PAD) - BW/2 - PAD/2    },  // A#
]

const OCT_W   = 7 * W + 6 * PAD          // 76px per octave
const TOTAL_W = 2 * OCT_W + OCT_GAP      // 157px total

const MIDDLE_C_BLUE = '#4a90d9'

export default function PianoChordDiagram({ name }) {
  const { root, intervals } = parseChord(name)
  const chordTones = new Set(intervals.map(i => (root + i) % 12))

  // octaveIdx 0 = left hand (C3–B3), octaveIdx 1 = right hand (C4–B4, middle C = C4)
  const fillFor = (semitone, octaveIdx, isBlack) => {
    const isChordTone = chordTones.has(semitone)
    if (isChordTone) return semitone === root ? 'var(--coral)' : 'var(--chord)'
    if (octaveIdx === 1 && semitone === 0) return MIDDLE_C_BLUE  // middle C marker
    return isBlack ? '#1e1e1e' : '#fff'
  }

  const octaveOffset = (i) => i * (OCT_W + OCT_GAP)

  return (
    <svg viewBox={`0 0 ${TOTAL_W} ${H}`} width={TOTAL_W} height={H} style={{ display: 'block' }}>
      {[0, 1].map(oct => {
        const ox = octaveOffset(oct)
        return (
          <g key={oct} transform={`translate(${ox},0)`}>
            {WHITE_KEYS.map(k => (
              <rect key={k.s} x={k.x} y={0} width={W} height={H}
                fill={fillFor(k.s, oct, false)} stroke="#aaa" strokeWidth={0.5} rx={R} />
            ))}
            {BLACK_KEYS.map(k => (
              <rect key={k.s} x={k.x} y={0} width={BW} height={BH}
                fill={fillFor(k.s, oct, true)} stroke="#000" strokeWidth={0.3} rx={R} />
            ))}
          </g>
        )
      })}
    </svg>
  )
}
