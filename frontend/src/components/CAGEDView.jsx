import React, { useState, useMemo, useRef } from 'react'

// ─── Music theory ───────────────────────────────────────────
const NOTE_NAMES = ['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B']
const FLAT_ROOTS  = new Set([5,10,3,8,1,6])  // F Bb Eb Ab Db Gb → prefer flats
function noteName(pc) {
  if (FLAT_ROOTS.has(pc)) {
    return ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'][pc]
  }
  return NOTE_NAMES[pc]
}

const NOTE_INDEX = {
  C:0,'C#':1,Db:1,D:2,'D#':3,Eb:3,E:4,F:5,'F#':6,Gb:6,G:7,'G#':8,Ab:8,A:9,'A#':10,Bb:10,B:11
}

// Open string pitch class (str 1=high e, 6=low E)
const OPEN_PC = { 1:4, 2:11, 3:7, 4:2, 5:9, 6:4 }

function fretsForPC(str, pc, max = 15) {
  const base = ((pc - OPEN_PC[str]) % 12 + 12) % 12
  const out = []
  for (let f = base; f <= max; f += 12) out.push(f)
  return out
}

function chordTones(root, quality) {
  const third = quality === 'minor' ? 3 : 4
  return [root % 12, (root + third) % 12, (root + 7) % 12]
}

const SCALE_INT = {
  major:     [0,2,4,5,7,9,11],
  minor:     [0,2,3,5,7,8,10],
  pentMajor: [0,2,4,7,9],
  pentMinor: [0,3,5,7,10],
}
function getScaleNotes(root, type) {
  return (SCALE_INT[type] || SCALE_INT.major).map(i => (root + i) % 12)
}

// CAGED anchor = lowest fret of each shape for a given root
function cagedAnchors(root) {
  const r = ((root % 12) + 12) % 12
  return {
    E: ((r - 4 + 12) % 12),   // root on str6 (0 = open E position)
    A: ((r - 9 + 12) % 12),   // root on str5
    G: ((r + 5)      % 12),   // 5th on str4 (lowest note in shape)
    D: ((r - 2 + 12) % 12),   // root on str4
    C: r,                      // 5th on str3 (lowest note in shape)
  }
}

// Each shape spans this many frets from its anchor
const SHAPE_SPAN = { E:3, A:3, G:4, D:4, C:4 }

function shapeWindow(shape, anchors) {
  return [anchors[shape], anchors[shape] + SHAPE_SPAN[shape]]
}

// Muted strings per shape (not typically played)
const MUTED = { E:[], A:[6], G:[], D:[5,6], C:[6] }

const SHAPE_COLOR = {
  E: { fill:'#4a8fd4', label:'E' },
  A: { fill:'#d4854a', label:'A' },
  G: { fill:'#c4a835', label:'G' },
  D: { fill:'#5aab6e', label:'D' },
  C: { fill:'#9b6cd4', label:'C' },
}

const ROLE_COLOR = {
  root:  '#f0635c',
  third: '#6ba3f5',
  fifth: '#5fba7d',
  scale: '#6b7280',
}

const SHAPES = ['E','A','G','D','C']

// ─── Layout ─────────────────────────────────────────────────
const MAX_FRET = 14
const FRET_W   = 54
const STR_H    = 26
const PAD_TOP  = 28   // for fret numbers
const PAD_LEFT = 36
const PAD_BOT  = 14
const DOT_R    = 10

const SVG_W = PAD_LEFT + (MAX_FRET + 0.5) * FRET_W
const SVG_H = PAD_TOP + 5 * STR_H + PAD_BOT

function strY(s) { return PAD_TOP + (s - 1) * STR_H }
// x center of a fret slot (note falls between line f-1 and f)
function fretX(f) {
  if (f === 0) return PAD_LEFT - FRET_W * 0.4
  return PAD_LEFT + (f - 0.5) * FRET_W
}
function fretLineX(f) { return PAD_LEFT + f * FRET_W }

const INLAY_FRETS  = [3,5,7,9,12,14]
const DOUBLE_INLAY = new Set([12])

// ─── Component ───────────────────────────────────────────────
const SCALE_TYPES = [
  { key:'major',     label:'Major'    },
  { key:'minor',     label:'Minor'    },
  { key:'pentMajor', label:'Pent Maj' },
  { key:'pentMinor', label:'Pent Min' },
]

