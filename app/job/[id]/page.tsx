"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Markdown from "@/components/Markdown";
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
  const [deciding, setDeciding] = useState(false);
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
    })().catch((e) => {
      setError(String(e));
      setStatus("error");
    });
  }, [id]);

  async function decide(action: "accept" | "reject") {
    setDeciding(true);
    const res = await fetch("/api/decide", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: id, action }),
    });
    const data = await res.json();
    if (data.status) setStatus(data.status);
    else setError(data.error || "Something went wrong");
    setDeciding(false);
  }

  const job = jobType ? JOBS[jobType] : null;
  const working = status === "working";
  const badge =
    status === "succeeded"
      ? ["accepted", "Accepted · $1 paid"]
      : status === "canceled"
        ? ["rejected", "Rejected · hold released"]
        : status === "requires_capture"
          ? ["pending", "Awaiting your verdict"]
          : status === "error"
            ? ["rejected", "Error"]
            : ["pending", "Agent working…"];

  return (
    <div className="job">
      <div className="jobhead">
        <h1>
          {job ? `${job.emoji} ${job.title}` : "Starting job…"}
        </h1>
        <span className={`badge ${badge[0]}`}>{badge[1]}</span>
      </div>
      {input && <div className="fine" style={{ textAlign: "left" }}>Brief: {input}</div>}

      {steps.length > 0 && (
        <ul className="steps" aria-live="polite">
          {steps.map((s, i) => (
            <li key={i} className={working && i === steps.length - 1 && !output ? "live" : ""}>
              {s}
            </li>
          ))}
        </ul>
      )}

      <div className={`output ${working ? "cursor" : ""}`}>
        <Markdown text={output} />
      </div>

      {error && <div className="err">{error}</div>}

      {status === "requires_capture" && (
        <div className="actions">
          <button className="btn good" disabled={deciding} onClick={() => decide("accept")}>
            ✓ Accept · pay $1
          </button>
          <button className="btn bad" disabled={deciding} onClick={() => decide("reject")}>
            ✕ Reject · release hold
          </button>
        </div>
      )}

      {(status === "succeeded" || status === "canceled") && (
        <div className="actions">
          <Link className="btn" href="/" style={{ textAlign: "center", textDecoration: "none" }}>
            Hire again
          </Link>
          <Link className="btn bad" href="/wall" style={{ textAlign: "center", textDecoration: "none", color: "var(--text)", borderColor: "var(--border)" }}>
            See the wall
          </Link>
        </div>
      )}
    </div>
  );
}
