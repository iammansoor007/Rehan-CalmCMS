import type { Article } from "@/types/cms";

/** Plain-text summary: the hand-written excerpt, or the start of the post body. */
export function getExcerpt(article: Pick<Article, "intro" | "content" | "sections">, max = 160): string {
  if (article.intro?.trim()) return article.intro.trim();

  const body = article.content
    ? article.content
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/\s+/g, " ")
        .trim()
    : article.sections?.[0]?.text || "";

  return body.length > max ? `${body.slice(0, max).replace(/\s+\S*$/, "")}…` : body;
}
