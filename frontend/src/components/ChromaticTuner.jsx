import React, { useEffect, useRef, useState } from 'react'

const GUITAR_STRINGS = [
  { label: 'E2', freq: 82.41 },
  { label: 'A2', freq: 110.00 },
  { label: 'D3', freq: 146.83 },
  { label: 'G3', freq: 196.00 },
  { label: 'B3', freq: 246.94 },
  { label: 'E4', freq: 329.63 },
]

const UKU_STRINGS = [
  { label: 'G4', freq: 392.00 },
  { label: 'C4', freq: 261.63 },
  { label: 'E4', freq: 329.63 },
  { label: 'A4', freq: 440.00 },
]

// All notes E2–E4. Black keys include leftWhiteIdx: index of the white key to their left.
const KEYBOARD_NOTES = [
  { label: 'E2',  freq: 82.41,  black: false },
  { label: 'F2',  freq: 87.31,  black: false },
  { label: 'F#2', freq: 92.50,  black: true,  leftWhiteIdx: 1 },
  { label: 'G2',  freq: 98.00,  black: false },
  { label: 'G#2', freq: 103.83, black: true,  leftWhiteIdx: 2 },
  { label: 'A2',  freq: 110.00, black: false },
  { label: 'A#2', freq: 116.54, black: true,  leftWhiteIdx: 3 },
  { label: 'B2',  freq: 123.47, black: false },
  { label: 'C3',  freq: 130.81, black: false },
  { label: 'C#3', freq: 138.59, black: true,  leftWhiteIdx: 5 },
  { label: 'D3',  freq: 146.83, black: false },
  { label: 'D#3', freq: 155.56, black: true,  leftWhiteIdx: 6 },
  { label: 'E3',  freq: 164.81, black: false },
  { label: 'F3',  freq: 174.61, black: false },
  { label: 'F#3', freq: 185.00, black: true,  leftWhiteIdx: 8 },
  { label: 'G3',  freq: 196.00, black: false },
  { label: 'G#3', freq: 207.65, black: true,  leftWhiteIdx: 9 },
  { label: 'A3',  freq: 220.00, black: false },
  { label: 'A#3', freq: 233.08, black: true,  leftWhiteIdx: 10 },
  { label: 'B3',  freq: 246.94, black: false },
  { label: 'C4',  freq: 261.63, black: false },
  { label: 'C#4', freq: 277.18, black: true,  leftWhiteIdx: 12 },
  { label: 'D4',  freq: 293.66, black: false },
  { label: 'D#4', freq: 311.13, black: true,  leftWhiteIdx: 13 },
  { label: 'E4',  freq: 329.63, black: false },
]

const WW = 24   // white key width
const WH = 88   // white key height
const BW = 14   // black key width
const BH = 54   // black key height

