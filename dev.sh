#!/bin/bash

# Veritas AI - Start both Frontend & Backend dev servers
# Usage: ./dev.sh

echo ""
echo -e "\033[0;36m  Veritas AI - Development Servers\033[0m"
echo -e "\033[0;34m  ================================\033[0m"
echo ""

# Get the directory where the script is located
ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Start backend (FastAPI + Uvicorn)
echo -e "\033[0;32m  [Backend]  Starting on http://localhost:8000      (Swagger: /docs)\033[0m"
cd "$ROOT_DIR/backend" || exit
# Run backend in background
source ./venv/bin/activate
uvicorn api.main:app --reload --port 8000 > /tmp/veritas_backend.log 2>&1 &
BACKEND_PID=$!

# Start frontend (Vite)
echo -e "\033[0;32m  [Frontend] Starting on http://localhost:5173\033[0m"
cd "$ROOT_DIR/frontend" || exit

echo ""
echo -e "\033[0;90m  Press Ctrl+C to stop both servers.\033[0m"
echo ""

# Function to clean up on exit
cleanup() {
    echo -e "\n\033[0;33m  Stopping backend server (PID $BACKEND_PID)...\033[0m"
    kill $BACKEND_PID
    echo -e "\033[0;32m  All servers stopped.\033[0m"
    exit
}

# Trap Ctrl+C (SIGINT) and call cleanup
trap cleanup SIGINT

# Start frontend in foreground
npm run dev
