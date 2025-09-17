#!/bin/bash

# HumanLenk Development Clean Start Script
# This script ensures a clean development environment every time

echo "🧹 Cleaning development environment..."

# Kill any existing processes
pkill -f "yarn dev" 2>/dev/null || true
pkill -f "turbo" 2>/dev/null || true  
pkill -f "tsx" 2>/dev/null || true
pkill -f "next" 2>/dev/null || true

# Clear ports
lsof -ti:4000,5000 | xargs kill -9 2>/dev/null || true

# Wait for processes to fully terminate
sleep 2

# Clean caches
echo "🗑️ Clearing caches..."
rm -rf apps/frontend/.next
rm -rf .turbo
rm -rf node_modules/.cache

# Ensure dependencies are properly installed
echo "📦 Checking dependencies..."
yarn install --silent

# Start development servers
echo "🚀 Starting development servers..."
yarn dev
