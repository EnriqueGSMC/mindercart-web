// Fixed-endpoint snapshots must only be offered on their matching app host.
export function siriShortcutLinks(hostname: string): { es: string; en: string } | null {
  if (hostname === "mindercart-web-git-testing-enrique-sanchezs-projects.vercel.app") {
    return {
      es: "https://www.icloud.com/shortcuts/fcbff51af45341cfbb4528d1096cffc1",
      en: "https://www.icloud.com/shortcuts/3f932f78e3de4f4e92c4b23f414afb96",
    };
  }
  if (hostname === "mindercart-web.vercel.app") {
    return {
      es: "https://www.icloud.com/shortcuts/bf4a799da2af4e2b977dfe5d764e656d",
      en: "https://www.icloud.com/shortcuts/11a53bc6cc874379ae2b72605170ec96",
    };
  }
  return null;
}
