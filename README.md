# HackerAnalytics — Hosted Vulnerability Scanners

HackerAnalytics provides hosted vulnerability scanning for internet-facing assets. Our cloud-based scanners (Nmap, OpenVAS, OWASP ZAP and related tooling) discover open services, surface vulnerabilities, and monitor external attack surfaces — all without requiring you to install or manage scanner infrastructure.

This repository contains the landing page for the HackerAnalytics product.

---

## Hetzner VPS Scan Worker Integration

The Next.js app (Vercel) communicates with a Scan Worker service running on a Hetzner VPS (FastAPI + Celery + Redis behind Caddy/TLS at `https://api.vulnscanners.com`).

### Architecture

```
Vercel (Next.js)
  │
  ├─ POST /api/scan/dispatch  ─────────►  Hetzner VPS  POST /scan
  │                                          (202 Accepted, async)
  │
  └─ POST /api/webhooks/scanner  ◄────────  Hetzner VPS  webhook callback
```

---

### Webhook contract — `POST /api/webhooks/scanner`

The VPS POSTs this endpoint when a scan finishes (success or failure).

**Auth header**

```
x-webhook-secret: <value of GCP_WEBHOOK_SECRET>
```

**Request body (JSON)**

| Field | Type | Required | Notes |
|---|---|---|---|
| `eventId` | string | ✅ | Unique event identifier (idempotency key) |
| `scanId` | string | ✅ | Firestore document ID |
| `userId` | string | ✅ | Owner UID |
| `scanType` | string | ✅ | `nmap` \| `nuclei` \| `zap` |
| `status` | string | ✅ | `queued` \| `running` \| `completed` \| `failed` \| `canceled` \| `timeout` |
| `startedAt` | string (ISO 8601) | — | |
| `completedAt` | string (ISO 8601) | — | |
| `durationSec` | number | — | |
| `resultUrl` | string | — | GCS signed/public URL |
| `resultPath` | string | — | GCS object path |
| `summary` | object | — | `{ critical, high, medium, low, info, total }` |
| `error` | string | ✅ if `status == failed` | Human-readable error message |

**Responses**

| Code | Meaning |
|---|---|
| 200 | Event processed (or already seen — idempotent) |
| 400 | Validation error |
| 401 | Missing or invalid `x-webhook-secret` |
| 405 | Method not allowed |
| 500 | Server error (Firestore unavailable, secret not configured) |

**Firestore writes**

- `scans/{scanId}` — merged update of `status`, `startedAt`, `completedAt`, `durationSec`, `resultUrl`, `resultPath`, `summary`, `error`, `updatedAt`.
- `scans/{scanId}/events/{eventId}` — full event payload stored for audit / lifecycle log.

---

### Scan dispatch — `POST /api/scan/dispatch`

Triggers a new scan on the Hetzner VPS. All secrets stay server-side.

**Request body (JSON)**

| Field | Type | Required |
|---|---|---|
| `scanId` | string | ✅ |
| `scanType` | string | ✅ |
| `target` | string | ✅ |
| `options` | object | — |

Returns `202 { queued: true, scanId }` on success.

---

### curl examples

```bash
# Trigger a scan
curl -X POST https://hackeranalytics.com/api/scan/dispatch \
  -H 'Content-Type: application/json' \
  -d '{"scanId":"scan_abc123","scanType":"nmap","target":"example.com"}'

# Simulate a webhook callback (local dev)
curl -X POST http://localhost:3000/api/webhooks/scanner \
  -H 'Content-Type: application/json' \
  -H 'x-webhook-secret: dev-secret' \
  -d '{
    "eventId": "evt_001",
    "scanId": "scan_abc123",
    "userId": "user_xyz",
    "scanType": "nmap",
    "status": "completed",
    "completedAt": "2025-01-01T12:00:00Z",
    "durationSec": 42,
    "resultUrl": "https://storage.googleapis.com/bucket/results/scan_abc123.json",
    "summary": { "total": 5, "critical": 1, "high": 2, "medium": 2, "low": 0 }
  }'
```

---

### Environment variables

Copy `.env-example` to `.env.local` and fill in the values.

| Variable | Description |
|---|---|
| `GCP_WEBHOOK_SECRET` | Shared secret — must match the VPS webhook config |
| `SCANNER_API_KEY` | API key sent to the Hetzner VPS in `x-api-key` header |
| `SCANNER_API_URL` | Base URL of the VPS API (default: `https://api.vulnscanners.com`) |
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `FIREBASE_CLIENT_EMAIL` | Service account email |
| `FIREBASE_PRIVATE_KEY` | Service account private key (replace newlines with `\n`) |

#### Add secrets with Vercel CLI

```bash
# Install Vercel CLI once
npm i -g vercel

# Add each secret (run once per secret)
vercel env add GCP_WEBHOOK_SECRET production
vercel env add SCANNER_API_KEY production
vercel env add SCANNER_API_URL production
vercel env add FIREBASE_PROJECT_ID production
vercel env add FIREBASE_CLIENT_EMAIL production
vercel env add FIREBASE_PRIVATE_KEY production

# Pull to .env.local for local development
vercel env pull .env.local
```

> **Security note**: Never commit `.env.local` or any file containing real secrets.

---

### Local dev setup

```bash
# Copy .env-example to .env.local and fill in values
cp .env-example .env.local

# Install dependencies
npm install

# Start dev server (env vars loaded from .env.local)
npm run dev
```

The dev server runs on `http://localhost:3000`. Webhook callbacks from the VPS need a public URL — use [ngrok](https://ngrok.com) or [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/) to expose your local port.
