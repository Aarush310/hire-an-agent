import { JobType } from "@/lib/jobs";

const common = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function JobIcon({ type }: { type: JobType }) {
  if (type === "roast")
    return (
      <svg {...common}>
        <path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5.3 1.6 1.2 2.5 2.3 2.5C11 8.5 11 6 12 3Z" />
      </svg>
    );
  if (type === "name")
    return (
      <svg {...common}>
        <path d="M9 18h6M10 21h4" />
        <path d="M12 3a6 6 0 0 0-3.5 10.9c.6.4 1 1.1 1 1.9V16h5v-.2c0-.8.4-1.5 1-1.9A6 6 0 0 0 12 3Z" />
      </svg>
    );
  return (
    <svg {...common}>
      <path d="M4 10v4a1 1 0 0 0 1 1h2l5 4V5L7 9H5a1 1 0 0 0-1 1Z" />
      <path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11" />
    </svg>
  );
}

export function Check() {
  return (
    <svg {...common} width={16} height={16} strokeWidth={2.4}>
      <path d="M5 12.5 10 17 19 7" />
    </svg>
  );
}

export function Arrow() {
  return (
    <svg {...common} width={18} height={18} strokeWidth={2}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
