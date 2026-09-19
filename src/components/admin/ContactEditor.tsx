"use client";

import React from "react";
import { ContactContent } from "@/types/cms";
import { ContentPage } from "./ContentPage";
import {
  IconField,
  LinkField,
  ListEditor,
  SectionCard,
  StringList,
  TextAreaField,
  TextField,
  sectionPatcher,
} from "./fields";
import { SeoPanel } from "./SeoPanel";

export function ContactEditor() {
  return (
    <ContentPage<ContactContent>
      contentKey="contact"
      title="Contact Page"
      description="Edit the headings, contact details, form and FAQ on the Contact page. Messages sent through the form appear under Contact Messages."
      viewHref="/contact"
    >
      {({ data, setData }) => {
        const seo = sectionPatcher(setData, "seo");
        const cards = sectionPatcher(setData, "infoCards");
        const form = sectionPatcher(setData, "form");
        const faq = sectionPatcher(setData, "faq");

        return (
          <>
            <SectionCard title="Page header" description="Badge, title and intro" defaultOpen>
              <TextField label="Badge" value={data.badge} onChange={(v) => setData((d) => ({ ...d, badge: v }))} hint="Empty hides the badge." />
              <TextField label="Title" value={data.title} onChange={(v) => setData((d) => ({ ...d, title: v }))} />
              <TextAreaField label="Intro text" value={data.subtitle} onChange={(v) => setData((d) => ({ ...d, subtitle: v }))} />
            </SectionCard>

            <SeoPanel
              value={data.seo}
              onChange={seo}
              context={{
                kind: "other",
                title: "Contact Us",
                slug: "contact",
                path: "/contact",
                fallbackDescription: data.subtitle,
              }}
            />

            <SectionCard
              title="Contact detail cards"
              description="Email, hours, phone, address…"
              visible={data.infoCards.visible}
              onVisibleChange={(v) => cards({ visible: v })}
              defaultOpen
            >
              <ListEditor
                items={data.infoCards.items}
                onChange={(items) => cards({ items })}
                newItem={() => ({ title: "", detail: "", subtext: "", iconName: "Mail", href: "" })}
                itemLabel="Card"
                addLabel="Add a card"
                summary={(i) => i.title}
                renderItem={(item, update) => (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <TextField label="Label" value={item.title} onChange={(v) => update({ title: v })} placeholder="Direct Email" />
                      <IconField value={item.iconName} onChange={(v) => update({ iconName: v })} />
                    </div>
                    <TextField label="Main text" value={item.detail} onChange={(v) => update({ detail: v })} placeholder="support@example.com" />
                    <TextField label="Small text" value={item.subtext} onChange={(v) => update({ subtext: v })} />
                    <LinkField
                      label="Link (optional)"
                      value={item.href}
                      onChange={(v) => update({ href: v })}
                      placeholder="mailto:you@example.com or tel:+123456789"
                      hint="Makes the whole card clickable."
                    />
                  </>
                )}
              />
            </SectionCard>

            <SectionCard
              title="Contact form"
              description="Headline, subject options, button and where messages go"
              visible={data.form.visible}
              onVisibleChange={(v) => form({ visible: v })}
            >
              <TextField label="Heading" value={data.form.title} onChange={(v) => form({ title: v })} />
              <TextAreaField label="Sub-heading" rows={2} value={data.form.subtitle} onChange={(v) => form({ subtitle: v })} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField label="Button text" value={data.form.buttonText} onChange={(v) => form({ buttonText: v })} />
                <TextField
                  label="Send messages to (email)"
                  type="email"
                  value={data.form.recipientEmail}
                  onChange={(v) => form({ recipientEmail: v })}
                  hint="The visitor's mail app opens addressed to this email."
                />
              </div>
              <TextField
                label="Message shown after sending"
                value={data.form.successMessage}
                onChange={(v) => form({ successMessage: v })}
                hint="Use {name} to include the sender's name."
              />
              <StringList
                label="Subject dropdown options"
                items={data.form.subjects}
                onChange={(subjects) => form({ subjects })}
                addLabel="Add a subject"
              />
            </SectionCard>

            <SectionCard
              title="FAQ"
              description="Questions and answers"
              visible={data.faq.visible}
              onVisibleChange={(v) => faq({ visible: v })}
            >
              <TextField label="Heading" value={data.faq.title} onChange={(v) => faq({ title: v })} />
              <TextField label="Sub-heading" value={data.faq.subtitle} onChange={(v) => faq({ subtitle: v })} />
              <ListEditor
                items={data.faq.items}
                onChange={(items) => faq({ items })}
                newItem={() => ({ question: "", answer: "" })}
                itemLabel="Question"
                addLabel="Add a question"
                summary={(i) => i.question}
                renderItem={(item, update) => (
                  <>
                    <TextField label="Question" value={item.question} onChange={(v) => update({ question: v })} />
                    <TextAreaField label="Answer" rows={3} value={item.answer} onChange={(v) => update({ answer: v })} />
                  </>
                )}
              />
            </SectionCard>
          </>
        );
      }}
    </ContentPage>
  );
}
