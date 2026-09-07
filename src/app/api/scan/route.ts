import { NextResponse } from "next/server";
import { loadConfig } from "@/lib/config";
import { runSweep } from "@/lib/sweeper";

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

async function handleScan() {
  try {
    const result = await runSweep();
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nežinoma klaida";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** POST — rankinis tikrinimas (dashboard mygtukas) */
export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return handleScan();
}

/** GET — Vercel Cron (kasdien 20:00 LT) */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return handleScan();
  }

  const config = await loadConfig();
  return NextResponse.json({
    message: "Naudokite POST rankiniam tikrinimui. Vercel Cron naudoja GET su CRON_SECRET.",
    config,
  });
}
