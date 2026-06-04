import React from 'react'

// frets: low E → high e. -1 = muted, 0 = open, N = fret number
export const CHORD_DB = {
  // C
  'C':      { frets: [-1, 3, 2, 0, 1, 0], baseFret: 1 },
  'Cm':     { frets: [-1, 3, 5, 5, 4, 3], baseFret: 3 },
  'C7':     { frets: [-1, 3, 2, 3, 1, 0], baseFret: 1 },
  'Cmaj7':  { frets: [-1, 3, 2, 0, 0, 0], baseFret: 1 },
  'Cm7':    { frets: [-1, 3, 5, 3, 4, 3], baseFret: 3 },
  'Cadd9':  { frets: [-1, 3, 2, 0, 3, 3], baseFret: 1 },
  'Csus2':  { frets: [-1, 3, 5, 5, 3, 3], baseFret: 3 },
  'Csus4':  { frets: [-1, 3, 3, 0, 1, 1], baseFret: 1 },
  // C# / Db
  'C#':     { frets: [-1, 4, 6, 6, 6, 4], baseFret: 4 },
  'C#m':    { frets: [-1, 4, 6, 6, 5, 4], baseFret: 4 },
  'C#7':    { frets: [-1, 4, 6, 4, 6, 4], baseFret: 4 },
  'C#maj7': { frets: [-1, 4, 6, 5, 6, 4], baseFret: 4 },
  'C#m7':   { frets: [-1, 4, 6, 4, 5, 4], baseFret: 4 },
  // D
  'D':      { frets: [-1, -1, 0, 2, 3, 2], baseFret: 1 },
  'Dm':     { frets: [-1, -1, 0, 2, 3, 1], baseFret: 1 },
  'D7':     { frets: [-1, -1, 0, 2, 1, 2], baseFret: 1 },
  'Dmaj7':  { frets: [-1, -1, 0, 2, 2, 2], baseFret: 1 },
  'Dm7':    { frets: [-1, -1, 0, 2, 1, 1], baseFret: 1 },
  'Dadd9':  { frets: [-1, -1, 0, 2, 3, 0], baseFret: 1 },
  'Dsus2':  { frets: [-1, -1, 0, 2, 3, 0], baseFret: 1 },
  'Dsus4':  { frets: [-1, -1, 0, 2, 3, 3], baseFret: 1 },
  // Eb / D#
  'Eb':     { frets: [-1, 6, 8, 8, 8, 6], baseFret: 6 },
  'Ebm':    { frets: [-1, 6, 8, 8, 7, 6], baseFret: 6 },
  'Eb7':    { frets: [-1, 6, 8, 6, 8, 6], baseFret: 6 },
  'Ebmaj7': { frets: [-1, 6, 8, 7, 8, 7], baseFret: 6 },
  'Ebm7':   { frets: [-1, 6, 8, 6, 7, 6], baseFret: 6 },
  'D#7':    { frets: [-1, -1, 1, 3, 2, 3], baseFret: 1 },
  // E
  'E':      { frets: [0, 2, 2, 1, 0, 0], baseFret: 1 },
  'Em':     { frets: [0, 2, 2, 0, 0, 0], baseFret: 1 },
  'E7':     { frets: [0, 2, 0, 1, 0, 0], baseFret: 1 },
  'Emaj7':  { frets: [0, 2, 1, 1, 0, 0], baseFret: 1 },
  'Em7':    { frets: [0, 2, 2, 0, 3, 3], baseFret: 1 },
  'Eadd9':  { frets: [0, 2, 2, 1, 2, 0], baseFret: 1 },
  'Esus2':  { frets: [0, 2, 4, 4, 0, 0], baseFret: 1 },
  'Esus4':  { frets: [0, 2, 2, 2, 0, 0], baseFret: 1 },
  // F
  'F':      { frets: [1, 3, 3, 2, 1, 1], baseFret: 1 },
  'Fm':     { frets: [1, 3, 3, 1, 1, 1], baseFret: 1 },
  'F7':     { frets: [1, 3, 1, 2, 1, 1], baseFret: 1 },
  'Fmaj7':  { frets: [-1, -1, 3, 2, 1, 0], baseFret: 1 },
  'Fm7':    { frets: [1, 3, 1, 1, 1, 1], baseFret: 1 },
  'Fsus2':  { frets: [1, 1, 3, 3, 1, 1], baseFret: 1 },
  'Fsus4':  { frets: [1, 3, 3, 3, 1, 1], baseFret: 1 },
  // F# / Gb
  'F#':     { frets: [2, 4, 4, 3, 2, 2], baseFret: 2 },
  'F#m':    { frets: [2, 4, 4, 2, 2, 2], baseFret: 2 },
  'F#7':    { frets: [2, 4, 2, 3, 2, 2], baseFret: 2 },
  'F#maj7': { frets: [2, 4, 3, 3, 2, 2], baseFret: 2 },
  'F#m7':   { frets: [2, 4, 2, 2, 2, 2], baseFret: 2 },
  // G
  'G':      { frets: [3, 2, 0, 0, 3, 3], baseFret: 1 },
  'Gm':     { frets: [3, 5, 5, 3, 3, 3], baseFret: 3 },
  'G7':     { frets: [3, 2, 0, 0, 0, 1], baseFret: 1 },
  'Gmaj7':  { frets: [3, 2, 0, 0, 0, 2], baseFret: 1 },
  'Gm7':    { frets: [3, 5, 3, 3, 3, 3], baseFret: 3 },
  'Gadd9':  { frets: [3, 2, 0, 2, 0, 3], baseFret: 1 },
  'Gsus2':  { frets: [3, 2, 0, 0, 0, 3], baseFret: 1 },
  'Gsus4':  { frets: [3, 3, 0, 0, 1, 3], baseFret: 1 },
  // Ab / G#
  'Ab':     { frets: [4, 6, 6, 5, 4, 4], baseFret: 4 },
  'G#':     { frets: [4, 6, 6, 5, 4, 4], baseFret: 4 },
  'Abm':    { frets: [4, 6, 6, 4, 4, 4], baseFret: 4 },
  'G#m':    { frets: [4, 6, 6, 4, 4, 4], baseFret: 4 },
  'Ab7':    { frets: [4, 6, 4, 5, 4, 4], baseFret: 4 },
  'Abmaj7': { frets: [4, 6, 5, 5, 4, 4], baseFret: 4 },
  'Abm7':   { frets: [4, 6, 4, 4, 4, 4], baseFret: 4 },
  // A
  'A':      { frets: [-1, 0, 2, 2, 2, 0], baseFret: 1 },
  'Am':     { frets: [-1, 0, 2, 2, 1, 0], baseFret: 1 },
  'A7':     { frets: [-1, 0, 2, 0, 2, 0], baseFret: 1 },
  'Amaj7':  { frets: [-1, 0, 2, 1, 2, 0], baseFret: 1 },
  'Am7':    { frets: [-1, 0, 2, 0, 1, 0], baseFret: 1 },
  'Aadd9':  { frets: [-1, 0, 2, 4, 2, 0], baseFret: 1 },
  'Asus2':  { frets: [-1, 0, 2, 2, 0, 0], baseFret: 1 },
  'Asus4':  { frets: [-1, 0, 2, 2, 3, 0], baseFret: 1 },
  'A7sus4': { frets: [-1, 0, 2, 0, 3, 3], baseFret: 1 },
  // Bb / A#
  'Bb':     { frets: [-1, 1, 3, 3, 3, 1], baseFret: 1 },
  'Bbm':    { frets: [-1, 1, 3, 3, 2, 1], baseFret: 1 },
  'Bb7':    { frets: [-1, 1, 3, 1, 3, 1], baseFret: 1 },
  'Bbmaj7': { frets: [-1, 1, 3, 2, 3, 1], baseFret: 1 },
  'Bbm7':   { frets: [-1, 1, 3, 1, 2, 1], baseFret: 1 },
  // B
  'B':      { frets: [-1, 2, 4, 4, 4, 2], baseFret: 2 },
  'Bm':     { frets: [-1, 2, 4, 4, 3, 2], baseFret: 2 },
  'B7':     { frets: [-1, 2, 1, 2, 0, 2], baseFret: 1 },
  'Bmaj7':  { frets: [-1, 2, 4, 3, 4, 2], baseFret: 2 },
  'Bm7':    { frets: [-1, 2, 4, 2, 3, 2], baseFret: 2 },
  'Baug':   { frets: [-1, 2, 1, 0, 0, 3], baseFret: 1 },
  // misc
  'Abdim7': { frets: [-1, -1, 0, 1, 0, 1], baseFret: 1 },
}

