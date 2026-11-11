import Stripe from "stripe";

let client: Stripe | null = null;

export function stripe(): Stripe {
  if (!client) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    client = new Stripe(key);
  }
  return client;
}

export const APP_TAG = "hire-an-agent";
// Stripe metadata values are capped at 500 chars, so results are stored in chunks.
const CHUNK = 490;
const MAX_CHUNKS = 8;

export function resultToMetadata(result: string): Record<string, string> {
  const md: Record<string, string> = {};
  const text = result.slice(0, CHUNK * MAX_CHUNKS);
  for (let i = 0; i < MAX_CHUNKS; i++) {
    md[`result_${i}`] = text.slice(i * CHUNK, (i + 1) * CHUNK);
  }
  return md;
}

export function resultFromMetadata(md: Stripe.Metadata): string {
  let out = "";
  for (let i = 0; i < MAX_CHUNKS; i++) out += md[`result_${i}`] ?? "";
  return out;
}

/** Resolve a Checkout Session id into its (expanded) PaymentIntent. */
export async function paymentIntentForSession(sessionId: string) {
  // Instant demo pay jobs are addressed by PaymentIntent id directly.
  if (/^pi_[A-Za-z0-9_]+$/.test(sessionId)) {
    const pi = await stripe().paymentIntents.retrieve(sessionId);
    if (pi.metadata.app !== APP_TAG) throw new Error("Payment not found");
    return { session: null, pi };
  }
  if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId)) throw new Error("Invalid session id");
  const session = await stripe().checkout.sessions.retrieve(sessionId, {
    expand: ["payment_intent"],
  });
  const pi = session.payment_intent as Stripe.PaymentIntent | null;
  if (!pi || pi.metadata.app !== APP_TAG) throw new Error("Payment not found");
  return { session, pi };
}
