// Archived API: create-checkout (moved to disabled)
// This endpoint previously verified Firebase ID tokens and created Stripe checkout sessions.
// It's been archived because this repository now serves as a marketing/landing site only.

export default function handler() {
  return new Response(JSON.stringify({ error: 'create-checkout endpoint is disabled in landing site.' }), { status: 410 });
}
