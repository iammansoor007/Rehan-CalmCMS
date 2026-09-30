import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import { Article, Category, SidebarSettings } from "@/types/cms";
import { pickCategories } from "@/lib/categoryTree";
import { slugify } from "@/lib/slugify";
import { SidebarNewsletter, SidebarSearch } from "./SidebarWidgets";

interface SidebarProps {
  recentArticles: Article[];
  categories: Category[];
  settings: SidebarSettings;
  /** Highlights this category in the list. */
  activeCategorySlug?: string;
}

const widget = "rounded-2xl bg-brand-bgSoft border border-brand-border p-6";
const widgetTitle =
  "font-heading font-bold text-[1.12rem] text-brand-dark mb-4 pb-2.5 border-b-2 border-primary-light";

/** Right-hand column used on blog posts and the homepage. Every widget is set under Appearance → Sidebar. */
export function Sidebar({ recentArticles, categories, settings, activeCategorySlug }: SidebarProps) {
  const topics = pickCategories(categories, settings.topicCategorySlugs);
  const countFor = (cat: Category) =>
    recentArticles.filter((a) => slugify(a.category) === cat.slug || a.category === cat.name).length;

  return (
    <aside className="flex flex-col gap-7">
      {settings.showSearch && (
        <div className={widget}>
          <SidebarSearch placeholder={settings.searchPlaceholder} />
        </div>
      )}

      {settings.showTopics && topics.length > 0 && (
        <div className={widget}>
          <h3 className={widgetTitle}>{settings.topicsTitle}</h3>
          <ul>
            {topics.map((cat) => {
              const active = cat.slug === activeCategorySlug;
              return (
                <li key={cat.slug} className="border-b border-brand-borderLight last:border-b-0">
                  <Link
                    href={`/category/${cat.slug}`}
                    className={`flex items-center justify-between py-2.5 text-[0.92rem] transition-all hover:text-primary hover:translate-x-1 ${
                      active
                        ? "text-primary font-bold border-l-[3px] border-primary pl-2.5"
                        : "text-brand-dark"
                    }`}
                    style={cat.depth ? { paddingLeft: 12 + cat.depth * 12 } : undefined}
                  >
                    <span>{cat.name}</span>
                    {settings.showTopicCounts && (
                      <span className="text-[0.82rem] text-brand-muted font-medium">({countFor(cat)})</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {settings.showPopular && recentArticles.length > 0 && (
        <div className={widget}>
          <h3 className={widgetTitle}>{settings.popularTitle}</h3>
          <div className="flex flex-col gap-4">
            {recentArticles.slice(0, settings.popularCount).map((art) => (
              <Link key={art.slug} href={`/blog/${art.slug}`} className="group flex items-center gap-3">
                <div className="relative w-[60px] h-[60px] rounded-[10px] overflow-hidden flex-shrink-0 bg-brand-bgLight">
                  {art.img ? (
                    <Image src={art.img} alt={art.imgAlt || art.title} fill sizes="60px" className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-primary/10 text-primary/50">
                      <Sparkles className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="text-[0.88rem] font-semibold text-brand-dark leading-[1.35] group-hover:text-primary transition-colors line-clamp-2">
                    {art.title}
                  </h4>
                  <span className="block mt-1 text-[0.78rem] text-brand-muted">{art.date}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {settings.showNewsletter && (
        <SidebarNewsletter
          title={settings.newsletterTitle}
          text={settings.newsletterText}
          buttonText={settings.newsletterButtonText}
        />
      )}

      {settings.showGuide && (
        <div className="rounded-2xl bg-brand-accentBeigeLight border border-brand-accentBeige p-6">
          {settings.guideBadge && (
            <span className="inline-block px-2.5 py-1 rounded-full bg-primary text-white text-[0.68rem] font-bold tracking-[0.08em] mb-2.5">
              {settings.guideBadge}
            </span>
          )}
          <h4 className="font-heading font-bold text-[1.1rem] text-brand-dark mb-1.5">{settings.guideTitle}</h4>
          <p className="text-[0.86rem] text-brand-muted mb-3 leading-relaxed">{settings.guideText}</p>
          {settings.guideImage && (
            <div className="relative w-full h-40 my-2">
              <Image src={settings.guideImage} alt={settings.guideTitle} fill sizes="340px" className="object-contain" />
            </div>
          )}
          {settings.guideButtonText && settings.guideButtonHref && (
            <Link
              href={settings.guideButtonHref}
              className="mt-3.5 block text-center w-full py-3 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all hover:-translate-y-0.5 shadow-[0_4px_14px_rgba(78,110,88,0.25)]"
            >
              {settings.guideButtonText}
            </Link>
          )}
        </div>
      )}

      {settings.showCard && (
        <div className="rounded-2xl bg-primary/10 border border-primary/20 p-6 text-center">
          <h5 className="font-heading font-semibold text-sm text-brand-dark mb-1">{settings.cardTitle}</h5>
          <p className="text-xs text-brand-muted mb-4">{settings.cardText}</p>
          {settings.cardLinkText && settings.cardLinkHref && (
            <Link href={settings.cardLinkHref} className="inline-block text-xs font-semibold text-primary hover:underline">
              {settings.cardLinkText}
            </Link>
          )}
        </div>
      )}
    </aside>
  );
}
