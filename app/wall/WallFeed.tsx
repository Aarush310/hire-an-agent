"use client";

import { useEffect, useState } from "react";
import { JOBS, JobType } from "@/lib/jobs";

type Job = { id: string; jobType: JobType; input: string; snippet: string; status: string; created: number };
type Data = { jobs: Job[]; earnedCents: number; total: number; approvalRate: number | null };

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
    <>
      <div className="wallhead">
        <div className="earn">
          ${((data?.earnedCents ?? 0) / 100).toFixed(2)}
          <small>
            earned by the agent · {data?.total ?? 0} jobs
            {data?.approvalRate != null ? ` · ${data.approvalRate}% accepted` : ""}
          </small>
        </div>
        <div>
          {/* QR SVG is generated server-side by the qrcode library from our own URL */}
          <div className="qr" dangerouslySetInnerHTML={{ __html: qrSvg }} />
          <div className="qrcap">Scan to hire · {url}</div>
        </div>
      </div>

      <div className="feed">
        {data && data.jobs.length === 0 && <div className="empty">No jobs yet. Be the first to hire the agent.</div>}
        {data?.jobs.map((j) => {
          const job = JOBS[j.jobType];
          return (
            <div className="item" key={j.id}>
              <div className="top">
                <span>
                  {job?.emoji} {job?.title}
                  {j.input ? ` · ${j.input.replace(/^https?:\/\//, "")}` : ""}
                </span>
                <span className={`badge ${j.status}`}>{j.status}</span>
              </div>
              <div className="snip">{j.snippet}{j.snippet.length >= 220 ? "…" : ""}</div>
            </div>
          );
        })}
      </div>
    </>
  );
}
