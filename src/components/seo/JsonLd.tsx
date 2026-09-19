import React from "react";

/** Renders one or more JSON-LD structured-data blocks (null entries are skipped). */
export function JsonLd({ data }: { data: (Record<string, unknown> | null | undefined)[] }) {
  return (
    <>
      {data
        .filter((d): d is Record<string, unknown> => !!d)
        .map((d, i) => (
          <script
            key={i}
            type="application/ld+json"
            // "<" is escaped so content can never close the script tag early
            dangerouslySetInnerHTML={{ __html: JSON.stringify(d).replace(/</g, "\\u003c") }}
          />
        ))}
    </>
  );
}
