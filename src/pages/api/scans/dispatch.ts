import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * POST /api/scans/dispatch
 *
 * Server-side proxy that forwards a scan job to the Hetzner worker at
 * https://api.vulnscanners.com/scan.
 *
 * The Hetzner worker authenticates callers via the `X-Scanner-Token` header
 * whose value must match the shared `GCP_WEBHOOK_SECRET`.  Using the same
 * secret for both directions keeps the key-management surface minimal:
 *   Next.js → Hetzner: X-Scanner-Token: <GCP_WEBHOOK_SECRET>
 *   Hetzner → Next.js: x-webhook-secret: <GCP_WEBHOOK_SECRET>
 *
 * Request body (JSON):
 *   scanId   string  – Firestore scan document ID
 *   scanType string  – "nmap" | "nuclei" | "zap"
 *   target   string  – URL or IP to scan
 *   options  object  – (optional) scanner-specific options
 *
 * Returns the Hetzner worker response body on success, or an error object.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const scannerToken = process.env.GCP_WEBHOOK_SECRET;
    if (!scannerToken) {
        console.error('GCP_WEBHOOK_SECRET is not configured');
        return res.status(500).json({ error: 'Scanner token not configured on server' });
    }

    const { scanId, scanType, target, options } = req.body as {
        scanId?: string;
        scanType?: string;
        target?: string;
        options?: Record<string, unknown>;
    };

    if (!scanId || !scanType || !target) {
        return res.status(400).json({ error: 'Missing required fields: scanId, scanType, target' });
    }

    try {
        const workerRes = await fetch('https://api.vulnscanners.com/scan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Scanner-Token': scannerToken,
            },
            body: JSON.stringify({ scanId, scanType, target, options: options ?? {} }),
        });

        const data = await workerRes.json().catch(() => ({}));

        if (!workerRes.ok) {
            console.error('Hetzner worker returned error', workerRes.status, data);
            return res.status(502).json({ error: 'Worker rejected the request', workerStatus: workerRes.status, detail: data });
        }

        return res.status(202).json(data);
    } catch (err) {
        console.error('Failed to reach Hetzner worker', err);
        return res.status(502).json({ error: 'Could not reach scanner worker' });
    }
}
