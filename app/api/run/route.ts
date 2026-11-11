import { runAgent } from "@/lib/agent";
import { isJobType } from "@/lib/jobs";
import { paymentIntentForSession, resultFromMetadata, resultToMetadata, stripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Streams NDJSON events: {type:"meta"|"step"|"token"|"error"|"done", ...} */
export async function POST(req: Request) {
  const { sessionId } = await req.json().catch(() => ({}));
  const enc = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: unknown) => controller.enqueue(enc.encode(JSON.stringify(obj) + "\n"));
      try {
        const { pi } = await paymentIntentForSession(String(sessionId));
        const jobType = pi.metadata.job_type;
        const input = pi.metadata.input ?? "";
        if (!isJobType(jobType)) throw new Error("Unknown job");

        send({ type: "meta", jobType, input, status: pi.status, amount: pi.amount });

        const existing = resultFromMetadata(pi.metadata);
        if (existing) {
          send({ type: "token", text: existing });
          send({ type: "done", status: pi.status });
          return;
        }
        if (pi.status !== "requires_capture") {
          throw new Error(`Payment isn't authorized (status: ${pi.status})`);
        }

        send({ type: "step", text: "Payment authorized: $1.00 on hold, not charged yet" });
        let result = "";
        for await (const ev of runAgent(jobType, input)) {
          if (ev.type === "token") result += ev.text;
          send(ev);
        }
        if (result) {
          send({ type: "step", text: "Delivering work" });
          await stripe().paymentIntents.update(pi.id, { metadata: resultToMetadata(result) });
        }
        send({ type: "done", status: pi.status });
      } catch (e) {
        send({ type: "error", text: (e as Error).message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" },
  });
}
