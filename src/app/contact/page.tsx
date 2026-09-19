import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { getContactData, getSiteConfig } from "@/lib/cms/client";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, buildMetadata, getSeoContext, webPageJsonLd } from "@/lib/seo";
import { ContactForm } from "@/components/contact/ContactForm";
import { FaqAccordion } from "@/components/contact/FaqAccordion";
import { DynamicIcon } from "@/lib/icons";
import { Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const [contact, ctx] = await Promise.all([getContactData(), getSeoContext()]);
  return buildMetadata(ctx, {
    kind: "other",
    path: "/contact",
    title: "Contact Us",
    seo: contact.seo,
    description: contact.subtitle,
  });
}

export default async function ContactPage() {
  const [contact, siteConfig, ctx] = await Promise.all([getContactData(), getSiteConfig(), getSeoContext()]);
  const showForm = contact.form.visible;
  const showFaq = contact.faq.visible && contact.faq.items.length > 0;

  return (
    <div className="py-16 bg-brand-bgSoft/30 min-h-screen">
      <JsonLd
        data={[
          webPageJsonLd(ctx, {
            path: "/contact",
            name: contact.seo?.title || contact.title,
            description: contact.seo?.description || contact.subtitle,
            type: "ContactPage",
          }),
          breadcrumbJsonLd(ctx, [
            { name: "Home", path: "/" },
            { name: contact.seo?.breadcrumbTitle || "Contact", path: "/contact" },
          ]),
        ]}
      />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          {contact.badge && (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{contact.badge}</span>
            </div>
          )}
          <h1 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl text-brand-dark tracking-tight leading-[1.2]">
            {contact.title}
          </h1>
          {contact.subtitle && (
            <p className="text-base text-brand-muted leading-relaxed">{contact.subtitle}</p>
          )}
        </div>

        {/* Contact Info Cards */}
        {contact.infoCards.visible && contact.infoCards.items.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contact.infoCards.items.map((info, i) => {
              const body = (
                <>
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <DynamicIcon name={info.iconName} fallback="Mail" className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-brand-muted mb-1">
                    {info.title}
                  </span>
                  <span className="font-heading font-bold text-base text-brand-dark mb-1 break-words">
                    {info.detail}
                  </span>
                  <span className="text-xs text-brand-muted">{info.subtext}</span>
                </>
              );
              const cls =
                "p-6 rounded-3xl bg-white border border-brand-borderLight shadow-sm flex flex-col items-start";
              return info.href ? (
                <Link
                  key={`${info.title}-${i}`}
                  href={info.href}
                  className={`${cls} hover:border-primary/40 transition-colors`}
                >
                  {body}
                </Link>
              ) : (
                <div key={`${info.title}-${i}`} className={cls}>
                  {body}
                </div>
              );
            })}
          </div>
        )}

        {/* Form and FAQ 2-Column Section */}
        {(showForm || showFaq) && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {showForm && (
              <div
                className={`${
                  showFaq ? "lg:col-span-7" : "lg:col-span-12 max-w-2xl mx-auto w-full"
                } bg-white p-8 sm:p-10 rounded-3xl border border-brand-borderLight shadow-sm`}
              >
                <div className="mb-6">
                  <h2 className="font-heading font-bold text-xl sm:text-2xl text-brand-dark mb-1">
                    {contact.form.title}
                  </h2>
                  {contact.form.subtitle && (
                    <p className="text-xs sm:text-sm text-brand-muted">{contact.form.subtitle}</p>
                  )}
                </div>

                <ContactForm
                  subjects={contact.form.subjects}
                  buttonText={contact.form.buttonText}
                  recipientEmail={contact.form.recipientEmail || siteConfig.contactEmail}
                  successMessage={contact.form.successMessage}
                />
              </div>
            )}

            {showFaq && (
              <div className={`${showForm ? "lg:col-span-5" : "lg:col-span-12"} space-y-4`}>
                <div>
                  <h2 className="font-heading font-bold text-xl sm:text-2xl text-brand-dark mb-1">
                    {contact.faq.title}
                  </h2>
                  {contact.faq.subtitle && (
                    <p className="text-xs sm:text-sm text-brand-muted mb-4">{contact.faq.subtitle}</p>
                  )}
                </div>

                <FaqAccordion faqs={contact.faq.items} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
