# Handoff: Guitar Songbook — Visual Revamp

## Overview
This package documents a visual + UX revamp of the **Guitar Songbook** app (repo: `WFLabs/GuitarSongBook`). It refreshes the song **Library**, adds a focused **Setlist mode** for running playlists, and polishes the **Song reading view** (chords-over-lyrics with transpose and chord diagrams). It introduces a cohesive design system with a **dark + light theme**.

The goal of this work is to take the existing app's functionality and make it look and feel more polished and intentional — not to add new features. Most behavior already exists in the current app; this is primarily a re-skin plus two layout/flow improvements (setlist mode, refined song page).

## About the Design Files
The files in `reference/` are **design references created in HTML/CSS/JS** — a working prototype that demonstrates the intended look, layout, and interactions. **They are not meant to be copied into the repo verbatim.** The task is to **recreate these designs within the Guitar Songbook codebase using its existing stack and patterns.**

> ⚠️ **Stack unknown at time of writing.** Inspect the target repo first and adapt accordingly:
> - If it's a **server-rendered / static HTML + vanilla JS** app, the reference files can be adapted fairly directly (port the CSS wholesale, re-template the markup, rewire JS to real data).
> - If it's a **framework app** (React/Vue/Svelte/etc.), translate the markup into components and the interactions into the framework's state model. Keep `songbook.css`'s tokens and component classes — they're framework-agnostic.
> - Reuse the repo's existing data layer, routing, and persistence. The prototype's data (`songbook-data.js`) is **sample data only** — wire the real song/playlist source in its place.

## Fidelity
**High-fidelity.** Final colors, typography, spacing, radii, shadows, and interactions are all specified below and embodied in `reference/songbook.css`. Recreate the UI to match. The one caveat: in some flat-rasterizer screenshots the display font falls back and titles appear to wrap — in a real browser with the linked Google Fonts loaded, titles render on one line as designed.

---

## Screens / Views
The prototype is a single page with three client-side "views" toggled by a router (`route(name)` in `songbook.js`): `library`, `song`, `setlist`. Plus a persistent top bar. Map these to the repo's real routing.

### Top Bar (persistent)
- **Layout:** sticky, full-width, 62px tall, `backdrop-filter: blur(14px)` over a translucent bg. Flex row, 22px horizontal padding, 18px gap.
- **Left:** brand lockup — a 34×34 rounded logo tile (`border-radius: 9px 9px 9px 3px`, coral gradient, rotated −8°, white guitar-headstock SVG inside rotated back +8°), then a two-line block: wordmark "Guitar Songbook" (display font, 18px/700) and a mono caption "142 SONGS" (10px, uppercase, letter-spacing .14em, `--text-3`).
- **Nav:** "Library / Tuner / Terminal" — text links, 14px/500, 8×13px padding, 9px radius. Active item gets `--surface-2` bg + inset hairline ring. Hover: `--chip-bg` bg.
- **Right:** a 36×36 icon button toggling theme (sun in dark mode, moon in light), then a primary "+ New Song" button.

### 1. Library View (`#view-library`)
- **Purpose:** browse/search the whole songbook and pick a song; manage the metronome and active playlist from a side rail.
- **Layout:** CSS grid, two columns: `minmax(0,1fr)` main + `332px` rail. Below 1100px the rail is hidden and it collapses to one column.
  - **Main** (`.lib-main`): 22px/26px padding.
    - **Toolbar:** flex row, 12px gap, wraps. A search input (flex-grow, 42px tall, 11px radius, leading magnifier icon at 13px left; focus = coral border + 3px `--coral-soft` ring) followed by three 42px select boxes ("All artists / genres / keys").
    - **Toolbar-foot:** space-between row — left: song count in mono/uppercase tiny label; right: "Sort A–Z" tiny label + a grid/list **view toggle** (segmented control: `--surface-2` track, active button gets `--surface` bg + shadow).
    - **Song grid** (`.songgrid`): `repeat(auto-fill, minmax(248px, 1fr))`, 14px gap. List mode = single column, 8px gap, rows become horizontal flex.
  - **Rail** (`.rail`): sticky, full viewport height, scrolls independently, left hairline border, contains the Metronome panel and Playlist panel (see Components).

