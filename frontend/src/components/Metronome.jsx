import React, { useState, useEffect, useRef } from 'react'

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M7 5.5v13a1 1 0 0 0 1.5.87l11-6.5a1 1 0 0 0 0-1.74l-11-6.5A1 1 0 0 0 7 5.5Z"/>
  </svg>
)
const PauseIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="5" width="4" height="14" rx="1"/>
    <rect x="14" y="5" width="4" height="14" rx="1"/>
  </svg>
)

export default function Metronome({ defaultTempo = 0 }) {
  const [bpm, setBpm]       = useState(defaultTempo > 0 ? defaultTempo : 100)
  const [running, setRunning] = useState(false)
  const [beat, setBeat]     = useState(-1)  // 0-3, -1 = none active

  const ctxRef       = useRef(null)
  const nextTimeRef  = useRef(0)
  const timerRef     = useRef(null)
  const bpmRef       = useRef(bpm)
  const runningRef   = useRef(false)
  const beatCountRef = useRef(0)

  useEffect(() => {
    if (!runningRef.current && defaultTempo > 0) {
      setBpm(defaultTempo); bpmRef.current = defaultTempo
    }
  }, [defaultTempo])

  useEffect(() => { bpmRef.current = bpm }, [bpm])

  function getCtx() {
    if (!ctxRef.current) ctxRef.current = new (window.AudioContext || window.webkitAudioContext)()
    return ctxRef.current
  }

  function scheduleClick(time, thisBeat) {
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

    const delay = Math.max(0, (time - ctx.currentTime) * 1000)
    setTimeout(() => {
      setBeat(thisBeat % 4)
      setTimeout(() => setBeat(-1), 80)
    }, delay)
  }

  function scheduler() {
    if (!runningRef.current) return
    const ctx = getCtx()
    const interval = 60 / bpmRef.current
    while (nextTimeRef.current < ctx.currentTime + 0.1) {
      scheduleClick(nextTimeRef.current, beatCountRef.current)
      nextTimeRef.current += interval
      beatCountRef.current++
    }
    timerRef.current = setTimeout(scheduler, 25)
  }

  function start() {
    const ctx = getCtx()
    if (ctx.state === 'suspended') ctx.resume()
    runningRef.current = true
    beatCountRef.current = 0
    nextTimeRef.current = ctx.currentTime + 0.05
    setRunning(true)
    scheduler()
  }

  function stop() {
    runningRef.current = false
    clearTimeout(timerRef.current)
    setRunning(false)
    setBeat(-1)
  }

  const toggle = () => running ? stop() : start()

  const changeBpm = (val) => {
    const v = Math.max(40, Math.min(200, Number(val)))
    setBpm(v); bpmRef.current = v
    if (runningRef.current) { stop(); setTimeout(start, 50) }
  }

  const pct = Math.max(4, Math.min(96, ((bpm - 40) / 160) * 100))

  const handleSliderClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    changeBpm(Math.round(40 + ratio * 160))
  }

  return (
    <>
      <div className="metro-top">
        <div className="bpm">
          <b>{bpm}</b>
          <span>bpm</span>
        </div>
        <button className={`startbtn${running ? ' on' : ''}`} onClick={toggle}>
          {running ? <PauseIcon /> : <PlayIcon />}
        </button>
      </div>

      <div className="slider" onClick={handleSliderClick}>
        <div className="fill" style={{ width: pct + '%' }} />
        <div className="knob" style={{ left: pct + '%' }} />
      </div>

      <div className="presets">
        {[60, 80, 100, 120, 140].map(v => (
          <button key={v} className={bpm === v ? 'on' : ''} onClick={() => changeBpm(v)}>{v}</button>
        ))}
      </div>

      <div className="beat-dots">
        {[0, 1, 2, 3].map(i => (
          <i key={i} className={beat === i ? 'lit' : ''} />
        ))}
      </div>
    </>
  )
}
