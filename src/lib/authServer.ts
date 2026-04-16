// FILE: src/lib/authServer.ts
import { cookies, headers } from "next/headers";

export async function getCurrentUserIdOrThrow(): Promise<string> {
  const h = await headers();
  const headerUid = h.get("x-user-id");
  if (headerUid) return headerUid;

  const c = await cookies();
  const cookieUid = c.get("x-user-id")?.value;
  if (cookieUid) return cookieUid;

  throw new Error("Missing x-user-id");
}