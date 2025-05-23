#!/bin/bash

# Start frontend application only (backend is now MongoDB Realm)
# Run this script with: bash start-all.sh

echo "Starting frontend application on port 3000..."
cd "$(dirname "$0")" && npm start