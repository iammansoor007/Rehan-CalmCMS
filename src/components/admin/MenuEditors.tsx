"use client";

import React, { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import {
  FooterColumn,
  FooterSettings,
  MenuItem,
  NavigationSettings,
  SidebarSettings,
  TemplateSettings,
} from "@/types/cms";
import { ContentPage } from "./ContentPage";
import { useConfirm } from "./ConfirmDialog";
import { MenuAddPanel, MenuCard, MenuFrame, MenuStructure, newMenuId } from "./MenuBuilder";
import { inputCls, labelCls, secondaryBtnCls } from "./shared";
import {
  CategoryPicker,
  ImageField,
  LinkField,
  NumberField,
  SectionCard,
  TextAreaField,
  TextField,
  Toggle,
  sectionPatcher,
} from "./fields";

// ---------------------------------------------------------------------------
// Header menu (WordPress: Appearance → Menus)
// ---------------------------------------------------------------------------

export function NavigationEditor() {
  return (
    <ContentPage<NavigationSettings>
      contentKey="navigation"
      title="Menus — Header"
      description="Build the menu at the top of every page the WordPress way: add pages, posts, categories or custom links on the left, then drag them into order. Drag an item under another one (or use the arrows) to make a dropdown."
      viewHref="/"
      wide
    >
      {({ data, setData }) => {
        const cta = sectionPatcher(setData, "cta");
        const setItems = (items: MenuItem[]) => setData((d) => ({ ...d, items }));
        return (
          <MenuFrame panel={<MenuAddPanel onAdd={(added) => setData((d) => ({ ...d, items: [...d.items, ...added] }))} />}>
            <MenuCard
              title="Menu structure"
              help="Drag items by the handle to reorder. Use the arrows to move an item up/down or make it a sub-item (dropdown). Click an item's name to edit its label and link."
            >
              <MenuStructure items={data.items} onChange={setItems} maxDepth={2} />
            </MenuCard>

            <SectionCard title="Menu settings" description="Search icon and an optional call-to-action button" defaultOpen>
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
          </MenuFrame>
        );
      }}
    </ContentPage>
  );
}

// ---------------------------------------------------------------------------
// Footer menus
// ---------------------------------------------------------------------------

const MAX_FOOTER_COLUMNS = 5;

export function FooterEditor() {
  const confirm = useConfirm();
  const [target, setTarget] = useState("");

  return (
    <ContentPage<FooterSettings>
      contentKey="footer"
      title="Menus — Footer"
      description="The dark section at the bottom of every page. Each column is its own menu: add items from the left into the column you pick, then drag them into order. Social media links are set under Branding & Logo."
      viewHref="/"
      wide
    >
      {({ data, setData }) => {
        const set = (patch: Partial<FooterSettings>) => setData((d) => ({ ...d, ...patch }));
        const updateColumn = (id: string, patch: Partial<FooterColumn>) =>
          setData((d) => ({ ...d, columns: d.columns.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));
        const moveColumn = (index: number, by: number) =>
          setData((d) => {
            const columns = [...d.columns];
            const [col] = columns.splice(index, 1);
            columns.splice(index + by, 0, col);
            return { ...d, columns };
          });
        const addColumn = () =>
          setData((d) => ({
            ...d,
            columns: [...d.columns, { id: newMenuId(), title: "New column", items: [] }],
          }));
        const removeColumn = async (col: FooterColumn) => {
          const ok = await confirm({
            title: `Delete the “${col.title || "untitled"}” column?`,
            message: "The column and the links in it are removed from the footer once you save.",
            confirmLabel: "Delete column",
            danger: true,
          });
          if (ok) setData((d) => ({ ...d, columns: d.columns.filter((c) => c.id !== col.id) }));
        };

        const addTo = data.columns.some((c) => c.id === target) ? target : data.columns[0]?.id || "";
        const addItems = (added: MenuItem[]) =>
          setData((d) => {
            if (d.columns.length === 0) {
              return { ...d, columns: [{ id: newMenuId(), title: "Links", items: added }] };
            }
            const id = d.columns.some((c) => c.id === target) ? target : d.columns[0].id;
            return { ...d, columns: d.columns.map((c) => (c.id === id ? { ...c, items: [...c.items, ...added] } : c)) };
          });

        return (
          <MenuFrame
            panel={
              <MenuAddPanel
                onAdd={addItems}
                header={
                  <div>
                    <label className={labelCls}>Add items to column</label>
                    <select value={addTo} onChange={(e) => setTarget(e.target.value)} className={inputCls}>
                      {data.columns.length === 0 && <option value="">(a column is created for you)</option>}
                      {data.columns.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title || "Untitled column"}
                        </option>
                      ))}
                    </select>
                  </div>
                }
              />
            }
          >
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

            {data.columns.map((col, i) => (
              <MenuCard
                key={col.id}
                title={`Column ${i + 1}`}
                action={
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      type="button"
                      aria-label="Move column up"
                      title="Move column up"
                      disabled={i === 0}
                      onClick={() => moveColumn(i, -1)}
                      className="w-7 h-7 rounded flex items-center justify-center text-brand-muted hover:bg-brand-bgLight disabled:opacity-30"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Move column down"
                      title="Move column down"
                      disabled={i === data.columns.length - 1}
                      onClick={() => moveColumn(i, 1)}
                      className="w-7 h-7 rounded flex items-center justify-center text-brand-muted hover:bg-brand-bgLight disabled:opacity-30"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Delete column"
                      title="Delete column"
                      onClick={() => removeColumn(col)}
                      className="w-7 h-7 rounded flex items-center justify-center text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                }
              >
                <TextField label="Column heading" value={col.title} onChange={(v) => updateColumn(col.id, { title: v })} />
                <MenuStructure
                  items={col.items}
                  onChange={(items) => updateColumn(col.id, { items })}
                  maxDepth={0}
                  emptyText="No links in this column yet. Pick this column on the left, then add items."
                />
              </MenuCard>
            ))}

            <button
              type="button"
              onClick={addColumn}
              disabled={data.columns.length >= MAX_FOOTER_COLUMNS}
              className={`${secondaryBtnCls} w-full !py-3`}
            >
              <Plus className="w-4 h-4" />
              <span>
                {data.columns.length >= MAX_FOOTER_COLUMNS
                  ? `Up to ${MAX_FOOTER_COLUMNS} columns fit in the footer`
                  : "Add a column"}
              </span>
            </button>

            <SectionCard title="Badge & bottom bar" description="Pill under the last column and the copyright line">
              <TextField label="Badge text" value={data.badgeText} onChange={(v) => set({ badgeText: v })} hint="Empty hides the badge." />
              <TextField label="Left text" value={data.copyright} onChange={(v) => set({ copyright: v })} />
              <TextField label="Right text" value={data.bottomText} onChange={(v) => set({ bottomText: v })} hint="Empty hides it." />
            </SectionCard>
          </MenuFrame>
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
              title="Search box"
              description="Opens the site search"
              visible={data.showSearch}
              onVisibleChange={(v) => set({ showSearch: v })}
              defaultOpen
            >
              <TextField label="Placeholder text" value={data.searchPlaceholder} onChange={(v) => set({ searchPlaceholder: v })} />
            </SectionCard>

            <SectionCard
              title="Categories box"
              description="List of categories with post counts"
              visible={data.showTopics}
              onVisibleChange={(v) => set({ showTopics: v })}
              defaultOpen
            >
              <TextField label="Heading" value={data.topicsTitle} onChange={(v) => set({ topicsTitle: v })} />
              <Toggle label="Show post counts, e.g. (4)" checked={data.showTopicCounts} onChange={(v) => set({ showTopicCounts: v })} />
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
              title="Newsletter box"
              description="Green sign-up widget (subscribers appear under Leads)"
              visible={data.showNewsletter}
              onVisibleChange={(v) => set({ showNewsletter: v })}
              defaultOpen
            >
              <TextField label="Heading" value={data.newsletterTitle} onChange={(v) => set({ newsletterTitle: v })} />
              <TextAreaField label="Text" rows={2} value={data.newsletterText} onChange={(v) => set({ newsletterText: v })} />
              <TextField label="Button text" value={data.newsletterButtonText} onChange={(v) => set({ newsletterButtonText: v })} />
            </SectionCard>

            <SectionCard
              title="Free guide box"
              description="Beige promo widget with image and button"
              visible={data.showGuide}
              onVisibleChange={(v) => set({ showGuide: v })}
              defaultOpen
            >
              <TextField label="Small badge" value={data.guideBadge} onChange={(v) => set({ guideBadge: v })} />
              <TextField label="Heading" value={data.guideTitle} onChange={(v) => set({ guideTitle: v })} />
              <TextAreaField label="Text" rows={2} value={data.guideText} onChange={(v) => set({ guideText: v })} />
              <ImageField label="Image" value={data.guideImage} onChange={(url) => set({ guideImage: url })} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField label="Button text" value={data.guideButtonText} onChange={(v) => set({ guideButtonText: v })} />
                <LinkField label="Button link" value={data.guideButtonHref} onChange={(v) => set({ guideButtonHref: v })} />
              </div>
            </SectionCard>

            <SectionCard
              title="Message card"
              description="Small highlighted card (off by default)"
              visible={data.showCard}
              onVisibleChange={(v) => set({ showCard: v })}
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
