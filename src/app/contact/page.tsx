import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { getContactData, getSiteConfig } from "@/lib/cms/client";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, buildMetadata, getSeoContext, webPageJsonLd } from "@/lib/seo";
import { ContactForm } from "@/components/contact/ContactForm";
import { DynamicIcon } from "@/lib/icons";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

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
  const showCards = contact.infoCards.visible && contact.infoCards.items.length > 0;
  const showFaq = contact.faq.visible && contact.faq.items.length > 0;
  const showRight = showCards || showFaq;

  return (
    <div className="bg-white pt-10 pb-24 min-h-[80vh]">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Contact Us" }]} />

        {/* Hero banner */}
        <div className="rounded-2xl bg-brand-bgSoft border border-brand-border px-6 py-8 sm:px-10 sm:py-10 mb-9">
          {contact.badge && (
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary-light text-primary text-[0.78rem] font-bold uppercase tracking-[0.12em] mb-3.5">
              {contact.badge}
            </span>
          )}
          <h1 className="font-heading font-bold text-3xl sm:text-4xl lg:text-[2.5rem] text-brand-dark leading-tight mt-2 mb-3">
            {contact.title}
          </h1>
          {contact.subtitle && (
            <p className="text-[1.08rem] text-brand-muted leading-relaxed max-w-[680px]">{contact.subtitle}</p>
          )}
        </div>

        <div className={`grid grid-cols-1 gap-9 ${showForm && showRight ? "lg:grid-cols-[1.4fr_1fr]" : ""}`}>
          {/* Form */}
          {showForm && (
            <div className="rounded-2xl bg-white border border-brand-border p-6 sm:p-9 shadow-soft">
              <h2 className="font-heading font-bold text-[1.5rem] text-brand-dark mb-1.5">{contact.form.title}</h2>
              {contact.form.subtitle && <p className="text-[0.92rem] text-brand-muted mb-6">{contact.form.subtitle}</p>}
              <ContactForm
                subjects={contact.form.subjects}
                buttonText={contact.form.buttonText}
                recipientEmail={contact.form.recipientEmail || siteConfig.contactEmail}
                successMessage={contact.form.successMessage}
              />
            </div>
          )}

          {/* Info cards + FAQ */}
          {showRight && (
            <div className="flex flex-col gap-5">
              {showCards &&
                contact.infoCards.items.map((info, i) => {
                  const body = (
                    <>
                      <div className="w-11 h-11 rounded-full bg-primary-light text-primary-dark flex items-center justify-center flex-shrink-0">
                        <DynamicIcon name={info.iconName} fallback="Mail" className="w-[22px] h-[22px]" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-heading font-bold text-[1.05rem] text-brand-dark mb-1">{info.title}</h4>
                        <p className="text-[0.92rem] text-brand-muted leading-[1.5] break-words">{info.detail}</p>
                        {info.subtext && (
                          <span className="block text-[0.78rem] font-semibold text-primary mt-1">{info.subtext}</span>
                        )}
                      </div>
                    </>
                  );
                  const cls = "flex gap-4 rounded-2xl bg-brand-bgSoft border border-brand-border p-6";
                  return info.href ? (
                    <Link key={`${info.title}-${i}`} href={info.href} className={`${cls} hover:border-primary transition-colors`}>
                      {body}
                    </Link>
                  ) : (
                    <div key={`${info.title}-${i}`} className={cls}>
                      {body}
                    </div>
                  );
                })}

              {showFaq && (
                <div className="rounded-2xl bg-white border border-brand-border p-6">
                  <h4 className="font-heading font-bold text-[1.1rem] text-brand-dark mb-3.5">{contact.faq.title}</h4>
                  {contact.faq.subtitle && <p className="text-[0.88rem] text-brand-muted mb-3">{contact.faq.subtitle}</p>}
                  <div>
                    {contact.faq.items.map((faq, i) => (
                      <details
                        key={`${faq.question}-${i}`}
                        open={i === 0}
                        className="group border-b border-brand-borderLight last:border-b-0 py-2.5"
                      >
                        <summary className="cursor-pointer list-none font-semibold text-[0.92rem] text-brand-dark hover:text-primary flex items-center justify-between gap-3">
                          <span>{faq.question}</span>
                          <span className="text-brand-muted transition-transform group-open:rotate-180">⌄</span>
                        </summary>
                        <p className="text-[0.88rem] text-brand-muted leading-[1.5] mt-2">{faq.answer}</p>
                      </details>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
