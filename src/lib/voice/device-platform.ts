export type VoiceDevicePlatform = "ios" | "android" | "unknown";

// Presentation hint only, never an authentication or capability check.
export function detectVoiceDevicePlatform(userAgent: string, maxTouchPoints = 0): VoiceDevicePlatform {
  if (/Android/i.test(userAgent)) return "android";
  if (/iPhone|iPad|iPod/i.test(userAgent)) return "ios";
  // iPad browsers can identify themselves as desktop Safari.
  if (/Macintosh/i.test(userAgent) && maxTouchPoints > 1) return "ios";
  return "unknown";
}
