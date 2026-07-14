/* ============================================================
   Guitar Songbook — app logic
   ============================================================ */
(function(){
  const $ = (s,r=document)=>r.querySelector(s);
  const $$ = (s,r=document)=>[...r.querySelectorAll(s)];
  const STD = "E A D G B E";

  /* ---------- icons ---------- */
  const I = {
    search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/></svg>',
    play:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 5.5v13a1 1 0 0 0 1.5.87l11-6.5a1 1 0 0 0 0-1.74l-11-6.5A1 1 0 0 0 7 5.5Z"/></svg>',
    plus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    edit:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
    x:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    grip:'<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.6"/><circle cx="15" cy="6" r="1.6"/><circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/><circle cx="9" cy="18" r="1.6"/><circle cx="15" cy="18" r="1.6"/></svg>',
    heart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20s-7-4.3-9.3-8.4C1 8.5 2.4 5 5.8 5 8 5 9.4 6.6 12 9c2.6-2.4 4-4 6.2-4 3.4 0 4.8 3.5 3.1 6.6C19 15.7 12 20 12 20Z"/></svg>',
    heartFill:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 20s-7-4.3-9.3-8.4C1 8.5 2.4 5 5.8 5 8 5 9.4 6.6 12 9c2.6-2.4 4-4 6.2-4 3.4 0 4.8 3.5 3.1 6.6C19 15.7 12 20 12 20Z"/></svg>',
    grid:'<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/></svg>',
    list:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/></svg>',
    yt:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 7.5a3 3 0 0 0-2.1-2.1C18 5 12 5 12 5s-6 0-7.9.4A3 3 0 0 0 2 7.5 31 31 0 0 0 1.7 12 31 31 0 0 0 2 16.5a3 3 0 0 0 2.1 2.1C6 19 12 19 12 19s6 0 7.9-.4a3 3 0 0 0 2.1-2.1A31 31 0 0 0 22.3 12 31 31 0 0 0 22 7.5ZM10 15V9l5.2 3Z"/></svg>',
    pdf:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z"/><path d="M14 3v5h5"/></svg>',
    back:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
    sun:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    moon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M21 12.8A8.5 8.5 0 1 1 11.2 3 6.6 6.6 0 0 0 21 12.8Z"/></svg>',
    pause:'<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>',
    shuffle:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg>',
    metro:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M8 21h8l-2.2-16h-3.6L8 21Z"/><path d="M6 17h12"/><path d="m12 13 4-7"/></svg>',
  };

  /* ---------- chord diagram SVG ---------- */
  function chordSVG(name){
    const sh = window.CHORD_SHAPES[name] || [-1,-1,-1,-1,-1,-1];
    const W=66, padL=9, padR=9, top=20, gw=W-padL-padR, fH=15, frets=4, gh=fH*frets;
    const sx = i => padL + i*(gw/5);
    let s = `<svg viewBox="0 0 ${W} ${top+gh+6}" aria-label="${name} chord">`;
    // nut
    s += `<rect x="${padL}" y="${top}" width="${gw}" height="3" rx="1" fill="currentColor" opacity=".85"/>`;
    // frets
    for(let f=1; f<=frets; f++){ const y=top+f*fH; s+=`<line x1="${padL}" y1="${y}" x2="${padL+gw}" y2="${y}" stroke="currentColor" stroke-width="1" opacity=".22"/>`; }
    // strings
    for(let i=0;i<6;i++){ s+=`<line x1="${sx(i)}" y1="${top}" x2="${sx(i)}" y2="${top+gh}" stroke="currentColor" stroke-width="1" opacity=".22"/>`; }
    // markers + dots
    sh.forEach((fr,i)=>{
      const x=sx(i);
      if(fr===-1){ s+=`<path d="M${x-3} ${top-11} l6 6 M${x+3} ${top-11} l-6 6" stroke="currentColor" stroke-width="1.4" opacity=".5" stroke-linecap="round"/>`; }
      else if(fr===0){ s+=`<circle cx="${x}" cy="${top-7}" r="3.1" fill="none" stroke="currentColor" stroke-width="1.4" opacity=".5"/>`; }
      else { const y=top+(fr-0.5)*fH; s+=`<circle cx="${x}" cy="${y}" r="4.4" fill="var(--coral)"/>`; }
    });
    s+=`</svg>`;
    return s;
  }

  /* ---------- meta chips ---------- */
  function metaChips(song, withTune){
    let h='';
    if(song.g) h+=`<span class="chip">${song.g}</span>`;
    if(song.key) h+=`<span class="chip key">${song.key}</span>`;
    if(song.capo) h+=`<span class="chip">Capo ${song.capo}</span>`;
    if(withTune && song.tune && song.tune!==STD) h+=`<span class="chip mono">${song.tune}</span>`;
    return h;
  }

  /* ---------- LIBRARY: grid ---------- */
  function renderGrid(list){
    const grid = $('#songgrid');
    grid.innerHTML = list.map((song,idx)=>`
      <div class="card" data-i="${window.SONGS.indexOf(song)}">
        <div class="card-top">
          <div>
            <div class="card-title">${song.t}</div>
            <div class="card-artist">${song.a}</div>
          </div>
          <button class="fav ${song.fav?'on':''}" data-fav title="Favorite">${song.fav?I.heartFill:I.heart}</button>
        </div>
        <div class="card-meta">${metaChips(song,true)}</div>
        <div class="card-foot">
          <span class="sessions">${song.s} session${song.s===1?'':'s'}</span>
          <div class="card-acts">
            <button class="mini" data-add title="Add to playlist">${I.plus}</button>
            <button class="mini play" data-play title="Play">${I.play}</button>
            <button class="mini" data-edit title="Edit">${I.edit}</button>
          </div>
        </div>
      </div>`).join('');
    $('#songcount').textContent = `${list.length} songs`;
  }

  /* ---------- RIGHT RAIL ---------- */
  function renderRail(){
    const opts = window.PLAYLISTS.map(p=>`<option>${p}</option>`).join('');
    const items = window.PLAYLIST.songs.map((p,i)=>`
      <div class="pl-item">
        <span class="grip">${I.grip}</span>
        <div class="info"><b>${p[0]}</b><span>${p[1]}</span></div>
        <div class="row-acts">
          <button data-play title="Play">${I.play}</button>
          <button data-rm title="Remove">${I.x}</button>
        </div>
      </div>`).join('');
    $('#rail').innerHTML = `
      <div class="panel">
        <div class="sec-label">Metronome</div>
        <div class="metro">
          <div class="metro-top">
            <div class="bpm"><b id="bpmval">100</b><span>bpm</span></div>
            <button class="startbtn" id="startbtn">${I.play}</button>
          </div>
          <div class="slider" id="tempo"><div class="fill"></div><div class="knob"></div></div>
          <div class="presets" id="presets">
            ${[60,80,100,120,140].map(b=>`<button data-bpm="${b}" class="${b===100?'on':''}">${b}</button>`).join('')}
          </div>
          <div class="beat-dots" id="beatdots">${[0,1,2,3].map(()=>'<i></i>').join('')}</div>
        </div>
      </div>
      <div class="panel">
        <div class="panel-head"><div class="sec-label">Playlists</div><button class="iconbtn" style="width:30px;height:30px" title="New playlist">${I.plus}</button></div>
        <div class="pl-select"><select class="selectbox">${opts}</select></div>
        <div class="pl-list">${items}</div>
        <button class="btn primary" id="runset" style="margin-top:6px">${I.play} Run setlist</button>
      </div>`;
    wireMetro();
    $('#runset').addEventListener('click', ()=>route('setlist'));
    $('#rail').addEventListener('click', e=>{ if(e.target.closest('[data-rm]')) e.target.closest('.pl-item').remove(); });
  }

  /* ---------- metronome behavior (visual) ---------- */
  let metroTimer=null, beat=0, bpm=100;
  function wireMetro(){
    $('#presets').addEventListener('click', e=>{
      const b=e.target.closest('[data-bpm]'); if(!b) return;
      bpm = +b.dataset.bpm;
      $('#bpmval').textContent = bpm;
      $$('#presets button').forEach(x=>x.classList.toggle('on', x===b));
      const pct = Math.max(4, Math.min(96, ((bpm-40)/(200-40))*100));
      $('.slider .fill').style.width = pct+'%'; $('.slider .knob').style.left = pct+'%';
      if(metroTimer) startMetro(true);
    });
    $('#startbtn').addEventListener('click', ()=> startMetro());
  }
  function startMetro(restart){
    const btn=$('#startbtn');
    if(metroTimer && !restart){ clearInterval(metroTimer); metroTimer=null; btn.classList.remove('on'); btn.innerHTML=I.play; $$('#beatdots i').forEach(d=>d.classList.remove('lit')); return; }
    if(metroTimer) clearInterval(metroTimer);
    btn.classList.add('on'); btn.innerHTML=I.pause; beat=0;
    const tick=()=>{ const dots=$$('#beatdots i'); dots.forEach((d,i)=>d.classList.toggle('lit', i===beat%4)); beat++; };
    tick(); metroTimer=setInterval(tick, 60000/bpm);
  }

  /* ---------- SONG (reading) VIEW ---------- */
  let transpose=0;
  const NOTES=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
  function transposeChordToken(tok, steps){
    return tok.replace(/[A-G]#?b?/g, m=>{
      let root=m[0], rest=m.slice(1), acc=0;
      if(rest[0]==='#'){acc=1; rest=rest.slice(1);} else if(rest[0]==='b'){acc=-1; rest=rest.slice(1);}
      let idx=NOTES.indexOf(root); if(idx<0) return m;
      idx=(idx+acc+steps+120)%12;
      return NOTES[idx]+rest;
    });
  }
  function renderSong(){
    const sg = window.CURRENT_SONG;
    $('#song-meta').innerHTML =
      `<span class="chip">${sg.g}</span>`+
      `<span class="chip key">Key of ${sg.key}</span>`+
      `<span class="chip mono">${sg.tune}</span>`+
      `<span class="chip">Capo ${sg.capo}</span>`+
      `<span class="chip mono">${sg.bpm} bpm</span>`;
    $('#song-title').textContent = sg.t;
    $('#song-artist').textContent = sg.a;
    $('#chordgrid').innerHTML = sg.chords.map(c=>`<div class="chord"><span class="cname">${transposeChordToken(c,transpose)}</span>${chordSVG(c)}</div>`).join('');
    renderLyrics();
    $('#song-bpm').textContent = sg.bpm;
  }
  function renderLyrics(){
    const sg = window.CURRENT_SONG;
    $('#lyrics').innerHTML = sg.sections.map(sec=>`
      <div class="section">
        <div class="section-name">${sec.name}</div>
        ${sec.lines.map(l=>`<div class="lyric-line">
          ${l.c?`<div class="chord-row">${transpose? transposeChordToken(l.c,transpose): l.c}</div>`:''}
          ${l.w?`<div class="word-row">${l.w}</div>`:''}
        </div>`).join('')}
      </div>`).join('');
  }

  /* ---------- SETLIST VIEW ---------- */
  function renderSetlist(){
    const pl = window.PLAYLIST;
    $('#set-title').textContent = pl.name;
    $('#set-sub').textContent = `${pl.songs.length} songs · about 27 min`;
    const first = pl.songs[0];
    $('#now-title').textContent = first[0];
    $('#now-meta').textContent = `${first[1]} · ${first[2]}`;
    $('#set-list').innerHTML = pl.songs.map((p,i)=>`
      <div class="set-row">
        <span class="grip">${I.grip}</span>
        <span class="idx">${String(i+1).padStart(2,'0')}</span>
        <div class="s-info"><b>${p[0]}</b><span>${p[1]} · ${p[2]}</span></div>
        <span class="chip">${p[2]}</span>
        <button class="row-acts" style="opacity:1"><span style="display:inline-grid;place-items:center;width:26px;height:26px">${I.x}</span></button>
      </div>`).join('');
  }

  /* ---------- ROUTING ---------- */
  function route(name){
    $$('.view').forEach(v=>v.classList.toggle('active', v.id==='view-'+name));
    $$('.topnav a').forEach(a=>a.classList.toggle('active', a.dataset.route===name || (name==='song'&&a.dataset.route==='library')));
    window.scrollTo(0,0);
    if(name==='song') renderSong();
    if(name==='setlist') renderSetlist();
  }
  window.__route = route;

  /* ---------- THEME ---------- */
  function setTheme(t){
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('gsb-theme', t);
    $('#themebtn').innerHTML = t==='dark' ? I.sun : I.moon;
  }

  /* ---------- INIT ---------- */
  function init(){
    // icons in static chrome
    $('#nav-search-ic').innerHTML = I.search;
    $('#themebtn').addEventListener('click', ()=> setTheme(document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark'));
    setTheme(localStorage.getItem('gsb-theme')||'dark');

    renderGrid(window.SONGS);
    renderRail();

    // grid interactions
    $('#songgrid').addEventListener('click', e=>{
      if(e.target.closest('[data-fav]')){ const b=e.target.closest('[data-fav]'); b.classList.toggle('on'); b.innerHTML=b.classList.contains('on')?I.heartFill:I.heart; e.stopPropagation(); return; }
      if(e.target.closest('[data-add]')||e.target.closest('[data-edit]')){ e.stopPropagation(); return; }
      const card=e.target.closest('.card'); if(card) route('song');
    });

    // search filter
    $('#searchinput').addEventListener('input', e=>{
      const q=e.target.value.toLowerCase().trim();
      const f = q? window.SONGS.filter(s=> (s.t+' '+s.a).toLowerCase().includes(q)) : window.SONGS;
      renderGrid(f);
    });

    // view toggle
    $$('#viewtoggle button').forEach(b=>b.addEventListener('click',()=>{
      $$('#viewtoggle button').forEach(x=>x.classList.toggle('on',x===b));
      $('#songgrid').classList.toggle('list', b.dataset.view==='list');
    }));

    // nav
    $$('.topnav a').forEach(a=>a.addEventListener('click', e=>{ if(a.dataset.route){ e.preventDefault(); route(a.dataset.route); } }));
    // back + setlist controls
    $('#backlink').addEventListener('click',()=>route('library'));
    $('#set-back').addEventListener('click',()=>route('library'));

    // song tabs
    $$('#song-tabs button').forEach(b=>b.addEventListener('click',()=>{ $$('#song-tabs button').forEach(x=>x.classList.toggle('on',x===b)); }));
    // transpose
    $('#tr-down').addEventListener('click',()=>{ transpose=Math.max(-11,transpose-1); $('#tr-val').textContent=(transpose>0?'+':'')+transpose; renderSong(); });
    $('#tr-up').addEventListener('click',()=>{ transpose=Math.min(11,transpose+1); $('#tr-val').textContent=(transpose>0?'+':'')+transpose; renderSong(); });
    // columns
    $$('#colseg button').forEach(b=>b.addEventListener('click',()=>{ $$('#colseg button').forEach(x=>x.classList.toggle('on',x===b)); $('#lyrics').classList.toggle('col2', b.dataset.col==='2'); }));

    route('library');
  }
  document.addEventListener('DOMContentLoaded', init);
})();
