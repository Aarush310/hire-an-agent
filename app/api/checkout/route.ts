import { NextResponse } from "next/server";
import { JOBS, PRICE_CENTS, isJobType } from "@/lib/jobs";
import { APP_TAG, stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const jobType = body.jobType;
  let input = String(body.input ?? "").trim().slice(0, 400);

  if (!isJobType(jobType)) return NextResponse.json({ error: "Pick a job" }, { status: 400 });
  if (!input) return NextResponse.json({ error: "Tell the agent what to work on" }, { status: 400 });

  if (JOBS[jobType].isUrl) {
    if (!/^https?:\/\//i.test(input)) input = `https://${input}`;
    try {
      new URL(input);
    } catch {
      return NextResponse.json({ error: "That doesn't look like a URL" }, { status: 400 });
    }
  }

  const origin = req.headers.get("origin") ?? new URL(req.url).origin;
  const job = JOBS[jobType];

  const session = await stripe().checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: PRICE_CENTS,
          product_data: {
            name: `${job.emoji} ${job.title}`,
            description: "You're only charged if you accept the agent's work.",
          },
        },
      },
    ],
    payment_intent_data: {
      capture_method: "manual",
      description: `Hire-an-Agent: ${job.title}`,
      metadata: { app: APP_TAG, job_type: jobType, input },
    },
    success_url: `${origin}/job/{CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/`,
  });

  return NextResponse.json({ url: session.url });
}
