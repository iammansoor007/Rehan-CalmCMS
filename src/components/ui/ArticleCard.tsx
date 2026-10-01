import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Article } from "@/types/cms";
import { Sparkles } from "lucide-react";

interface ArticleCardProps {
  article: Article;
  priority?: boolean;
}

/** Post card: picture, green category tag, title and date (matches the original design). */
export function ArticleCard({ article, priority = false }: ArticleCardProps) {
  return (
    <article className="group flex flex-col h-full overflow-hidden rounded-2xl bg-white border border-brand-border transition-all hover:-translate-y-1.5 hover:shadow-card">
      <Link href={`/blog/${article.slug}`} className="relative block w-full h-[200px] overflow-hidden bg-brand-bgLight">
        {article.img ? (
          <Image
            src={article.img}
            alt={article.imgAlt || article.title}
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/15 via-brand-bgLight to-brand-accentBeigeLight text-primary/40">
            <Sparkles className="w-10 h-10" />
          </div>
        )}
      </Link>

      <div className="flex flex-col flex-grow p-6">
        <span className="mb-2.5 text-[0.72rem] font-bold uppercase tracking-[0.08em] text-primary">{article.category}</span>
        <h3 className="flex-grow mb-4 font-heading font-semibold text-[1.1rem] leading-[1.35] text-brand-dark transition-colors group-hover:text-primary">
          <Link href={`/blog/${article.slug}`}>{article.title}</Link>
        </h3>
        <div className="flex items-center justify-between pt-3.5 border-t border-brand-borderLight text-[0.8rem] text-brand-muted">
          <span>{article.date}</span>
        </div>
      </div>
    </article>
  );
}