// frets: [G, C, E, A]. -1 = muted, 0 = open, N = fret number
export const UKU_CHORD_DB = {
  // C
  'C':      { frets: [0, 0, 0, 3], baseFret: 1 },
  'Cm':     { frets: [0, 3, 3, 3], baseFret: 1 },
  'C7':     { frets: [0, 0, 0, 1], baseFret: 1 },
  'Cmaj7':  { frets: [0, 0, 0, 2], baseFret: 1 },
  'Cm7':    { frets: [0, 3, 3, 3], baseFret: 3 },
  'Cadd9':  { frets: [0, 2, 0, 3], baseFret: 1 },
  'Csus2':  { frets: [0, 2, 3, 3], baseFret: 1 },
  'Csus4':  { frets: [0, 0, 1, 3], baseFret: 1 },
  // C# / Db
  'C#':     { frets: [1, 1, 1, 4], baseFret: 1 },
  'C#m':    { frets: [1, 1, 0, 4], baseFret: 1 },
  'C#7':    { frets: [1, 1, 1, 2], baseFret: 1 },
  'C#maj7': { frets: [1, 1, 1, 3], baseFret: 1 },
  'C#m7':   { frets: [1, 1, 0, 2], baseFret: 1 },
  // D
  'D':      { frets: [2, 2, 2, 0], baseFret: 1 },
  'Dm':     { frets: [2, 2, 1, 0], baseFret: 1 },
  'D7':     { frets: [2, 2, 2, 3], baseFret: 1 },
  'Dmaj7':  { frets: [2, 2, 2, 4], baseFret: 1 },
  'Dm7':    { frets: [2, 2, 1, 3], baseFret: 1 },
  'Dadd9':  { frets: [2, 4, 2, 0], baseFret: 1 },
  'Dsus2':  { frets: [2, 2, 0, 0], baseFret: 1 },
  'Dsus4':  { frets: [0, 2, 3, 0], baseFret: 1 },
  // Eb / D#
  'Eb':     { frets: [3, 3, 3, 1], baseFret: 1 },
  'Ebm':    { frets: [3, 3, 2, 1], baseFret: 1 },
  'Eb7':    { frets: [3, 3, 3, 4], baseFret: 1 },
  'Ebmaj7': { frets: [3, 3, 3, 5], baseFret: 1 },
  'Ebm7':   { frets: [3, 3, 2, 4], baseFret: 1 },
  // E
  'E':      { frets: [4, 4, 4, 2], baseFret: 2 },
  'Em':     { frets: [0, 4, 3, 2], baseFret: 2 },
  'E7':     { frets: [1, 2, 0, 2], baseFret: 1 },
  'Emaj7':  { frets: [1, 3, 0, 2], baseFret: 1 },
  'Em7':    { frets: [0, 2, 0, 2], baseFret: 1 },
  'Esus4':  { frets: [2, 4, 0, 2], baseFret: 2 },
  // F
  'F':      { frets: [2, 0, 1, 0], baseFret: 1 },
  'Fm':     { frets: [1, 0, 1, 3], baseFret: 1 },
  'F7':     { frets: [2, 3, 1, 0], baseFret: 1 },
  'Fmaj7':  { frets: [2, 4, 1, 0], baseFret: 1 },
  'Fm7':    { frets: [1, 0, 1, 1], baseFret: 1 },
  'Fsus2':  { frets: [0, 0, 1, 3], baseFret: 1 },
  'Fsus4':  { frets: [3, 0, 1, 0], baseFret: 1 },
  // F# / Gb
  'F#':     { frets: [3, 1, 2, 1], baseFret: 1 },
  'F#m':    { frets: [2, 1, 2, 0], baseFret: 1 },
  'F#7':    { frets: [3, 4, 2, 1], baseFret: 1 },
  'F#maj7': { frets: [3, 1, 2, 3], baseFret: 1 },
  'F#m7':   { frets: [2, 1, 0, 0], baseFret: 1 },
  // G
  'G':      { frets: [0, 2, 3, 2], baseFret: 1 },
  'Gm':     { frets: [0, 2, 3, 1], baseFret: 1 },
  'G7':     { frets: [0, 2, 1, 2], baseFret: 1 },
  'Gmaj7':  { frets: [0, 2, 2, 2], baseFret: 1 },
  'Gm7':    { frets: [0, 2, 1, 1], baseFret: 1 },
  'Gsus2':  { frets: [0, 2, 3, 0], baseFret: 1 },
  'Gsus4':  { frets: [0, 2, 3, 3], baseFret: 1 },
  // Ab / G#
  'Ab':     { frets: [1, 3, 4, 3], baseFret: 3 },
  'Abm':    { frets: [1, 3, 4, 2], baseFret: 3 },
  'Ab7':    { frets: [1, 3, 2, 3], baseFret: 3 },
  'Abmaj7': { frets: [1, 3, 3, 3], baseFret: 3 },
  'Abm7':   { frets: [1, 3, 2, 2], baseFret: 3 },
  // A
  'A':      { frets: [2, 1, 0, 0], baseFret: 1 },
  'Am':     { frets: [2, 0, 0, 0], baseFret: 1 },
  'A7':     { frets: [0, 1, 0, 0], baseFret: 1 },
  'Amaj7':  { frets: [1, 1, 0, 0], baseFret: 1 },
  'Am7':    { frets: [0, 0, 0, 0], baseFret: 1 },
  'Aadd9':  { frets: [2, 1, 2, 0], baseFret: 1 },
  'Asus2':  { frets: [2, 4, 0, 0], baseFret: 2 },
  'Asus4':  { frets: [2, 2, 0, 0], baseFret: 1 },
  'A7sus4': { frets: [0, 2, 0, 0], baseFret: 1 },
  // Bb / A#
  'Bb':     { frets: [3, 2, 1, 1], baseFret: 1 },
  'Bbm':    { frets: [3, 1, 1, 1], baseFret: 1 },
  'Bb7':    { frets: [1, 2, 1, 1], baseFret: 1 },
  'Bbmaj7': { frets: [3, 2, 1, 2], baseFret: 1 },
  'Bbm7':   { frets: [1, 1, 1, 1], baseFret: 1 },
  // B
  'B':      { frets: [4, 3, 2, 2], baseFret: 1 },
  'Bm':     { frets: [4, 2, 2, 2], baseFret: 1 },
  'B7':     { frets: [2, 1, 2, 2], baseFret: 1 },
  'Bmaj7':  { frets: [3, 3, 2, 2], baseFret: 1 },
  'Bm7':    { frets: [2, 2, 2, 2], baseFret: 2 },
}

