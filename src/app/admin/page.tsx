"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Article,
  SiteConfig,
  Category,
  CmsPage,
  CmsUser,
  HomepageContent,
  MediaItem,
  Subscriber,
  Inquiry,
} from "@/types/cms";
import { useToast } from "@/components/layout/Toast";
import {
  LayoutDashboard,
  FileText,
  Image as ImageIcon,
  File as FileIcon,
  Palette,
  Home,
  Info,
  Mail,
  Menu as MenuIcon,
  PanelBottom,
  PanelRight,
  LayoutTemplate,
  SearchCheck,
  CornerUpRight,
  Plus,
  Trash2,
  Save,
  ExternalLink,
  LogOut,
  Upload,
  Lock,
  RefreshCw,
  Sparkles,
  Users,
  UserCog,
  MessageSquare,
  ChevronDown,
} from "lucide-react";
import { Capability, Role, can, roleLabel } from "@/lib/permissions";
import { api } from "@/components/admin/shared";
import { PostsList } from "@/components/admin/PostsList";
import { PostEditor } from "@/components/admin/PostEditor";
import { CategoriesSection } from "@/components/admin/CategoriesSection";
import { MediaSection } from "@/components/admin/MediaSection";
import { PagesList, PageEditor } from "@/components/admin/PagesSection";
import { UsersSection } from "@/components/admin/UsersSection";
import { HomepageEditor } from "@/components/admin/HomepageEditor";
import { AboutEditor } from "@/components/admin/AboutEditor";
import { ContactEditor } from "@/components/admin/ContactEditor";
import { NavigationEditor, FooterEditor, SidebarEditor, TemplatesEditor } from "@/components/admin/MenuEditors";
import { AdminEnvContext, LinkSuggestion } from "@/components/admin/AdminEnv";
import { SeoSettingsEditor, RedirectsEditor } from "@/components/admin/SeoSettingsEditor";
import { ProfileSection } from "@/components/admin/ProfileSection";

type Section =
  | "dashboard"
  | "posts"
  | "post-editor"
  | "categories"
  | "media"
  | "pages"
  | "page-editor"
  | "users"
  | "profile"
  | "subscribers"
  | "inquiries"
  | "homepage"
  | "about"
  | "contact"
  | "navigation"
  | "footer"
  | "sidebar"
  | "templates"
  | "seo"
  | "redirects"
  | "branding";

interface Me {
  username: string;
  displayName: string;
  email: string;
  role: Role;
  capabilities: Capability[];
}

type CategoryRow = Category & { count?: number };

