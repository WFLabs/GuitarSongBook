import React, { useState, useEffect, useRef } from 'react'

export default function Player({ song, onClose }) {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [speed, setSpeed] = useState(1)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed
    }
  }, [speed])

  useEffect(() => {
    setPlaying(false)
    setProgress(0)
    setSpeed(1)
    if (song && audioRef.current) {
      audioRef.current.load()
      audioRef.current.play()
        .then(() => setPlaying(true))
        .catch(() => {})
    }
  }, [song?.id])

  if (!song) return null

  const toggle = () => {
    if (!audioRef.current) return
    if (playing) { audioRef.current.pause(); setPlaying(false) }
    else { audioRef.current.play(); setPlaying(true) }
  }

  const seek = (e) => {
    if (!audioRef.current || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    audioRef.current.currentTime = ratio * duration
  }

  const fmt = (s) => {
    if (!s || isNaN(s)) return '0:00'
    return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 0, left: 0, right: 0,
      background: 'var(--surface)',
      borderTop: '1px solid var(--border)',
      padding: '10px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      zIndex: 100,
    }}>
      <audio
        ref={audioRef}
        src={song.media_file ? `/media/${song.media_file}` : ''}
        onTimeUpdate={() => setProgress(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={() => setPlaying(false)}
      />

      <div style={{ flex: '0 0 auto' }}>
        <div style={{ fontWeight: 600, fontSize: 13 }}>{song.title}</div>
        <div style={{ fontSize: 11, color: 'var(--text2)' }}>{song.artist}</div>
      </div>

      <button onClick={toggle} style={{
        background: 'var(--accent)', color: '#fff', width: 36, height: 36,
        borderRadius: '50%', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {playing ? '⏸' : '▶'}
      </button>

      <span style={{ fontSize: 11, color: 'var(--text2)', minWidth: 36 }}>{fmt(progress)}</span>

      <div onClick={seek} style={{
        flex: 1, height: 4, background: 'var(--border)', borderRadius: 2, cursor: 'pointer', position: 'relative',
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, height: '100%',
          width: duration ? `${(progress / duration) * 100}%` : '0%',
          background: 'var(--accent)', borderRadius: 2, pointerEvents: 'none',
        }} />
      </div>

      <span style={{ fontSize: 11, color: 'var(--text2)', minWidth: 36 }}>{fmt(duration)}</span>

      <input type="range" min="0" max="1" step="0.01" value={volume}
        onChange={e => { setVolume(+e.target.value); if (audioRef.current) audioRef.current.volume = +e.target.value }}
        style={{ width: 70, accentColor: 'var(--accent)', cursor: 'pointer' }} />

      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
        {[1, 0.9, 0.75, 0.5].map(s => (
          <button
            key={s}
            onClick={() => setSpeed(s)}
            style={{
              fontSize: 11,
              padding: '2px 6px',
              borderRadius: 4,
              background: speed === s ? 'var(--accent)' : 'var(--surface2)',
              color: speed === s ? '#fff' : 'var(--text2)',
              border: '1px solid var(--border)',
              cursor: 'pointer',
            }}
          >
            {s === 1 ? '1×' : `${s}×`}
          </button>
        ))}
      </div>

      <button className="btn-ghost btn-sm" onClick={onClose} style={{ flexShrink: 0 }}>✕</button>
    </div>
  )
}
