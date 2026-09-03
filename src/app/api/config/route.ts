import { NextResponse } from "next/server";
import { loadConfig, saveConfig } from "@/lib/config";
import type { SweeperConfig } from "@/lib/types";

export async function GET() {
  const config = await loadConfig();
  return NextResponse.json(config);
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as SweeperConfig;
    const current = await loadConfig();
    const merged = { ...current, ...body, telegram: { ...current.telegram, ...body.telegram } };
    await saveConfig(merged);
    return NextResponse.json(merged);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nežinoma klaida";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