const S = 12   // string spacing
const F = 14   // fret spacing
const L = 20   // left margin (for fret numbers)
const T = 30   // top margin (chord name + X/O row)
const DR = 4.5 // dot radius
const FRETS = 4

export default function ChordDiagram({ name, frets, baseFret = 1, strings = 6, compact = false }) {
  const N = strings
  const scale = compact ? 0.82 : 1
  const s = S * scale
  const f = F * scale
  const l = L * scale
  const t = T * scale
  const dr = DR * scale
  const w = l + (N - 1) * s + 10 * scale
  const h = t + FRETS * f + 8 * scale

  const sx = i => l + i * s
  const fy = fr => t + (fr - 0.5) * f

  const relFrets = frets.map(fr => fr > 0 ? fr - baseFret + 1 : fr)

  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <text x={w / 2} y={compact ? 11 : 13} textAnchor="middle" fill="#eaeaea"
        fontSize={compact ? 9 : 11} fontWeight="700" fontFamily="sans-serif">
        {name}
      </text>

      {frets.map((fr, i) => {
        if (fr === -1) return (
          <text key={i} x={sx(i)} y={t - 5 * scale} textAnchor="middle" fill="#e94560"
            fontSize={compact ? 8 : 10} fontFamily="sans-serif">✕</text>
        )
        if (fr === 0) return (
          <text key={i} x={sx(i)} y={t - 5 * scale} textAnchor="middle" fill="#8aa"
            fontSize={compact ? 9 : 11} fontFamily="sans-serif">○</text>
        )
        return null
      })}

      <rect x={l} y={t} width={(N - 1) * s} height={baseFret === 1 ? 3 * scale : scale}
        fill={baseFret === 1 ? '#ccc' : '#444'} rx="1" />

      {baseFret > 1 && (
        <text x={l - 4 * scale} y={t + f / 2 + 4 * scale} textAnchor="end" fill="#888"
          fontSize={compact ? 7 : 9} fontFamily="sans-serif">
          {baseFret}fr
        </text>
      )}

      {Array.from({ length: N }).map((_, i) => (
        <line key={i} x1={sx(i)} y1={t} x2={sx(i)} y2={t + FRETS * f} stroke="#444" strokeWidth="1" />
      ))}

      {Array.from({ length: FRETS }).map((_, i) => (
        <line key={i} x1={l} y1={t + (i + 1) * f} x2={l + (N - 1) * s} y2={t + (i + 1) * f}
          stroke="#444" strokeWidth="1" />
      ))}

      {relFrets.map((rf, i) => {
        if (rf < 1 || rf > FRETS) return null
        return <circle key={i} cx={sx(i)} cy={fy(rf)} r={dr} fill="#e94560" />
      })}
    </svg>
  )
}
