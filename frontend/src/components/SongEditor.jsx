import React, { useState, useEffect, useMemo, useRef } from 'react'
import { parseLyrics, buildSections } from './LyricsView'

const KEYS = ['','C','C#','D','D#','E','F','F#','G','G#','A','A#','B',
               'Cm','C#m','Dm','D#m','Em','Fm','F#m','Gm','G#m','Am','A#m','Bm']
const TUNINGS = ['Standard','Drop D','Open G','Open D','Open E','DADGAD','Half Step Down','Full Step Down']
const GENRES = ['','Rock','Pop','Blues','Country','Folk','Jazz','Classical','Metal','Punk','Alternative','R&B','Soul','Reggae','Other']

const empty = { title:'', artist:'', genre:'', key:'', tuning:'Standard', capo:0, tempo:0, lyrics:'', tabs:'', notes:'', youtube_url:'' }

const DEFAULT_TAB_TEMPLATE =
  'e|--------------------------------------------------|\n' +
  'B|--------------------------------------------------|\n' +
  'G|--------------------------------------------------|\n' +
  'D|--------------------------------------------------|\n' +
  'A|--------------------------------------------------|\n' +
  'E|--------------------------------------------------|'

function EditorLegend() {
  return (
    <div className="editor-legend">
      <div className="legend-row">
        <strong>Chords</strong> — place right before the syllable they apply to: <code>[C]Hello [G]world</code>
      </div>
      <div className="legend-row">
        <strong>Sections</strong> — one bracketed label alone on its own line: <code>[Verse 1]</code>, <code>[Chorus]</code>, <code>[Bridge]</code>, <code>[Intro]</code>, <code>[Outro]</code>, <code>[Pre-Chorus]</code>, <code>[Interlude]</code>, <code>[Hook]</code>, <code>[Tag]</code>, <code>[Coda]</code>, <code>[Solo]</code>, <code>[Refrain]</code>, <code>[Break]</code>
      </div>
      <div className="legend-row">
        <strong>Tabs</strong> — standard 6-line ASCII fretboard, high <code>e</code> to low <code>E</code>, dashes for space, numbers for frets
      </div>
      <div className="legend-row">
        2-column view splits along detected section headers — songs without any will auto-split down the middle instead.
      </div>
    </div>
  )
}

export default function SongEditor({ song, pendingDownload, onSaved, onCancel }) {
  const [form, setForm] = useState({ ...empty, ...(song || {}) })
  const [saving, setSaving] = useState(false)
  const [artists, setArtists] = useState([])
  const tabsRef = useRef(null)

  useEffect(() => {
    fetch('/songs/meta/artists').then(r => r.json()).then(setArtists)
  }, [])
  // Start on lyrics tab when pre-filled from online so user sees what was found
  const [tab, setTab] = useState(song && !song.id && song.lyrics ? 'lyrics' : 'tabs')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const isExisting = !!song?.id

  const sectionCount = useMemo(
    () => buildSections(parseLyrics(form.lyrics || '')).length,
    [form.lyrics]
  )

  const insertTabTemplate = () => {
    const el = tabsRef.current
    const current = form.tabs || ''
    if (!el) { set('tabs', current ? current + '\n\n' + DEFAULT_TAB_TEMPLATE : DEFAULT_TAB_TEMPLATE); return }
    const start = el.selectionStart ?? current.length
    const end = el.selectionEnd ?? current.length
    const needsLeadingBreak = start > 0 && current[start - 1] !== '\n'
    const insert = (needsLeadingBreak ? '\n\n' : '') + DEFAULT_TAB_TEMPLATE
    const next = current.slice(0, start) + insert + current.slice(end)
    set('tabs', next)
    const cursor = start + insert.length
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(cursor, cursor) })
  }

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
    <div style={{ maxWidth: 1500, margin: '0 auto' }}>
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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 0 }}>
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
          <button className="btn-ghost btn-sm" onClick={insertTabTemplate} style={{ marginBottom: 6 }}>
            + Insert neck template
          </button>
        )}
      </div>

      {tab === 'tabs' && (
        <textarea
          ref={tabsRef}
          className="editor-textarea"
          value={form.tabs}
          onChange={e => set('tabs', e.target.value)}
          placeholder={"e|---|\nB|---|\nG|---|\nD|---|\nA|---|\nE|---|"}
          style={{ fontFamily: 'var(--mono)', fontSize: 13 }}
        />
      )}
      {tab === 'lyrics' && (
        <>
          <textarea
            className="editor-textarea"
            value={form.lyrics}
            onChange={e => set('lyrics', e.target.value)}
            placeholder="Paste or type lyrics here…"
            style={{ fontFamily: 'inherit', fontSize: 14 }}
          />
          <div className={`editor-hint ${sectionCount <= 1 ? 'warn' : ''}`}>
            {form.lyrics.trim() === ''
              ? 'No lyrics yet.'
              : sectionCount <= 1
                ? 'No section headers detected — 2-column view will auto-split this song down the middle instead.'
                : `${sectionCount} section${sectionCount === 1 ? '' : 's'} detected — 2-column view will split along them.`}
          </div>
        </>
      )}
      {tab === 'notes' && (
        <textarea
          className="editor-textarea"
          value={form.notes}
          onChange={e => set('notes', e.target.value)}
          placeholder="Chord diagrams, practice notes, tips…"
          style={{ fontFamily: 'inherit', fontSize: 14 }}
        />
      )}

      <EditorLegend />
    </div>
  )
}
