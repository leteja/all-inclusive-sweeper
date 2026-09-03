import { NextResponse } from "next/server";
import { loadDeals } from "@/lib/store";

export async function GET() {
  const data = await loadDeals();
  return NextResponse.json(data);
}
