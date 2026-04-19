# VMA Calculator Service Overview

## 1. What the service does
The VMA Calculator helps coaches and athletes capture endurance test results (Cooper and Demi-Cooper), compute VMA metrics, and store authenticated users' histories. It ships with:

- **Public SPA** (React + Vite + Tailwind) for running guest tests or logged-in workflows.
- **Secure API** (Node.js + Express + PostgreSQL) with JWT authentication, password reset, and per-user data isolation.
- **Email hooks** (Mailjet) for welcome and password reset notifications (currently pending Mailjet account unblock).

## 2. High-level architecture
```
┌────────────┐      HTTPS       ┌──────────────────────┐      HTTP       ┌──────────────┐
│  Browser   │ ───────────────▶ │  Public Endpoint     │ ───────────────▶│ Proxy (8080) │
└────────────┘    (tunnel or    │ (Cloudflare tunnel   │  /api + static │  Express      │
                    nginx)      │  or nginx on 80/443) │                └──────┬───────┘
                                                │                          │
                                                │                          │
                                                ▼                          ▼
                                       ┌────────────────┐        ┌────────────────┐
                                       │ React build    │        │ API (3001)     │
                                       │ frontend/dist  │        │ Express + PG   │
                                       └────────────────┘        └────────────────┘
```

Key pieces:

| Component | Role | Location |
|-----------|------|----------|
| Frontend SPA | Built assets served by `scripts/proxy.js` (port 8080) | `frontend/` + `frontend/dist` |
| API server | Auth, tests CRUD, per-user stats | `backend/src` (port 3001) |
| PostgreSQL | Persistent storage (users, tests, reset tokens) | Local DB `vma_calculator` |
| Proxy | Serves SPA and rewrites `/api` → backend | `scripts/proxy.js` |
| Public access | Either trycloudflare tunnel (`scripts/start_tunnel.sh`) or future nginx/Caddy on 80/443 | `scripts/`, system services |

## 3. Deployment modes
### 3.1 Local-only
1. `cd backend && npm install` (once).
2. `npm run dev` or `node src/index.js` (port 3001).
3. `cd frontend && npm install && npm run dev` (Vite dev server) **or** run `npm run build` and serve through proxy.

### 3.2 One-command public demo (Cloudflare quick tunnel)
Run the orchestrator from the repo root:
```bash
./scripts/start_tunnel.sh
```
What it does:
1. Builds the frontend (Vite → `frontend/dist`).
2. Starts the backend if it is not already running (background, logs → `backend.log`).
3. Installs proxy dependencies in `scripts/` and launches `node scripts/proxy.js` (logs → `proxy.log`).
4. Installs `cloudflared` if missing, then starts a quick tunnel that exposes `http://localhost:8080` and prints a URL like `https://your-tunnel.trycloudflare.com`.

Share that URL with external testers; the SPA will call `/api/*` relative to the same origin, so both UI and API work through a single hostname. Keep the script session running—closing it stops the tunnel.

### 3.3 Direct hosting from your machine (recommended for stability)
1. Keep backend + proxy running permanently (PM2/systemd).
2. Install nginx or Caddy, pointing upstream to `http://127.0.0.1:8080`.
3. Forward router ports 80/443 to this machine, and point DNS (A record) to your public IP.
4. Use Certbot or Caddy automatic TLS so you serve HTTPS directly.

## 4. Operations & monitoring
- **Logs** (all relative to repo root):
  - Backend API: `tail -f backend.log`
  - Proxy server: `tail -f proxy.log`
  - Cloudflare tunnel: `tail -f cloudflared.log`
  - Nginx (when enabled): `sudo journalctl -u nginx -f`
- **Health checks**:
  - Direct API: `curl http://localhost:3001/api/health`
  - Through proxy: `curl http://localhost:8080/api/health`
  - Public URL: `curl https://<tunnel-or-domain>/api/health`
- **Database**: `psql -h localhost -U postgres -d vma_calculator -c "SELECT ..."`
- **Logs inside PostgreSQL**: use `
\dt`, `\d tests`, etc., from psql to inspect schema.

## 5. Accounts & secrets
- `backend/.env` controls DB credentials, JWT secret, and Mailjet keys. Keep this file out of version control.
- Production recommendations:
  - Rotate `JWT_SECRET` and DB credentials before exposing publicly.
  - Enable SSL on PostgreSQL if remote clients will access it.
  - Store secrets in a password manager or `.env` managed by your process manager.

## 6. Known limitations / next steps
1. **Mailjet blocked**: Welcome/reset emails currently fail with HTTP 401 from Mailjet. Resolve with Mailjet support or switch to another provider (SendGrid, SES, Postmark) by updating `emailService.js` and `.env`.
2. **Availability**: Quick tunnels are temporary. For demos, consider a named Cloudflare tunnel with DNS mapping or direct nginx hosting.
3. **Process management**: For continuous uptime, add PM2/systemd units for both backend and proxy, plus a named tunnel or nginx service.
4. **Monitoring**: Add uptime checks (e.g., health ping monitors) and log rotation.

## 7. Quick reference commands
```bash
# Start everything via tunnel script
./scripts/start_tunnel.sh

# Stop proxy/backend/tunnel manually
pkill -f "scripts/proxy.js"
pkill -f "node src/index.js"
pkill -f cloudflared

# View logs
tail -f backend.log proxy.log cloudflared.log

# Database peek
PGPASSWORD='VmaCalc2026!' psql -h localhost -U postgres -d vma_calculator -c 'SELECT COUNT(*) FROM tests;'
```

## 8. Contact / ownership
- **Primary maintainer**: gladius (this machine/user).
- **Tech stack**: React 18, Vite, Tailwind, Node 18, Express, PostgreSQL, Mailjet, Cloudflare Tunnel.
- **Source repository**: local workspace `/home/gladius/Codes/project`.

This document should accompany the generated PDF for stakeholders who need an offline summary of the current deployment setup.