export default function AdminPage() {
  // Auth state
  const [me, setMe] = useState<Me | null>(null);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(true);
  const [loginBusy, setLoginBusy] = useState(false);

  // Nav state
  const [currentSection, setCurrentSection] = useState<Section>("dashboard");

  // Data state
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [users, setUsers] = useState<CmsUser[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [homepage, setHomepage] = useState<HomepageContent | null>(null);

  // Editors
  const [editorArticle, setEditorArticle] = useState<Article | null>(null);
  const [editorPage, setEditorPage] = useState<CmsPage | null>(null);
  const [editorKey, setEditorKey] = useState(0);
  const [mediaUploadRequest, setMediaUploadRequest] = useState(0);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const { showToast } = useToast();
  const logoInputRef = useRef<HTMLInputElement>(null);

  const allow = (cap: Capability) => !!me && can(me.role, cap);

  // 1. Check auth on mount, and log out if any request reports an expired session
  useEffect(() => {
    checkAuth();
    const onUnauthorized = () => {
      setMe((current) => {
        if (current) showToast("Your session has expired. Please log in again.");
        return null;
      });
    };
    window.addEventListener("cms:unauthorized", onUnauthorized);
    return () => window.removeEventListener("cms:unauthorized", onUnauthorized);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/admin/auth");
      const data = await res.json();
      if (data.authenticated) {
        setMe(data.user);
        loadAllData(data.user.role);
      }
    } catch {
      setMe(null);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginBusy(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        setMe(data.user);
        setLoginPassword("");
        setCurrentSection("dashboard");
        showToast(`Welcome back, ${data.user.displayName}!`);
        loadAllData(data.user.role);
      } else {
        showToast(data.error || "Invalid credentials. Please verify your login details.");
      }
    } catch {
      showToast("Authentication server error");
    } finally {
      setLoginBusy(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    setMe(null);
    showToast("Logged out from Admin");
  };

  // 2. Load CMS data (only what the signed-in role may see)
  const loadAllData = async (role: Role | undefined = me?.role) => {
    if (!role) return;
    const skip = Promise.resolve(null);
    const [arts, cats, site, media, pgs, usrs, subs, inqs] = await Promise.all([
      api<Article[]>("/api/admin/articles"),
      api<CategoryRow[]>("/api/admin/categories"),
      api<{ siteConfig: SiteConfig; homepage: HomepageContent }>("/api/admin/site"),
      api<MediaItem[]>("/api/admin/media"),
      can(role, "manage_pages") ? api<CmsPage[]>("/api/admin/pages") : skip,
      can(role, "manage_users") ? api<CmsUser[]>("/api/admin/users") : skip,
      can(role, "view_leads") ? api<Subscriber[]>("/api/admin/subscribers") : skip,
      can(role, "view_leads") ? api<Inquiry[]>("/api/admin/inquiries") : skip,
    ]);

    if (arts.data) setArticles(arts.data);
    if (cats.data) setCategories(cats.data);
    if (site.data) {
      setSiteConfig(site.data.siteConfig || null);
      setHomepage(site.data.homepage || null);
    }
    if (media.data) setMediaList(media.data);
    if (pgs?.data) setPages(pgs.data);
    if (usrs?.data) setUsers(usrs.data);
    if (subs?.data) setSubscribers(subs.data);
    if (inqs?.data) setInquiries(inqs.data);

    if (!arts.ok && !cats.ok && arts.status !== 401) showToast("Error loading CMS data");
  };

  const reloadMedia = async () => {
    const res = await api<MediaItem[]>("/api/admin/media");
    if (res.data) setMediaList(res.data);
  };

  // 3. Navigation helpers
  const openPostEditor = (article: Article | null) => {
    setEditorArticle(article);
    setEditorKey((k) => k + 1);
    setCurrentSection("post-editor");
  };

  const openPageEditor = (page: CmsPage | null) => {
    setEditorPage(page);
    setEditorKey((k) => k + 1);
    setCurrentSection("page-editor");
  };

  const goToMediaUpload = () => {
    setCurrentSection("media");
    setMediaUploadRequest((n) => n + 1);
  };

  // 4. Where each image is used (shown before deleting media)
  const mediaUsage = (url: string): string[] => [
    ...articles
      .filter((a) => a.img === url || a.seo?.ogImage === url || a.seo?.twitterImage === url || a.ogImage === url || (a.content || "").includes(url))
      .map((a) => `Post “${a.title}”`),
    ...pages
      .filter((p) => p.img === url || p.content.includes(url))
      .map((p) => `Page “${p.title}”`),
    ...(homepage?.hero.image === url ? ["Homepage hero"] : []),
    ...(siteConfig?.logoUrl === url ? ["Site logo"] : []),
  ];

  // 5. Logo upload
  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>, target: "logo") => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    if (target === "logo") setUploadingLogo(true);

    const res = await api<{ url: string }>("/api/admin/upload", { method: "POST", body: formData });
    setUploadingLogo(false);

    if (res.ok && res.data?.url) {
      showToast("Image uploaded successfully!");
      if (target === "logo" && siteConfig) setSiteConfig({ ...siteConfig, logoUrl: res.data.url });
      reloadMedia();
    } else {
      showToast(res.error || "Image upload failed");
    }
  };

  // 6. Delete subscriber & inquiry
  const handleDeleteSubscriber = async (id?: string) => {
    if (!id) return;
    const res = await api(`/api/admin/subscribers?id=${id}`, { method: "DELETE" });
    showToast(res.ok ? "Subscriber deleted" : res.error);
    if (res.ok) loadAllData();
  };

  const handleDeleteInquiry = async (id?: string) => {
    if (!id) return;
    const res = await api(`/api/admin/inquiries?id=${id}`, { method: "DELETE" });
    showToast(res.ok ? "Inquiry deleted" : res.error);
    if (res.ok) loadAllData();
  };

  // 7. Save branding
  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteConfig) return;
    const res = await api("/api/admin/site", {
      method: "POST",
      body: JSON.stringify({ siteConfig }),
    });
    if (res.ok) {
      showToast("Branding and logo settings saved!");
      loadAllData();
    } else {
      showToast(res.error);
    }
  };

  // Render: loading / login gate
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#1D2327] flex items-center justify-center text-white">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-primary" />
          <span className="text-sm font-medium">Checking admin session...</span>
        </div>
      </div>
    );
  }

  if (!me) {
    return (
      <div className="min-h-screen bg-[#1D2327] flex flex-col justify-center items-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-full bg-primary/20 border-2 border-primary mx-auto flex items-center justify-center text-primary mb-3">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.4 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>
              </svg>
            </div>
            <h1 className="text-2xl font-heading font-bold text-white tracking-tight">
              CalmTouch CMS
            </h1>
            <p className="text-xs text-white/60 mt-1">WordPress-Style Administration Panel</p>
          </div>

          <form
            onSubmit={handleLogin}
            className="bg-white rounded-xl shadow-2xl p-7 space-y-5 border border-white/10"
          >
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-1.5">
                Username
              </label>
              <input
                type="text"
                required
                autoComplete="username"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-brand-border text-sm text-brand-dark focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-brand-border text-sm text-brand-dark focus:outline-none focus:border-primary"
              />
            </div>

            <button
              type="submit"
              disabled={loginBusy}
              className="w-full py-3 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-semibold shadow transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Lock className="w-4 h-4" />
              <span>{loginBusy ? "Logging in…" : "Log In to Dashboard"}</span>
            </button>
          </form>

          <div className="text-center mt-6">
            <Link href="/" className="text-xs text-white/50 hover:text-white transition-colors">
              ← Return to CalmTouch live site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Internal addresses offered in every "link" field
  const linkSuggestions: LinkSuggestion[] = [
    { label: "Homepage", href: "/" },
    { label: "About page", href: "/about" },
    { label: "Contact page", href: "/contact" },
    { label: "All posts", href: "/category/all" },
    { label: "All categories", href: "/category" },
    { label: "Homepage: featured guide banner", href: "/#guide" },
    { label: "Homepage: newsletter", href: "/#newsletter" },
    ...categories
      .filter((c) => c.slug !== "all")
      .map((c) => ({ label: `Category: ${c.name}`, href: `/category/${c.slug}` })),
    ...pages.map((p) => ({ label: `Page: ${p.title}`, href: `/${p.slug}` })),
    ...articles
      .slice(0, 40)
      .map((a) => ({ label: `Post: ${a.title}`, href: `/blog/${a.slug}` })),
  ];

  const isPostGroup =
    currentSection === "posts" || currentSection === "post-editor" || currentSection === "categories";
  const isPageGroup = currentSection === "pages" || currentSection === "page-editor";

  return (
    <AdminEnvContext.Provider
      value={{
        media: mediaList,
        canUpload: allow("upload_files"),
        onMediaChanged: reloadMedia,
        categories,
        linkSuggestions,
      }}
    >
    <div className="min-h-screen bg-[#F0F0F1] flex flex-col font-sans">
      {/* 1. WordPress-style top admin bar */}
      <div className="h-10 bg-[#1D2327] text-[#C3C4C7] px-2 sm:px-4 flex items-center justify-between text-xs z-30 flex-shrink-0">
        <div className="flex items-center h-full">
          <button
            onClick={() => setCurrentSection("dashboard")}
            className="h-full px-2.5 flex items-center gap-1.5 font-heading font-bold text-white hover:bg-[#2C3338]"
            title="Dashboard"
          >
            <span className="w-4 h-4 rounded-full bg-primary flex items-center justify-center text-[10px] text-white font-bold">
              C
            </span>
          </button>

          <Link
            href="/"
            target="_blank"
            className="h-full px-3 flex items-center gap-1.5 hover:bg-[#2C3338] hover:text-[#72AEE6] transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline max-w-[160px] truncate">
              {siteConfig?.brandName || "Visit Site"}
            </span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </Link>

          {/* + New dropdown */}
          <div className="relative group h-full">
            <button className="h-full px-3 flex items-center gap-1.5 hover:bg-[#2C3338] group-hover:bg-[#2C3338] group-hover:text-[#72AEE6] transition-colors focus:outline-none">
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
            <div className="absolute left-0 top-full min-w-[160px] bg-[#2C3338] shadow-xl py-1 hidden group-hover:block group-focus-within:block">
              <button
                onClick={() => openPostEditor(null)}
                className="w-full text-left px-4 py-2 hover:text-[#72AEE6] hover:bg-[#1D2327] flex items-center gap-2"
              >
                <FileText className="w-3.5 h-3.5" /> Post
              </button>
              {allow("manage_pages") && (
                <button
                  onClick={() => openPageEditor(null)}
                  className="w-full text-left px-4 py-2 hover:text-[#72AEE6] hover:bg-[#1D2327] flex items-center gap-2"
                >
                  <FileIcon className="w-3.5 h-3.5" /> Page
                </button>
              )}
              {allow("upload_files") && (
                <button
                  onClick={goToMediaUpload}
                  className="w-full text-left px-4 py-2 hover:text-[#72AEE6] hover:bg-[#1D2327] flex items-center gap-2"
                >
                  <ImageIcon className="w-3.5 h-3.5" /> Media
                </button>
              )}
              {allow("manage_users") && (
                <button
                  onClick={() => setCurrentSection("users")}
                  className="w-full text-left px-4 py-2 hover:text-[#72AEE6] hover:bg-[#1D2327] flex items-center gap-2"
                >
                  <Users className="w-3.5 h-3.5" /> User
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Howdy dropdown */}
        <div className="relative group h-full">
          <button className="h-full px-3 flex items-center gap-2 hover:bg-[#2C3338] group-hover:bg-[#2C3338] transition-colors focus:outline-none">
            <span className="hidden sm:inline">
              Howdy, <strong className="text-white">{me.displayName}</strong>
            </span>
            <span className="w-6 h-6 rounded-full bg-primary text-white font-bold text-[11px] flex items-center justify-center">
              {me.displayName.charAt(0).toUpperCase()}
            </span>
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>
          <div className="absolute right-0 top-full min-w-[200px] bg-[#2C3338] shadow-xl py-1 hidden group-hover:block group-focus-within:block">
            <div className="px-4 py-2.5 border-b border-white/10">
              <span className="block text-white font-semibold">{me.displayName}</span>
              <span className="block text-[11px] text-[#8C8F94]">
                @{me.username} · {roleLabel(me.role)}
              </span>
            </div>
            <button
              onClick={() => setCurrentSection("profile")}
              className="w-full text-left px-4 py-2 hover:text-[#72AEE6] hover:bg-[#1D2327] flex items-center gap-2"
            >
              <UserCog className="w-3.5 h-3.5" /> Edit My Profile
            </button>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 hover:text-[#72AEE6] hover:bg-[#1D2327] flex items-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" /> Log Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Admin Body: Sidebar + Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* 2. Left navigation sidebar */}
        <aside className="w-56 lg:w-60 bg-[#1D2327] flex-shrink-0 flex flex-col justify-between overflow-y-auto">
          <nav className="py-3">
            <SideItem
              icon={<LayoutDashboard className="w-4 h-4" />}
              label="Dashboard"
              active={currentSection === "dashboard"}
              onClick={() => setCurrentSection("dashboard")}
            />

            <SideItem
              icon={<FileText className="w-4 h-4" />}
              label="Posts"
              badge={articles.length}
              active={isPostGroup}
              onClick={() => setCurrentSection("posts")}
            />
            {isPostGroup && (
              <SideSub>
                <SideSubLink
                  label="All Posts"
                  active={currentSection === "posts"}
                  onClick={() => setCurrentSection("posts")}
                />
                <SideSubLink
                  label="Add New"
                  active={currentSection === "post-editor" && !editorArticle}
                  onClick={() => openPostEditor(null)}
                />
                {allow("manage_categories") && (
                  <SideSubLink
                    label="Categories"
                    active={currentSection === "categories"}
                    onClick={() => setCurrentSection("categories")}
                  />
                )}
              </SideSub>
            )}

            <SideItem
              icon={<ImageIcon className="w-4 h-4" />}
              label="Media"
              active={currentSection === "media"}
              onClick={() => setCurrentSection("media")}
            />

            {allow("manage_pages") && (
              <>
                <SideItem
                  icon={<FileIcon className="w-4 h-4" />}
                  label="Pages"
                  badge={pages.length}
                  active={isPageGroup}
                  onClick={() => setCurrentSection("pages")}
                />
                {isPageGroup && (
                  <SideSub>
                    <SideSubLink
                      label="All Pages"
                      active={currentSection === "pages"}
                      onClick={() => setCurrentSection("pages")}
                    />
                    <SideSubLink
                      label="Add New"
                      active={currentSection === "page-editor" && !editorPage}
                      onClick={() => openPageEditor(null)}
                    />
                  </SideSub>
                )}
              </>
            )}

            {allow("view_leads") && (
              <>
                <SideHeading>Engagement & Leads</SideHeading>
                <SideItem
                  icon={<Users className="w-4 h-4" />}
                  label="Subscribers"
                  badge={subscribers.length}
                  active={currentSection === "subscribers"}
                  onClick={() => setCurrentSection("subscribers")}
                />
                <SideItem
                  icon={<MessageSquare className="w-4 h-4" />}
                  label="Contact Messages"
                  badge={inquiries.length}
                  active={currentSection === "inquiries"}
                  onClick={() => setCurrentSection("inquiries")}
                />
              </>
            )}

            {allow("manage_settings") && (
              <>
                <SideHeading>Site Content</SideHeading>
                <SideItem
                  icon={<Home className="w-4 h-4" />}
                  label="Homepage"
                  active={currentSection === "homepage"}
                  onClick={() => setCurrentSection("homepage")}
                />
                <SideItem
                  icon={<Info className="w-4 h-4" />}
                  label="About Page"
                  active={currentSection === "about"}
                  onClick={() => setCurrentSection("about")}
                />
                <SideItem
                  icon={<Mail className="w-4 h-4" />}
                  label="Contact Page"
                  active={currentSection === "contact"}
                  onClick={() => setCurrentSection("contact")}
                />

                <SideHeading>Appearance</SideHeading>
                <SideItem
                  icon={<MenuIcon className="w-4 h-4" />}
                  label="Navigation Menu"
                  active={currentSection === "navigation"}
                  onClick={() => setCurrentSection("navigation")}
                />
                <SideItem
                  icon={<PanelBottom className="w-4 h-4" />}
                  label="Footer"
                  active={currentSection === "footer"}
                  onClick={() => setCurrentSection("footer")}
                />
                <SideItem
                  icon={<PanelRight className="w-4 h-4" />}
                  label="Sidebar"
                  active={currentSection === "sidebar"}
                  onClick={() => setCurrentSection("sidebar")}
                />
                <SideItem
                  icon={<LayoutTemplate className="w-4 h-4" />}
                  label="Post & Archive Layout"
                  active={currentSection === "templates"}
                  onClick={() => setCurrentSection("templates")}
                />
                <SideItem
                  icon={<Palette className="w-4 h-4" />}
                  label="Branding & Logo"
                  active={currentSection === "branding"}
                  onClick={() => setCurrentSection("branding")}
                />
              </>
            )}

            {allow("manage_settings") && (
              <>
                <SideHeading>SEO</SideHeading>
                <SideItem
                  icon={<SearchCheck className="w-4 h-4" />}
                  label="SEO Settings"
                  active={currentSection === "seo"}
                  onClick={() => setCurrentSection("seo")}
                />
                <SideItem
                  icon={<CornerUpRight className="w-4 h-4" />}
                  label="Redirects"
                  active={currentSection === "redirects"}
                  onClick={() => setCurrentSection("redirects")}
                />
              </>
            )}

            {allow("manage_users") && (
              <>
                <SideHeading>Administration</SideHeading>
                <SideItem
                  icon={<UserCog className="w-4 h-4" />}
                  label="Users"
                  badge={users.length}
                  active={currentSection === "users"}
                  onClick={() => setCurrentSection("users")}
                />
              </>
            )}
          </nav>

          <div className="p-4 border-t border-white/10 text-[11px] text-[#8C8F94]">
            CalmTouch CMS Engine
            <div className="text-[10px] text-primary mt-0.5 font-medium">{roleLabel(me.role)} access</div>
          </div>
        </aside>

        {/* 3. Main workspace */}
        <div id="admin-main" className="flex-1 overflow-y-auto p-5 sm:p-8">
          {/* SECTION: DASHBOARD */}
          {currentSection === "dashboard" && (
            <div className="space-y-6 max-w-6xl">
              <div>
                <h1 className="font-heading font-bold text-2xl text-brand-dark mb-1">Dashboard</h1>
                <p className="text-xs text-brand-muted">
                  Welcome back, {me.displayName}. Here&apos;s what&apos;s happening on your site.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  label="Published Posts"
                  value={articles.filter((a) => (a.status || "published") === "published").length}
                  accent="text-primary"
                  action="Manage Posts →"
                  onAction={() => setCurrentSection("posts")}
                />
                <StatCard
                  label="Drafts & Scheduled"
                  value={articles.filter((a) => a.status === "draft" || a.status === "scheduled").length}
                  action="Review →"
                  onAction={() => setCurrentSection("posts")}
                />
                {allow("manage_categories") && (
                  <StatCard
                    label="Categories"
                    value={categories.length}
                    action="Manage Categories →"
                    onAction={() => setCurrentSection("categories")}
                  />
                )}
                {allow("view_leads") && (
                  <StatCard
                    label="Subscribers"
                    value={subscribers.length}
                    action="View Subscribers →"
                    onAction={() => setCurrentSection("subscribers")}
                  />
                )}
                {allow("view_leads") && (
                  <StatCard
                    label="Inquiries"
                    value={inquiries.length}
                    accent="text-emerald-600"
                    action="View Messages →"
                    onAction={() => setCurrentSection("inquiries")}
                  />
                )}
                {allow("manage_pages") && (
                  <StatCard
                    label="Pages"
                    value={pages.length}
                    action="Manage Pages →"
                    onAction={() => setCurrentSection("pages")}
                  />
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 bg-white rounded-xl border border-[#DCDCDE] shadow-sm p-6 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-brand-borderLight">
                    <h3 className="font-heading font-semibold text-base text-brand-dark">Recent Posts</h3>
                    <button
                      onClick={() => openPostEditor(null)}
                      className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>New Post</span>
                    </button>
                  </div>

                  <div className="divide-y divide-brand-borderLight">
                    {articles.length === 0 && (
                      <p className="py-6 text-center text-xs text-brand-muted">No posts yet.</p>
                    )}
                    {articles.slice(0, 5).map((art) => (
                      <div key={art.slug} className="py-3 flex items-center justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-sm text-brand-dark truncate">{art.title}</h4>
                          <span className="text-xs text-brand-muted">
                            <strong className="text-primary">{art.category}</strong> • {art.date}
                            {art.status && art.status !== "published" && (
                              <span className="ml-1.5 uppercase font-bold text-[10px] text-amber-700">
                                {art.status}
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => openPostEditor(art)}
                            className="text-xs font-semibold text-primary hover:underline"
                          >
                            Edit
                          </button>
                          <Link
                            href={`/blog/${art.slug}`}
                            target="_blank"
                            className="text-xs text-brand-muted hover:text-brand-dark"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-4 bg-white rounded-xl border border-[#DCDCDE] shadow-sm p-6 space-y-4">
                  <h3 className="font-heading font-semibold text-base text-brand-dark pb-3 border-b border-brand-borderLight">
                    Quick Shortcuts
                  </h3>
                  <div className="space-y-2">
                    {allow("manage_settings") && (
                      <Shortcut label="Edit Homepage Hero" onClick={() => setCurrentSection("homepage")} />
                    )}
                    {allow("manage_settings") && (
                      <Shortcut label="Change Brand Logo / Name" onClick={() => setCurrentSection("branding")} />
                    )}
                    {allow("manage_categories") && (
                      <Shortcut label="Create New Category" onClick={() => setCurrentSection("categories")} />
                    )}
                    {allow("manage_pages") && (
                      <Shortcut label="Add a Page" onClick={() => openPageEditor(null)} />
                    )}
                    <Shortcut label="Open Media Library" onClick={() => setCurrentSection("media")} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: POSTS */}
          {currentSection === "posts" && (
            <PostsList
              articles={articles}
              me={me}
              onNew={() => openPostEditor(null)}
              onEdit={openPostEditor}
              onChanged={() => loadAllData()}
            />
          )}

          {currentSection === "post-editor" && (
            <PostEditor
              key={editorKey}
              initial={editorArticle}
              categories={categories}
              media={mediaList}
              me={me}
              onSaved={async () => {
                await loadAllData();
                setCurrentSection("posts");
              }}
              onCancel={() => setCurrentSection("posts")}
              onMediaChanged={reloadMedia}
            />
          )}

          {/* SECTION: CATEGORIES */}
          {currentSection === "categories" && allow("manage_categories") && (
            <CategoriesSection categories={categories} onChanged={() => loadAllData()} />
          )}

          {/* SECTION: MEDIA */}
          {currentSection === "media" && (
            <MediaSection
              items={mediaList}
              role={me.role}
              usedIn={mediaUsage}
              onChanged={reloadMedia}
              uploadRequest={mediaUploadRequest}
            />
          )}

          {/* SECTION: PAGES */}
          {currentSection === "pages" && allow("manage_pages") && (
            <PagesList
              pages={pages}
              onNew={() => openPageEditor(null)}
              onEdit={openPageEditor}
              onChanged={() => loadAllData()}
            />
          )}

          {currentSection === "page-editor" && allow("manage_pages") && (
            <PageEditor
              key={editorKey}
              initial={editorPage}
              media={mediaList}
              me={me}
              onSaved={async () => {
                await loadAllData();
                setCurrentSection("pages");
              }}
              onCancel={() => setCurrentSection("pages")}
              onMediaChanged={reloadMedia}
            />
          )}

          {/* SECTION: USERS & PROFILE */}
          {currentSection === "users" && allow("manage_users") && (
            <UsersSection users={users} meUsername={me.username} onChanged={() => loadAllData()} />
          )}

          {currentSection === "profile" && (
            <ProfileSection
              me={me}
              onSaved={async () => {
                const res = await api<{ authenticated: boolean; user: Me }>("/api/admin/auth");
                if (res.data?.user) setMe(res.data.user);
              }}
            />
          )}

          {/* SECTION: SITE CONTENT EDITORS */}
          {currentSection === "homepage" && allow("manage_settings") && <HomepageEditor />}
          {currentSection === "about" && allow("manage_settings") && <AboutEditor />}
          {currentSection === "contact" && allow("manage_settings") && <ContactEditor />}
          {currentSection === "navigation" && allow("manage_settings") && <NavigationEditor />}
          {currentSection === "footer" && allow("manage_settings") && <FooterEditor />}
          {currentSection === "sidebar" && allow("manage_settings") && <SidebarEditor />}
          {currentSection === "templates" && allow("manage_settings") && <TemplatesEditor />}
          {currentSection === "seo" && allow("manage_settings") && <SeoSettingsEditor />}
          {currentSection === "redirects" && allow("manage_settings") && <RedirectsEditor />}

          {/* SECTION: SUBSCRIBERS */}
          {currentSection === "subscribers" && allow("view_leads") && (
            <div className="space-y-6 max-w-5xl">
              <div>
                <h1 className="font-heading font-bold text-2xl text-brand-dark mb-1">
                  Newsletter Subscribers
                </h1>
                <p className="text-xs text-brand-muted">
                  Email addresses submitted via the homepage newsletter subscription box.
                </p>
              </div>

              <div className="bg-white rounded-xl border border-[#DCDCDE] shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-brand-bgSoft border-b border-[#DCDCDE] text-brand-dark font-bold">
                      <th className="p-3.5">Email Address</th>
                      <th className="p-3.5">Date Subscribed</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-borderLight">
                    {subscribers.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-8 text-center text-brand-muted">
                          No subscribers recorded yet.
                        </td>
                      </tr>
                    ) : (
                      subscribers.map((s) => (
                        <tr key={s._id || s.email} className="hover:bg-brand-bgSoft/60 transition-colors">
                          <td className="p-3.5 font-semibold text-brand-dark">{s.email}</td>
                          <td className="p-3.5 text-brand-muted">
                            {new Date(s.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => handleDeleteSubscriber(s._id)}
                              className="p-1.5 rounded text-brand-muted hover:text-red-600"
                              title="Delete Subscriber"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION: CONTACT INQUIRIES */}
          {currentSection === "inquiries" && allow("view_leads") && (
            <div className="space-y-6 max-w-5xl">
              <div>
                <h1 className="font-heading font-bold text-2xl text-brand-dark mb-1">
                  Contact Inquiries & Messages
                </h1>
                <p className="text-xs text-brand-muted">
                  Messages received from visitors through the Contact page form.
                </p>
              </div>

              <div className="space-y-4">
                {inquiries.length === 0 ? (
                  <div className="p-12 rounded-xl bg-white border border-[#DCDCDE] text-center text-brand-muted text-sm">
                    No contact messages received yet.
                  </div>
                ) : (
                  inquiries.map((inq) => (
                    <div
                      key={inq._id}
                      className="p-6 rounded-xl bg-white border border-[#DCDCDE] shadow-sm space-y-3"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-brand-borderLight">
                        <div>
                          <span className="text-xs font-bold text-primary block">
                            [{inq.subject}]
                          </span>
                          <h4 className="font-heading font-semibold text-sm text-brand-dark">
                            From: {inq.name} ({inq.email})
                          </h4>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-brand-muted">
                            {new Date(inq.createdAt).toLocaleDateString()}
                          </span>
                          <button
                            onClick={() => handleDeleteInquiry(inq._id)}
                            className="p-1 rounded text-brand-muted hover:text-red-600"
                            title="Delete Message"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-brand-dark whitespace-pre-wrap leading-relaxed">
                        {inq.message}
                      </p>
                      <div className="pt-2">
                        <a
                          href={`mailto:${inq.email}?subject=Re: [${inq.subject}] CalmTouch Inquiry`}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                        >
                          Reply via Email →
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* SECTION: BRANDING & LOGO */}
          {currentSection === "branding" && allow("manage_settings") && siteConfig && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h1 className="font-heading font-bold text-2xl text-brand-dark mb-1">
                  Branding & Logo Customizer
                </h1>
                <p className="text-xs text-brand-muted">
                  Update your site emblem/logo, site title, tagline, and contact info.
                </p>
              </div>

              <form onSubmit={handleSaveBranding} className="space-y-6">
                <div className="bg-white p-6 rounded-xl border border-[#DCDCDE] shadow-sm space-y-4">
                  <h3 className="font-heading font-bold text-sm text-brand-dark pb-2 border-b border-brand-borderLight">
                    Site Logo
                  </h3>

                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="w-20 h-20 rounded-full border-2 border-brand-border overflow-hidden bg-brand-bgLight flex items-center justify-center flex-shrink-0">
                      {siteConfig.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={siteConfig.logoUrl}
                          alt="Brand Logo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary">
                          <Sparkles className="w-8 h-8" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 flex-1">
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleUploadImage(e, "logo")}
                      />

                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          disabled={uploadingLogo}
                          onClick={() => logoInputRef.current?.click()}
                          className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{uploadingLogo ? "Uploading Logo..." : "Upload Logo Image"}</span>
                        </button>

                        {siteConfig.logoUrl && (
                          <button
                            type="button"
                            onClick={() => setSiteConfig({ ...siteConfig, logoUrl: "" })}
                            className="px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors"
                          >
                            Remove Logo (Use Default SVG)
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-brand-muted">
                        Recommended size: 200x200px PNG or SVG.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-[#DCDCDE] shadow-sm space-y-4">
                  <h3 className="font-heading font-bold text-sm text-brand-dark pb-2 border-b border-brand-borderLight">
                    Site Identity & Global Meta
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-1">
                        Site Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={siteConfig.brandName}
                        onChange={(e) =>
                          setSiteConfig({ ...siteConfig, brandName: e.target.value })
                        }
                        className="w-full px-3.5 py-2 rounded-lg border border-brand-border text-xs text-brand-dark focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-1">
                        Tagline
                      </label>
                      <input
                        type="text"
                        value={siteConfig.tagline}
                        onChange={(e) =>
                          setSiteConfig({ ...siteConfig, tagline: e.target.value })
                        }
                        className="w-full px-3.5 py-2 rounded-lg border border-brand-border text-xs text-brand-dark focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-1">
                      Support Email
                    </label>
                    <input
                      type="email"
                      value={siteConfig.contactEmail}
                      onChange={(e) =>
                        setSiteConfig({ ...siteConfig, contactEmail: e.target.value })
                      }
                      className="w-full px-3.5 py-2 rounded-lg border border-brand-border text-xs text-brand-dark focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-1">
                      Global Meta Description (SEO)
                    </label>
                    <textarea
                      rows={3}
                      value={siteConfig.metaDescription}
                      onChange={(e) =>
                        setSiteConfig({ ...siteConfig, metaDescription: e.target.value })
                      }
                      className="w-full px-3.5 py-2 rounded-lg border border-brand-border text-xs text-brand-dark focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="pt-2 border-t border-brand-borderLight space-y-3">
                    <h4 className="font-heading font-bold text-sm text-brand-dark pt-2">
                      Social Media Links
                    </h4>
                    <p className="text-[11px] text-brand-muted">
                      Shown as icons in the footer. Leave a field empty to hide that network.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {(
                        [
                          ["facebook", "Facebook page URL"],
                          ["twitter", "Twitter / X profile URL"],
                          ["instagram", "Instagram profile URL"],
                          ["linkedin", "LinkedIn page URL"],
                        ] as const
                      ).map(([key, label]) => (
                        <div key={key}>
                          <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-1">
                            {label}
                          </label>
                          <input
                            type="url"
                            placeholder="https://"
                            value={siteConfig.socialLinks?.[key] || ""}
                            onChange={(e) =>
                              setSiteConfig({
                                ...siteConfig,
                                socialLinks: { ...siteConfig.socialLinks, [key]: e.target.value },
                              })
                            }
                            className="w-full px-3.5 py-2 rounded-lg border border-brand-border text-xs text-brand-dark focus:outline-none focus:border-primary"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-white text-xs font-semibold shadow transition-all duration-200 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Branding Settings</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
    </AdminEnvContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Small presentational helpers
// ---------------------------------------------------------------------------

function SideItem({
  icon,
  label,
  badge,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  badge?: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-2.5 flex items-center justify-between text-sm transition-colors ${
        active
          ? "bg-primary text-white font-semibold"
          : "text-[#C3C4C7] hover:bg-[#13171A] hover:text-[#72AEE6]"
      }`}
    >
      <span className="flex items-center gap-3">
        {icon}
        <span>{label}</span>
      </span>
      {badge !== undefined && (
        <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full">{badge}</span>
      )}
    </button>
  );
}

function SideSub({ children }: { children: React.ReactNode }) {
  return <div className="bg-[#13171A] py-1.5">{children}</div>;
}

function SideSubLink({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left pl-11 pr-4 py-1.5 text-[13px] transition-colors ${
        active ? "text-white font-semibold" : "text-[#A7AAAD] hover:text-[#72AEE6]"
      }`}
    >
      {label}
    </button>
  );
}

function SideHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 pt-6 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#8C8F94]">
      {children}
    </div>
  );
}

function StatCard({
  label,
  value,
  accent = "text-brand-dark",
  action,
  onAction,
}: {
  label: string;
  value: number;
  accent?: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <div className="p-5 rounded-xl bg-white border border-[#DCDCDE] shadow-sm">
      <span className="text-xs font-semibold text-brand-muted uppercase block">{label}</span>
      <div className={`font-heading font-bold text-3xl mt-1 ${accent}`}>{value}</div>
      <button onClick={onAction} className="text-xs text-primary font-semibold hover:underline mt-2 inline-block">
        {action}
      </button>
    </div>
  );
}

function Shortcut({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-3 rounded-lg bg-brand-bgSoft hover:bg-brand-bgLight transition-colors text-xs font-semibold text-brand-dark flex items-center justify-between"
    >
      <span>{label}</span>
      <span>→</span>
    </button>
  );
}
