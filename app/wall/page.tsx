import { headers } from "next/headers";
import QRCode from "qrcode";
import WallFeed from "./WallFeed";

export const dynamic = "force-dynamic";

export default async function WallPage() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const url = `${proto}://${host}/`;
  const svg = await QRCode.toString(url, { type: "svg", margin: 0 });

  return <WallFeed qrSvg={svg} url={url.replace(/^https?:\/\//, "").replace(/\/$/, "")} />;
}
