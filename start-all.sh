#!/bin/bash

# Start both backend and frontend applications
# Run this script with: bash start-all.sh

# Start backend in the background on port 8083
echo "Starting backend API server on port 8083..."
cd "$(dirname "$0")/backend" && PORT=8083 npm start &
BACKEND_PID=$!

# Give the backend a moment to start
sleep 2

# Start frontend on port 8080
echo "Starting frontend application on port 8080..."
cd "$(dirname "$0")" && PORT=8080 npm start

# When frontend is stopped, also kill the backend process
kill $BACKEND_PID