function chordLabel({ root, quality }) {
  return noteName(root) + (quality === 'minor' ? 'm' : '')
}

// Note dots for one chord — pure function so it can be computed per-chord
// (one call per stacked neck) instead of only for a single "active" chord.
function computeChordNotes({ root, quality }, { mode, scaleType, activeShape }) {
  const tones = chordTones(root, quality)
  const scale = getScaleNotes(root, scaleType)
  const anchors = cagedAnchors(root)
  const [rootPc, thirdPc, fifthPc] = tones
  const roleOf = pc => {
    if (pc === rootPc)  return 'root'
    if (pc === thirdPc) return 'third'
    if (pc === fifthPc) return 'fifth'
    if (scale.includes(pc)) return 'scale'
    return null
  }

  const pcsToShow = mode === 'scale' ? scale : tones

  let windows = null   // null = no restriction (arpeggio)
  if (mode !== 'arpeggio') {
    windows = activeShape === 'all'
      ? SHAPES.map(sh => shapeWindow(sh, anchors))
      : [shapeWindow(activeShape, anchors)]
  }

  const seen = new Set()
  const result = []

  for (let str = 1; str <= 6; str++) {
    if (activeShape !== 'all' && mode !== 'arpeggio') {
      if (MUTED[activeShape]?.includes(str)) continue
    }

    for (const pc of pcsToShow) {
      for (const fret of fretsForPC(str, pc)) {
        if (fret > MAX_FRET) continue

        if (windows) {
          const inWindow = windows.some(([lo, hi]) => fret >= lo && fret <= hi)
          if (!inWindow) continue
        }

        const key = `${str}-${fret}`
        if (seen.has(key)) continue
        seen.add(key)

        const role = roleOf(pc)
        if (role) result.push({ str, fret, role, pc })
      }
    }
  }
  return result
}

const isPopoutWindow = () =>
  new URLSearchParams(window.location.search).get('popout') === 'caged'

