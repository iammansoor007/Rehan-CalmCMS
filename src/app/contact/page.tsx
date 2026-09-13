import React from "react";
import type { Metadata } from "next";
import { getContactData } from "@/lib/cms/client";
import { ContactForm } from "@/components/contact/ContactForm";
import { FaqAccordion } from "@/components/contact/FaqAccordion";
import { Sparkles, Mail, FileText, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the CalmTouch editorial team. Send us your inquiries or massage topic requests directly.",
};

const iconMap: Record<string, React.ReactNode> = {
  Mail: <Mail className="w-5 h-5 text-primary" />,
  FileText: <FileText className="w-5 h-5 text-primary" />,
  Clock: <Clock className="w-5 h-5 text-primary" />,
};

export default async function ContactPage() {
  const contact = await getContactData();

  return (
    <div className="py-16 bg-brand-bgSoft/30 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{contact.badge}</span>
          </div>
          <h1 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl text-brand-dark tracking-tight leading-[1.2]">
            {contact.title}
          </h1>
          <p className="text-base text-brand-muted leading-relaxed">
            {contact.subtitle}
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {contact.infoCards.map((info) => (
            <div
              key={info.title}
              className="p-6 rounded-3xl bg-white border border-brand-borderLight shadow-sm flex flex-col items-start"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                {iconMap[info.iconName] || <Mail className="w-5 h-5 text-primary" />}
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-muted mb-1">
                {info.title}
              </span>
              <span className="font-heading font-bold text-base text-brand-dark mb-1">
                {info.detail}
              </span>
              <span className="text-xs text-brand-muted">
                {info.subtext}
              </span>
            </div>
          ))}
        </div>

        {/* Form and FAQ 2-Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Contact Form */}
          <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-3xl border border-brand-borderLight shadow-sm">
            <div className="mb-6">
              <h2 className="font-heading font-bold text-xl sm:text-2xl text-brand-dark mb-1">
                Send a Message
              </h2>
              <p className="text-xs sm:text-sm text-brand-muted">
                Fill out the form below and we will get back to you promptly.
              </p>
            </div>

            <ContactForm subjects={contact.subjects} />
          </div>

          {/* FAQs */}
          <div className="lg:col-span-5 space-y-4">
            <div>
              <h2 className="font-heading font-bold text-xl sm:text-2xl text-brand-dark mb-1">
                Frequently Asked
              </h2>
              <p className="text-xs sm:text-sm text-brand-muted mb-4">
                Quick answers to common questions about CalmTouch.
              </p>
            </div>

            <FaqAccordion faqs={contact.faqs} />
          </div>
        </div>
      </div>
    </div>
  );
}
