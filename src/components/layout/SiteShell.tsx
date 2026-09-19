"use client";

import React from "react";
import { usePathname } from "next/navigation";

interface SiteShellProps {
  header: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
}

/** Wraps public pages with the site header/footer; the admin panel gets its own full-screen chrome. */
export function SiteShell({ header, footer, children }: SiteShellProps) {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return <main className="flex-grow">{children}</main>;
  }

  return (
    <>
      {header}
      <main className="flex-grow">{children}</main>
      {footer}
    </>
  );
}