export default function ChromaticTuner({ onClose }) {
  const [playing, setPlaying] = useState(null)
  const [volume, setVolume] = useState(0.4)
  const ctxRef = useRef(null)
  const oscRef = useRef(null)
  const gainRef = useRef(null)

  useEffect(() => () => stopTone(), [])

  function getCtx() {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }
    if (ctxRef.current.state === 'suspended') ctxRef.current.resume()
    return ctxRef.current
  }

  function stopTone() {
    const ctx = ctxRef.current
    if (!ctx) return
    if (gainRef.current) {
      gainRef.current.gain.setTargetAtTime(0, ctx.currentTime, 0.015)
      gainRef.current = null
    }
    if (oscRef.current) {
      const osc = oscRef.current
      oscRef.current = null
      setTimeout(() => { try { osc.stop() } catch {} }, 80)
    }
  }

  function selectNote(freq) {
    stopTone()
    if (freq === playing) { setPlaying(null); return }

    const ctx = getCtx()
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.setTargetAtTime(volume, ctx.currentTime, 0.025)
    gain.connect(ctx.destination)
    gainRef.current = gain

    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = freq
    osc.connect(gain)
    osc.start()
    oscRef.current = osc

    setPlaying(freq)
  }

  const whites = KEYBOARD_NOTES.filter(n => !n.black)
  const blacks = KEYBOARD_NOTES.filter(n => n.black)
  const totalKbWidth = whites.length * WW

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      }}
    >
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: '28px 28px 20px',
        width: 440, position: 'relative',
      }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: 10, right: 12, background: 'none', color: 'var(--text2)', fontSize: 20, padding: '2px 6px', lineHeight: 1 }}
        >×</button>

        <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 20, fontWeight: 600, letterSpacing: 2 }}>
          TUNER
        </div>

        <StringRow label="Guitar" strings={GUITAR_STRINGS} playing={playing} onSelect={selectNote} />
        <StringRow label="Ukulele" strings={UKU_STRINGS} playing={playing} onSelect={selectNote} style={{ marginTop: 16 }} />

        <div style={{ marginTop: 16, fontSize: 12, color: 'var(--text2)', minHeight: 18 }}>
          {playing
            ? `Playing ${playing.toFixed(2)} Hz — click again to stop`
            : 'Select a string or key to play a reference tone'}
        </div>

        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 11, color: 'var(--text2)', whiteSpace: 'nowrap' }}>Volume</span>
          <input
            type="range" min={0} max={1} step={0.01} value={volume}
            onChange={e => {
              const v = parseFloat(e.target.value)
              setVolume(v)
              if (gainRef.current && ctxRef.current) {
                gainRef.current.gain.setTargetAtTime(v, ctxRef.current.currentTime, 0.01)
              }
            }}
            style={{ flex: 1, accentColor: 'var(--accent)', cursor: 'pointer' }}
          />
          <span style={{ fontSize: 11, color: 'var(--text2)', width: 28, textAlign: 'right' }}>
            {Math.round(volume * 100)}%
          </span>
        </div>

        {/* Piano keyboard */}
        <div style={{ marginTop: 16 }}>
          <svg
            viewBox={`0 0 ${totalKbWidth} ${WH}`}
            style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 4, overflow: 'visible' }}
          >
            {/* White keys */}
            {whites.map((note, i) => {
              const active = playing === note.freq
              return (
                <g key={note.label} onClick={() => selectNote(note.freq)} style={{ cursor: 'pointer' }}>
                  <rect
                    x={i * WW + 0.5} y={0.5}
                    width={WW - 1} height={WH - 1}
                    fill={active ? '#e94560' : '#dde4f0'}
                    stroke="#556" strokeWidth={1}
                    rx={2}
                  />
                  <text
                    x={i * WW + WW / 2} y={WH - 6}
                    textAnchor="middle" fontSize={7}
                    fill={active ? '#fff' : '#556'}
                    fontFamily="sans-serif" style={{ userSelect: 'none' }}
                  >
                    {note.label}
                  </text>
                </g>
              )
            })}
            {/* Black keys rendered on top */}
            {blacks.map(note => {
              const active = playing === note.freq
              const x = (note.leftWhiteIdx + 1) * WW - BW / 2
              return (
                <rect
                  key={note.label}
                  x={x} y={0}
                  width={BW} height={BH}
                  fill={active ? '#e94560' : '#1a1a2e'}
                  stroke="#000" strokeWidth={1}
                  rx={2}
                  style={{ cursor: 'pointer' }}
                  onClick={() => selectNote(note.freq)}
                />
              )
            })}
          </svg>
        </div>
      </div>
    </div>
  )
}

function StringRow({ label, strings, playing, onSelect, style }) {
  return (
    <div style={style}>
      <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 8, fontWeight: 600 }}>{label}</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {strings.map(s => {
          const active = playing === s.freq
          return (
            <button
              key={s.label + s.freq}
              onClick={() => onSelect(s.freq)}
              style={{
                minWidth: 48, padding: '8px 10px',
                background: active ? 'var(--accent)' : 'var(--surface2)',
                color: active ? '#fff' : 'var(--text)',
                border: active ? '1px solid var(--accent)' : '1px solid var(--border)',
                borderRadius: 6, fontSize: 13, fontWeight: 600,
                boxShadow: active ? '0 0 8px var(--accent)' : 'none',
                transition: 'background 0.1s, box-shadow 0.1s',
              }}
            >
              {s.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
