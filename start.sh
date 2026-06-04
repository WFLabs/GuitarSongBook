#!/bin/bash
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Starting Guitar Song Book..."
echo ""

# Backend
cd "$DIR/backend"
"$DIR/venv/bin/uvicorn" main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

sleep 1

# Frontend
cd "$DIR/frontend"
npm run dev &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

echo ""
echo "Guitar Song Book running at http://localhost:5173"
echo "Press Ctrl+C to stop."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT TERM

wait
