"use client";

import { useState } from "react";
import { JOBS, JobType } from "@/lib/jobs";

export default function Home() {
  const [jobType, setJobType] = useState<JobType>("roast");
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const job = JOBS[jobType];

  async function hire(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobType, input }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Checkout failed");
      window.location.href = data.url;
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <>
      <section className="hero">
        <span className="pill">🟢 Agent online · $1 per job</span>
        <h1>
          Hire an AI agent.
          <br />
          <em>Only pay if it&apos;s good.</em>
        </h1>
        <p>
          Your $1 is held, not charged. Watch the agent work live, then accept to pay or reject for a full release.
        </p>
      </section>

      <div className="grid" role="radiogroup" aria-label="Pick a job">
        {(Object.keys(JOBS) as JobType[]).map((k) => (
          <button
            key={k}
            type="button"
            role="radio"
            aria-checked={k === jobType}
            className={`card ${k === jobType ? "selected" : ""}`}
            onClick={() => setJobType(k)}
          >
            <div className="emoji">{JOBS[k].emoji}</div>
            <h3>{JOBS[k].title}</h3>
            <p>{JOBS[k].blurb}</p>
          </button>
        ))}
      </div>

      <form className="form" onSubmit={hire}>
        <label htmlFor="input">{job.inputLabel}</label>
        <input
          id="input"
          className="input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={job.placeholder}
          inputMode={job.isUrl ? "url" : "text"}
          autoCapitalize="off"
          required
          maxLength={400}
        />
        <button className="btn" disabled={busy || !input.trim()}>
          {busy ? "Opening checkout…" : `Hire the agent · $1`}
        </button>
        {error && <div className="err">{error}</div>}
        <div className="fine">Test mode: use card 4242 4242 4242 4242, any future date, any CVC.</div>
      </form>
    </>
  );
}
