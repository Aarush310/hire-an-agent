import "./globals.css";
import type { Metadata, Viewport } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Hire-an-Agent",
  description: "Pay an AI agent $1 to do a job live. Only charged if you accept the work.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0b0b12" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="nav">
          <Link href="/" className="brand">
            <span className="dot" /> Hire-an-Agent
          </Link>
          <Link href="/wall" className="navlink">
            Live wall →
          </Link>
        </header>
        <main>{children}</main>
        <footer className="foot">
          Payments by Stripe (test mode) · Agent via OpenRouter · Hosted on Vercel · Built with Stripe Projects
        </footer>
      </body>
    </html>
  );
}