#### Song Card (`.card`)
- 15/16/13px padding, `--surface` bg, 1px `--line` border, 16px radius (`--r-lg`).
- A 3px coral bar on the left edge, hidden (opacity 0) until hover.
- **Hover:** `translateY(-2px)`, border brightens to `--line-strong`, `--shadow-lift`, left bar fades in, action buttons go from 0.55 → 1 opacity.
- **Top row:** title (display font, 16.5px/600, line-height 1.15, letter-spacing −.01em) + artist (13px, `--text-2`) on the left; a heart **favorite** toggle on the right (`--text-3`, becomes coral + filled when on).
- **Meta row:** chips, 12px gap-6. Genre chip (neutral), **key chip** (coral-soft bg, coral text, mono — e.g. "Bb"), capo chip ("Capo 3"). **Tuning chip only shows when tuning ≠ standard `E A D G B E`** — this is an intentional noise-reduction decision; standard tuning is never shown.
- **Foot row:** top hairline border, 11px padding-top. Left: "N sessions" in mono 11px `--text-3`. Right: three 30×30 mini action buttons — add-to-playlist (+), **play** (hover fills coral), edit (pencil).
- **Click anywhere on the card** (except the action buttons / favorite) navigates to the Song view.

### 2. Song Reading View (`#view-song`)
- **Purpose:** read chords + lyrics while playing; transpose, switch columns, reference chord shapes, run metronome.
- **Layout:** grid, `minmax(0,1fr)` main + `340px` rail; rail hidden below 1100px.
  - **Back link:** "‹ Library" — `--text-3`, 13px/600, chevron icon.
  - **Song head:** space-between, wraps. Left: title (display, 33px/700, line-height 1.04, letter-spacing −.02em), artist (17px `--text-2`), then a meta chip row (Genre / "Key of Bb" / tuning mono / "Capo 3" / "91 bpm"). Right: action buttons — primary **Play**, **YouTube**, **PDF**, ghost **Edit**.
  - **Tabs** (`.tabs`): "Tabs / Lyrics / Notes / Practice", bottom-border track, active tab = `--text` color + 2.5px coral underline inset 12px. (Lyrics active by default.)
  - **Song toolbar:** space-between. Left: "Transpose" tiny label + a **stepper** (− / value / +; value in mono). Right: a 1col/2col **segmented** toggle + a ghost "Auto-scroll" button.
  - **Lyrics** (`.lyrics`): mono font. Two-column by default (`column-count: 2; column-gap: 54px`), collapses to one column under 760px or via the toggle.
    - **Section** (`.section`, `break-inside: avoid`): a section name (display, 14px/600, **coral text**, uppercase, letter-spacing .08em — e.g. "Verse 1") followed by lyric lines.
    - **Lyric line:** a **chord row** (`--chord` amber, 14px/700, `white-space: pre` to preserve column alignment) above a **word row** (`--text`, 15px, `white-space: pre-wrap`). Chord-only lines (intro turnarounds) omit the word row.
  - **Rail** (`.song-rail`): "Chords used" panel — a 3-column grid of chord diagrams (see Chord Diagram component) + a tiny note listing sections with no diagram; then a compact Metronome panel showing the song bpm.

### 3. Setlist View (`#view-setlist`)
- **Purpose:** a focused mode for running a playlist live — see now/next, control tempo, reorder.
- **Layout:** centered single column, `max-width: 920px`, 26px padding. Reached via the rail's "Run setlist" button or could be its own route.
  - **Back link** "‹ Library".
  - **Set head:** space-between, wraps. Left: set title (display, 30px/700) + subtitle ("8 songs · about 27 min"). Right: ghost **Shuffle** + primary **Start set**.
  - **Now card** (`.now-card`): gradient surface, 1px border, 22px radius (`--r-xl`), 24px padding, soft coral radial glow in the top-right corner (`::after`). Contains a mono "NOW · UP NEXT" tag (coral text), the current song title (display 30px) + meta, an inline bpm readout + circular start button, and a tempo slider.
  - **Set list** (`.set-list`): vertical stack, 8px gap. Each **row** (`.set-row`): drag grip, two-digit index (mono `--text-3`), song title (display 15.5px/600) + "artist · capo/key" subtitle, a duration chip, and a remove (✕) button. Hover brightens the border.

