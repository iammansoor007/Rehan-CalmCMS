import sanitizeHtml from "sanitize-html";

const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "br", "hr", "h2", "h3", "h4", "strong", "b", "em", "i", "u", "s", "strike",
    "ul", "ol", "li", "blockquote", "pre", "code", "a", "img", "figure", "figcaption",
    "table", "thead", "tbody", "tr", "th", "td", "span", "div",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt", "title", "width", "height"],
    "*": ["style"],
  },
  allowedStyles: {
    "*": { "text-align": [/^(left|right|center|justify)$/] },
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowProtocolRelative: false,
  transformTags: {
    a: (tagName, attribs) => {
      if (attribs.target === "_blank") attribs.rel = "noopener noreferrer";
      return { tagName, attribs };
    },
  },
};

/** Strips scripts, event handlers and anything else outside the editor's allow-list. */
export function sanitizeContent(html: string | undefined | null): string {
  return sanitizeHtml(html || "", OPTIONS).trim();
}
