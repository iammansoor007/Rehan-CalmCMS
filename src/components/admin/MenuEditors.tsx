"use client";

import React from "react";
import { FooterSettings, NavItem, NavigationSettings, SidebarSettings, TemplateSettings } from "@/types/cms";
import { ContentPage } from "./ContentPage";
import {
  CategoryPicker,
  LinkField,
  ListEditor,
  NumberField,
  SectionCard,
  TextAreaField,
  TextField,
  Toggle,
  sectionPatcher,
} from "./fields";

/** Editor for a list of links: label, address, show/hide, open in new tab. */
function LinkList({
  items,
  onChange,
  addLabel = "Add a link",
}: {
  items: NavItem[];
  onChange: (items: NavItem[]) => void;
  addLabel?: string;
}) {
  return (
    <ListEditor
      items={items}
      onChange={onChange}
      newItem={() => ({ label: "", href: "", visible: true, newTab: false })}
      itemLabel="Link"
      addLabel={addLabel}
      summary={(i) => `${i.label}${i.visible === false ? " (hidden)" : ""}`}
      renderItem={(item, update) => (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TextField label="Text" value={item.label} onChange={(v) => update({ label: v })} />
            <LinkField label="Link" value={item.href} onChange={(v) => update({ href: v })} />
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            <Toggle label="Show on site" checked={item.visible !== false} onChange={(v) => update({ visible: v })} />
            <Toggle label="Open in new tab" checked={!!item.newTab} onChange={(v) => update({ newTab: v })} />
          </div>
        </>
      )}
    />
  );
}

// ---------------------------------------------------------------------------
// Header navigation
// ---------------------------------------------------------------------------

export function NavigationEditor() {
  return (
    <ContentPage<NavigationSettings>
      contentKey="navigation"
      title="Navigation Menu"
      description="The menu bar at the top of every page: link names and addresses, the categories dropdown, search and an optional button."
      viewHref="/"
    >
      {({ data, setData }) => {
        const menu = sectionPatcher(setData, "categoriesMenu");
        const cta = sectionPatcher(setData, "cta");
        return (
          <>
            <SectionCard title="Menu links" description="Shown after “Home” and the categories dropdown" defaultOpen>
              <TextField
                label="First link text (goes to the homepage)"
                value={data.homeLabel}
                onChange={(v) => setData((d) => ({ ...d, homeLabel: v }))}
              />
              <LinkList items={data.links} onChange={(links) => setData((d) => ({ ...d, links }))} />
              <p className="text-[11px] text-brand-muted">
                Tip: type “/” in the link box to pick from your pages, categories and posts.
              </p>
            </SectionCard>

            <SectionCard
              title="Categories dropdown"
              description="The menu that lists your categories"
              visible={data.categoriesMenu.visible}
              onVisibleChange={(v) => menu({ visible: v })}
              defaultOpen
            >
              <TextField label="Menu name" value={data.categoriesMenu.label} onChange={(v) => menu({ label: v })} />
              <CategoryPicker value={data.categoriesMenu.categorySlugs} onChange={(v) => menu({ categorySlugs: v })} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                <Toggle
                  label="Add an “all categories” link at the end"
                  checked={data.categoriesMenu.showAllLink}
                  onChange={(v) => menu({ showAllLink: v })}
                />
                <TextField label="“All” link text" value={data.categoriesMenu.allLabel} onChange={(v) => menu({ allLabel: v })} />
              </div>
            </SectionCard>

            <SectionCard title="Search & button" description="Search icon and an optional call-to-action button">
              <Toggle
                label="Show the search icon"
                checked={data.showSearch}
                onChange={(v) => setData((d) => ({ ...d, showSearch: v }))}
              />
              <Toggle label="Show a button in the header" checked={data.cta.visible} onChange={(v) => cta({ visible: v })} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField label="Button text" value={data.cta.text} onChange={(v) => cta({ text: v })} />
                <LinkField label="Button link" value={data.cta.href} onChange={(v) => cta({ href: v })} />
              </div>
            </SectionCard>
          </>
        );
      }}
    </ContentPage>
  );
}

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------

