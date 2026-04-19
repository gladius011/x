#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "[start_tunnel] Root: $ROOT"

# 1) Build frontend
echo "\n[1/6] Building frontend..."
cd "$ROOT/frontend"
if [ -f package-lock.json ] || [ -f yarn.lock ]; then
  : # assume deps exist
else
  echo "Installing frontend deps (this may take a while)..."
  npm install
fi
npm run build

# 2) Start backend if not running
echo "\n[2/6] Starting backend (if not already running)..."
cd "$ROOT/backend"
if pgrep -f "node src/index.js" >/dev/null 2>&1; then
  echo "Backend appears to be already running. Skipping start."
else
  echo "Starting backend in background; logs -> $ROOT/backend.log"
  nohup node src/index.js > "$ROOT/backend.log" 2>&1 &
  sleep 1
fi

# 3) Prepare proxy dependencies
echo "\n[3/6] Preparing proxy (express + http-proxy-middleware) in scripts/ directory..."
cd "$ROOT/scripts"
# Install into the scripts/ prefix so we don't modify top-level package.json
npm install --prefix "$ROOT/scripts" express http-proxy-middleware --no-audit --no-fund

# 4) Start proxy (serves SPA + proxies /api)
echo "\n[4/6] Starting proxy server on port 8080; logs -> $ROOT/proxy.log"
if pgrep -f "node .*scripts/proxy.js" >/dev/null 2>&1; then
  echo "Proxy already running."
else
  nohup node proxy.js > "$ROOT/proxy.log" 2>&1 &
  sleep 1
fi

# 5) Ensure cloudflared exists; if not, attempt to download/install (Debian/Ubuntu .deb)
echo "\n[5/6] Ensuring cloudflared is installed..."
if ! command -v cloudflared >/dev/null 2>&1; then
  echo "cloudflared not found. Attempting to download and install (requires sudo)..."
  TMPDEB="/tmp/cloudflared.deb"
  wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -O "$TMPDEB"
  sudo dpkg -i "$TMPDEB"
  rm -f "$TMPDEB"
fi

# 6) Start cloudflared tunnel (trycloudflare URL) and report public URL
echo "\n[6/6] Starting cloudflared tunnel to http://localhost:8080 ...\n  (This will create a public trycloudflare.com URL)"
cd "$ROOT"
nohup cloudflared tunnel --url http://localhost:8080 > "$ROOT/cloudflared.log" 2>&1 &

# Wait for public URL to appear in log
echo "Waiting for public URL (check $ROOT/cloudflared.log) ..."
for i in {1..30}; do
  if grep -qE "https?://[a-z0-9-]+\.trycloudflare\.com" "$ROOT/cloudflared.log" 2>/dev/null; then
    URL=$(grep -oE "https?://[a-z0-9-]+\.trycloudflare\.com" "$ROOT/cloudflared.log" | head -n1)
    echo "\nTunnel ready: $URL"
    echo "Open this URL in your browser. API will be available under ${URL}/api/* and the SPA will make requests to /api by default."
    exit 0
  fi
  sleep 1
done

echo "\nTimed out waiting for cloudflared public URL. Check the log at $ROOT/cloudflared.log for details."
exit 2
