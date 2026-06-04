import React, { useState, useEffect, useRef } from 'react'

export default function Metronome({ defaultTempo = 0 }) {
  const [bpm, setBpm] = useState(defaultTempo > 0 ? defaultTempo : 100)
  const [running, setRunning] = useState(false)
  const [beat, setBeat] = useState(false)

  const ctxRef       = useRef(null)
  const nextTimeRef  = useRef(0)
  const timerRef     = useRef(null)
  const bpmRef       = useRef(bpm)
  const runningRef   = useRef(false)

  // Sync defaultTempo when song changes but metronome is stopped
  useEffect(() => {
    if (!runningRef.current && defaultTempo > 0) {
      setBpm(defaultTempo)
      bpmRef.current = defaultTempo
    }
  }, [defaultTempo])

  useEffect(() => { bpmRef.current = bpm }, [bpm])

  function getCtx() {
    if (!ctxRef.current) ctxRef.current = new (window.AudioContext || window.webkitAudioContext)()
    return ctxRef.current
  }

  function scheduleClick(time) {
    const ctx = getCtx()
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.04, ctx.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.008))
    }
    const src = ctx.createBufferSource()
    src.buffer = buf
    const gain = ctx.createGain()
    gain.gain.value = 0.7
    src.connect(gain)
    gain.connect(ctx.destination)
    src.start(time)

    // Flash beat indicator in sync with audio
    const delay = Math.max(0, (time - ctx.currentTime) * 1000)
    setTimeout(() => {
      setBeat(true)
      setTimeout(() => setBeat(false), 80)
    }, delay)
  }

  function scheduler() {
    if (!runningRef.current) return
    const ctx = getCtx()
    const interval = 60 / bpmRef.current
    while (nextTimeRef.current < ctx.currentTime + 0.1) {
      scheduleClick(nextTimeRef.current)
      nextTimeRef.current += interval
    }
    timerRef.current = setTimeout(scheduler, 25)
  }

  function start() {
    const ctx = getCtx()
    if (ctx.state === 'suspended') ctx.resume()
    runningRef.current = true
    nextTimeRef.current = ctx.currentTime + 0.05
    setRunning(true)
    scheduler()
  }

  function stop() {
    runningRef.current = false
    clearTimeout(timerRef.current)
    setRunning(false)
    setBeat(false)
  }

  const toggle = () => running ? stop() : start()

  const changeBpm = (val) => {
    const v = Math.max(20, Math.min(300, Number(val)))
    setBpm(v)
    bpmRef.current = v
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <button
          onClick={toggle}
          className={running ? 'btn-danger btn-sm' : 'btn-primary btn-sm'}
          style={{ minWidth: 64 }}
        >
          {running ? 'Stop' : 'Start'}
        </button>
        <div style={{
          width: 12, height: 12, borderRadius: '50%', flexShrink: 0,
          background: beat ? 'var(--accent)' : 'var(--surface2)',
          transition: beat ? 'none' : 'background 0.15s',
          boxShadow: beat ? '0 0 6px var(--accent)' : 'none',
        }} />
        <span style={{ fontSize: 20, fontWeight: 700, minWidth: 38, textAlign: 'right', color: 'var(--text)' }}>
          {bpm}
        </span>
        <span style={{ fontSize: 11, color: 'var(--text2)' }}>BPM</span>
      </div>

      <input
        type="range"
        min={20} max={300} value={bpm}
        onChange={e => changeBpm(e.target.value)}
        style={{ width: '100%', accentColor: 'var(--accent)', marginBottom: 6 }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {[60, 80, 100, 120, 140].map(v => (
          <button key={v} className="btn-ghost btn-sm"
            style={{ fontSize: 11, padding: '2px 6px', opacity: bpm === v ? 1 : 0.5 }}
            onClick={() => changeBpm(v)}>{v}</button>
        ))}
      </div>
    </div>
  )
}