export function FooterEditor() {
  return (
    <ContentPage<FooterSettings>
      contentKey="footer"
      title="Footer"
      description="The dark section at the bottom of every page. Social media links are set under Branding & Logo."
      viewHref="/"
    >
      {({ data, setData }) => {
        const set = (patch: Partial<FooterSettings>) => setData((d) => ({ ...d, ...patch }));
        return (
          <>
            <SectionCard
              title="About text"
              description="Logo, description and social icons"
              visible={data.visible}
              onVisibleChange={(v) => set({ visible: v })}
              defaultOpen
            >
              <TextAreaField
                label="Description"
                rows={3}
                value={data.brandDescription}
                onChange={(v) => set({ brandDescription: v })}
                hint="Leave empty to use the site description from Branding."
              />
              <Toggle
                label="Show social media icons"
                hint="Only networks that have a link in Branding & Logo are shown."
                checked={data.showSocial}
                onChange={(v) => set({ showSocial: v })}
              />
            </SectionCard>

            <SectionCard title="First link column" description="Quick links" defaultOpen>
              <TextField label="Column heading" value={data.quickLinksTitle} onChange={(v) => set({ quickLinksTitle: v })} />
              <LinkList items={data.quickLinks} onChange={(quickLinks) => set({ quickLinks })} />
            </SectionCard>

            <SectionCard
              title="Categories column"
              description="List of category links"
              visible={data.showCategories}
              onVisibleChange={(v) => set({ showCategories: v })}
            >
              <TextField label="Column heading" value={data.categoriesTitle} onChange={(v) => set({ categoriesTitle: v })} />
              <CategoryPicker
                hint="Automatic shows the first six categories."
                value={data.categorySlugs}
                onChange={(categorySlugs) => set({ categorySlugs })}
              />
            </SectionCard>

            <SectionCard title="Information column" description="Legal links and badge">
              <TextField label="Column heading" value={data.legalTitle} onChange={(v) => set({ legalTitle: v })} />
              <LinkList items={data.legalLinks} onChange={(legalLinks) => set({ legalLinks })} />
              <TextField label="Badge text" value={data.badgeText} onChange={(v) => set({ badgeText: v })} hint="Empty hides the badge." />
            </SectionCard>

            <SectionCard title="Bottom bar" description="Copyright line">
              <TextField label="Left text" value={data.copyright} onChange={(v) => set({ copyright: v })} />
              <TextField label="Right text" value={data.bottomText} onChange={(v) => set({ bottomText: v })} hint="Empty hides it." />
            </SectionCard>
          </>
        );
      }}
    </ContentPage>
  );
}

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------

export function SidebarEditor() {
  return (
    <ContentPage<SidebarSettings>
      contentKey="sidebar"
      title="Sidebar"
      description="The column shown beside post lists on the homepage and on category pages."
      viewHref="/category/all"
    >
      {({ data, setData }) => {
        const set = (patch: Partial<SidebarSettings>) => setData((d) => ({ ...d, ...patch }));
        return (
          <>
            <SectionCard
              title="Topics box"
              description="Category chips"
              visible={data.showTopics}
              onVisibleChange={(v) => set({ showTopics: v })}
              defaultOpen
            >
              <TextField label="Heading" value={data.topicsTitle} onChange={(v) => set({ topicsTitle: v })} />
              <CategoryPicker value={data.topicCategorySlugs} onChange={(v) => set({ topicCategorySlugs: v })} />
            </SectionCard>

            <SectionCard
              title="Popular guides box"
              description="Newest posts with thumbnails"
              visible={data.showPopular}
              onVisibleChange={(v) => set({ showPopular: v })}
              defaultOpen
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField label="Heading" value={data.popularTitle} onChange={(v) => set({ popularTitle: v })} />
                <NumberField label="Number of posts" min={1} max={10} value={data.popularCount} onChange={(v) => set({ popularCount: v })} />
              </div>
            </SectionCard>

            <SectionCard
              title="Message card"
              description="Small highlighted card at the bottom"
              visible={data.showCard}
              onVisibleChange={(v) => set({ showCard: v })}
              defaultOpen
            >
              <TextField label="Heading" value={data.cardTitle} onChange={(v) => set({ cardTitle: v })} />
              <TextAreaField label="Text" rows={2} value={data.cardText} onChange={(v) => set({ cardText: v })} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField label="Link text" value={data.cardLinkText} onChange={(v) => set({ cardLinkText: v })} />
                <LinkField label="Link" value={data.cardLinkHref} onChange={(v) => set({ cardLinkHref: v })} />
              </div>
            </SectionCard>
          </>
        );
      }}
    </ContentPage>
  );
}

