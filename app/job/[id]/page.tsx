"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Markdown from "@/components/Markdown";
import { Check, JobIcon } from "@/components/Icons";
import { JOBS, JobType } from "@/lib/jobs";

type Status = "working" | "requires_capture" | "succeeded" | "canceled" | "error";

export default function JobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [jobType, setJobType] = useState<JobType | null>(null);
  const [input, setInput] = useState("");
  const [steps, setSteps] = useState<string[]>([]);
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<Status>("working");
  const [error, setError] = useState("");
  const [deciding, setDeciding] = useState<"" | "accept" | "reject">("");
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return; // guard against double-run in dev strict mode
    started.current = true;
    (async () => {
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: id }),
      });
      const reader = res.body!.getReader();
      const dec = new TextDecoder();
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        let nl;
        while ((nl = buf.indexOf("\n")) >= 0) {
          const line = buf.slice(0, nl);
          buf = buf.slice(nl + 1);
          if (!line) continue;
          const ev = JSON.parse(line);
          if (ev.type === "meta") {
            setJobType(ev.jobType);
            setInput(ev.input);
          } else if (ev.type === "step") setSteps((s) => [...s, ev.text]);
          else if (ev.type === "token") setOutput((o) => o + ev.text);
          else if (ev.type === "done") setStatus(ev.status);
          else if (ev.type === "error") {
            setError(ev.text);
            setStatus("error");
          }
        }
      }
    })().catch(() => {
      setError("We lost the connection. Refresh the page to pick up where you left off.");
      setStatus("error");
    });
  }, [id]);

  async function decide(action: "accept" | "reject") {
    setDeciding(action);
    try {
      const res = await fetch("/api/decide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: id, action }),
      });
      const data = await res.json();
      if (data.status) setStatus(data.status);
      else setError(data.error || "Something went wrong. Try again?");
    } finally {
      setDeciding("");
    }
  }

  const job = jobType ? JOBS[jobType] : null;
  const working = status === "working";
  const orderNo = id.slice(-6).toUpperCase();
  const pill =
    status === "succeeded"
      ? ["accepted", "Paid $1"]
      : status === "canceled"
        ? ["rejected", "Not charged"]
        : status === "requires_capture"
          ? ["pending", "Waiting on you"]
          : status === "error"
            ? ["rejected", "Hit a snag"]
            : ["pending", "In progress"];

  return (
    <div className="jobwrap">
      <div className="ticket">
        <div className="tickethead">
          <div>
            <div className="lbl">Order #{orderNo}</div>
            <h1>{job ? job.title : "Getting started…"}</h1>
            {input && (
              <div className="brief">
                <b>Brief:</b> {input}
              </div>
            )}
          </div>
          <span className={`pill ${pill[0]}`}>{pill[1]}</span>
        </div>

        {steps.length > 0 && (
          <ul className="progress" aria-live="polite">
            {steps.map((s, i) => {
              const now = working && i === steps.length - 1 && !output;
              return (
                <li key={i} className={now ? "now" : ""}>
                  <span className="tick">{!now && <Check />}</span>
                  {s}
                </li>
              );
            })}
          </ul>
        )}

        <div className={`result ${working && output ? "typing" : ""}`}>
          {output ? (
            <Markdown text={output} />
          ) : (
            <p className="placeholder">{working ? "Your result will appear here…" : ""}</p>
          )}
          {error && <div className="err">{error}</div>}
        </div>

        {status === "requires_capture" && (
          <div className="decide">
            <div className="q">
              Happy with this?
              <span>You&apos;re only charged if you say yes.</span>
            </div>
            <div className="row">
              <button className="btn good" disabled={!!deciding} onClick={() => decide("accept")}>
                {deciding === "accept" ? "Paying…" : "Yes, pay $1"}
              </button>
              <button className="btn ghost" disabled={!!deciding} onClick={() => decide("reject")}>
                {deciding === "reject" ? "Releasing…" : "No thanks, don't charge me"}
              </button>
            </div>
          </div>
        )}

        {(status === "succeeded" || status === "canceled") && (
          <div className="done">
            <div className="big">
              {status === "succeeded" ? "Thanks! Your $1 just paid an agent's rent." : "No problem. You weren't charged."}
            </div>
            <div className="row">
              <Link className="btn" href="/">
                Order another
              </Link>
              <Link className="btn ghost" href="/wall">
                See the live board
              </Link>
            </div>
          </div>
        )}
      </div>

      {jobType && (
        <p className="fine">
          <JobIcon type={jobType} /> Done by an AI agent. Payments held and processed by Stripe.
        </p>
      )}
    </div>
  );
}
