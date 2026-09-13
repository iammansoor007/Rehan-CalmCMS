import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Article } from "@/types/cms";
import { Calendar, User } from "lucide-react";

interface ArticleCardProps {
  article: Article;
  priority?: boolean;
}

export function ArticleCard({ article, priority = false }: ArticleCardProps) {
  return (
    <article className="group bg-white rounded-2xl overflow-hidden border border-brand-borderLight hover:border-primary/30 transition-all duration-300 hover:shadow-card flex flex-col h-full">
      <Link href={`/blog/${article.slug}`} className="block relative aspect-[16/10] overflow-hidden bg-brand-bgLight">
        <Image
          src={article.img}
          alt={article.title}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-primary shadow-sm">
          {article.category}
        </div>
      </Link>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-3 text-xs text-brand-muted mb-2.5">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {article.date}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 truncate">
            <User className="w-3.5 h-3.5" />
            {article.author}
          </span>
        </div>

        <h3 className="font-heading font-semibold text-lg text-brand-dark group-hover:text-primary transition-colors line-clamp-2 leading-snug mb-2">
          <Link href={`/blog/${article.slug}`}>{article.title}</Link>
        </h3>

        <p className="text-sm text-brand-muted line-clamp-2 mb-4 flex-1">
          {article.intro}
        </p>

        <div className="pt-3 border-t border-brand-borderLight flex items-center justify-between text-xs font-semibold text-primary">
          <span>Read Guide →</span>
          <span className="text-brand-muted font-normal">5 min read</span>
        </div>
      </div>
    </article>
  );
}
