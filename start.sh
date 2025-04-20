#!/bin/bash
# Start frontend and backend processes
echo "Starting Bajet-Je application..."

# Store the root directory
ROOT_DIR=$(pwd)

# Start the backend (in the background)
cd "${ROOT_DIR}/backend"
echo "Starting backend from $(pwd)"
# Fix the nodemon command to only run server.js
npx nodemon server.js &

# Wait a moment for the backend to initialize
sleep 3

# Navigate to frontend from the root directory
cd "${ROOT_DIR}/frontend"
echo "Starting frontend from $(pwd)"
npm start

# This brings both processes down when the script is terminated
trap "kill 0" EXIT