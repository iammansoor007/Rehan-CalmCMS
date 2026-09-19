import { getSeoContext } from "@/lib/seo";

export const dynamic = "force-dynamic";

const AI_CRAWLERS = ["GPTBot", "ChatGPT-User", "CCBot", "Google-Extended", "anthropic-ai", "ClaudeBot", "PerplexityBot"];

/** robots.txt is generated from Admin → SEO Settings. */
export async function GET() {
  const { settings, baseUrl } = await getSeoContext();
  const lines: string[] = ["User-agent: *"];

  if (!settings.indexing.siteVisible) {
    lines.push("Disallow: /");
  } else {
    lines.push("Allow: /", "Disallow: /admin/", "Disallow: /api/");
  }

  if (settings.robotsTxt.blockAiCrawlers) {
    for (const bot of AI_CRAWLERS) lines.push("", `User-agent: ${bot}`, "Disallow: /");
  }

  const extra = settings.robotsTxt.extra.trim();
  if (extra) lines.push("", extra);

  if (settings.sitemap.enabled && settings.indexing.siteVisible) {
    lines.push("", `Sitemap: ${baseUrl}/sitemap.xml`);
  }

  return new Response(lines.join("\n") + "\n", {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
