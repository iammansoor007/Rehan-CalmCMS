import React from "react";
import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

/** "Home / Category / Page" trail, matching the site's original design. */
export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[0.88rem] text-brand-muted mb-7">
      {items.map((item, i) => {
        const last = i === items.length - 1;
        return (
          <React.Fragment key={`${item.label}-${i}`}>
            {i > 0 && <span className="text-brand-border">/</span>}
            {item.href && !last ? (
              <Link href={item.href} className="hover:text-primary transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className={last ? "text-brand-dark font-medium truncate max-w-[320px]" : ""}>{item.label}</span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
