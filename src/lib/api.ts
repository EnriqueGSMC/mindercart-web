// ============================================================================
// FILE: src/lib/api.ts   (CREAR NUEVO si no existe)
// ============================================================================
"use client";

import type { User } from "firebase/auth";

export type ApiJson = Record<string, unknown>;

export async function apiJson<T = ApiJson>(user: User, path: string, init: RequestInit = {}): Promise<T> {
  const token = await user.getIdToken();
  const headers = new Headers(init.headers || {});
  if (!headers.has("content-type")) headers.set("content-type", "application/json");
  headers.set("authorization", `Bearer ${token}`);
  headers.set("cache-control", "no-store");

  const res = await fetch(path, { ...init, headers, cache: "no-store" });
  const json = (await res.json().catch(() => ({}))) as any;

  if (!res.ok) {
    const msg = String(json?.error || json?.message || `HTTP ${res.status}`);
    throw new Error(msg);
  }
  return json as T;
}