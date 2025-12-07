// Archived API: stripe webhook handler (moved to disabled)
// This webhook previously wrote subscription data to Firestore. It's archived for landing-only site.

export const config = { api: { bodyParser: false } };

export default async function handler(req: any, res: any) {
  res.status(410).json({ error: 'stripe webhook endpoint is disabled in landing site.' });
}
