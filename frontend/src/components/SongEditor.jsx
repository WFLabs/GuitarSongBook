import React, { useState, useEffect } from 'react'

const KEYS = ['','C','C#','D','D#','E','F','F#','G','G#','A','A#','B',
               'Cm','C#m','Dm','D#m','Em','Fm','F#m','Gm','G#m','Am','A#m','Bm']
const TUNINGS = ['Standard','Drop D','Open G','Open D','Open E','DADGAD','Half Step Down','Full Step Down']
const GENRES = ['','Rock','Pop','Blues','Country','Folk','Jazz','Classical','Metal','Punk','Alternative','R&B','Soul','Reggae','Other']

const empty = { title:'', artist:'', genre:'', key:'', tuning:'Standard', capo:0, tempo:0, lyrics:'', tabs:'', notes:'', youtube_url:'' }

export default function SongEditor({ song, pendingDownload, onSaved, onCancel }) {
  const [form, setForm] = useState({ ...empty, ...(song || {}) })
  const [saving, setSaving] = useState(false)
  const [artists, setArtists] = useState([])

  useEffect(() => {
    fetch('/songs/meta/artists').then(r => r.json()).then(setArtists)
  }, [])
  // Start on lyrics tab when pre-filled from online so user sees what was found
  const [tab, setTab] = useState(song && !song.id && song.lyrics ? 'lyrics' : 'tabs')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const isExisting = !!song?.id

  const save = async () => {
    if (!form.title.trim()) return alert('Title is required')
    setSaving(true)
    const method = isExisting ? 'PUT' : 'POST'
    const url = isExisting ? `/songs/${song.id}` : '/songs/'
    const body = { ...form }
    delete body.id; delete body.created_at; delete body.updated_at
    delete body.media_file; delete body.practice_count; delete body.last_practiced
    const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (r.ok) {
      const saved = await r.json()
      onSaved(saved)
    } else {
      alert('Save failed')
    }
    setSaving(false)
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 20 }}>{isExisting ? 'Edit Song' : 'New Song'}</h2>
          {pendingDownload && (
            <p style={{ fontSize: 12, color: 'var(--accent2)', marginTop: 4 }}>
              Audio will download automatically when you save.
            </p>
          )}
          {!isExisting && form.lyrics && (
            <p style={{ fontSize: 12, color: '#2ecc71', marginTop: 4 }}>
              Lyrics found automatically — check the Lyrics tab.
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
        </div>
      </div>


      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <label>Title *</label>
          <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Song title" />
        </div>
        <div>
          <label>Artist</label>
          <input list="artist-list" value={form.artist} onChange={e => set('artist', e.target.value)} placeholder="Artist name" />
          <datalist id="artist-list">
            {artists.map(a => <option key={a} value={a} />)}
          </datalist>
        </div>
        <div>
          <label>Genre</label>
          <select value={form.genre} onChange={e => set('genre', e.target.value)}>
            {GENRES.map(g => <option key={g} value={g}>{g || '— select —'}</option>)}
          </select>
        </div>
        <div>
          <label>Key</label>
          <select value={form.key} onChange={e => set('key', e.target.value)}>
            {KEYS.map(k => <option key={k} value={k}>{k || '— select —'}</option>)}
          </select>
        </div>
        <div>
          <label>Tuning</label>
          <select value={form.tuning} onChange={e => set('tuning', e.target.value)}>
            {TUNINGS.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label>Capo fret</label>
          <input type="number" min="0" max="12" value={form.capo} onChange={e => set('capo', +e.target.value)} />
        </div>
        <div>
          <label>Tempo (BPM)</label>
          <input type="number" min="0" max="300" value={form.tempo} onChange={e => set('tempo', +e.target.value)} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', marginBottom: 12 }}>
        {[['tabs','Tabs'],['lyrics','Lyrics'],['notes','Notes']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            background: tab === id ? 'var(--surface2)' : 'transparent',
            color: tab === id ? 'var(--text)' : 'var(--text2)',
            borderRadius: '6px 6px 0 0',
            padding: '7px 18px',
            fontWeight: tab === id ? 600 : 400,
            borderBottom: tab === id ? '2px solid var(--accent)' : '2px solid transparent',
          }}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'tabs' && (
        <textarea
          value={form.tabs}
          onChange={e => set('tabs', e.target.value)}
          rows={18}
          placeholder={"e|---|\nB|---|\nG|---|\nD|---|\nA|---|\nE|---|"}
          style={{ fontFamily: 'var(--mono)', fontSize: 13 }}
        />
      )}
      {tab === 'lyrics' && (
        <textarea
          value={form.lyrics}
          onChange={e => set('lyrics', e.target.value)}
          rows={18}
          placeholder="Paste or type lyrics here…"
          style={{ fontFamily: 'inherit', fontSize: 14 }}
        />
      )}
      {tab === 'notes' && (
        <textarea
          value={form.notes}
          onChange={e => set('notes', e.target.value)}
          rows={18}
          placeholder="Chord diagrams, practice notes, tips…"
          style={{ fontFamily: 'inherit', fontSize: 14 }}
        />
      )}
    </div>
  )
}
