import { NextResponse } from "next/server";
import {
  createVoiceAccess,
  getVoiceAccessStatus,
  requireFirebaseUser,
  revokeVoiceAccess,
} from "@/lib/voice/server";

export const runtime = "nodejs";

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "VOICE_ACCESS_ERROR";
  return NextResponse.json(
    { error: message === "UNAUTHORIZED" ? "No autorizado" : "No se pudo configurar Siri" },
    { status: message === "UNAUTHORIZED" ? 401 : 500 },
  );
}

export async function GET(req: Request) {
  try {
    const user = await requireFirebaseUser(req);
    return NextResponse.json(await getVoiceAccessStatus(user.uid));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireFirebaseUser(req);
    return NextResponse.json(await createVoiceAccess(user.uid));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await requireFirebaseUser(req);
    await revokeVoiceAccess(user.uid);
    return NextResponse.json({ enabled: false });
  } catch (error) {
    return errorResponse(error);
  }
}
