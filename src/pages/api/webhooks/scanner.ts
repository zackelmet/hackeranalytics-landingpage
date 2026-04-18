// POST /api/webhooks/scanner
//
// Receives scan completion events from the Hetzner VPS Scan Worker.
//
// Auth    : x-webhook-secret header must equal GCP_WEBHOOK_SECRET env var.
// Payload : JSON body as described in the webhook contract (see README).
// Idempotency : uses Firestore scans/{scanId}/events/{eventId} — duplicate
//               eventIds are silently ignored (200 returned immediately).

import type { NextApiRequest, NextApiResponse } from 'next';
import { getFirestore } from '../../../utils/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ScanStatus = 'queued' | 'running' | 'completed' | 'failed' | 'canceled' | 'timeout';

interface ScanSummary {
    critical?: number;
    high?: number;
    medium?: number;
    low?: number;
    info?: number;
    total?: number;
    [key: string]: unknown;
}

interface WebhookPayload {
    eventId: string;
    scanId: string;
    userId: string;
    scanType: string;
    status: ScanStatus;
    startedAt?: string | null;
    completedAt?: string | null;
    durationSec?: number | null;
    resultUrl?: string | null;
    resultPath?: string | null;
    summary?: ScanSummary | null;
    error?: string | null;
}

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

const VALID_STATUSES: ScanStatus[] = ['queued', 'running', 'completed', 'failed', 'canceled', 'timeout'];

function validatePayload(body: unknown): { payload: WebhookPayload; validationError: null } | { payload: null; validationError: string } {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return { payload: null, validationError: 'Request body must be a JSON object' };
    }

    const b = body as Record<string, unknown>;

    if (typeof b.eventId !== 'string' || !b.eventId.trim()) {
        return { payload: null, validationError: 'eventId is required and must be a non-empty string' };
    }
    if (typeof b.scanId !== 'string' || !b.scanId.trim()) {
        return { payload: null, validationError: 'scanId is required and must be a non-empty string' };
    }
    if (typeof b.userId !== 'string' || !b.userId.trim()) {
        return { payload: null, validationError: 'userId is required and must be a non-empty string' };
    }
    if (typeof b.scanType !== 'string' || !b.scanType.trim()) {
        return { payload: null, validationError: 'scanType is required and must be a non-empty string' };
    }
    if (!VALID_STATUSES.includes(b.status as ScanStatus)) {
        return { payload: null, validationError: `status must be one of: ${VALID_STATUSES.join(', ')}` };
    }
    if (b.status === 'failed' && (typeof b.error !== 'string' || !b.error.trim())) {
        return { payload: null, validationError: 'error is required when status is "failed"' };
    }

    return {
        payload: {
            eventId: b.eventId as string,
            scanId: b.scanId as string,
            userId: b.userId as string,
            scanType: b.scanType as string,
            status: b.status as ScanStatus,
            startedAt: (b.startedAt as string | null | undefined) ?? null,
            completedAt: (b.completedAt as string | null | undefined) ?? null,
            durationSec: (b.durationSec as number | null | undefined) ?? null,
            resultUrl: (b.resultUrl as string | null | undefined) ?? null,
            resultPath: (b.resultPath as string | null | undefined) ?? null,
            summary: (b.summary as ScanSummary | null | undefined) ?? null,
            error: (b.error as string | null | undefined) ?? null
        },
        validationError: null
    };
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // --- Authentication ---
    const webhookSecret = process.env.GCP_WEBHOOK_SECRET;
    if (!webhookSecret) {
        console.error('[scanner-webhook] GCP_WEBHOOK_SECRET is not configured');
        return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    const incomingSecret = req.headers['x-webhook-secret'];
    if (typeof incomingSecret !== 'string' || incomingSecret !== webhookSecret) {
        return res.status(401).json({ error: 'Unauthorized: invalid or missing x-webhook-secret header' });
    }

    // --- Validation ---
    const { payload, validationError } = validatePayload(req.body);
    if (validationError) {
        return res.status(400).json({ error: validationError });
    }

    const { eventId, scanId, userId, scanType, status, startedAt, completedAt, durationSec, resultUrl, resultPath, summary, error } = payload!;

    // --- Idempotency check + Firestore writes ---
    try {
        const db = getFirestore();
        const scanRef = db.collection('scans').doc(scanId);
        const eventRef = scanRef.collection('events').doc(eventId);

        // Use a transaction so the idempotency check and the writes are atomic.
        const isDuplicate = await db.runTransaction(async (tx) => {
            const eventSnap = await tx.get(eventRef);
            if (eventSnap.exists) {
                return true; // duplicate — skip
            }

            // Build the scan document update (only include non-null fields).
            const scanUpdate: Record<string, unknown> = {
                status,
                updatedAt: FieldValue.serverTimestamp()
            };
            if (startedAt !== null) scanUpdate.startedAt = startedAt;
            if (completedAt !== null) scanUpdate.completedAt = completedAt;
            if (durationSec !== null) scanUpdate.durationSec = durationSec;
            if (resultUrl !== null) scanUpdate.resultUrl = resultUrl;
            if (resultPath !== null) scanUpdate.resultPath = resultPath;
            if (summary !== null) scanUpdate.summary = summary;
            if (error !== null) scanUpdate.error = error;

            // Event document captures the full payload for the lifecycle log.
            const eventDoc: Record<string, unknown> = {
                eventId,
                scanId,
                userId,
                scanType,
                status,
                receivedAt: FieldValue.serverTimestamp()
            };
            if (startedAt !== null) eventDoc.startedAt = startedAt;
            if (completedAt !== null) eventDoc.completedAt = completedAt;
            if (durationSec !== null) eventDoc.durationSec = durationSec;
            if (resultUrl !== null) eventDoc.resultUrl = resultUrl;
            if (resultPath !== null) eventDoc.resultPath = resultPath;
            if (summary !== null) eventDoc.summary = summary;
            if (error !== null) eventDoc.error = error;

            tx.set(scanRef, scanUpdate, { merge: true });
            tx.set(eventRef, eventDoc);

            return false;
        });

        if (isDuplicate) {
            console.info('[scanner-webhook] duplicate eventId ignored', { eventId, scanId });
            return res.status(200).json({ received: true, duplicate: true });
        }

        console.info('[scanner-webhook] processed event', { eventId, scanId, status });
        return res.status(200).json({ received: true });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('[scanner-webhook] Firestore error', { scanId, eventId, message });
        return res.status(500).json({ error: 'Internal server error' });
    }
}
