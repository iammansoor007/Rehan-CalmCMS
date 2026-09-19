import { DESCRIPTION_IDEAL_MIN, DESCRIPTION_MAX, TITLE_IDEAL_MIN, TITLE_MAX } from "@/lib/seoShared";

/** Yoast-style content analysis. Pure functions so the admin panel can run them on every keystroke. */

export type CheckStatus = "good" | "ok" | "bad";

export interface Check {
  id: string;
  status: CheckStatus;
  text: string;
}

export interface Analysis {
  /** 0–100 */
  score: number;
  level: CheckStatus | "none";
  checks: Check[];
}

export interface SeoAnalysisInput {
  keyword: string;
  /** Title exactly as it will appear in search results. */
  title: string;
  description: string;
  /** True when the description comes from the SEO field (not an auto-generated fallback). */
  hasCustomDescription: boolean;
  slug: string;
  /** Post/page body. Leave undefined to skip the content checks (categories, homepage…). */
  html?: string;
}

/** All regex matches (matchAll needs a newer compile target). */
function all(text: string, re: RegExp): RegExpExecArray[] {
  const g = new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g");
  const out: RegExpExecArray[] = [];
  let m: RegExpExecArray | null;
  while ((m = g.exec(text))) {
    out.push(m);
    if (m[0] === "") g.lastIndex += 1;
  }
  return out;
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/&nbsp;|&amp;/g, " ")
    .replace(/[^a-z0-9\s\u00C0-\uFFFF]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const stripHtml = (html: string) =>
  html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<\/(p|div|h[1-6]|li|blockquote|tr)>/gi, ". ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

const wordsOf = (text: string) => norm(text).split(" ").filter(Boolean);

/** good = the exact phrase; ok = every word appears somewhere; bad = neither. */
function phraseMatch(text: string, keyword: string): CheckStatus {
  const t = norm(text);
  const k = norm(keyword);
  if (!k) return "bad";
  if (t.includes(k)) return "good";
  const kw = k.split(" ");
  return kw.every((w) => t.split(" ").includes(w)) ? "ok" : "bad";
}

function summarise(checks: Check[], hasKeyword: boolean): Analysis {
  const points = checks.reduce((sum, c) => sum + (c.status === "good" ? 1 : c.status === "ok" ? 0.5 : 0), 0);
  const score = checks.length ? Math.round((points / checks.length) * 100) : 0;
  const level: Analysis["level"] = !hasKeyword ? "none" : score >= 80 ? "good" : score >= 50 ? "ok" : "bad";
  return { score, level, checks };
}

export function analyseSeo(input: SeoAnalysisInput): Analysis {
  const checks: Check[] = [];
  const add = (id: string, status: CheckStatus, text: string) => checks.push({ id, status, text });
  const keyword = input.keyword.trim();
  const hasKeyword = keyword.length > 0;
  const html = input.html;
  const text = html !== undefined ? stripHtml(html) : "";
  const words = wordsOf(text);

  // --- keyphrase checks
  if (!hasKeyword) {
    add("keyword", "bad", "No focus keyphrase set. Add the word or phrase you want this page to rank for.");
  } else {
    add(
      "keyword-length",
      wordsOf(keyword).length <= 4 ? "good" : "ok",
      wordsOf(keyword).length <= 4
        ? "Focus keyphrase length is good."
        : "Your focus keyphrase is long. Shorter phrases (up to 4 words) work best."
    );

    const inTitle = phraseMatch(input.title, keyword);
    add(
      "keyword-title",
      inTitle,
      inTitle === "good"
        ? "The focus keyphrase appears in the SEO title."
        : inTitle === "ok"
        ? "The words of your keyphrase appear in the SEO title, but not together. Try using the exact phrase."
        : "The focus keyphrase does not appear in the SEO title. Add it."
    );

    const inDescription = phraseMatch(input.description, keyword);
    add(
      "keyword-description",
      input.hasCustomDescription ? inDescription : inDescription === "good" ? "ok" : "bad",
      input.hasCustomDescription
        ? inDescription === "good"
          ? "The focus keyphrase appears in the meta description."
          : "The focus keyphrase is missing from the meta description. Add it."
        : "Write a meta description that contains your focus keyphrase."
    );

    const inSlug = phraseMatch(input.slug.replace(/-/g, " "), keyword);
    add(
      "keyword-slug",
      inSlug,
      inSlug === "good"
        ? "The focus keyphrase appears in the URL."
        : inSlug === "ok"
        ? "The URL contains the keyphrase words but not as one phrase."
        : "The focus keyphrase does not appear in the URL slug."
    );

    if (html !== undefined) {
      const firstParagraph = (/<p[^>]*>([\s\S]*?)<\/p>/i.exec(html)?.[1] ?? text.split(". ")[0]) || "";
      const inIntro = phraseMatch(stripHtml(firstParagraph).split(" ").slice(0, 100).join(" "), keyword);
      add(
        "keyword-intro",
        inIntro,
        inIntro === "good"
          ? "The focus keyphrase appears in the first paragraph."
          : "Use the focus keyphrase in the first paragraph so readers and search engines see it early."
      );

      const headings = all(html, /<h[2-4][^>]*>([\s\S]*?)<\/h[2-4]>/gi).map((m) => stripHtml(m[1]));
      if (headings.length === 0) {
        add("keyword-heading", "ok", "No subheadings found. Add H2/H3 headings and use the keyphrase in one.");
      } else {
        const has = headings.some((h) => phraseMatch(h, keyword) === "good");
        add(
          "keyword-heading",
          has ? "good" : "ok",
          has
            ? "The focus keyphrase appears in a subheading."
            : "Use the focus keyphrase (or a synonym) in at least one subheading."
        );
      }

      if (words.length > 0) {
        const k = norm(keyword);
        const count = k ? (norm(text).match(new RegExp(`\\b${k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g")) || []).length : 0;
        const density = (count / Math.max(words.length, 1)) * 100;
        add(
          "keyword-density",
          count === 0 ? "bad" : density > 3 ? "bad" : density < 0.5 ? "ok" : "good",
          count === 0
            ? "The focus keyphrase does not appear in the text."
            : density > 3
            ? `The keyphrase appears ${count} times (${density.toFixed(1)}%). That is too often — it may look like keyword stuffing.`
            : density < 0.5
            ? `The keyphrase appears only ${count} time${count === 1 ? "" : "s"} (${density.toFixed(1)}%). Use it a bit more.`
            : `The keyphrase appears ${count} times (${density.toFixed(1)}%). Great!`
        );
      }

      const imgs = all(html, /<img\b[^>]*>/gi).map((m) => m[0]);
      if (imgs.length > 0) {
        const alts = imgs.map((i) => /alt="([^"]*)"/i.exec(i)?.[1] ?? "");
        const withKeyword = alts.some((a) => phraseMatch(a, keyword) === "good");
        add(
          "keyword-alt",
          withKeyword ? "good" : "ok",
          withKeyword
            ? "An image has the focus keyphrase in its alt text."
            : "None of the images use the focus keyphrase in their alt text."
        );
      }
    }
  }

  // --- title & description length
  const tl = input.title.length;
  add(
    "title-length",
    tl === 0 ? "bad" : tl > TITLE_MAX ? "bad" : tl < TITLE_IDEAL_MIN ? "ok" : "good",
    tl === 0
      ? "The SEO title is empty."
      : tl > TITLE_MAX
      ? `The SEO title is ${tl} characters — it will be cut off in Google. Keep it under ${TITLE_MAX}.`
      : tl < TITLE_IDEAL_MIN
      ? `The SEO title is short (${tl} characters). Use more of the available space (up to ${TITLE_MAX}).`
      : `The SEO title has a good length (${tl} characters).`
  );

  const dl = input.description.length;
  add(
    "description-length",
    !input.hasCustomDescription ? "bad" : dl > DESCRIPTION_MAX ? "ok" : dl < DESCRIPTION_IDEAL_MIN ? "ok" : "good",
    !input.hasCustomDescription
      ? "No meta description has been written. Search engines will pick text from the page instead."
      : dl > DESCRIPTION_MAX
      ? `The meta description is ${dl} characters — it may be cut off. Keep it under ${DESCRIPTION_MAX}.`
      : dl < DESCRIPTION_IDEAL_MIN
      ? `The meta description is short (${dl} characters). Aim for ${DESCRIPTION_IDEAL_MIN}–${DESCRIPTION_MAX}.`
      : `The meta description has a good length (${dl} characters).`
  );

  // --- content checks
  if (html !== undefined) {
    const n = words.length;
    add(
      "text-length",
      n >= 300 ? "good" : n >= 150 ? "ok" : "bad",
      n >= 300
        ? `The text has ${n} words. Good job!`
        : n >= 150
        ? `The text has ${n} words. Aim for at least 300 words.`
        : `The text has only ${n} words. Write at least 300 words to give search engines enough to work with.`
    );

    const links = all(html, /<a\b[^>]*href="([^"]*)"/gi).map((m) => m[1]);
    const internal = links.filter((h) => h.startsWith("/") || h.startsWith("#"));
    const external = links.filter((h) => /^https?:/i.test(h));
    add(
      "internal-links",
      internal.length > 0 ? "good" : "ok",
      internal.length > 0 ? "The page has internal links." : "No internal links. Link to other pages on your site."
    );
    add(
      "outbound-links",
      external.length > 0 ? "good" : "ok",
      external.length > 0 ? "The page has outbound links." : "No outbound links. Linking to a trustworthy source can help."
    );

    const imgs = all(html, /<img\b[^>]*>/gi).map((m) => m[0]);
    if (imgs.length === 0) {
      add("images", "ok", "No images in the text. Add an image to make the page more engaging.");
    } else {
      const missing = imgs.filter((i) => !/alt="[^"]+"/i.test(i)).length;
      add(
        "images",
        missing === 0 ? "good" : "ok",
        missing === 0
          ? "All images have alt text."
          : `${missing} image${missing === 1 ? " has" : "s have"} no alt text. Describe them for SEO and accessibility.`
      );
    }

    const headingCount = (html.match(/<h[2-4]\b/gi) || []).length;
    if (n > 300) {
      add(
        "subheadings",
        headingCount > 0 ? "good" : "ok",
        headingCount > 0 ? "The text uses subheadings." : "Long text without subheadings. Break it up with H2/H3 headings."
      );
    }
  }

  return summarise(checks, hasKeyword);
}

export function analyseReadability(html: string): Analysis {
  const checks: Check[] = [];
  const add = (id: string, status: CheckStatus, text: string) => checks.push({ id, status, text });
  const text = stripHtml(html);
  const sentences = text.replace(/([.!?])\s+/g, "$1\n").split("\n").map((s) => s.trim()).filter((s) => wordsOf(s).length > 0);

  if (sentences.length === 0) {
    add("empty", "bad", "There is no text to analyse yet.");
    return summarise(checks, true);
  }

  const lengths = sentences.map((s) => wordsOf(s).length);
  const longShare = (lengths.filter((l) => l > 20).length / lengths.length) * 100;
  const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  add(
    "sentence-length",
    longShare <= 25 ? "good" : longShare <= 30 ? "ok" : "bad",
    longShare <= 25
      ? `${longShare.toFixed(0)}% of sentences are longer than 20 words. Great!`
      : `${longShare.toFixed(0)}% of sentences are longer than 20 words (aim for 25% or less). Try shortening some.`
  );
  add(
    "avg-sentence",
    avg <= 20 ? "good" : avg <= 25 ? "ok" : "bad",
    `The average sentence is ${avg.toFixed(0)} words long.`
  );

  const paragraphs = all(html, /<p[^>]*>([\s\S]*?)<\/p>/gi).map((m) => wordsOf(stripHtml(m[1])).length);
  const longParas = paragraphs.filter((p) => p > 150).length;
  add(
    "paragraph-length",
    longParas === 0 ? "good" : "bad",
    longParas === 0
      ? "No paragraph is too long."
      : `${longParas} paragraph${longParas === 1 ? " is" : "s are"} longer than 150 words. Split them up.`
  );

  let repeat = 0;
  for (let i = 0; i + 2 < sentences.length; i++) {
    const first = (s: string) => wordsOf(s)[0];
    if (first(sentences[i]) === first(sentences[i + 1]) && first(sentences[i]) === first(sentences[i + 2])) repeat += 1;
  }
  add(
    "variety",
    repeat === 0 ? "good" : "ok",
    repeat === 0
      ? "Sentence beginnings are varied."
      : "Three or more sentences in a row start with the same word. Vary your sentence openings."
  );

  const totalWords = wordsOf(text).length;
  const headingCount = (html.match(/<h[2-4]\b/gi) || []).length;
  if (totalWords > 300) {
    add(
      "distribution",
      headingCount * 300 >= totalWords ? "good" : "ok",
      headingCount * 300 >= totalWords
        ? "Subheadings are well distributed."
        : "Some sections are longer than 300 words without a subheading. Add more headings."
    );
  }

  return summarise(checks, true);
}
