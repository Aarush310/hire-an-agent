import { NextResponse } from "next/server";
import { paymentIntentForSession, stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const { sessionId, action } = await req.json().catch(() => ({}));
  try {
    const { pi } = await paymentIntentForSession(String(sessionId));
    if (pi.status !== "requires_capture") {
      return NextResponse.json({ status: pi.status });
    }
    const updated =
      action === "accept"
        ? await stripe().paymentIntents.capture(pi.id)
        : await stripe().paymentIntents.cancel(pi.id, { cancellation_reason: "requested_by_customer" });
    return NextResponse.json({ status: updated.status });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