---

## Interactions & Behavior
- **Routing:** `route(name)` toggles `.view.active` and syncs `.topnav` active state; scrolls to top. View entrance: `fade` keyframe (opacity 0→1, translateY 6px→0, .28s).
- **Search:** live `input` filter on title + artist (case-insensitive substring); re-renders grid and updates count.
- **Grid / List toggle:** adds/removes `.list` on the grid container.
- **Favorite:** toggles `.on` and swaps outline/filled heart icon; stops propagation so it doesn't navigate.
- **Card click → Song view.** Action buttons (add/edit) stop propagation.
- **Metronome (visual model in prototype):**
  - Start/stop toggles a `setInterval` at `60000 / bpm` ms; button swaps play/pause icon and an `.on` style.
  - A 4-dot beat indicator lights the current beat (`.lit` = coral, scaled 1.25).
  - Preset buttons (60/80/100/120/140) set bpm, update the readout, move the slider fill/knob, and restart the timer if running.
  - **In production:** replace the visual-only ticker with real audio (Web Audio API click, or the repo's existing metronome if it has one). The slider should become a real draggable input bound to bpm (40–200 range used for fill math).
- **Transpose:** `tr-down`/`tr-up` change a `transpose` integer (−11…+11). Every chord token is re-pitched via `transposeChordToken()` — a regex over `[A-G]#?b?` that shifts each root by N semitones through a 12-note sharp scale, preserving suffixes (7, m, sus, etc.) and chord-row spacing. Re-renders chord diagrams' names and the lyric chord rows. **Note:** the diagram *shapes* in the prototype are static; in production, either compute transposed shapes or (simpler, common for capo-based players) keep shapes and only relabel — confirm desired behavior.
- **Column toggle:** adds/removes `.col2` on `.lyrics`.
- **Tabs:** switch active class only (Tabs/Notes/Practice panels are not built in the prototype — wire to real content).
- **Theme toggle:** sets `data-theme` on `<html>`, persists to `localStorage['gsb-theme']`, swaps sun/moon icon. Read the stored value on load (default dark).
- **Responsive:** rails hidden < 1100px; lyrics force single column < 760px. The grid is already fluid via `auto-fill`. Mobile nav/rail behavior (drawer, bottom sheet for tools) is **not** designed yet — flag if mobile is in scope.

## State Management
State needed (names from prototype; adapt to framework):
- `currentView` — `'library' | 'song' | 'setlist'`.
- `searchQuery` → filtered song list.
- `gridMode` — `'grid' | 'list'`.
- `theme` — `'dark' | 'light'` (persisted).
- `currentSong` — the song open in the reading view.
- `transpose` — integer semitone offset for the current song.
- `lyricColumns` — `1 | 2`.
- `bpm` + `metroRunning` + `currentBeat` — metronome.
- `activePlaylist` + its ordered songs (and drag-reorder state).
- `favorites` — per-song boolean (should persist to the real data store).
- **Data fetching:** none in prototype. In production, load songs and playlists from the repo's existing source; the sample arrays in `songbook-data.js` show the shape expected by the render functions.

## Design Tokens
All defined as CSS custom properties in `reference/songbook.css` (`:root`/`[data-theme="dark"]` and `[data-theme="light"]`). Key values:

**Brand (theme-independent)**
- Coral primary `--coral: #f0635c`; strong `--coral-strong: #e8463f`
- Amber chord accent `--amber: #e9a23b`

**Dark theme**
- bg `#0f1218` (with two radial gradient washes `#141925` / `#0d1016`)
- surfaces `--surface #171c25`, `--surface-2 #1d232f`, `--surface-3 #232b39`
- text `--text #eef1f6`, `--text-2 #aab2c0`, `--text-3 #727c8c`
- lines `--line rgba(255,255,255,.09)`, `--line-strong rgba(255,255,255,.16)`
- chord text `--chord #f0b257`; key chip `--coral-soft rgba(240,99,92,.16)`, `--coral-text #ff8079`

**Light theme**
- bg `#f4f1ea` (warm paper; gradient washes `#f7f5ef` / `#efe9dd`)
- surfaces `--surface #ffffff`, `--surface-2 #faf8f3`, `--surface-3 #f1ede3`
- text `--text #211d16`, `--text-2 #5f594d`, `--text-3 #938b7a`
- lines `--line rgba(40,34,24,.12)`, `--line-strong rgba(40,34,24,.22)`
- chord text `--chord #c0791b`; `--coral-text #d8483f`, `--coral-soft rgba(240,99,92,.12)`

**Radii:** `--r-sm 8px`, `--r-md 12px`, `--r-lg 16px`, `--r-xl 22px`. Note the logo tile's intentional asymmetric radius `9px 9px 9px 3px`.

**Shadows:** `--shadow` (subtle 2-layer) and `--shadow-lift` (hover/raised). Values differ per theme — see CSS.

**Motion:** `--ease: cubic-bezier(.22,.61,.36,1)`; most transitions .14–.16s; view fade .28s.

**Typography (Google Fonts):**
- Display — **Bricolage Grotesque** (opsz 12–96; weights 500/600/700): wordmark, card/song/section/set titles.
- UI — **Hanken Grotesk** (400/500/600/700): body, nav, buttons, chips, labels.
- Mono — **Spline Sans Mono** (400/500/600/700): lyrics + chord rows, keys/tuning chips, tiny uppercase labels, bpm/indices.
- Scale highlights: song title 33px/700, set/now title 30px, card title 16.5px, body 15px, lyric words 15px (mono), chord rows 14px/700, tiny labels 11px uppercase letter-spacing .1em.

## Assets
- **No external image assets.** All icons are inline SVG (defined in the `I` map in `songbook.js` and inline in the HTML) — search, play/pause, plus, edit, x, grip, heart (outline + filled), grid, list, YouTube, PDF, back chevron, sun, moon, shuffle, metronome. Reuse the repo's existing icon set if it has one; otherwise these are clean 24×24 stroke/fill icons you can keep.
- **Logo** is a CSS tile + inline guitar-headstock SVG (no raster asset).
- **Fonts** load from Google Fonts via `<link>` in the HTML head — self-host or keep the CDN link per repo convention.
- **Chord diagrams** are generated programmatically by `chordSVG(name)` from a fingering map (`CHORD_SHAPES`, low-E→high-E, `-1`=muted, `0`=open). Port this generator — it's resolution-independent and themable (dots use `var(--coral)`).

## Files (in `reference/`)
- `Guitar Songbook.html` — markup, view structure, static chrome, font links.
- `songbook.css` — the complete design system: tokens, both themes, and every component style. **This is the primary source of truth for visual values.**
- `songbook.js` — render functions, the chord-diagram SVG generator, transpose logic, routing, theme persistence, metronome, and all interaction wiring.
- `songbook-data.js` — **sample data only** (song list, chord fingerings, one fully-charted song, a sample playlist). Replace with the repo's real data; keep the object shapes the render functions expect.

## Implementation Notes / Open Questions for the Developer
1. **Confirm the repo's stack** before choosing port strategy (direct adaptation vs. component translation).
2. **Transpose + chord diagrams:** decide whether transposing should recompute diagram shapes or only relabel chord names.
3. **Metronome:** wire to real audio; reuse the existing metronome if the current app already has one.
4. **Tabs/Notes/Practice** panels and the **Tuner/Terminal** routes are not built in the prototype — keep the existing app's implementations, just restyled.
5. **Drag-to-reorder** (playlist + setlist) is visual-only here — use the repo's existing reorder logic or a library.
6. **Mobile** layout is not yet designed — flag if in scope before building.
7. Persist **favorites** and **theme** to the real data store / settings.