// ---------------------------------------------------------------------------
// Post & archive templates
// ---------------------------------------------------------------------------

export function TemplatesEditor() {
  return (
    <ContentPage<TemplateSettings>
      contentKey="templates"
      title="Post & Archive Layout"
      description="Extras shown on every post page, and the headings on category pages."
      viewHref="/category/all"
    >
      {({ data, setData }) => {
        const post = sectionPatcher(setData, "post");
        const archive = sectionPatcher(setData, "archive");
        const directory = sectionPatcher(setData, "directory");
        return (
          <>
            <SectionCard title="Post pages" description="What appears on each blog post" defaultOpen>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Toggle label="Reading time" checked={data.post.showReadingTime} onChange={(v) => post({ showReadingTime: v })} />
                <Toggle label="Share buttons" checked={data.post.showShare} onChange={(v) => post({ showShare: v })} />
                <Toggle label="Previous / next post" checked={data.post.showPrevNext} onChange={(v) => post({ showPrevNext: v })} />
              </div>

              <div className="pt-3 border-t border-brand-borderLight space-y-4">
                <Toggle label="Call-to-action banner after the post" checked={data.post.showCta} onChange={(v) => post({ showCta: v })} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <TextField label="Banner heading" value={data.post.ctaTitle} onChange={(v) => post({ ctaTitle: v })} />
                  <TextField label="Banner text" value={data.post.ctaText} onChange={(v) => post({ ctaText: v })} />
                  <TextField label="Button text" value={data.post.ctaButtonText} onChange={(v) => post({ ctaButtonText: v })} />
                  <LinkField label="Button link" value={data.post.ctaButtonHref} onChange={(v) => post({ ctaButtonHref: v })} />
                </div>
              </div>

              <div className="pt-3 border-t border-brand-borderLight space-y-4">
                <Toggle label="Author box" checked={data.post.showAuthorBox} onChange={(v) => post({ showAuthorBox: v })} />
                <TextField label="Author box label" value={data.post.authorBoxLabel} onChange={(v) => post({ authorBoxLabel: v })} />
                <TextAreaField label="Author bio (same for every post)" value={data.post.authorBio} onChange={(v) => post({ authorBio: v })} />
              </div>
            </SectionCard>

            <SectionCard title="Category pages" description="Header and empty-state text on each category page" defaultOpen>
              <TextField label="Badge" value={data.archive.badge} onChange={(v) => archive({ badge: v })} />
              <Toggle label="Show “Showing N guides”" checked={data.archive.showCount} onChange={(v) => archive({ showCount: v })} />
              <TextField label="Empty category heading" value={data.archive.emptyTitle} onChange={(v) => archive({ emptyTitle: v })} />
              <TextField label="Empty category text" value={data.archive.emptyText} onChange={(v) => archive({ emptyText: v })} />
            </SectionCard>

            <SectionCard title="All categories page" description="The /category directory page">
              <TextField label="Badge" value={data.directory.badge} onChange={(v) => directory({ badge: v })} />
              <TextField label="Title" value={data.directory.title} onChange={(v) => directory({ title: v })} />
              <TextAreaField label="Intro text" rows={2} value={data.directory.subtitle} onChange={(v) => directory({ subtitle: v })} />
            </SectionCard>
          </>
        );
      }}
    </ContentPage>
  );
}
