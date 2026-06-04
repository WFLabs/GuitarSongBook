import React, { useState, useEffect } from 'react'

export default function PracticeTracker({ songId }) {
  const [sessions, setSessions] = useState([])
  const [form, setForm] = useState({ duration_minutes: 15, rating: 3, notes: '' })
  const [saving, setSaving] = useState(false)

  const load = () =>
    fetch(`/songs/${songId}/practice`).then(r => r.json()).then(setSessions)

  useEffect(() => { load() }, [songId])

  const log = async () => {
    setSaving(true)
    await fetch(`/songs/${songId}/practice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    await load()
    setForm({ duration_minutes: 15, rating: 3, notes: '' })
    setSaving(false)
  }

  const totalMinutes = sessions.reduce((a, s) => a + (s.duration_minutes || 0), 0)
  const avgRating = sessions.length ? (sessions.reduce((a, s) => a + (s.rating || 0), 0) / sessions.length).toFixed(1) : '—'

  return (
    <div>
      <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
        <Stat label="Sessions" value={sessions.length} />
        <Stat label="Total time" value={`${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`} />
        <Stat label="Avg rating" value={avgRating === '—' ? '—' : `${avgRating}/5`} />
      </div>

      <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: 16, marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, marginBottom: 12, color: 'var(--text2)' }}>Log a practice session</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '0 1 120px' }}>
            <label>Duration (min)</label>
            <input type="number" min="1" max="300" value={form.duration_minutes}
              onChange={e => setForm(f => ({ ...f, duration_minutes: +e.target.value }))} />
          </div>
          <div style={{ flex: '0 1 100px' }}>
            <label>Rating (1–5)</label>
            <input type="number" min="1" max="5" value={form.rating}
              onChange={e => setForm(f => ({ ...f, rating: +e.target.value }))} />
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <label>Notes</label>
            <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="What did you work on?" />
          </div>
          <button className="btn-primary btn-sm" onClick={log} disabled={saving}
            style={{ flexShrink: 0, marginBottom: 1 }}>
            {saving ? 'Saving…' : 'Log Session'}
          </button>
        </div>
      </div>

      {sessions.length === 0 ? (
        <p style={{ color: 'var(--text2)', fontStyle: 'italic' }}>No sessions logged yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sessions.map(s => (
            <div key={s.id} style={{
              background: 'var(--surface)', borderRadius: 'var(--radius)',
              padding: '10px 14px', display: 'flex', gap: 12, alignItems: 'center',
            }}>
              <span style={{ fontSize: 11, color: 'var(--text2)', minWidth: 80 }}>
                {new Date(s.date).toLocaleDateString()}
              </span>
              <span style={{ fontSize: 12, color: 'var(--accent2)', minWidth: 60 }}>{s.duration_minutes} min</span>
              <span style={{ fontSize: 13, color: '#f5c518' }}>{'★'.repeat(s.rating)}{'☆'.repeat(5 - s.rating)}</span>
              {s.notes && <span style={{ fontSize: 12, color: 'var(--text2)' }}>{s.notes}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '10px 18px', textAlign: 'center', minWidth: 100 }}>
      <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent)' }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>{label}</div>
    </div>
  )
}
