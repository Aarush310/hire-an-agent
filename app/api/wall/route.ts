import { NextResponse } from "next/server";
import { APP_TAG, resultFromMetadata, stripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export async function GET() {
  const list = await stripe().paymentIntents.list({ limit: 100 });
  const ours = list.data.filter((pi) => pi.metadata.app === APP_TAG && pi.metadata.result_0);

  const jobs = ours.slice(0, 30).map((pi) => ({
    id: pi.id.slice(-8),
    jobType: pi.metadata.job_type,
    input: pi.metadata.job_type === "roast" ? pi.metadata.input : "",
    snippet: resultFromMetadata(pi.metadata).replace(/\*\*/g, "").slice(0, 220),
    status: pi.status === "succeeded" ? "accepted" : pi.status === "canceled" ? "rejected" : "pending",
    created: pi.created,
  }));

  const earnedCents = ours.filter((p) => p.status === "succeeded").reduce((s, p) => s + p.amount_received, 0);
  const accepted = jobs.filter((j) => j.status === "accepted").length;
  const decided = jobs.filter((j) => j.status !== "pending").length;

  return NextResponse.json(
    { jobs, earnedCents, total: ours.length, approvalRate: decided ? Math.round((accepted / decided) * 100) : null },
    { headers: { "Cache-Control": "no-store" } },
  );
}
