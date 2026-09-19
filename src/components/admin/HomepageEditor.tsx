"use client";

import React from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff } from "lucide-react";
import { HomeSectionId, HomepageContent } from "@/types/cms";
import { ContentPage } from "./ContentPage";
import {
  CategoryPicker,
  Field,
  IconField,
  ImageField,
  LinkField,
  ListEditor,
  NumberField,
  SectionCard,
  StringList,
  TextAreaField,
  TextField,
  Toggle,
  sectionPatcher,
} from "./fields";
import { SeoPanel } from "./SeoPanel";
import { inputCls } from "./shared";

const DEFAULT_HERO_IMAGE = "/assets/images/hero.png";

const SECTION_META: Record<HomeSectionId, { label: string; key: keyof HomepageContent }> = {
  hero: { label: "Hero (top banner)", key: "hero" },
  categories: { label: "Category cards", key: "categoriesSection" },
  latest: { label: "Latest articles", key: "latestSection" },
  browse: { label: "Browse by category tabs", key: "browseSection" },
  guidebook: { label: "Featured guide banner", key: "guidebook" },
  trust: { label: "Trust badges", key: "trustSection" },
  newsletter: { label: "Newsletter sign-up", key: "newsletter" },
};

const ALL_IDS = Object.keys(SECTION_META) as HomeSectionId[];

