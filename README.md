# HackerAnalytics — Hosted Vulnerability Scanners

HackerAnalytics provides hosted vulnerability scanning for internet-facing assets. Our cloud-based scanners (Nmap, OpenVAS, OWASP ZAP and related tooling) discover open services, surface vulnerabilities, and monitor external attack surfaces — all without requiring you to install or manage scanner infrastructure.

This repository contains the landing page for the HackerAnalytics product.

---

## Scan-worker integration runbook

### Architecture overview

```
Browser / API client
      │ POST /api/scans/dispatch
      ▼
Next.js (Vercel)  ──── X-Scanner-Token: <GCP_WEBHOOK_SECRET> ────▶  Hetzner worker
                                                                      api.vulnscanners.com/scan
                                                                              │
                        POST /api/scans/webhook ◀────────────────────────────┘
                        x-webhook-secret: <GCP_WEBHOOK_SECRET>
```

The **same secret** (`GCP_WEBHOOK_SECRET`) authenticates both directions:

| Direction | Header |
|---|---|
| Next.js → Hetzner | `X-Scanner-Token: <secret>` |
| Hetzner → Next.js | `x-webhook-secret: <secret>` (also accepted: `x-gcp-webhook-secret`, `x-webhook-signature`) |

---

### Environment variables

| Variable | Required | Description |
|---|---|---|
| `GCP_WEBHOOK_SECRET` | ✅ | Shared secret for scanner auth in both directions |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | ✅ | Firebase project ID |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | ✅ | Full service-account JSON as a single-line string |

#### Setting secrets in Vercel

```bash
# Production (required)
vercel env add GCP_WEBHOOK_SECRET production
vercel env add FIREBASE_SERVICE_ACCOUNT_JSON production
vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID production

# Preview (optional — recommended for staging tests)
vercel env add GCP_WEBHOOK_SECRET preview
vercel env add FIREBASE_SERVICE_ACCOUNT_JSON preview
vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID preview
```

---

### API endpoints

#### `POST /api/scans/dispatch`

Forwards a scan job to the Hetzner worker. Called server-side only (never
expose `GCP_WEBHOOK_SECRET` to the browser).

**Request body**

```json
{
  "scanId":   "abc123",
  "scanType": "nmap",
  "target":   "https://example.com",
  "options":  {}
}
```

**Response** — `202 Accepted` with the worker's response body on success.

---

#### `POST /api/scans/webhook`

Receives scan-result callbacks from the Hetzner worker.

**Authentication** — one of the following headers must be present with the
correct value:

```
x-webhook-secret: <GCP_WEBHOOK_SECRET>
x-gcp-webhook-secret: <GCP_WEBHOOK_SECRET>
x-webhook-signature: <GCP_WEBHOOK_SECRET>
```

**Request body**

```json
{
  "eventId":     "evt_001",
  "scanId":      "abc123",
  "userId":      "uid_xyz",
  "scanType":    "nmap",
  "status":      "completed",
  "startedAt":   "2024-01-01T10:00:00Z",
  "completedAt": "2024-01-01T10:05:00Z",
  "durationSec": 300,
  "resultUrl":   "https://storage.googleapis.com/...",
  "resultPath":  "scans/abc123/result.json",
  "summary":     { "critical": 0, "high": 1, "medium": 3, "low": 5, "info": 10, "total": 19 },
  "error":       null
}
```

**Firestore writes** (all in a single transaction)

| Path | Description |
|---|---|
| `scans/{scanId}` | Primary scan document (merge) |
| `users/{userId}/completedScans/{scanId}` | Per-user mirror (merge) |
| `scans/{scanId}/events/{eventId}` | Lifecycle event (exclusive create — guarantees idempotency) |

A duplicate delivery of the same `eventId` returns `200 { ok: true, duplicate: true }` without re-writing Firestore.

---

### Hetzner worker expectations

The Hetzner worker at `api.vulnscanners.com` must:

1. **Authenticate incoming dispatch requests** by checking that the
   `X-Scanner-Token` header matches its own copy of `GCP_WEBHOOK_SECRET`.
2. **POST the webhook callback** to `https://hackeranalytics.com/api/scans/webhook`
   (or your Vercel preview URL) with the header `x-webhook-secret: <GCP_WEBHOOK_SECRET>`.
3. **Include `eventId`** (a stable, unique ID per event) in every callback so
   the Next.js endpoint can safely deduplicate retries.
