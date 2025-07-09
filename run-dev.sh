#!/bin/bash
# Run the project in development mode.

# Start the server in background
echo "Starting the server..."
(cd server && npm run dev) &

# Start the client
echo "Starting the client..."
cd client
npm run dev
