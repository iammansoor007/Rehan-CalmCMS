import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound, permanentRedirect } from "next/navigation";
import { resolveRedirect } from "@/lib/cms/content";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, buildMetadata, getSeoContext, webPageJsonLd } from "@/lib/seo";
import type { Metadata } from "next";
import { ChevronRight, Eye } from "lucide-react";
import { getPageBySlug } from "@/lib/cms/pages";
import { getSession } from "@/lib/auth";

interface CmsPageProps {
  params: {
    slug: string;
  };
}

export const dynamic = "force-dynamic";

/** Logged-in admins can open draft pages to preview them. */
async function loadPage(slug: string) {
  const session = await getSession();
  return getPageBySlug(slug, { includeAll: !!session });
}

function plainText(html: string, max = 160): string {
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max).replace(/\s+\S*$/, "")}…` : text;
}

export async function generateMetadata({ params }: CmsPageProps): Promise<Metadata> {
  const [page, ctx] = await Promise.all([loadPage(params.slug), getSeoContext()]);
  if (!page) return { title: "Page Not Found", robots: { index: false, follow: false } };

  return buildMetadata(ctx, {
    kind: "page",
    path: `/${page.slug}`,
    title: page.title,
    seo: page.seo,
    description: plainText(page.content),
    image: page.img,
    preview: page.status === "draft",
  });
}

export default async function CmsPage({ params }: CmsPageProps) {
  const page = await loadPage(params.slug);
  if (!page) {
    const moved = await resolveRedirect(`/${params.slug}`);
    if (moved) permanentRedirect(moved);
    notFound();
  }
  const ctx = await getSeoContext();

  return (
    <article className="py-12 bg-brand-bgSoft/30 min-h-screen">
      <JsonLd
        data={[
          webPageJsonLd(ctx, {
            path: `/${page.slug}`,
            name: page.seo?.title || page.title,
            description: page.seo?.description || plainText(page.content),
            type: page.seo?.schemaType || undefined,
            image: page.img,
          }),
          breadcrumbJsonLd(ctx, [
            { name: "Home", path: "/" },
            { name: page.seo?.breadcrumbTitle || page.title, path: `/${page.slug}` },
          ]),
        ]}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {page.status === "draft" && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-800">
            <Eye className="w-4 h-4 flex-shrink-0" />
            <span>Preview only — this page is a draft. Visitors cannot see it.</span>
          </div>
        )}

        <nav className="flex items-center gap-2 text-xs text-brand-muted mb-8">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-brand-border" />
          <span className="text-brand-dark font-medium">{page.title}</span>
        </nav>

        <header className="mb-8">
          <h1 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl text-brand-dark tracking-tight leading-[1.2]">
            {page.title}
          </h1>
        </header>

        {page.img && (
          <div className="relative aspect-[16/9] rounded-3xl overflow-hidden shadow-card border border-brand-borderLight mb-10 bg-brand-bgLight">
            <Image
              src={page.img}
              alt={page.imgAlt || page.title}
              fill
              priority
              sizes="(max-width: 896px) 100vw, 896px"
              className="object-cover"
            />
          </div>
        )}

        <div
          className="cms-content bg-white rounded-3xl border border-brand-borderLight p-6 sm:p-10"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>
    </article>
  );
}
