import React from "react";
import type { Metadata } from "next";
import { getAboutData } from "@/lib/cms/client";
import { Sparkles, CheckCircle, Compass, Shield, Smile } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about CalmTouch's mission to provide simple, trustworthy, and science-backed massage and body wellness guides.",
};

const valueIconMap: Record<string, React.ReactNode> = {
  Compass: <Compass className="w-6 h-6 text-primary" />,
  Shield: <Shield className="w-6 h-6 text-primary" />,
  Smile: <Smile className="w-6 h-6 text-primary" />,
};

export default async function AboutPage() {
  const about = await getAboutData();

  return (
    <div className="py-16 bg-brand-bgSoft/30 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{about.badge}</span>
          </div>
          <h1 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl text-brand-dark tracking-tight leading-[1.2]">
            {about.title}
          </h1>
          <p className="text-base sm:text-lg text-brand-muted leading-relaxed">
            {about.subtitle}
          </p>
        </div>

        {/* Story Section */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-brand-borderLight shadow-sm space-y-6">
          <h2 className="font-heading font-bold text-2xl text-brand-dark tracking-tight">
            {about.story.title}
          </h2>
          <div className="space-y-4 text-base text-brand-muted leading-relaxed">
            {about.story.paragraphs.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>

        {/* Core Values */}
        <div className="space-y-8">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-brand-dark tracking-tight mb-2">
              Our Core Principles
            </h2>
            <p className="text-sm text-brand-muted">
              The foundational pillars that steer every article and routine we share.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {about.values.map((val) => (
              <div
                key={val.title}
                className="p-8 rounded-3xl bg-white border border-brand-borderLight shadow-sm flex flex-col items-start"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                  {valueIconMap[val.iconName] || <Compass className="w-6 h-6 text-primary" />}
                </div>
                <h3 className="font-heading font-bold text-lg text-brand-dark mb-2">
                  {val.title}
                </h3>
                <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
                  {val.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Editorial Team */}
        <div className="space-y-8">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-brand-dark tracking-tight mb-2">
              Editorial Advisors & Contributors
            </h2>
            <p className="text-sm text-brand-muted">
              Experienced practitioners dedicated to body health and mindful recovery.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {about.team.map((member) => (
              <div
                key={member.name}
                className="p-6 rounded-3xl bg-white border border-brand-borderLight shadow-sm text-center flex flex-col items-center"
              >
                <div className="w-16 h-16 rounded-full bg-primary-light text-primary font-bold text-2xl flex items-center justify-center mb-4">
                  {member.initial}
                </div>
                <h3 className="font-heading font-semibold text-base text-brand-dark">
                  {member.name}
                </h3>
                <span className="text-xs font-semibold text-primary block mt-0.5 mb-3">
                  {member.role}
                </span>
                <p className="text-xs text-brand-muted leading-relaxed">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Commitments Banner */}
        <div className="p-8 sm:p-10 rounded-3xl bg-primary text-white space-y-6">
          <div className="max-w-xl">
            <h2 className="font-heading font-bold text-2xl sm:text-3xl tracking-tight mb-2">
              Our Editorial Integrity Pledge
            </h2>
            <p className="text-sm text-white/80">
              We uphold clinical responsibility and factual clarity in every guide we write.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {about.commitments.map((c, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-accentBeige flex-shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-white/95">{c}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
