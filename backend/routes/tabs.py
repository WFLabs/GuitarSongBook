from fastapi import APIRouter
import urllib.request
import urllib.parse
import http.cookiejar
import json
import re
import html as html_lib

router = APIRouter(prefix="/tabs", tags=["tabs"])

UG_BASE   = "https://www.ultimate-guitar.com"
UG_SEARCH = f"{UG_BASE}/search.php"

# Persistent session: fetching the UG homepage primes the cookie jar so
# individual tab pages (which return 403 without a session) succeed.
_cj = http.cookiejar.CookieJar()
_opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(_cj))
_opener.addheaders = [
    ("User-Agent",
     "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
     "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"),
    ("Accept",
     "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"),
    ("Accept-Language", "en-US,en;q=0.9"),
    ("Accept-Encoding", "identity"),
    ("DNT", "1"),
]

_cookies_primed = False


def _prime_cookies():
    """Hit the UG homepage once to get session cookies needed for tab pages."""
    global _cookies_primed
    if _cookies_primed:
        return
    try:
        with _opener.open(UG_BASE, timeout=10) as r:
            r.read()
        _cookies_primed = True
    except Exception:
        pass


def _fetch_ug(url: str) -> dict:
    _prime_cookies()
    with _opener.open(url, timeout=15) as r:
        page = r.read().decode("utf-8", errors="replace")
    m = re.search(r'class="js-store"[^>]+data-content="([^"]+)"', page)
    if not m:
        raise ValueError("js-store block not found — UG may have changed its markup.")
    return json.loads(html_lib.unescape(m.group(1)))


@router.get("/search")
def search_tabs(q: str):
    params = urllib.parse.urlencode([("search_type", "title"), ("value", q)])
    try:
        store = _fetch_ug(f"{UG_SEARCH}?{params}")
        results = (
            store.get("store", {})
                 .get("page", {})
                 .get("data", {})
                 .get("results", [])
        )
        out = []
        for t in results:
            if t.get("type") not in ("Chords", "Tabs", "Bass Tabs"):
                continue
            if not t.get("tab_url"):
                continue
            out.append({
                "tab_id":      t.get("id") or t.get("tab_id"),
                "song_name":   t.get("song_name", ""),
                "artist_name": t.get("artist_name", ""),
                "type":        t.get("type", ""),
                "version":     t.get("version", 1),
                "rating":      round(float(t.get("rating") or 0), 1),
                "votes":       t.get("votes", 0),
                "tab_url":     t.get("tab_url", ""),
            })
        return out
    except Exception as e:
        return {"error": str(e)}


@router.get("/content")
def get_tab_content(tab_url: str):
    try:
        store    = _fetch_ug(tab_url)
        if not isinstance(store, dict):
            raise ValueError(f"Unexpected js-store type: {type(store).__name__}")
        pd       = store.get("store", {}).get("page", {}).get("data", {})
        tab_info = pd.get("tab", {}) if isinstance(pd, dict) else {}
        tab_view = pd.get("tab_view", {}) if isinstance(pd, dict) else {}
        meta_raw = tab_view.get("meta", {}) if isinstance(tab_view, dict) else {}
        meta     = meta_raw if isinstance(meta_raw, dict) else {}
        wiki_tab = tab_view.get("wiki_tab", {}) if isinstance(tab_view, dict) else {}
        raw      = wiki_tab.get("content", "") if isinstance(wiki_tab, dict) else ""

        tabs_text, lyrics_text = _parse_ug_content(raw, tab_info.get("type", ""))

        tuning_raw = meta.get("tuning", {})
        tuning = (
            tuning_raw.get("label") or tuning_raw.get("value") or "Standard"
        ) if isinstance(tuning_raw, dict) else (str(tuning_raw) or "Standard")

        return {
            "title":       tab_info.get("song_name", ""),
            "artist":      tab_info.get("artist_name", ""),
            "type":        tab_info.get("type", ""),
            "tabs":        tabs_text,
            "lyrics":      lyrics_text,
            "key":         meta.get("tonality", ""),
            "capo":        int(meta.get("capo") or 0),
            "tuning":      tuning,
            "tempo":       int(meta.get("tempo") or 0),
            "notes":       f"Source: Ultimate Guitar\n{tab_url}",
            "youtube_url": "",
        }
    except Exception as e:
        return {"error": str(e)}


def _parse_ug_content(content: str, tab_type: str = ""):
    """
    For Tabs type: [tab]...[/tab] → tabs field; rest → lyrics.
    For Chords type: chord fingering chart (before first section header) → tabs;
                     sections like [Verse]/[Chorus] with inline chords → lyrics.
    """
    # ── Tabs type ──
    if tab_type == "Tabs":
        blocks = re.findall(r'\[tab\](.*?)\[/tab\]', content, re.DOTALL)
        tabs = "\n\n".join(b.strip() for b in blocks)
        rest = re.sub(r'\[tab\].*?\[/tab\]', '', content, flags=re.DOTALL)
        rest = re.sub(r'\[ch\]([^\[]+)\[/ch\]', r'[\1]', rest)
        return _clean(tabs), _clean(rest)

    # ── Chords type (or anything without real tab notation) ──
    # For Chords tabs, UG also wraps chord+lyric lines in [tab]...[/tab] — strip
    # those markers but keep the content (they are NOT guitar notation here).
    content_clean = re.sub(r'\[tab\](.*?)\[/tab\]', r'\1', content, flags=re.DOTALL)

    # Split at the first structural section marker ([Intro], [Verse 1], etc.)
    sec = re.search(r'\n\s*\[(Intro|Verse|Chorus|Bridge|Outro|Pre-Chorus|Hook)',
                    content_clean, re.IGNORECASE)
    if sec:
        chart_raw  = content_clean[:sec.start()]
        lyrics_raw = content_clean[sec.start():]
    else:
        chart_raw  = ""
        lyrics_raw = content_clean

    # Chart: strip [ch] wrappers, keep chord names and fingering strings
    chart = re.sub(r'\[ch\]([^\[]+)\[/ch\]', r'\1', chart_raw).strip()

    # Lyrics: convert [ch]Chord[/ch] → [Chord]
    lyrics_raw = re.sub(r'\[ch\]([^\[]+)\[/ch\]', r'[\1]', lyrics_raw)

    return chart, _clean(lyrics_raw)


def _clean(text: str) -> str:
    lines = [l.rstrip() for l in text.split('\n')]
    result = '\n'.join(lines)
    while '\n\n\n' in result:
        result = result.replace('\n\n\n', '\n\n')
    return result.strip()
