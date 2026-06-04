# Guitar Songbook

A personal songbook web app for managing songs, lyrics, tabs, chords, and practice sessions. Runs locally in your browser.

Built with FastAPI (Python) + React (Vite). Data is stored in a local SQLite database. Audio files are served from the `media/` folder.

---

## Requirements

- Python 3.10+
- Node.js 18+

---

## Setup

### 1. Backend

```bash
cd backend
python -m venv ../venv
source ../venv/bin/activate       # Windows: ..\venv\Scripts\activate
pip install fastapi uvicorn sqlalchemy python-multipart
```

### 2. Frontend

```bash
cd frontend
npm install
```

---

## Running

```bash
./start.sh
```

Then open [http://localhost:5173](http://localhost:5173).

The database (`backend/songs.db`) is created automatically on first run — you start with an empty library.

Audio files go in the `media/` folder. The backend serves them at `/media/<filename>`.

---

## Linux Desktop Launcher (optional)

`Guitar Songbook.desktop` adds the app to your application menu. Before using it, edit the `Exec=` line to point to wherever you cloned this repo:

```
Exec=konsole --noclose -e bash -c "/your/path/to/GuitarSongBook/start.sh; exec bash"
```

Then copy it to `~/.local/share/applications/`.

---

## Accessing from Other Devices

### Tailscale (recommended for personal use)

If you want to access your songbook from your phone or another computer without running it on a server, [Tailscale](https://tailscale.com) is the easiest option. It creates a private network between your devices — no port forwarding, no public exposure.

1. Install Tailscale on both machines and sign in.
2. Start the app on your main machine.
3. Find your Tailscale IP (`tailscale ip -4`) and open `http://<tailscale-ip>:5173` on your other device.

No auth needed because Tailscale keeps it off the public internet.

### VPS + nginx (if you want it accessible from a browser anywhere, or want to share it)

If you want to host this on a real server (e.g., DigitalOcean, Hetzner, Linode), you'd:

1. Build the frontend: `cd frontend && npm run build` — this produces static files in `frontend/dist/`.
2. Run the backend with uvicorn behind nginx as a reverse proxy.
3. Have nginx serve the built frontend files directly.
4. Add HTTP basic auth at the nginx level to protect it (the app has no built-in login).
5. Use a persistent volume for `backend/songs.db` and `media/` so they survive redeploys.

A small VPS (~$5–7/month) is enough for this workload. This is only worth the effort if you need access from networks you don't control, or want to share it with someone else.