export function HomepageEditor() {
  return (
    <ContentPage<HomepageContent>
      contentKey="homepage"
      title="Homepage"
      description="Everything on the homepage: show or hide each section, change the order, edit every text, button, link and image, and choose which categories appear."
      viewHref="/"
    >
      {({ data, setData }) => {
        const hero = sectionPatcher(setData, "hero");
        const cats = sectionPatcher(setData, "categoriesSection");
        const latest = sectionPatcher(setData, "latestSection");
        const browse = sectionPatcher(setData, "browseSection");
        const guide = sectionPatcher(setData, "guidebook");
        const trust = sectionPatcher(setData, "trustSection");
        const news = sectionPatcher(setData, "newsletter");
        const seo = sectionPatcher(setData, "seo");

        const order = [
          ...data.sectionOrder.filter((id) => ALL_IDS.includes(id)),
          ...ALL_IDS.filter((id) => !data.sectionOrder.includes(id)),
        ];
        const isVisible = (id: HomeSectionId) =>
          (data[SECTION_META[id].key] as { visible: boolean }).visible !== false;
        const setVisible = (id: HomeSectionId, visible: boolean) =>
          setData((d) => ({
            ...d,
            [SECTION_META[id].key]: { ...(d[SECTION_META[id].key] as object), visible },
          }));
        const moveSection = (from: number, to: number) => {
          if (to < 0 || to >= order.length) return;
          const next = [...order];
          const [item] = next.splice(from, 1);
          next.splice(to, 0, item);
          setData((d) => ({ ...d, sectionOrder: next }));
        };

        return (
          <>
            {/* Order & visibility */}
            <SectionCard
              title="Sections: show / hide & order"
              description="Switch a section off to hide it from the homepage, or move it up and down."
              defaultOpen
            >
              <div className="rounded-xl border border-brand-borderLight bg-white divide-y divide-brand-borderLight">
                {order.map((id, i) => (
                  <div key={id} className="flex items-center gap-3 px-3 py-2.5">
                    <span className="w-5 text-[11px] font-bold text-brand-muted">{i + 1}</span>
                    <span
                      className={`text-xs font-semibold flex-1 ${
                        isVisible(id) ? "text-brand-dark" : "text-brand-muted line-through"
                      }`}
                    >
                      {SECTION_META[id].label}
                    </span>
                    <button
                      type="button"
                      onClick={() => setVisible(id, !isVisible(id))}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors ${
                        isVisible(id)
                          ? "border-primary/30 bg-primary/10 text-primary"
                          : "border-brand-border bg-brand-bgLight text-brand-muted"
                      }`}
                    >
                      {isVisible(id) ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {isVisible(id) ? "Shown" : "Hidden"}
                    </button>
                    <button
                      type="button"
                      disabled={i === 0}
                      onClick={() => moveSection(i, i - 1)}
                      aria-label="Move up"
                      className="p-1.5 rounded text-brand-muted hover:text-primary hover:bg-brand-bgLight disabled:opacity-30"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={i === order.length - 1}
                      onClick={() => moveSection(i, i + 1)}
                      aria-label="Move down"
                      className="p-1.5 rounded text-brand-muted hover:text-primary hover:bg-brand-bgLight disabled:opacity-30"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SeoPanel
              value={data.seo}
              onChange={seo}
              context={{
                kind: "home",
                title: "",
                path: "/",
                fallbackDescription: data.hero.subtitle,
                image: data.hero.image,
              }}
            />

            {/* Hero */}
            <SectionCard
              title="Hero"
              description="Top banner: image, headline, text, button"
              visible={data.hero.visible}
              onVisibleChange={(v) => hero({ visible: v })}
              defaultOpen
            >
              <ImageField
                label="Hero image"
                value={data.hero.image}
                fallbackPreview={DEFAULT_HERO_IMAGE}
                onChange={(url, alt) => hero({ image: url || DEFAULT_HERO_IMAGE, ...(alt ? { imageAlt: alt } : {}) })}
                hint="Landscape, at least 1200 × 900 px."
              />
              <TextField label="Image alt text (SEO)" value={data.hero.imageAlt} onChange={(v) => hero({ imageAlt: v })} />
              <TextField label="Badge" value={data.hero.badge} onChange={(v) => hero({ badge: v })} />
              <Field label="Headline">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input className={inputCls} placeholder="Start" value={data.hero.titleStart} onChange={(e) => hero({ titleStart: e.target.value })} />
                  <input className={inputCls} placeholder="Highlighted words" value={data.hero.titleHighlight} onChange={(e) => hero({ titleHighlight: e.target.value })} />
                  <input className={inputCls} placeholder="End" value={data.hero.titleEnd} onChange={(e) => hero({ titleEnd: e.target.value })} />
                </div>
                <p className="text-[11px] text-brand-muted mt-1">The middle part is shown in green italics.</p>
              </Field>
              <TextAreaField label="Content (subtitle)" value={data.hero.subtitle} onChange={(v) => hero({ subtitle: v })} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField label="Button text" value={data.hero.ctaText} onChange={(v) => hero({ ctaText: v })} hint="Leave empty to hide the button." />
                <LinkField label="Button link" value={data.hero.ctaHref} onChange={(v) => hero({ ctaHref: v })} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <TextField label="Image card: small label" value={data.hero.cardLabel} onChange={(v) => hero({ cardLabel: v })} />
                <TextField label="Image card: title" value={data.hero.cardTitle} onChange={(v) => hero({ cardTitle: v })} hint="Empty hides the card." />
                <LinkField label="Image card: link" value={data.hero.cardHref} onChange={(v) => hero({ cardHref: v })} />
              </div>
              <TextField
                label="Popular topics (comma separated)"
                value={data.hero.popularTags.join(", ")}
                onChange={(v) => hero({ popularTags: v.split(",").map((t) => t.trim()).filter(Boolean) })}
              />
              <ListEditor
                items={data.hero.stats}
                onChange={(stats) => hero({ stats })}
                newItem={() => ({ value: "", label: "" })}
                itemLabel="Number"
                addLabel="Add a number"
                summary={(s) => `${s.value} ${s.label}`}
                renderItem={(s, update) => (
                  <div className="grid grid-cols-[110px_1fr] gap-3">
                    <TextField label="Value" value={s.value} onChange={(v) => update({ value: v })} placeholder="50+" />
                    <TextField label="Label" value={s.label} onChange={(v) => update({ label: v })} placeholder="Wellness Guides" />
                  </div>
                )}
              />
            </SectionCard>

            {/* Category cards */}
            <SectionCard
              title="Category cards"
              description="“Browse Wellness Categories” — choose which categories appear"
              visible={data.categoriesSection.visible}
              onVisibleChange={(v) => cats({ visible: v })}
            >
              <TextField label="Badge" value={data.categoriesSection.badge} onChange={(v) => cats({ badge: v })} />
              <TextField label="Title" value={data.categoriesSection.title} onChange={(v) => cats({ title: v })} />
              <TextAreaField label="Subtitle" rows={2} value={data.categoriesSection.subtitle} onChange={(v) => cats({ subtitle: v })} />
              <Toggle
                label="Show each category's description"
                checked={data.categoriesSection.showDescriptions}
                onChange={(v) => cats({ showDescriptions: v })}
              />
              <CategoryPicker value={data.categoriesSection.categorySlugs} onChange={(v) => cats({ categorySlugs: v })} />
            </SectionCard>

            {/* Latest */}
            <SectionCard
              title="Latest articles"
              description="Post grid, with optional sidebar"
              visible={data.latestSection.visible}
              onVisibleChange={(v) => latest({ visible: v })}
            >
              <TextField label="Title" value={data.latestSection.title} onChange={(v) => latest({ title: v })} />
              <TextAreaField label="Subtitle" rows={2} value={data.latestSection.subtitle} onChange={(v) => latest({ subtitle: v })} />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <NumberField label="Number of posts" min={1} max={24} value={data.latestSection.count} onChange={(v) => latest({ count: v })} />
                <TextField label="“View all” text" value={data.latestSection.linkText} onChange={(v) => latest({ linkText: v })} hint="Empty hides it." />
                <LinkField label="“View all” link" value={data.latestSection.linkHref} onChange={(v) => latest({ linkHref: v })} />
              </div>
              <Toggle
                label="Show the sidebar"
                hint="Edit the sidebar under Appearance → Sidebar."
                checked={data.latestSection.showSidebar}
                onChange={(v) => latest({ showSidebar: v })}
              />
              <CategoryPicker
                label="Only list posts from these categories"
                hint="Show all = the newest posts from every category."
                value={data.latestSection.categorySlugs}
                onChange={(v) => latest({ categorySlugs: v })}
              />
            </SectionCard>

            {/* Browse */}
            <SectionCard
              title="Browse by category tabs"
              description="Tabs of posts per category (built from your real posts)"
              visible={data.browseSection.visible}
              onVisibleChange={(v) => browse({ visible: v })}
            >
              <TextField label="Badge" value={data.browseSection.badge} onChange={(v) => browse({ badge: v })} />
              <TextField label="Title" value={data.browseSection.title} onChange={(v) => browse({ title: v })} />
              <TextAreaField label="Subtitle" rows={2} value={data.browseSection.subtitle} onChange={(v) => browse({ subtitle: v })} />
              <NumberField label="Posts per tab" min={1} max={12} value={data.browseSection.postsPerCategory} onChange={(v) => browse({ postsPerCategory: v })} />
              <CategoryPicker
                label="Category tabs"
                hint="Categories without any published posts are skipped automatically."
                value={data.browseSection.categorySlugs}
                onChange={(v) => browse({ categorySlugs: v })}
              />
            </SectionCard>

            {/* Guidebook */}
            <SectionCard
              title="Featured guide banner"
              description="Big promo card with checklist, button and image"
              visible={data.guidebook.visible}
              onVisibleChange={(v) => guide({ visible: v })}
            >
              <TextField label="Badge" value={data.guidebook.badge} onChange={(v) => guide({ badge: v })} />
              <TextField label="Title" value={data.guidebook.title} onChange={(v) => guide({ title: v })} />
              <TextAreaField label="Description" value={data.guidebook.subtitle} onChange={(v) => guide({ subtitle: v })} />
              <StringList label="Checklist points" items={data.guidebook.perks} onChange={(perks) => guide({ perks })} addLabel="Add a point" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField label="Button text" value={data.guidebook.ctaText} onChange={(v) => guide({ ctaText: v })} hint="Empty hides the button." />
                <LinkField label="Button link" value={data.guidebook.ctaHref} onChange={(v) => guide({ ctaHref: v })} />
              </div>
              <ImageField label="Image" value={data.guidebook.img} onChange={(url) => guide({ img: url })} />
            </SectionCard>

            {/* Trust */}
            <SectionCard
              title="Trust badges"
              description="Row of icon + short text cards"
              visible={data.trustSection.visible}
              onVisibleChange={(v) => trust({ visible: v })}
            >
              <ListEditor
                items={data.trustSection.items}
                onChange={(items) => trust({ items })}
                newItem={() => ({ title: "", desc: "", iconName: "ShieldCheck" })}
                itemLabel="Badge"
                addLabel="Add a badge"
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

            {/* Newsletter */}
            <SectionCard
              title="Newsletter sign-up"
              description="Email subscription box (subscribers appear under Subscribers)"
              visible={data.newsletter.visible}
              onVisibleChange={(v) => news({ visible: v })}
            >
              <TextField label="Badge" value={data.newsletter.badge} onChange={(v) => news({ badge: v })} />
              <TextField label="Title" value={data.newsletter.title} onChange={(v) => news({ title: v })} />
              <TextAreaField label="Subtitle" rows={2} value={data.newsletter.subtitle} onChange={(v) => news({ subtitle: v })} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField label="Button text" value={data.newsletter.buttonText} onChange={(v) => news({ buttonText: v })} />
                <TextField label="Small print" value={data.newsletter.disclaimer} onChange={(v) => news({ disclaimer: v })} />
              </div>
            </SectionCard>
          </>
        );
      }}
    </ContentPage>
  );
}
