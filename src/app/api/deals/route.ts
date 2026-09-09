import { NextResponse } from "next/server";
import { loadDeals } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await loadDeals();
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nežinoma klaida";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
