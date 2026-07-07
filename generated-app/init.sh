#!/bin/bash
set -e

echo "=== Canopy Project Management - Init ==="

# Install root dependencies
echo "[1/5] Installing root dependencies..."
npm install 2>/dev/null || true

# Build shared package
echo "[2/5] Building shared package..."
cd shared
npm run build 2>/dev/null || true
cd ..

# Install frontend dependencies
echo "[3/5] Installing frontend dependencies..."
cd frontend
npm install 2>/dev/null || true
cd ..

# Get API URL from SSM if not already in .env
echo "[4/5] Configuring API URL..."
if [ ! -f frontend/.env ]; then
  API_URL=$(aws ssm get-parameter --name "/claude-code/infra/deploy-state" --region us-east-1 --query 'Parameter.Value' --output text 2>/dev/null | jq -r '.apiUrl' 2>/dev/null || echo "")
  if [ -n "$API_URL" ] && [ "$API_URL" != "null" ]; then
    echo "VITE_API_URL=$API_URL" > frontend/.env
    echo "  API URL set to: $API_URL"
  else
    echo "  Warning: Could not fetch API URL from SSM. Set VITE_API_URL manually in frontend/.env"
  fi
else
  echo "  frontend/.env already exists"
fi

# Start frontend dev server
echo "[5/5] Starting frontend dev server on port 6174..."
cd frontend
npx vite --port 6174 --host 0.0.0.0 &
VITE_PID=$!
cd ..

echo ""
echo "=== Canopy is running ==="
echo "  Frontend: http://localhost:6174"
echo "  API:      $(cat frontend/.env 2>/dev/null | grep VITE_API_URL | cut -d= -f2-)"
echo ""
echo "  Press Ctrl+C to stop"

# Wait for vite to finish
wait $VITE_PID
