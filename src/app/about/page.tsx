import React from "react";
import Image from "next/image";
import type { Metadata } from "next";
import { getAboutData } from "@/lib/cms/client";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, buildMetadata, getSeoContext, webPageJsonLd } from "@/lib/seo";
import { DynamicIcon } from "@/lib/icons";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { CheckCircle } from "lucide-react";

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

const badge =
  "inline-block px-4 py-1.5 rounded-full bg-primary-light text-primary text-[0.78rem] font-bold uppercase tracking-[0.12em] mb-3.5";

export default async function AboutPage() {
  const [about, ctx] = await Promise.all([getAboutData(), getSeoContext()]);

  return (
    <div className="bg-white pt-10 pb-24 min-h-[80vh]">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "About Us" }]} />

        {/* Hero banner */}
        <div className="rounded-2xl bg-brand-bgSoft border border-brand-border px-6 py-10 sm:px-10 sm:py-12 mb-10 text-center">
          {about.badge && <span className={badge}>{about.badge}</span>}
          <h1 className="font-heading font-bold text-3xl sm:text-4xl lg:text-[2.5rem] text-brand-dark leading-[1.25] max-w-[840px] mx-auto mt-3 mb-4">
            {about.title}
          </h1>
          {about.subtitle && (
            <p className="text-[1.12rem] text-brand-muted leading-relaxed max-w-[720px] mx-auto">{about.subtitle}</p>
          )}
        </div>

        {about.image && (
          <div className="relative aspect-[21/9] rounded-2xl overflow-hidden border border-brand-border shadow-card bg-brand-bgLight mb-10">
            <Image src={about.image} alt={about.title} fill priority sizes="(max-width: 1280px) 100vw, 1280px" className="object-cover" />
          </div>
        )}

        {/* Story */}
        {about.story.visible && (
          <div className="rounded-2xl bg-white border border-brand-border p-7 sm:p-10 mb-10">
            <div className={about.story.image ? "grid grid-cols-1 md:grid-cols-2 gap-10 items-center" : ""}>
              <div>
                <h2 className="font-heading font-bold text-[1.75rem] text-brand-dark tracking-tight mb-5">{about.story.title}</h2>
                <div className="space-y-4 text-[1.02rem] text-brand-muted leading-[1.7]">
                  {about.story.paragraphs.map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </div>
              {about.story.image && (
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-brand-bgLight">
                  <Image src={about.story.image} alt={about.story.title} fill sizes="(max-width: 768px) 100vw, 560px" className="object-cover" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mission cards */}
        {about.values.visible && about.values.items.length > 0 && (
          <div className="mb-12">
            {(about.values.title || about.values.subtitle) && (
              <div className="text-center max-w-xl mx-auto mb-8">
                <h2 className="font-heading font-bold text-[2rem] text-brand-dark tracking-[-0.02em] mb-2">{about.values.title}</h2>
                {about.values.subtitle && <p className="text-[1.05rem] text-brand-muted">{about.values.subtitle}</p>}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
              {about.values.items.map((val, i) => (
                <div
                  key={`${val.title}-${i}`}
                  className="rounded-2xl bg-white border border-brand-border px-7 py-8 transition-all hover:-translate-y-1 hover:border-primary hover:shadow-card"
                >
                  <div className="w-[50px] h-[50px] rounded-xl bg-primary-light text-primary-dark flex items-center justify-center mb-5">
                    <DynamicIcon name={val.iconName} fallback="Compass" className="w-6 h-6" />
                  </div>
                  <h3 className="font-heading font-bold text-[1.25rem] text-brand-dark mb-2.5">{val.title}</h3>
                  <p className="text-[0.94rem] text-brand-muted leading-relaxed">{val.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats bar */}
        {about.stats?.visible && about.stats.items.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 rounded-2xl bg-primary text-white px-6 py-9 text-center">
            {about.stats.items.map((s, i) => (
              <div key={`${s.label}-${i}`}>
                <span className="block font-heading font-extrabold text-[2.2rem] leading-tight mb-1">{s.value}</span>
                <span className="text-[0.88rem] font-semibold uppercase tracking-[0.06em] opacity-90">{s.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Team */}
        {about.team.visible && about.team.members.length > 0 && (
          <div className="mt-16">
            <div className="text-center mb-9">
              <span className={badge}>Meet Our Team</span>
              <h2 className="font-heading font-bold text-[2.25rem] text-brand-dark tracking-[-0.02em] mb-3">{about.team.title}</h2>
              {about.team.subtitle && <p className="text-[1.05rem] text-brand-muted max-w-[580px] mx-auto">{about.team.subtitle}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
              {about.team.members.map((m, i) => (
                <div
                  key={`${m.name}-${i}`}
                  className="rounded-2xl bg-brand-bgSoft border border-brand-border px-6 py-8 text-center transition-all hover:-translate-y-1 hover:border-primary"
                >
                  <div className="relative w-[90px] h-[90px] rounded-full overflow-hidden mx-auto mb-4 border-[3px] border-primary-light bg-primary-light flex items-center justify-center">
                    {m.photo ? (
                      <Image src={m.photo} alt={m.name} fill sizes="90px" className="object-cover" />
                    ) : (
                      <span className="text-primary font-bold text-3xl">{m.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <h3 className="font-heading font-bold text-[1.2rem] text-brand-dark mb-1">{m.name}</h3>
                  <span className="block text-[0.84rem] font-semibold text-primary mb-3">{m.role}</span>
                  <p className="text-[0.88rem] text-brand-muted leading-[1.55]">{m.bio}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pledge */}
        {about.commitments.visible && about.commitments.items.length > 0 && (
          <div className="mt-16 rounded-2xl bg-brand-bgSoft border border-brand-border p-8 sm:p-10">
            <div className="max-w-xl mb-6">
              <h2 className="font-heading font-bold text-[1.75rem] text-brand-dark tracking-tight mb-2">{about.commitments.title}</h2>
              {about.commitments.subtitle && <p className="text-[0.95rem] text-brand-muted">{about.commitments.subtitle}</p>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {about.commitments.items.map((c, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-[0.95rem] text-brand-dark">{c}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