export default function CAGEDView() {
  const [progression, setProgression] = useState([
    { root: 0, quality: 'major' },
  ])
  const [activeIdx,   setActiveIdx]   = useState(0)
  const [mode,        setMode]        = useState('chord')      // chord|arpeggio|scale
  const [scaleType,   setScaleType]   = useState('major')
  const [activeShape, setActiveShape] = useState('all')        // all|E|A|G|D|C
  const [addRoot,     setAddRoot]     = useState(0)
  const [addQuality,  setAddQuality]  = useState('major')
  const neckRefs = useRef([])

  // One computed neck (label + note dots + shape anchors) per progression
  // chord — every chord stays visible as its own stacked fretboard, rather
  // than only ever showing a single "active" one.
  const necks = useMemo(() => progression.map(ch => ({
    chord: ch,
    anchors: cagedAnchors(ch.root),
    notes: computeChordNotes(ch, { mode, scaleType, activeShape }),
  })), [progression, mode, scaleType, activeShape])

  const quality = (progression[Math.min(activeIdx, progression.length - 1)] ?? { quality: 'major' }).quality

  const addChord = () => {
    if (progression.length >= 8) return
    const next = [...progression, { root: addRoot, quality: addQuality }]
    setProgression(next)
    setActiveIdx(next.length - 1)
  }

  const removeChord = (i) => {
    if (progression.length === 1) return
    const next = progression.filter((_, j) => j !== i)
    setProgression(next)
    setActiveIdx(Math.min(activeIdx, next.length - 1))
  }

  const focusChord = (i) => {
    setActiveIdx(i)
    neckRefs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const popOut = () => {
    window.open(window.location.pathname + '?popout=caged', 'caged-popout', 'width=1180,height=900')
  }

  return (
    <div className="caged-view">
      <div className="caged-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div>
          <h2 className="caged-title">CAGED Explorer</h2>
          <p className="caged-subtitle">
            Fretboard positions, arpeggios &amp; scales for your progression
          </p>
        </div>
        {!isPopoutWindow() && (
          <button className="btn-ghost btn-sm" onClick={popOut}>⧉ Pop out</button>
        )}
      </div>

      {/* Chord progression */}
      <div className="caged-section">
        <span className="tiny">Progression</span>
        <div className="caged-prog-row">
          {progression.map((ch, i) => (
            <div key={i} className="caged-chord-wrap">
              <button
                className={`caged-chord-btn${i === activeIdx ? ' active' : ''}`}
                onClick={() => focusChord(i)}
              >
                {chordLabel(ch)}
              </button>
              {progression.length > 1 && (
                <button className="caged-chord-rm" onClick={() => removeChord(i)}>×</button>
              )}
            </div>
          ))}

          {progression.length < 8 && (
            <div className="caged-add-chord">
              <select value={addRoot} onChange={e => setAddRoot(+e.target.value)}>
                {NOTE_NAMES.map((n, i) => <option key={i} value={i}>{n}</option>)}
              </select>
              <select value={addQuality} onChange={e => setAddQuality(e.target.value)}>
                <option value="major">maj</option>
                <option value="minor">min</option>
              </select>
              <button className="btn sm" onClick={addChord}>+ Add</button>
            </div>
          )}
        </div>
      </div>

      {/* Controls row */}
      <div className="caged-controls-row">
        <div className="caged-ctrl">
          <span className="tiny">View</span>
          <div className="segmented">
            {['chord','arpeggio','scale'].map(m => (
              <button key={m} className={mode === m ? 'on' : ''} onClick={() => setMode(m)}>
                {m[0].toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {mode === 'scale' && (
          <div className="caged-ctrl">
            <span className="tiny">Scale</span>
            <div className="segmented">
              {SCALE_TYPES.map(({ key, label }) => (
                <button key={key} className={scaleType === key ? 'on' : ''} onClick={() => setScaleType(key)}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="caged-ctrl">
          <span className="tiny">Shape</span>
          <div className="segmented">
            <button className={activeShape === 'all' ? 'on' : ''} onClick={() => setActiveShape('all')}>All</button>
            {SHAPES.map(sh => (
              <button
                key={sh}
                className={activeShape === sh ? 'on caged-shape-active' : ''}
                style={activeShape === sh ? { '--shape-col': SHAPE_COLOR[sh].fill } : {}}
                onClick={() => setActiveShape(sh)}
              >
                {sh}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Fretboards — one per progression chord, stacked */}
      <div className="caged-neck-list">
        {necks.map((n, i) => (
          <div key={i} ref={el => { neckRefs.current[i] = el }}>
            <div className="caged-neck-label">{chordLabel(n.chord)}</div>
            <div className="caged-neck-wrap">
              <svg
                viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                className="caged-neck-svg"
                aria-label={`Guitar fretboard diagram for ${chordLabel(n.chord)}`}
              >
                <FretBoard notes={n.notes} anchors={n.anchors} activeShape={activeShape} maxFret={MAX_FRET} />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="caged-legend">
        <div className="caged-legend-group">
          {[
            { role:'root',  label:'Root' },
            { role:'third', label: quality === 'minor' ? 'b3' : '3rd' },
            { role:'fifth', label:'5th' },
            ...(mode === 'scale' ? [{ role:'scale', label:'Scale' }] : []),
          ].map(({ role, label }) => (
            <span key={role} className="caged-legend-item">
              <span className="caged-legend-dot" style={{ background: ROLE_COLOR[role] }} />
              {label}
            </span>
          ))}
        </div>
        <div className="caged-legend-group">
          {SHAPES.map(sh => (
            <span key={sh} className="caged-legend-item">
              <span className="caged-legend-dot" style={{ background: SHAPE_COLOR[sh].fill, borderRadius: 3 }} />
              {sh} shape
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Fretboard SVG internals ─────────────────────────────────
function FretBoard({ notes, anchors, activeShape, maxFret }) {
  return (
    <>
      {/* CAGED shape regions */}
      {SHAPES.map(sh => {
        const [lo, hi] = shapeWindow(sh, anchors)
        if (lo > maxFret) return null
        const clampedHi = Math.min(hi, maxFret)
        const x1 = lo === 0
          ? PAD_LEFT - FRET_W * 0.45
          : fretLineX(lo)
        const x2 = fretLineX(clampedHi) + (clampedHi === lo ? FRET_W * 0.5 : 0)
        const col = SHAPE_COLOR[sh].fill
        const focused = activeShape === 'all' || activeShape === sh
        const labelX = (x1 + x2) / 2
        const labelY = PAD_TOP - 8

        return (
          <g key={sh}>
            <rect
              x={x1} y={PAD_TOP - 5}
              width={Math.max(0, x2 - x1)}
              height={5 * STR_H + 10}
              rx={7}
              fill={col}
              opacity={focused ? 0.14 : 0.04}
              stroke={col}
              strokeWidth={activeShape === sh ? 1.5 : 0.8}
              strokeOpacity={focused ? (activeShape === sh ? 0.7 : 0.35) : 0.1}
            />
            <text
              x={labelX} y={labelY}
              textAnchor="middle"
              fontSize="10"
              fontFamily="var(--f-mono)"
              fontWeight="700"
              fill={col}
              opacity={focused ? 0.9 : 0.25}
            >
              {sh}
            </text>
          </g>
        )
      })}

      {/* Nut */}
      <rect
        x={PAD_LEFT - 4} y={PAD_TOP - 5}
        width={5} height={5 * STR_H + 10}
        fill="var(--text-2)" rx={2}
      />

      {/* Fret lines */}
      {Array.from({ length: maxFret }, (_, i) => i + 1).map(f => (
        <line
          key={f}
          x1={fretLineX(f)} y1={PAD_TOP - 3}
          x2={fretLineX(f)} y2={PAD_TOP + 5 * STR_H + 3}
          stroke="var(--line-strong)"
          strokeWidth={f === 12 ? 2.5 : 0.8}
          opacity={f === 12 ? 1 : 0.7}
        />
      ))}

      {/* String lines (str 1=top=high e, 6=bottom=low E) */}
      {[1,2,3,4,5,6].map(s => (
        <line
          key={s}
          x1={PAD_LEFT - FRET_W * 0.42} y1={strY(s)}
          x2={fretLineX(maxFret)}        y2={strY(s)}
          stroke="var(--text-3)"
          strokeWidth={0.8 + (s - 1) * 0.35}
          opacity={0.6}
        />
      ))}

      {/* Inlays */}
      {INLAY_FRETS.filter(f => f <= maxFret).map(f => {
        const x = fretX(f)
        const midY = PAD_TOP + 2.5 * STR_H
        return DOUBLE_INLAY.has(f) ? (
          <g key={f}>
            <circle cx={x} cy={PAD_TOP + 1.5 * STR_H} r={3.5} fill="var(--line-strong)" />
            <circle cx={x} cy={PAD_TOP + 3.5 * STR_H} r={3.5} fill="var(--line-strong)" />
          </g>
        ) : (
          <circle key={f} cx={x} cy={midY} r={3.5} fill="var(--line-strong)" />
        )
      })}

      {/* Fret number labels */}
      {[0,3,5,7,9,12].filter(f => f <= maxFret).map(f => (
        <text
          key={f}
          x={fretX(f)}
          y={SVG_H - 2}
          textAnchor="middle"
          fontSize="9"
          fill="var(--text-3)"
          fontFamily="var(--f-mono)"
        >
          {f}
        </text>
      ))}

      {/* String name labels */}
      {['e','B','G','D','A','E'].map((name, i) => (
        <text
          key={i}
          x={PAD_LEFT - FRET_W * 0.45 - 5}
          y={strY(i + 1) + 4}
          textAnchor="end"
          fontSize="9"
          fill="var(--text-3)"
          fontFamily="var(--f-mono)"
        >
          {name}
        </text>
      ))}

      {/* Note dots */}
      {notes.map(({ str, fret, role, pc }, i) => {
        const cx = fretX(fret)
        const cy = strY(str)
        const col = ROLE_COLOR[role]
        const isRoot = role === 'root'
        const isDim  = role === 'scale'
        return (
          <g key={i}>
            <circle cx={cx} cy={cy} r={DOT_R} fill={col} opacity={isDim ? 0.5 : 0.9} />
            {isRoot && (
              <circle cx={cx} cy={cy} r={DOT_R - 3.5} fill="none" stroke="rgba(255,255,255,.65)" strokeWidth={1.5} />
            )}
            <text
              x={cx} y={cy + 4}
              textAnchor="middle"
              fontSize={isDim ? '7' : '8'}
              fontWeight="700"
              fontFamily="var(--f-mono)"
              fill={isDim ? 'var(--text-3)' : '#fff'}
              pointerEvents="none"
            >
              {noteName(pc)}
            </text>
          </g>
        )
      })}
    </>
  )
}
