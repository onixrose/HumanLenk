#!/bin/bash

echo "🚀 Starting HumanLenk Backend (Port 5000)..."

# Clear any existing processes on port 5000
lsof -ti:5000 | xargs kill -9 2>/dev/null || true

# Navigate to backend directory
cd apps/backend

# Start backend development server
PORT=5000 yarn dev
