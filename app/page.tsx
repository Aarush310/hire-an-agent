"use client";

import { useEffect, useState } from "react";
import { JOBS, JobType } from "@/lib/jobs";
import { Arrow, Check, JobIcon } from "@/components/Icons";

type Recent = { id: string; jobType: JobType; input: string; snippet: string; status: string };

export default function Home() {
  const [jobType, setJobType] = useState<JobType>("roast");
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [recent, setRecent] = useState<Recent[]>([]);
  const job = JOBS[jobType];

  useEffect(() => {
    fetch("/api/wall")
      .then((r) => r.json())
      .then((d) => setRecent((d.jobs ?? []).slice(0, 3)))
      .catch(() => {});
  }, []);

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
      if (!res.ok || !data.url) throw new Error(data.error || "Couldn't start checkout. Try again?");
      window.location.href = data.url;
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <>
      <section className="wrap hero">
        <div>
          <div className="eyebrow">
            <b>New</b> Pay only if you like the result
          </div>
          <h1>
            Small jobs, done in <i>ten seconds.</i>
          </h1>
          <p className="lede">
            Hire an AI agent for $1 to roast your landing page, name your startup or write your launch tweet. We hold the
            dollar and only charge you if you&apos;re happy with the work.
          </p>
          <div className="proof">
            <span><Check /> No signup</span>
            <span><Check /> Results in ~10 seconds</span>
            <span><Check /> Reject it and pay nothing</span>
          </div>
        </div>

        <form className="order" onSubmit={hire}>
          <h2>What do you need?</h2>
          <p className="sub">Choose a job. You&apos;ll see it happen live.</p>
          <div className="choices" role="radiogroup" aria-label="Choose a job">
            {(Object.keys(JOBS) as JobType[]).map((k) => (
              <button
                key={k}
                type="button"
                role="radio"
                aria-checked={k === jobType}
                className="choice"
                onClick={() => setJobType(k)}
              >
                <span className="ic"><JobIcon type={k} /></span>
                <span>
                  <b>{JOBS[k].title}</b>
                  <span className="d">{JOBS[k].blurb}</span>
                </span>
              </button>
            ))}
          </div>
          <div className="field">
            <label htmlFor="input">{job.inputLabel}</label>
            <input
              id="input"
              className="input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={job.placeholder}
              inputMode={job.isUrl ? "url" : "text"}
              autoCapitalize="off"
              autoComplete="off"
              required
              maxLength={400}
            />
          </div>
          <button className="btn block" disabled={busy || !input.trim()}>
            {busy ? "Opening secure checkout…" : <>Start for $1 <Arrow /></>}
          </button>
          {error && <div className="err">{error}</div>}
          <p className="fine">
            Demo mode: pay with <code>4242 4242 4242 4242</code>, any date and CVC.
          </p>
        </form>
      </section>

      <section className="section" id="how">
        <div className="wrap">
          <h2 className="title">How it works</h2>
          <p className="kicker">Like hiring a freelancer, minus the waiting and the invoices.</p>
          <div className="steps3">
            <div className="step">
              <div className="n">1</div>
              <h3>Pick a job</h3>
              <p>Tell us what you need. Checkout puts a $1 hold on your card but doesn&apos;t charge it.</p>
            </div>
            <div className="step">
              <div className="n">2</div>
              <h3>Watch it work</h3>
              <p>The agent reads your site or brief and writes back while you watch, usually in about ten seconds.</p>
            </div>
            <div className="step">
              <div className="n">3</div>
              <h3>Keep it or don&apos;t</h3>
              <p>Like it? Accept and we take the $1. Not your thing? Reject it and the hold disappears.</p>
            </div>
          </div>
        </div>
      </section>

      {recent.length > 0 && (
        <section className="section">
          <div className="wrap">
            <h2 className="title">Fresh off the desk</h2>
            <p className="kicker">Real jobs people just ordered. <a href="/wall">See them all →</a></p>
            <div className="recent">
              {recent.map((r) => (
                <div className="quote" key={r.id}>
                  <div className="meta">
                    <span><JobIcon type={r.jobType} /> {JOBS[r.jobType]?.short}</span>
                    <span className={`pill ${r.status}`}>{r.status}</span>
                  </div>
                  <p>{r.snippet.slice(0, 160)}{r.snippet.length > 160 ? "…" : ""}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="wrap faq">
          <div>
            <h3>Will I actually be charged?</h3>
            <p>Not today. This is a demo running in Stripe test mode, so use the test card and no real money moves.</p>
          </div>
          <div>
            <h3>What if I don&apos;t like it?</h3>
            <p>Click reject. The hold on your card is cancelled straight away, so you pay nothing.</p>
          </div>
          <div>
            <h3>Who&apos;s doing the work?</h3>
            <p>An AI agent. It reads what you give it, drafts an answer and hands it over for you to approve.</p>
          </div>
        </div>
      </section>
    </>
  );
}
