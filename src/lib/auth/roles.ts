export type Role = "BASIC" | "BUYER" | "ADMIN" | string;

export function canBuy(role: Role): boolean {
  const r = String(role || "").toUpperCase();
  return r !== "BASIC";
}

export function isBasic(role: Role): boolean {
  return String(role || "").toUpperCase() === "BASIC";
}