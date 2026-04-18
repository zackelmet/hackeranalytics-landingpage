import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../utils/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

// Disable Next.js body-size limit — webhook payloads are small JSON blobs.
export const config = { api: { bodyParser: true } };

/**
 * POST /api/scans/webhook
 *
 * Receives scan-result callbacks from the Hetzner worker and writes the
 * outcome into Firestore at three locations:
 *   • scans/{scanId}                           — primary scan document
 *   • users/{userId}/completedScans/{scanId}   — per-user mirror
 *   • scans/{scanId}/events/{eventId}          — ordered lifecycle events
 *
 * Idempotency: the event sub-document is written with `{ create: false }` so
 * a duplicate delivery of the same eventId is silently ignored.
 *
 * Authentication: the caller must supply the shared secret in one of:
 *   x-webhook-signature | x-gcp-webhook-secret | x-webhook-secret
 * The value is compared against the GCP_WEBHOOK_SECRET environment variable.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // ── Authentication ───────────────────────────────────────────────────────
    const secret = process.env.GCP_WEBHOOK_SECRET;
    if (!secret) {
        console.error('GCP_WEBHOOK_SECRET is not configured');
        return res.status(500).json({ error: 'Webhook secret not configured on server' });
    }

    const incomingSecret =
        req.headers['x-webhook-signature'] ||
        req.headers['x-gcp-webhook-secret'] ||
        req.headers['x-webhook-secret'];

    if (!incomingSecret || incomingSecret !== secret) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    // ── Payload validation ───────────────────────────────────────────────────
    const {
        eventId,
        scanId,
        userId,
        scanType,
        status,
        startedAt,
        completedAt,
        durationSec,
        resultUrl,
        resultPath,
        summary,
        error: scanError,
    } = req.body as {
        eventId?: string;
        scanId?: string;
        userId?: string;
        scanType?: string;
        status?: string;
        startedAt?: string;
        completedAt?: string;
        durationSec?: number;
        resultUrl?: string;
        resultPath?: string;
        summary?: Record<string, unknown>;
        error?: string | null;
    };

    if (!eventId || !scanId || !userId || !status) {
        return res.status(400).json({ error: 'Missing required fields: eventId, scanId, userId, status' });
    }

    // ── Idempotency check ────────────────────────────────────────────────────
    // Attempt to create the event document exclusively. If it already exists
    // the event has been processed before — return 200 (already accepted).
    const eventRef = db.collection('scans').doc(scanId).collection('events').doc(eventId);
    try {
        await db.runTransaction(async (txn) => {
            const eventSnap = await txn.get(eventRef);
            if (eventSnap.exists) {
                // Signal to the outer scope that this is a duplicate.
                throw Object.assign(new Error('duplicate'), { code: 'duplicate' });
            }

            // Build the Firestore update for the primary scan document.
            const scanUpdate: Record<string, unknown> = {
                status,
                updatedAt: FieldValue.serverTimestamp(),
            };
            if (scanType !== undefined) scanUpdate.scanType = scanType;
            if (startedAt !== undefined) scanUpdate.startedAt = startedAt;
            if (completedAt !== undefined) scanUpdate.completedAt = completedAt;
            if (durationSec !== undefined) scanUpdate.durationSec = durationSec;
            if (resultUrl !== undefined) scanUpdate.resultUrl = resultUrl;
            if (resultPath !== undefined) scanUpdate.resultPath = resultPath;
            if (summary !== undefined) scanUpdate.summary = summary;
            if (scanError !== undefined) scanUpdate.error = scanError ?? null;

            // 1. Update primary scan document (merge so existing fields survive).
            txn.set(db.collection('scans').doc(scanId), scanUpdate, { merge: true });

            // 2. Mirror into users/{userId}/completedScans/{scanId}.
            txn.set(
                db.collection('users').doc(userId).collection('completedScans').doc(scanId),
                { ...scanUpdate, scanId, userId },
                { merge: true }
            );

            // 3. Write the lifecycle event (exclusive create guards idempotency).
            txn.set(eventRef, {
                eventId,
                scanId,
                userId,
                status,
                scanType: scanType ?? null,
                startedAt: startedAt ?? null,
                completedAt: completedAt ?? null,
                durationSec: durationSec ?? null,
                resultUrl: resultUrl ?? null,
                resultPath: resultPath ?? null,
                summary: summary ?? null,
                error: scanError ?? null,
                receivedAt: FieldValue.serverTimestamp(),
            });
        });
    } catch (err: unknown) {
        if (err instanceof Error && (err as NodeJS.ErrnoException & { code?: string }).code === 'duplicate') {
            return res.status(200).json({ ok: true, duplicate: true });
        }
        console.error('Webhook Firestore transaction failed', err);
        return res.status(500).json({ error: 'Internal server error' });
    }

    return res.status(200).json({ ok: true });
}
