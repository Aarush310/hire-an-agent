import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Geist, Instrument_Serif } from "next/font/google";
import Link from "next/link";

const sans = Geist({ subsets: ["latin"], variable: "--font-sans" });
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: "Hire-an-Agent: small jobs, pay only if it's good",
  description: "Get your landing page roasted, your startup named or your launch tweet written in seconds. $1, and only if you like it.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#FBFAF7" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body>
        <header className="nav">
          <div className="wrap navin">
            <Link href="/" className="brand">
              <span className="mark">H</span>
              Hire-an-Agent
            </Link>
            <nav className="navlinks">
              <Link href="/#how">How it works</Link>
              <Link href="/wall" className="navcta">
                <span className="live" /> Live board
              </Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="foot">
          <div className="wrap footin">
            <span>© 2026 Hire-an-Agent · Made at Agentic Dev Day</span>
            <span>Payments by Stripe · Test mode, no real money moves</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
