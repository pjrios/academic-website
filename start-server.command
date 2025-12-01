#!/bin/bash
# Simple local server launcher for Packet Journey Simulator
cd "$(dirname "$0")" || exit 1

PORT=${PORT:-8000}
echo "Starting local server on http://localhost:${PORT} ..."
python3 -m http.server "${PORT}" &
SERVER_PID=$!

open "http://localhost:${PORT}/Packet%20Journey%20Simulator.html"

trap 'echo "Stopping server..."; kill ${SERVER_PID}' INT TERM
wait ${SERVER_PID}
