/* ============================================================
   Songbook data
   ============================================================ */
const STD = "E A D G B E";

window.SONGS = [
  { t:"1999", a:"Prince", g:"R&B", key:"", capo:1, tune:STD, s:4, fav:false },
  { t:"32 Flavors", a:"Ani DiFranco", g:"Folk", key:"", capo:3, tune:STD, s:2 },
  { t:"7", a:"Prince", g:"R&B", key:"", capo:0, tune:STD, s:0 },
  { t:"Add It Up", a:"Violent Femmes", g:"Alternative", key:"Bm", capo:0, tune:STD, s:1 },
  { t:"Alone Again Or", a:"Love", g:"Psych Rock", key:"Em", capo:0, tune:STD, s:1, fav:true },
  { t:"American Tune", a:"Paul Simon", g:"Folk Rock", key:"C", capo:0, tune:STD, s:7, fav:true },
  { t:"Anything Could Happen", a:"The Clean", g:"Indie Rock", key:"", capo:0, tune:STD, s:0 },
  { t:"Anything Goes", a:"Guns N' Roses", g:"Rock", key:"", capo:0, tune:STD, s:0 },
  { t:"At the Bottom of Everything", a:"Bright Eyes", g:"Folk", key:"C", capo:0, tune:STD, s:3 },
  { t:"Before the Next Teardrop Falls", a:"Freddie Fender", g:"Country", key:"Bb", capo:3, tune:STD, s:5, bpm:91, fav:true },
  { t:"Bit Part", a:"The Lemonheads", g:"Alternative", key:"", capo:0, tune:STD, s:0 },
  { t:"Bizarre Love Triangle", a:"New Order", g:"New Wave", key:"", capo:3, tune:STD, s:5 },
  { t:"Cant Find My Way Home", a:"Blind Faith", g:"Rock", key:"", capo:0, tune:STD, s:2 },
  { t:"Catch the Wind", a:"Donovan", g:"Folk", key:"Eb", capo:3, tune:STD, s:6 },
  { t:"Closer to Fine", a:"Indigo Girls", g:"Folk Rock", key:"A", capo:2, tune:STD, s:9, fav:true },
  { t:"Deeper Than the Holler", a:"Randy Travis", g:"Country", key:"", capo:3, tune:STD, s:2 },
  { t:"Diggin Up Bones", a:"Randy Travis", g:"Country", key:"", capo:0, tune:STD, s:1 },
  { t:"El Paso", a:"Marty Robbins", g:"Country", key:"", capo:2, tune:STD, s:8 },
  { t:"Forever and Ever, Amen", a:"Randy Travis", g:"Country", key:"D", capo:0, tune:STD, s:3 },
  { t:"Friend of the Devil", a:"Grateful Dead", g:"Folk Rock", key:"G", capo:0, tune:STD, s:12, fav:true },
  { t:"Gone Daddy Gone", a:"Violent Femmes", g:"Alternative", key:"D", capo:0, tune:STD, s:0 },
  { t:"Good Feelings", a:"Violent Femmes", g:"Alternative", key:"D", capo:0, tune:STD, s:1 },
  { t:"Goodbye Stranger", a:"Supertramp", g:"Rock", key:"Ab", capo:0, tune:STD, s:4 },
  { t:"He Stopped Loving Her Today", a:"George Jones", g:"Country", key:"", capo:3, tune:STD, s:2 },
];

/* chord fingerings — low E -> high E ; -1 muted, 0 open */
window.CHORD_SHAPES = {
  C:  [-1,3,2,0,1,0],
  G:  [3,2,0,0,0,3],
  D7: [-1,0,0,2,1,2],
  G7: [3,2,0,0,0,1],
  D:  [-1,0,0,2,3,2],
  A:  [-1,0,2,2,2,0],
  A7: [-1,0,2,0,2,0],
};

/* the song opened in the reading view */
window.CURRENT_SONG = {
  t:"Before the Next Teardrop Falls", a:"Freddie Fender",
  g:"Country", key:"Bb", capo:3, tune:STD, bpm:91,
  chords:["C","G","D7","G7","D","A","A7"],
  sections:[
    { name:"Intro", lines:[
      { c:"C        G       D7     G  C    G  D7", w:"" },
    ]},
    { name:"Verse 1", lines:[
      { c:"        G              G7          C              G", w:"If he brings you happiness, then I wish you both the best" },
      { c:"            C            D            G     D7", w:"It's your happiness that matters most of all" },
      { c:"          G                G7           C              G", w:"But if he ever breaks your heart, if the teardrops ever start" },
      { c:"        C          D              G", w:"I'll be there before the next teardrop falls" },
    ]},
    { name:"Chorus", lines:[
      { c:"             C", w:"Si te quiere de verdad" },
      { c:"                            G", w:"Y te da felicidad" },
      { c:"            D7                      G   C  G  D7", w:"Te deseo lo más bueno pa' los dos" },
      { c:"             C", w:"Pero si te hace llorar" },
      { c:"                            G", w:"A mi me puedes hablar" },
      { c:"             D7                  G", w:"Y estaré contigo cuando triste estás" },
    ]},
    { name:"Verse 2", lines:[
      { c:"        G              G7          C              G", w:"I'll be there anytime you need me by your side" },
      { c:"             C          D             G    D7", w:"To drive away every teardrop that you've cried" },
      { c:"          G                  G7         C            G", w:"And if he ever leaves you blue, just remember, I love you" },
      { c:"        C          D              G", w:"And I'll be there before the next teardrop falls" },
    ]},
  ],
};

window.PLAYLIST = {
  name:"Country Practice",
  songs:[
    ["Deeper Than the Holler","Randy Travis","Capo 3","3:42"],
    ["Diggin Up Bones","Randy Travis","Key of G","3:18"],
    ["If I Didn't Have You","Randy Travis","Capo 2","3:05"],
    ["Forever and Ever, Amen","Randy Travis","Key of D","3:27"],
    ["Before the Next Teardrop Falls","Freddie Fender","Capo 3","2:31"],
    ["Wasted Days and Wasted Nights","Freddie Fender","Key of A","2:48"],
    ["You Never Even Call Me by My Name","David Allen Coe","Capo 1","4:31"],
    ["He Stopped Loving Her Today","George Jones","Capo 3","3:35"],
  ]
};

window.PLAYLISTS = ["Country Practice","Open Mic — Friday","Campfire Singalong","Learning Queue"];
