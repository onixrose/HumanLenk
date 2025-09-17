#!/bin/bash

echo "🌐 Starting HumanLenk Frontend (Port 4000)..."

# Clear any existing processes on port 4000
lsof -ti:4000 | xargs kill -9 2>/dev/null || true

# Navigate to frontend directory
cd apps/frontend

# Clear Next.js cache for clean start
rm -rf .next

# Start frontend development server
yarn dev
