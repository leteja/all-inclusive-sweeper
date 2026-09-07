import { NextResponse } from "next/server";
import { loadConfig } from "@/lib/config";
import { runSweep } from "@/lib/sweeper";

export async function POST() {
  try {
    const result = await runSweep();
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nežinoma klaida";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  const config = await loadConfig();
  return NextResponse.json({
    message: "Naudokite POST rankiniam tikrinimui. Automatinis — per GitHub Actions.",
    config,
  });
}
