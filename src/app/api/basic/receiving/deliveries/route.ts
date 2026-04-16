// FILE: src/app/api/basic/receiving/deliveries/route.ts
import { NextResponse } from "next/server";
import { listDeliveryClosed } from "@/lib/receivingRepo";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q");
  const orders = await listDeliveryClosed({ q });
  return NextResponse.json({ orders });
}