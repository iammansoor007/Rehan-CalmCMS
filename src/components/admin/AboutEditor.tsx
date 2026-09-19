"use client";

import React from "react";
import { AboutContent } from "@/types/cms";
import { ContentPage } from "./ContentPage";
import {
  IconField,
  ImageField,
  ListEditor,
  SectionCard,
  StringList,
  TextAreaField,
  TextField,
  sectionPatcher,
} from "./fields";
import { SeoPanel } from "./SeoPanel";

export function AboutEditor() {
  return (
    <ContentPage<AboutContent>
      contentKey="about"
      title="About Page"
      description="Edit every heading, paragraph, image, card and team member on the About page, and hide any section you don't need."
      viewHref="/about"
    >
      {({ data, setData }) => {
        const seo = sectionPatcher(setData, "seo");
        const story = sectionPatcher(setData, "story");
        const values = sectionPatcher(setData, "values");
        const team = sectionPatcher(setData, "team");
        const pledge = sectionPatcher(setData, "commitments");

        return (
          <>
            <SectionCard title="Page header" description="Badge, title, intro and optional banner image" defaultOpen>
              <TextField label="Badge" value={data.badge} onChange={(v) => setData((d) => ({ ...d, badge: v }))} hint="Empty hides the badge." />
              <TextField label="Title" value={data.title} onChange={(v) => setData((d) => ({ ...d, title: v }))} />
              <TextAreaField label="Intro text" value={data.subtitle} onChange={(v) => setData((d) => ({ ...d, subtitle: v }))} />
              <ImageField
                label="Banner image (optional)"
                aspect="aspect-[21/9]"
                value={data.image}
                onChange={(url) => setData((d) => ({ ...d, image: url }))}
              />
            </SectionCard>

            <SeoPanel
              value={data.seo}
              onChange={seo}
              context={{
                kind: "other",
                title: "About Us",
                slug: "about",
                path: "/about",
                fallbackDescription: data.subtitle,
                image: data.image,
              }}
            />

            <SectionCard
              title="Story"
              description="Heading with paragraphs (and an optional side image)"
              visible={data.story.visible}
              onVisibleChange={(v) => story({ visible: v })}
            >
              <TextField label="Heading" value={data.story.title} onChange={(v) => story({ title: v })} />
              <StringList
                label="Paragraphs"
                multiline
                items={data.story.paragraphs}
                onChange={(paragraphs) => story({ paragraphs })}
                addLabel="Add a paragraph"
              />
              <ImageField label="Side image (optional)" value={data.story.image} onChange={(url) => story({ image: url })} />
            </SectionCard>

            <SectionCard
              title="Core principles"
              description="Icon cards"
              visible={data.values.visible}
              onVisibleChange={(v) => values({ visible: v })}
            >
              <TextField label="Heading" value={data.values.title} onChange={(v) => values({ title: v })} />
              <TextField label="Sub-heading" value={data.values.subtitle} onChange={(v) => values({ subtitle: v })} />
              <ListEditor
                items={data.values.items}
                onChange={(items) => values({ items })}
                newItem={() => ({ title: "", desc: "", iconName: "Compass" })}
                itemLabel="Card"
                addLabel="Add a card"
                summary={(i) => i.title}
                renderItem={(item, update) => (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <TextField label="Title" value={item.title} onChange={(v) => update({ title: v })} />
                      <IconField value={item.iconName} onChange={(v) => update({ iconName: v })} />
                    </div>
                    <TextAreaField label="Text" rows={2} value={item.desc} onChange={(v) => update({ desc: v })} />
                  </>
                )}
              />
            </SectionCard>

            <SectionCard
              title="Team"
              description="People cards with optional photo"
              visible={data.team.visible}
              onVisibleChange={(v) => team({ visible: v })}
            >
              <TextField label="Heading" value={data.team.title} onChange={(v) => team({ title: v })} />
              <TextField label="Sub-heading" value={data.team.subtitle} onChange={(v) => team({ subtitle: v })} />
              <ListEditor
                items={data.team.members}
                onChange={(members) => team({ members })}
                newItem={() => ({ name: "", role: "", bio: "", photo: "" })}
                itemLabel="Person"
                addLabel="Add a team member"
                summary={(m) => m.name}
                renderItem={(m, update) => (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <TextField label="Name" value={m.name} onChange={(v) => update({ name: v })} />
                      <TextField label="Role" value={m.role} onChange={(v) => update({ role: v })} />
                    </div>
                    <TextAreaField label="Short bio" rows={2} value={m.bio} onChange={(v) => update({ bio: v })} />
                    <ImageField
                      label="Photo (optional)"
                      aspect="aspect-square"
                      value={m.photo}
                      onChange={(url) => update({ photo: url })}
                      hint="Without a photo the first letter of the name is shown."
                    />
                  </>
                )}
              />
            </SectionCard>

            <SectionCard
              title="Pledge banner"
              description="Green banner with a checklist"
              visible={data.commitments.visible}
              onVisibleChange={(v) => pledge({ visible: v })}
            >
              <TextField label="Heading" value={data.commitments.title} onChange={(v) => pledge({ title: v })} />
              <TextField label="Sub-heading" value={data.commitments.subtitle} onChange={(v) => pledge({ subtitle: v })} />
              <StringList
                label="Checklist"
                multiline
                items={data.commitments.items}
                onChange={(items) => pledge({ items })}
                addLabel="Add a point"
              />
            </SectionCard>
          </>
        );
      }}
    </ContentPage>
  );
}
