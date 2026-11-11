"use client";

import { useEffect, useState } from "react";
import { JOBS, JobType } from "@/lib/jobs";
import { JobIcon } from "@/components/Icons";

type Job = { id: string; jobType: JobType; input: string; snippet: string; status: string; created: number };
type Data = { jobs: Job[]; earnedCents: number; total: number; approvalRate: number | null };

function ago(ts: number) {
  const s = Math.max(1, Math.floor(Date.now() / 1000 - ts));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

export default function WallFeed({ qrSvg, url }: { qrSvg: string; url: string }) {
  const [data, setData] = useState<Data | null>(null);

  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch("/api/wall", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => alive && d.jobs && setData(d))
        .catch(() => {});
    load();
    const t = setInterval(load, 3000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  return (
    <div className="wrap wallwrap">
      <div className="wallhead">
        <div className="stat">
          <div className="lbl">
            <span className="live" /> Live · the agent has earned
          </div>
          <div className="money">${((data?.earnedCents ?? 0) / 100).toFixed(2)}</div>
          <div className="row">
            <div>
              <b>{data?.total ?? 0}</b> jobs delivered
            </div>
            <div>
              <b>{data?.approvalRate != null ? `${data.approvalRate}%` : "–"}</b> accepted
            </div>
            <div>
              <b>$1</b> per job, only if it&apos;s good
            </div>
          </div>
        </div>
        <div className="qrcard">
          {/* QR SVG is generated server-side by the qrcode library from our own URL */}
          <div className="qr" dangerouslySetInnerHTML={{ __html: qrSvg }} />
          <b>Scan to try it</b>
          <span>{url}</span>
        </div>
      </div>

      {data && data.jobs.length === 0 && (
        <div className="empty">No jobs yet. Scan the code and be the first.</div>
      )}
      <div className="feed">
        {data?.jobs.map((j) => {
          const job = JOBS[j.jobType];
          return (
            <div className="quote" key={j.id}>
              <div className="meta">
                <span>
                  <JobIcon type={j.jobType} /> {job?.short}
                  {j.input ? ` · ${j.input.replace(/^https?:\/\//, "").replace(/\/$/, "")}` : ""}
                </span>
                <span className={`pill ${j.status}`}>{j.status}</span>
              </div>
              <p>
                {j.snippet}
                {j.snippet.length >= 220 ? "…" : ""}
              </p>
              <div className="meta">
                <span>{ago(j.created)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
