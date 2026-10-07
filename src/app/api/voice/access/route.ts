import { NextResponse } from "next/server";
import {
  createVoiceAccess,
  getVoiceAccessStatus,
  requireFirebaseUser,
  revokeVoiceAccess,
} from "@/lib/voice/server";

export const runtime = "nodejs";

function diagnosticCode(error: unknown) {
  const record = error && typeof error === "object"
    ? error as { code?: unknown; message?: unknown }
    : null;
  const code = String(record?.code ?? "").toLowerCase();
  const message = String(record?.message ?? error ?? "").toLowerCase();
  const details = `${code} ${message}`;

  if (message === "unauthorized") return "VOICE_UNAUTHORIZED";
  if (details.includes("service_account_base64")) return "ADMIN_BASE64_INVALID";
  if (details.includes("credential") || details.includes("private key") || details.includes("pem")) {
    return "ADMIN_CREDENTIAL_INVALID";
  }
  if (details.includes("id-token") || details.includes("id token") || details.includes("argument-error")) {
    return "ID_TOKEN_INVALID";
  }
  if (details.includes("permission-denied") || details.includes("permission denied")) {
    return "FIRESTORE_PERMISSION_DENIED";
  }
  if (details.includes("invalid-argument") || details.includes("invalid argument")) {
    return "FIRESTORE_INVALID_ARGUMENT";
  }
  if (details.includes("not-found") || details.includes("not found")) {
    return "FIRESTORE_NOT_FOUND";
  }
  return "VOICE_ACCESS_INTERNAL";
}

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "VOICE_ACCESS_ERROR";
  const diagnostic = diagnosticCode(error);
  const logMessage = error instanceof Error
    ? error.message.replace(/-----BEGIN[\s\S]*?-----END[^-]*-----/g, "[REDACTED]")
    : String(error);
  console.error("[voice/access]", diagnostic, logMessage);

  return NextResponse.json(
    {
      error: message === "UNAUTHORIZED"
        ? "No autorizado"
        : `No se pudo configurar Siri (${diagnostic})`,
      diagnostic,
    },
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
