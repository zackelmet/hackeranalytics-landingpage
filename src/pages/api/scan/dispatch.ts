// POST /api/scan/dispatch
//
// Server-side proxy that triggers a scan on the Hetzner VPS Scan Worker.
// Keeps SCANNER_API_KEY out of the client bundle.
//
// Request body:
//   scanId    (string, required) — Firestore document ID for this scan job
//   scanType  (string, required) — e.g. "nmap" | "nuclei" | "zap"
//   target    (string, required) — hostname or IP to scan
//   options   (object, optional) — additional scanner options
//
// Returns 202 on success (the VPS returns 202 Accepted and processes async).

import type { NextApiRequest, NextApiResponse } from 'next';

const DEFAULT_SCANNER_API_URL = 'https://api.vulnscanners.com';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DispatchRequest {
    scanId: string;
    scanType: string;
    target: string;
    options?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validateDispatchRequest(body: unknown): { data: DispatchRequest; error: null } | { data: null; error: string } {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return { data: null, error: 'Request body must be a JSON object' };
    }

    const b = body as Record<string, unknown>;

    if (typeof b.scanId !== 'string' || !b.scanId.trim()) {
        return { data: null, error: 'scanId is required and must be a non-empty string' };
    }
    if (typeof b.scanType !== 'string' || !b.scanType.trim()) {
        return { data: null, error: 'scanType is required and must be a non-empty string' };
    }
    if (typeof b.target !== 'string' || !b.target.trim()) {
        return { data: null, error: 'target is required and must be a non-empty string' };
    }
    if (b.options !== undefined && (typeof b.options !== 'object' || Array.isArray(b.options))) {
        return { data: null, error: 'options must be an object if provided' };
    }

    return {
        data: {
            scanId: b.scanId as string,
            scanType: b.scanType as string,
            target: b.target as string,
            options: b.options as Record<string, unknown> | undefined
        },
        error: null
    };
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const scannerApiKey = process.env.SCANNER_API_KEY;
    const scannerApiUrl = process.env.SCANNER_API_URL || DEFAULT_SCANNER_API_URL;

    if (!scannerApiKey) {
        console.error('[scan-dispatch] SCANNER_API_KEY is not configured');
        return res.status(500).json({ error: 'Scanner API key not configured' });
    }

    const { data, error } = validateDispatchRequest(req.body);
    if (error) {
        return res.status(400).json({ error });
    }

    const { scanId, scanType, target, options } = data!;

    const dispatchUrl = `${scannerApiUrl}/scan`;

    try {
        const upstream = await fetch(dispatchUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': scannerApiKey
            },
            body: JSON.stringify({ scanId, scanType, target, options: options ?? {} })
        });

        if (upstream.status === 202) {
            console.info('[scan-dispatch] scan queued', { scanId, scanType });
            return res.status(202).json({ queued: true, scanId });
        }

        // Propagate non-202 responses from the VPS without leaking raw body.
        console.warn('[scan-dispatch] unexpected response from scanner API', {
            scanId,
            status: upstream.status
        });
        return res.status(upstream.status).json({ error: 'Scanner API returned an unexpected status', status: upstream.status });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('[scan-dispatch] fetch error', { scanId, message });
        return res.status(502).json({ error: 'Could not reach scanner API' });
    }
}
