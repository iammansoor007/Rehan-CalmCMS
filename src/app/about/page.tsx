import React from "react";
import Image from "next/image";
import type { Metadata } from "next";
import { getAboutData } from "@/lib/cms/client";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, buildMetadata, getSeoContext, webPageJsonLd } from "@/lib/seo";
import { DynamicIcon } from "@/lib/icons";
import { Sparkles, CheckCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const [about, ctx] = await Promise.all([getAboutData(), getSeoContext()]);
  return buildMetadata(ctx, {
    kind: "other",
    path: "/about",
    title: "About Us",
    seo: about.seo,
    description: about.subtitle,
    image: about.image,
  });
}

export default async function AboutPage() {
  const [about, ctx] = await Promise.all([getAboutData(), getSeoContext()]);

  return (
    <div className="py-16 bg-brand-bgSoft/30 min-h-screen">
      <JsonLd
        data={[
          webPageJsonLd(ctx, {
            path: "/about",
            name: about.seo?.title || about.title,
            description: about.seo?.description || about.subtitle,
            type: "AboutPage",
            image: about.image,
          }),
          breadcrumbJsonLd(ctx, [
            { name: "Home", path: "/" },
            { name: about.seo?.breadcrumbTitle || "About", path: "/about" },
          ]),
        ]}
      />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          {about.badge && (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{about.badge}</span>
            </div>
          )}
          <h1 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl text-brand-dark tracking-tight leading-[1.2]">
            {about.title}
          </h1>
          {about.subtitle && (
            <p className="text-base sm:text-lg text-brand-muted leading-relaxed">{about.subtitle}</p>
          )}
        </div>

        {about.image && (
          <div className="relative aspect-[21/9] rounded-3xl overflow-hidden border border-brand-borderLight shadow-card bg-brand-bgLight">
            <Image
              src={about.image}
              alt={about.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover"
            />
          </div>
        )}

        {/* Story Section */}
        {about.story.visible && (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-brand-borderLight shadow-sm">
            <div className={about.story.image ? "grid grid-cols-1 md:grid-cols-2 gap-10 items-center" : ""}>
              <div className="space-y-6">
                <h2 className="font-heading font-bold text-2xl text-brand-dark tracking-tight">
                  {about.story.title}
                </h2>
                <div className="space-y-4 text-base text-brand-muted leading-relaxed">
                  {about.story.paragraphs.map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </div>
              {about.story.image && (
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-brand-bgLight">
                  <Image
                    src={about.story.image}
                    alt={about.story.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 480px"
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Core Values */}
        {about.values.visible && about.values.items.length > 0 && (
          <div className="space-y-8">
            <div className="text-center max-w-xl mx-auto">
              <h2 className="font-heading font-bold text-2xl sm:text-3xl text-brand-dark tracking-tight mb-2">
                {about.values.title}
              </h2>
              {about.values.subtitle && (
                <p className="text-sm text-brand-muted">{about.values.subtitle}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {about.values.items.map((val, i) => (
                <div
                  key={`${val.title}-${i}`}
                  className="p-8 rounded-3xl bg-white border border-brand-borderLight shadow-sm flex flex-col items-start"
                >
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                    <DynamicIcon name={val.iconName} fallback="Compass" className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-brand-dark mb-2">{val.title}</h3>
                  <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">{val.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Editorial Team */}
        {about.team.visible && about.team.members.length > 0 && (
          <div className="space-y-8">
            <div className="text-center max-w-xl mx-auto">
              <h2 className="font-heading font-bold text-2xl sm:text-3xl text-brand-dark tracking-tight mb-2">
                {about.team.title}
              </h2>
              {about.team.subtitle && <p className="text-sm text-brand-muted">{about.team.subtitle}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {about.team.members.map((member, i) => (
                <div
                  key={`${member.name}-${i}`}
                  className="p-6 rounded-3xl bg-white border border-brand-borderLight shadow-sm text-center flex flex-col items-center"
                >
                  {member.photo ? (
                    <div className="relative w-20 h-20 rounded-full overflow-hidden mb-4 bg-brand-bgLight">
                      <Image
                        src={member.photo}
                        alt={member.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-primary-light text-primary font-bold text-2xl flex items-center justify-center mb-4">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <h3 className="font-heading font-semibold text-base text-brand-dark">{member.name}</h3>
                  <span className="text-xs font-semibold text-primary block mt-0.5 mb-3">{member.role}</span>
                  <p className="text-xs text-brand-muted leading-relaxed">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Commitments Banner */}
        {about.commitments.visible && about.commitments.items.length > 0 && (
          <div className="p-8 sm:p-10 rounded-3xl bg-primary text-white space-y-6">
            <div className="max-w-xl">
              <h2 className="font-heading font-bold text-2xl sm:text-3xl tracking-tight mb-2">
                {about.commitments.title}
              </h2>
              {about.commitments.subtitle && (
                <p className="text-sm text-white/80">{about.commitments.subtitle}</p>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {about.commitments.items.map((c, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-brand-accentBeige flex-shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-white/95">{c}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
