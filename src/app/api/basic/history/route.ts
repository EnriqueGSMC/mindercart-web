// FILE: src/app/api/basic/receiving/history/route.ts
import { NextResponse } from "next/server";
import { listHistory } from "@/lib/receivingRepo";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q");
  const orders = await listHistory({ q });
  return NextResponse.json({ orders });
}