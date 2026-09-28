import { NextResponse } from "next/server";
import { addVoiceItems } from "@/lib/voice/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json() as { utterance?: unknown };
    const utterance = String(body.utterance ?? "").trim().slice(0, 500);
    if (!utterance) {
      return NextResponse.json({ error: "No se recibió ningún artículo" }, { status: 400 });
    }

    return NextResponse.json(await addVoiceItems(req, utterance));
  } catch (error) {
    const message = error instanceof Error ? error.message : "VOICE_ADD_ERROR";
    const status = message === "UNAUTHORIZED" ? 401 : message === "NO_ITEMS" ? 400 : 500;
    return NextResponse.json({
      error: status === 401
        ? "Acceso de voz no autorizado"
        : status === 400
          ? "No pude identificar artículos"
          : "No se pudieron agregar los artículos",
    }, { status });
  }
}
