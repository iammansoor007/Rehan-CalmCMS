"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Article, SiteConfig, Category, HomepageContent, Subscriber, Inquiry } from "@/types/cms";
import { useToast } from "@/components/layout/Toast";
import {
  LayoutDashboard,
  FileText,
  FolderTree,
  Image as ImageIcon,
  Palette,
  Settings,
  Plus,
  Trash2,
  Edit,
  Save,
  ExternalLink,
  LogOut,
  Upload,
  Lock,
  Search,
  CheckCircle,
  Copy,
  RefreshCw,
  Sparkles,
  Users,
  MessageSquare,
  Globe,
  Eye,
} from "lucide-react";
import { slugify } from "@/lib/slugify";

interface MediaItem {
  filename: string;
  url: string;
  size?: number;
}

export default function AdminPage() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginUsername, setLoginUsername] = useState("rehanblogsite");
  const [loginPassword, setLoginPassword] = useState("rehanblogsite@2026adsense");
  const [authLoading, setAuthLoading] = useState(true);

  // Nav state
  const [currentSection, setCurrentSection] = useState<
    "dashboard" | "posts" | "new-post" | "categories" | "media" | "subscribers" | "inquiries" | "branding" | "settings"
  >("dashboard");

  // Data state
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [homepage, setHomepage] = useState<HomepageContent | null>(null);
  const [loading, setLoading] = useState(false);

  // Post Editor state
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  // Category form state
  const [newCatName, setNewCatName] = useState("");
  const [newCatSlug, setNewCatSlug] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");

  // Search & Filter in posts
  const [postSearch, setPostSearch] = useState("");
  const [postStatusFilter, setPostStatusFilter] = useState<"all" | "published" | "draft">("all");

  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const mediaLibraryInputRef = useRef<HTMLInputElement>(null);

  // 1. Check Auth on Mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/admin/auth");
      const data = await res.json();
      if (data.authenticated) {
        setIsAuthenticated(true);
        loadAllData();
      }
    } catch {
      setIsAuthenticated(false);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        showToast("Logged in successfully as Administrator");
        loadAllData();
      } else {
        showToast("Invalid credentials. Please verify your login details.");
      }
    } catch {
      showToast("Authentication server error");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    setIsAuthenticated(false);
    showToast("Logged out from Admin");
  };

  // 2. Load All CMS Data
  const loadAllData = async () => {
    setLoading(true);
    try {
      const [artRes, catRes, siteRes, mediaRes, subRes, inqRes] = await Promise.all([
        fetch("/api/admin/articles"),
        fetch("/api/admin/categories"),
        fetch("/api/admin/site"),
        fetch("/api/admin/media"),
        fetch("/api/admin/subscribers"),
        fetch("/api/admin/inquiries"),
      ]);

      const [arts, cats, siteData, media, subs, inqs] = await Promise.all([
        artRes.json(),
        catRes.json(),
        siteRes.json(),
        mediaRes.json(),
        subRes.json(),
        inqRes.json(),
      ]);

      setArticles(Array.isArray(arts) ? arts : []);
      setCategories(Array.isArray(cats) ? cats : []);
      setSiteConfig(siteData.siteConfig || null);
      setHomepage(siteData.homepage || null);
      setMediaList(Array.isArray(media) ? media : []);
      setSubscribers(Array.isArray(subs) ? subs : []);
      setInquiries(Array.isArray(inqs) ? inqs : []);
    } catch (err) {
      console.error("Error loading data:", err);
      showToast("Error loading CMS data");
    } finally {
      setLoading(false);
    }
  };

  // 3. Post Actions
  const initNewPost = () => {
    const defaultCat = categories[0]?.name || "Massage Therapy";
    setEditingArticle({
      slug: "",
      title: "",
      category: defaultCat,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      author: "CalmTouch Editorial Team",
      img: "/assets/images/article1.png",
      intro: "",
      quickSummary: "",
      keyBenefits: [
        "Releases muscular tightness and improves circulation",
        "Calms the parasympathetic nervous system",
      ],
      sections: [
        { heading: "Overview & Technique", text: "" },
        { heading: "Step-by-Step Instructions", text: "" },
      ],
      relatedSlugs: [],
      status: "published",
      metaTitle: "",
      metaDescription: "",
      keywords: [],
    });
    setCurrentSection("new-post");
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle) return;

    if (!editingArticle.title.trim() || !editingArticle.slug.trim()) {
      showToast("Title and URL Slug are required.");
      return;
    }

    try {
      const res = await fetch("/api/admin/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingArticle),
      });

      if (res.ok) {
        showToast("Post published successfully!");
        setEditingArticle(null);
        setCurrentSection("posts");
        loadAllData();
      } else {
        showToast("Failed to save post");
      }
    } catch {
      showToast("Network error saving post");
    }
  };

  const handleDeletePost = async (slug: string) => {
    if (!confirm(`Are you sure you want to permanently delete post "${slug}"?`)) return;

    try {
      const res = await fetch(`/api/admin/articles?slug=${slug}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast("Post removed from CMS");
        loadAllData();
      } else {
        showToast("Failed to delete post");
      }
    } catch {
      showToast("Network error deleting post");
    }
  };

  // 4. Category Actions
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      showToast("Category name is required.");
      return;
    }

    const slug = newCatSlug.trim() || slugify(newCatName);

    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCatName.trim(),
          slug,
          description: newCatDesc.trim() || `Articles and guides on ${newCatName.trim()}`,
        }),
      });

      if (res.ok) {
        showToast(`Category "${newCatName}" created!`);
        setNewCatName("");
        setNewCatSlug("");
        setNewCatDesc("");
        loadAllData();
      } else {
        showToast("Failed to create category");
      }
    } catch {
      showToast("Network error creating category");
    }
  };

  const handleDeleteCategory = async (slug: string) => {
    if (slug === "all") {
      showToast("Default archive category cannot be deleted.");
      return;
    }
    if (!confirm(`Delete category "${slug}"?`)) return;

    try {
      const res = await fetch(`/api/admin/categories?slug=${slug}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast("Category deleted");
        loadAllData();
      } else {
        showToast("Failed to delete category");
      }
    } catch {
      showToast("Network error deleting category");
    }
  };

  // 5. Image Upload Handlers
  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>, target: "post" | "logo" | "media") => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    if (target === "post") setUploadingImage(true);
    if (target === "logo") setUploadingLogo(true);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok && data.url) {
        showToast("Image uploaded successfully!");
        if (target === "post" && editingArticle) {
          setEditingArticle({ ...editingArticle, img: data.url });
        } else if (target === "logo" && siteConfig) {
          setSiteConfig({ ...siteConfig, logoUrl: data.url });
        }
        loadAllData();
      } else {
        showToast(data.error || "Image upload failed");
      }
    } catch {
      showToast("Upload network error");
    } finally {
      setUploadingImage(false);
      setUploadingLogo(false);
    }
  };

  // 6. Delete Subscriber & Inquiry
  const handleDeleteSubscriber = async (id?: string) => {
    if (!id) return;
    try {
      await fetch(`/api/admin/subscribers?id=${id}`, { method: "DELETE" });
      showToast("Subscriber deleted");
      loadAllData();
    } catch {
      showToast("Error deleting subscriber");
    }
  };

  const handleDeleteInquiry = async (id?: string) => {
    if (!id) return;
    try {
      await fetch(`/api/admin/inquiries?id=${id}`, { method: "DELETE" });
      showToast("Inquiry deleted");
      loadAllData();
    } catch {
      showToast("Error deleting inquiry");
    }
  };

  // 7. Save Branding / SiteConfig
  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteConfig) return;

    try {
      const res = await fetch("/api/admin/site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteConfig }),
      });
      if (res.ok) {
        showToast("Branding and logo settings saved!");
        loadAllData();
      } else {
        showToast("Failed to save branding");
      }
    } catch {
      showToast("Network error saving branding");
    }
  };

  // 8. Save Homepage Settings
  const handleSaveHomepage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!homepage) return;

    try {
      const res = await fetch("/api/admin/site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ homepage }),
      });
      if (res.ok) {
        showToast("Homepage copy updated successfully!");
        loadAllData();
      } else {
        showToast("Failed to update homepage copy");
      }
    } catch {
      showToast("Network error updating homepage copy");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text);
    showToast("URL copied to clipboard!");
  };

  // Render Login Gate
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

  if (!isAuthenticated) {
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
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-brand-border text-sm text-brand-dark focus:outline-none focus:border-primary"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-semibold shadow transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Log In to Dashboard</span>
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

  // Filtered posts
  const filteredArticles = articles.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(postSearch.toLowerCase()) ||
      a.category.toLowerCase().includes(postSearch.toLowerCase());
    const matchesStatus =
      postStatusFilter === "all" ||
      (postStatusFilter === "published" && a.status !== "draft") ||
      (postStatusFilter === "draft" && a.status === "draft");
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#F0F0F1] flex flex-col font-sans">
      {/* 1. WordPress Top Admin Bar */}
      <div className="h-10 bg-[#1D2327] text-[#C3C4C7] px-4 flex items-center justify-between text-xs z-30 flex-shrink-0">
        <div className="flex items-center gap-4">
          <span className="font-heading font-bold text-white flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-primary flex items-center justify-center text-[10px] text-white font-bold">
              C
            </span>
            CalmTouch CMS
          </span>
          <Link
            href="/"
            target="_blank"
            className="hover:text-white transition-colors flex items-center gap-1"
          >
            <span>Visit Site</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
          <button
            onClick={initNewPost}
            className="hover:text-white transition-colors flex items-center gap-1 font-semibold text-primary"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Guide</span>
          </button>
        </div>

        <div className="flex items-center gap-4">
          <span>Howdy, <strong className="text-white">rehanblogsite</strong></span>
          <button
            onClick={handleLogout}
            className="hover:text-white transition-colors flex items-center gap-1"
          >
            <LogOut className="w-3 h-3" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Main Admin Body: Sidebar + Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* 2. WordPress Left Navigation Sidebar */}
        <aside className="w-60 bg-[#1D2327] flex-shrink-0 flex flex-col justify-between overflow-y-auto">
          <nav className="py-3">
            <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-[#8C8F94]">
              Main Navigation
            </div>

            <button
              onClick={() => setCurrentSection("dashboard")}
              className={`w-full text-left px-4 py-2.5 flex items-center gap-3 text-sm transition-colors ${
                currentSection === "dashboard"
                  ? "bg-primary text-white font-semibold"
                  : "text-[#C3C4C7] hover:bg-[#13171A] hover:text-[#72AEE6]"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => {
                setEditingArticle(null);
                setCurrentSection("posts");
              }}
              className={`w-full text-left px-4 py-2.5 flex items-center justify-between text-sm transition-colors ${
                currentSection === "posts" || currentSection === "new-post"
                  ? "bg-primary text-white font-semibold"
                  : "text-[#C3C4C7] hover:bg-[#13171A] hover:text-[#72AEE6]"
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4" />
                <span>Posts & Guides</span>
              </div>
              <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full">
                {articles.length}
              </span>
            </button>

            <button
              onClick={() => setCurrentSection("categories")}
              className={`w-full text-left px-4 py-2.5 flex items-center justify-between text-sm transition-colors ${
                currentSection === "categories"
                  ? "bg-primary text-white font-semibold"
                  : "text-[#C3C4C7] hover:bg-[#13171A] hover:text-[#72AEE6]"
              }`}
            >
              <div className="flex items-center gap-3">
                <FolderTree className="w-4 h-4" />
                <span>Categories</span>
              </div>
              <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full">
                {categories.length}
              </span>
            </button>

            <button
              onClick={() => setCurrentSection("media")}
              className={`w-full text-left px-4 py-2.5 flex items-center gap-3 text-sm transition-colors ${
                currentSection === "media"
                  ? "bg-primary text-white font-semibold"
                  : "text-[#C3C4C7] hover:bg-[#13171A] hover:text-[#72AEE6]"
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Media Library</span>
            </button>

            <div className="px-4 pt-6 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#8C8F94]">
              Engagement & Leads
            </div>

            <button
              onClick={() => setCurrentSection("subscribers")}
              className={`w-full text-left px-4 py-2.5 flex items-center justify-between text-sm transition-colors ${
                currentSection === "subscribers"
                  ? "bg-primary text-white font-semibold"
                  : "text-[#C3C4C7] hover:bg-[#13171A] hover:text-[#72AEE6]"
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4" />
                <span>Subscribers</span>
              </div>
              <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full">
                {subscribers.length}
              </span>
            </button>

            <button
              onClick={() => setCurrentSection("inquiries")}
              className={`w-full text-left px-4 py-2.5 flex items-center justify-between text-sm transition-colors ${
                currentSection === "inquiries"
                  ? "bg-primary text-white font-semibold"
                  : "text-[#C3C4C7] hover:bg-[#13171A] hover:text-[#72AEE6]"
              }`}
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4" />
                <span>Contact Messages</span>
              </div>
              <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full">
                {inquiries.length}
              </span>
            </button>

            <div className="px-4 pt-6 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#8C8F94]">
              Customization & SEO
            </div>

            <button
              onClick={() => setCurrentSection("branding")}
              className={`w-full text-left px-4 py-2.5 flex items-center gap-3 text-sm transition-colors ${
                currentSection === "branding"
                  ? "bg-primary text-white font-semibold"
                  : "text-[#C3C4C7] hover:bg-[#13171A] hover:text-[#72AEE6]"
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>Branding & Logo</span>
            </button>

            <button
              onClick={() => setCurrentSection("settings")}
              className={`w-full text-left px-4 py-2.5 flex items-center gap-3 text-sm transition-colors ${
                currentSection === "settings"
                  ? "bg-primary text-white font-semibold"
                  : "text-[#C3C4C7] hover:bg-[#13171A] hover:text-[#72AEE6]"
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Settings & SEO</span>
            </button>
          </nav>

          <div className="p-4 border-t border-white/10 text-[11px] text-[#8C8F94]">
            CalmTouch CMS Engine
            <div className="text-[10px] text-primary mt-0.5 font-medium">
              MongoDB Atlas Active
            </div>
          </div>
        </aside>

        {/* 3. Main Workspace Area */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8">
          {/* SECTION: DASHBOARD */}
          {currentSection === "dashboard" && (
            <div className="space-y-6 max-w-6xl">
              <div>
                <h1 className="font-heading font-bold text-2xl text-brand-dark mb-1">
                  Dashboard
                </h1>
                <p className="text-xs text-brand-muted">
                  Welcome to your CalmTouch WordPress-style Content Management System.
                </p>
              </div>

              {/* Stats Widgets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-xl bg-white border border-[#DCDCDE] shadow-sm">
                  <span className="text-xs font-semibold text-brand-muted uppercase block">
                    Published Guides
                  </span>
                  <div className="font-heading font-bold text-3xl text-primary mt-1">
                    {articles.length}
                  </div>
                  <button
                    onClick={() => setCurrentSection("posts")}
                    className="text-xs text-primary font-semibold hover:underline mt-2 inline-block"
                  >
                    Manage Posts →
                  </button>
                </div>

                <div className="p-5 rounded-xl bg-white border border-[#DCDCDE] shadow-sm">
                  <span className="text-xs font-semibold text-brand-muted uppercase block">
                    Categories
                  </span>
                  <div className="font-heading font-bold text-3xl text-brand-dark mt-1">
                    {categories.length}
                  </div>
                  <button
                    onClick={() => setCurrentSection("categories")}
                    className="text-xs text-primary font-semibold hover:underline mt-2 inline-block"
                  >
                    Manage Categories →
                  </button>
                </div>

                <div className="p-5 rounded-xl bg-white border border-[#DCDCDE] shadow-sm">
                  <span className="text-xs font-semibold text-brand-muted uppercase block">
                    Subscribers
                  </span>
                  <div className="font-heading font-bold text-3xl text-brand-dark mt-1">
                    {subscribers.length}
                  </div>
                  <button
                    onClick={() => setCurrentSection("subscribers")}
                    className="text-xs text-primary font-semibold hover:underline mt-2 inline-block"
                  >
                    View Subscribers →
                  </button>
                </div>

                <div className="p-5 rounded-xl bg-white border border-[#DCDCDE] shadow-sm">
                  <span className="text-xs font-semibold text-brand-muted uppercase block">
                    Inquiries
                  </span>
                  <div className="font-heading font-bold text-3xl text-emerald-600 mt-1">
                    {inquiries.length}
                  </div>
                  <button
                    onClick={() => setCurrentSection("inquiries")}
                    className="text-xs text-primary font-semibold hover:underline mt-2 inline-block"
                  >
                    View Messages →
                  </button>
                </div>
              </div>

              {/* Quick Actions & Recent Posts */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 bg-white rounded-xl border border-[#DCDCDE] shadow-sm p-6 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-brand-borderLight">
                    <h3 className="font-heading font-semibold text-base text-brand-dark">
                      Recently Published Wellness Guides
                    </h3>
                    <button
                      onClick={initNewPost}
                      className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>New Post</span>
                    </button>
                  </div>

                  <div className="divide-y divide-brand-borderLight">
                    {articles.slice(0, 5).map((art) => (
                      <div
                        key={art.slug}
                        className="py-3 flex items-center justify-between gap-4"
                      >
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-sm text-brand-dark truncate">
                            {art.title}
                          </h4>
                          <span className="text-xs text-brand-muted">
                            Category: <strong className="text-primary">{art.category}</strong> • {art.date}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingArticle(art);
                              setCurrentSection("new-post");
                            }}
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
                    <button
                      onClick={() => setCurrentSection("branding")}
                      className="w-full text-left p-3 rounded-lg bg-brand-bgSoft hover:bg-brand-bgLight transition-colors text-xs font-semibold text-brand-dark flex items-center justify-between"
                    >
                      <span>Change Brand Logo / Name</span>
                      <span>→</span>
                    </button>
                    <button
                      onClick={() => setCurrentSection("categories")}
                      className="w-full text-left p-3 rounded-lg bg-brand-bgSoft hover:bg-brand-bgLight transition-colors text-xs font-semibold text-brand-dark flex items-center justify-between"
                    >
                      <span>Create New Topic Category</span>
                      <span>→</span>
                    </button>
                    <button
                      onClick={() => setCurrentSection("media")}
                      className="w-full text-left p-3 rounded-lg bg-brand-bgSoft hover:bg-brand-bgLight transition-colors text-xs font-semibold text-brand-dark flex items-center justify-between"
                    >
                      <span>Upload Media Image</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: ALL POSTS */}
          {currentSection === "posts" && (
            <div className="space-y-6 max-w-6xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-heading font-bold text-2xl text-brand-dark mb-1">
                    Posts & Wellness Guides
                  </h1>
                  <p className="text-xs text-brand-muted">
                    Manage all articles appearing across CalmTouch categories and the homepage.
                  </p>
                </div>
                <button
                  onClick={initNewPost}
                  className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Post</span>
                </button>
              </div>

              {/* Status and Search Filter Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs font-medium">
                  <button
                    onClick={() => setPostStatusFilter("all")}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      postStatusFilter === "all" ? "bg-primary text-white" : "bg-white text-brand-dark hover:bg-brand-bgLight border border-brand-border"
                    }`}
                  >
                    All ({articles.length})
                  </button>
                  <button
                    onClick={() => setPostStatusFilter("published")}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      postStatusFilter === "published" ? "bg-primary text-white" : "bg-white text-brand-dark hover:bg-brand-bgLight border border-brand-border"
                    }`}
                  >
                    Published ({articles.filter((a) => a.status !== "draft").length})
                  </button>
                  <button
                    onClick={() => setPostStatusFilter("draft")}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      postStatusFilter === "draft" ? "bg-primary text-white" : "bg-white text-brand-dark hover:bg-brand-bgLight border border-brand-border"
                    }`}
                  >
                    Drafts ({articles.filter((a) => a.status === "draft").length})
                  </button>
                </div>

                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-[#DCDCDE] shadow-sm max-w-md w-full sm:w-auto">
                  <Search className="w-4 h-4 text-brand-muted" />
                  <input
                    type="text"
                    placeholder="Filter posts by title or category..."
                    value={postSearch}
                    onChange={(e) => setPostSearch(e.target.value)}
                    className="w-full bg-transparent text-xs text-brand-dark focus:outline-none"
                  />
                </div>
              </div>

              {/* WordPress-style Posts Table */}
              <div className="bg-white rounded-xl border border-[#DCDCDE] shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-brand-bgSoft border-b border-[#DCDCDE] text-brand-dark font-bold">
                      <th className="p-3.5">Title</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Author</th>
                      <th className="p-3.5">Date</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-borderLight">
                    {filteredArticles.map((art) => (
                      <tr key={art.slug} className="hover:bg-brand-bgSoft/60 transition-colors">
                        <td className="p-3.5 font-semibold text-brand-dark">
                          <div className="flex items-center gap-3">
                            {art.img && (
                              <div className="relative w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-brand-bgLight">
                                <Image
                                  src={art.img}
                                  alt={art.title}
                                  fill
                                  sizes="36px"
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <div>
                              <span className="text-sm font-semibold text-brand-dark block">
                                {art.title}
                              </span>
                              <span className="text-[11px] text-brand-muted">
                                /{art.slug}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              art.status === "draft"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {art.status === "draft" ? "Draft" : "Published"}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className="inline-block px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold text-[11px]">
                            {art.category}
                          </span>
                        </td>
                        <td className="p-3.5 text-brand-muted">{art.author}</td>
                        <td className="p-3.5 text-brand-muted">{art.date}</td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/blog/${art.slug}`}
                              target="_blank"
                              className="p-1.5 rounded-md text-brand-muted hover:text-brand-dark hover:bg-brand-bgLight"
                              title="View Post"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => {
                                setEditingArticle(art);
                                setCurrentSection("new-post");
                              }}
                              className="p-1.5 rounded-md text-brand-muted hover:text-primary hover:bg-brand-bgLight"
                              title="Edit Post"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeletePost(art.slug)}
                              className="p-1.5 rounded-md text-brand-muted hover:text-red-600 hover:bg-red-50"
                              title="Delete Post"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION: ADD / EDIT POST (WordPress Post Editor with SEO Suite) */}
          {currentSection === "new-post" && editingArticle && (
            <div className="space-y-6 max-w-5xl">
              <div className="flex items-center justify-between pb-4 border-b border-[#DCDCDE]">
                <div>
                  <h1 className="font-heading font-bold text-2xl text-brand-dark">
                    {editingArticle.slug ? "Edit Post" : "Add New Post"}
                  </h1>
                  <p className="text-xs text-brand-muted">
                    Compose rich content, configure live Google SEO snippets, and assign categories.
                  </p>
                </div>
                <button
                  onClick={() => setCurrentSection("posts")}
                  className="px-3 py-1.5 rounded-lg border border-brand-border text-xs font-semibold text-brand-dark hover:bg-brand-bgLight"
                >
                  ← Back to All Posts
                </button>
              </div>

              <form onSubmit={handleSavePost} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Content Column */}
                <div className="lg:col-span-8 space-y-6">
                  <div className="bg-white p-6 rounded-xl border border-[#DCDCDE] shadow-sm space-y-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-1.5">
                        Post Title *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 5 Easy Neck Massage Techniques for Desk Workers"
                        value={editingArticle.title}
                        onChange={(e) => {
                          const title = e.target.value;
                          setEditingArticle({
                            ...editingArticle,
                            title,
                            slug: editingArticle.slug ? editingArticle.slug : slugify(title),
                          });
                        }}
                        className="w-full px-4 py-3 rounded-lg border border-brand-border text-base font-semibold text-brand-dark focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-1.5">
                        Permalink / URL Slug *
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-brand-muted">/blog/</span>
                        <input
                          type="text"
                          required
                          value={editingArticle.slug}
                          onChange={(e) =>
                            setEditingArticle({ ...editingArticle, slug: slugify(e.target.value) })
                          }
                          className="flex-1 px-3 py-2 rounded-lg border border-brand-border text-xs text-brand-dark focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-1.5">
                        Intro Excerpt
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Short intro summarizing what this guide covers..."
                        value={editingArticle.intro}
                        onChange={(e) =>
                          setEditingArticle({ ...editingArticle, intro: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-lg border border-brand-border text-xs text-brand-dark focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-1.5">
                        Quick Summary Box
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Highlighted callout text displayed in the green summary box..."
                        value={editingArticle.quickSummary || ""}
                        onChange={(e) =>
                          setEditingArticle({ ...editingArticle, quickSummary: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-lg border border-brand-border text-xs text-brand-dark focus:outline-none focus:border-primary"
                      />
                    </div>

                    {/* Content Sections Builder */}
                    <div className="pt-4 border-t border-brand-borderLight space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-heading font-semibold text-sm text-brand-dark">
                          Content Sections (Headings & Paragraphs)
                        </h3>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingArticle({
                              ...editingArticle,
                              sections: [
                                ...editingArticle.sections,
                                { heading: "New Technique Section", text: "" },
                              ],
                            });
                          }}
                          className="text-xs font-semibold text-primary hover:underline"
                        >
                          + Add Section
                        </button>
                      </div>

                      {editingArticle.sections.map((sec, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl bg-brand-bgSoft border border-brand-borderLight space-y-2 relative"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-brand-muted">
                              Section {idx + 1}
                            </span>
                            {editingArticle.sections.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const newSecs = editingArticle.sections.filter((_, i) => i !== idx);
                                  setEditingArticle({ ...editingArticle, sections: newSecs });
                                }}
                                className="text-xs text-red-500 hover:underline"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                          <input
                            type="text"
                            placeholder="Section Heading"
                            value={sec.heading}
                            onChange={(e) => {
                              const newSecs = [...editingArticle.sections];
                              newSecs[idx].heading = e.target.value;
                              setEditingArticle({ ...editingArticle, sections: newSecs });
                            }}
                            className="w-full px-3 py-2 rounded-lg border border-brand-border text-xs font-semibold text-brand-dark"
                          />
                          <textarea
                            rows={4}
                            placeholder="Detailed instructions or advice for this section..."
                            value={sec.text}
                            onChange={(e) => {
                              const newSecs = [...editingArticle.sections];
                              newSecs[idx].text = e.target.value;
                              setEditingArticle({ ...editingArticle, sections: newSecs });
                            }}
                            className="w-full px-3 py-2 rounded-lg border border-brand-border text-xs text-brand-dark leading-relaxed"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 4. YOAST / RANKMATH STYLE SEO SUITE */}
                  <div className="bg-white p-6 rounded-xl border border-[#DCDCDE] shadow-sm space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-brand-borderLight">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-primary" />
                        <h3 className="font-heading font-bold text-sm text-brand-dark">
                          Google Search & SEO Optimization (Yoast Style)
                        </h3>
                      </div>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                        AdSense & Indexing Ready
                      </span>
                    </div>

                    {/* Google Snippet Live Preview */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                        Google Search Snippet Preview
                      </span>
                      <div className="text-xs text-slate-600 flex items-center gap-1">
                        <span>https://calmtouch.com</span>
                        <span>›</span>
                        <span>blog</span>
                        <span>›</span>
                        <span className="text-slate-800 font-medium">
                          {editingArticle.slug || "post-slug"}
                        </span>
                      </div>
                      <div className="text-base font-medium text-[#1a0dab] hover:underline cursor-pointer truncate">
                        {editingArticle.metaTitle || editingArticle.title || "Post Title Goes Here — CalmTouch"}
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {editingArticle.metaDescription ||
                          editingArticle.intro ||
                          "Explore our evidence-aligned massage guidance, practical body recovery tips, and everyday stress relief routines."}
                      </p>
                    </div>

                    {/* SEO Meta Title */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-brand-dark">
                          SEO Meta Title
                        </label>
                        <span
                          className={`text-[11px] ${
                            (editingArticle.metaTitle || editingArticle.title).length > 60
                              ? "text-amber-600 font-semibold"
                              : "text-brand-muted"
                          }`}
                        >
                          {(editingArticle.metaTitle || editingArticle.title).length} / 60 chars
                        </span>
                      </div>
                      <input
                        type="text"
                        placeholder="Custom Title for Google (defaults to post title)"
                        value={editingArticle.metaTitle || ""}
                        onChange={(e) =>
                          setEditingArticle({ ...editingArticle, metaTitle: e.target.value })
                        }
                        className="w-full px-3.5 py-2 rounded-lg border border-brand-border text-xs text-brand-dark focus:outline-none focus:border-primary"
                      />
                    </div>

                    {/* SEO Meta Description */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-brand-dark">
                          SEO Meta Description
                        </label>
                        <span
                          className={`text-[11px] ${
                            (editingArticle.metaDescription || editingArticle.intro).length > 160
                              ? "text-amber-600 font-semibold"
                              : "text-brand-muted"
                          }`}
                        >
                          {(editingArticle.metaDescription || editingArticle.intro).length} / 160 chars
                        </span>
                      </div>
                      <textarea
                        rows={2}
                        placeholder="Search engine snippet description (defaults to intro excerpt)"
                        value={editingArticle.metaDescription || ""}
                        onChange={(e) =>
                          setEditingArticle({ ...editingArticle, metaDescription: e.target.value })
                        }
                        className="w-full px-3.5 py-2 rounded-lg border border-brand-border text-xs text-brand-dark focus:outline-none focus:border-primary"
                      />
                    </div>

                    {/* Focus Keywords */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-1">
                        Focus Keywords (comma separated)
                      </label>
                      <input
                        type="text"
                        placeholder="neck pain, desk stretches, cervical relief"
                        value={editingArticle.keywords?.join(", ") || ""}
                        onChange={(e) =>
                          setEditingArticle({
                            ...editingArticle,
                            keywords: e.target.value.split(",").map((k) => k.trim()),
                          })
                        }
                        className="w-full px-3.5 py-2 rounded-lg border border-brand-border text-xs text-brand-dark focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* Sidebar Column (Publish, Category, Media) */}
                <div className="lg:col-span-4 space-y-5">
                  {/* Publish Box */}
                  <div className="bg-white p-5 rounded-xl border border-[#DCDCDE] shadow-sm space-y-4">
                    <h3 className="font-heading font-bold text-sm text-brand-dark pb-2 border-b border-brand-borderLight">
                      Publish Settings
                    </h3>

                    {/* Status Toggle */}
                    <div>
                      <label className="block text-xs font-semibold text-brand-dark mb-1.5">
                        Post Status
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingArticle({ ...editingArticle, status: "published" })}
                          className={`py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            editingArticle.status !== "draft"
                              ? "bg-emerald-600 text-white"
                              : "bg-brand-bgSoft text-brand-dark border border-brand-border"
                          }`}
                        >
                          Published
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingArticle({ ...editingArticle, status: "draft" })}
                          className={`py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            editingArticle.status === "draft"
                              ? "bg-amber-600 text-white"
                              : "bg-brand-bgSoft text-brand-dark border border-brand-border"
                          }`}
                        >
                          Draft
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-brand-dark mb-1">
                        Category *
                      </label>
                      <select
                        value={editingArticle.category}
                        onChange={(e) =>
                          setEditingArticle({ ...editingArticle, category: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-brand-border text-xs text-brand-dark focus:outline-none focus:border-primary bg-white"
                      >
                        {categories.map((cat) => (
                          <option key={cat.slug} value={cat.name}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      <p className="text-[11px] text-brand-muted mt-1">
                        Selected articles automatically appear on this category page.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-brand-dark mb-1">
                        Author Name
                      </label>
                      <input
                        type="text"
                        value={editingArticle.author}
                        onChange={(e) =>
                          setEditingArticle({ ...editingArticle, author: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-brand-border text-xs text-brand-dark focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-brand-dark mb-1">
                        Publication Date
                      </label>
                      <input
                        type="text"
                        value={editingArticle.date}
                        onChange={(e) =>
                          setEditingArticle({ ...editingArticle, date: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-brand-border text-xs text-brand-dark focus:outline-none focus:border-primary"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-white text-xs font-semibold shadow transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>{editingArticle.status === "draft" ? "Save as Draft" : "Publish to Live Site"}</span>
                    </button>
                  </div>

                  {/* Featured Image Box with Media Picker Modal */}
                  <div className="bg-white p-5 rounded-xl border border-[#DCDCDE] shadow-sm space-y-4">
                    <h3 className="font-heading font-bold text-sm text-brand-dark pb-2 border-b border-brand-borderLight">
                      Featured Image
                    </h3>

                    {editingArticle.img ? (
                      <div className="space-y-3">
                        <div className="relative aspect-[16/10] rounded-lg overflow-hidden border border-brand-border bg-brand-bgLight">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={editingArticle.img}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <input
                          type="text"
                          value={editingArticle.img}
                          onChange={(e) =>
                            setEditingArticle({ ...editingArticle, img: e.target.value })
                          }
                          className="w-full px-3 py-1.5 rounded-lg border border-brand-border text-[11px] text-brand-muted"
                        />
                      </div>
                    ) : (
                      <div className="p-4 rounded-lg bg-brand-bgSoft border border-dashed border-brand-border text-center text-xs text-brand-muted">
                        No image selected
                      </div>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleUploadImage(e, "post")}
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        disabled={uploadingImage}
                        onClick={() => fileInputRef.current?.click()}
                        className="py-2 rounded-lg border border-primary text-primary hover:bg-primary/10 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingImage ? "Uploading..." : "Upload File"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setMediaPickerOpen(true)}
                        className="py-2 rounded-lg bg-brand-bgSoft border border-brand-border hover:bg-brand-bgLight text-brand-dark text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Media Library</span>
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* SECTION: CATEGORIES */}
          {currentSection === "categories" && (
            <div className="space-y-6 max-w-6xl">
              <div>
                <h1 className="font-heading font-bold text-2xl text-brand-dark mb-1">
                  Categories
                </h1>
                <p className="text-xs text-brand-muted">
                  Create, edit, and manage blog categories. All categories automatically appear in the navbar dropdown and category pages.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-[#DCDCDE] shadow-sm space-y-4">
                  <h3 className="font-heading font-bold text-sm text-brand-dark pb-2 border-b border-brand-borderLight">
                    Add New Category
                  </h3>

                  <form onSubmit={handleCreateCategory} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-1">
                        Category Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Hot Stone Therapy"
                        value={newCatName}
                        onChange={(e) => {
                          setNewCatName(e.target.value);
                          if (!newCatSlug) setNewCatSlug(slugify(e.target.value));
                        }}
                        className="w-full px-3.5 py-2 rounded-lg border border-brand-border text-xs text-brand-dark focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-1">
                        Slug (URL identifier)
                      </label>
                      <input
                        type="text"
                        placeholder="hot-stone-therapy"
                        value={newCatSlug}
                        onChange={(e) => setNewCatSlug(slugify(e.target.value))}
                        className="w-full px-3.5 py-2 rounded-lg border border-brand-border text-xs text-brand-dark focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-1">
                        Description
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Short summary displayed at the top of this category's archive page..."
                        value={newCatDesc}
                        onChange={(e) => setNewCatDesc(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-lg border border-brand-border text-xs text-brand-dark focus:outline-none focus:border-primary"
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white text-xs font-semibold shadow transition-all duration-200 flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add New Category</span>
                    </button>
                  </form>
                </div>

                <div className="lg:col-span-7 bg-white rounded-xl border border-[#DCDCDE] shadow-sm overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-brand-bgSoft border-b border-[#DCDCDE] text-brand-dark font-bold">
                        <th className="p-3.5">Name</th>
                        <th className="p-3.5">Slug</th>
                        <th className="p-3.5">Articles</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-borderLight">
                      {categories.map((cat) => (
                        <tr key={cat.slug} className="hover:bg-brand-bgSoft/60 transition-colors">
                          <td className="p-3.5 font-semibold text-brand-dark">
                            <span className="block">{cat.name}</span>
                            <span className="text-[11px] text-brand-muted line-clamp-1">
                              {cat.description}
                            </span>
                          </td>
                          <td className="p-3.5 text-brand-muted">/{cat.slug}</td>
                          <td className="p-3.5 font-bold text-primary">
                            {articles.filter(
                              (a) => a.category.toLowerCase().trim() === cat.name.toLowerCase().trim()
                            ).length}
                          </td>
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                href={`/category/${cat.slug}`}
                                target="_blank"
                                className="p-1 rounded text-brand-muted hover:text-brand-dark"
                                title="View Category Page"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>
                              {cat.slug !== "all" && (
                                <button
                                  onClick={() => handleDeleteCategory(cat.slug)}
                                  className="p-1 rounded text-brand-muted hover:text-red-600"
                                  title="Delete Category"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: MEDIA LIBRARY */}
          {currentSection === "media" && (
            <div className="space-y-6 max-w-6xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-heading font-bold text-2xl text-brand-dark mb-1">
                    Media Library
                  </h1>
                  <p className="text-xs text-brand-muted">
                    Upload images to use for blog posts, headers, or your brand logo.
                  </p>
                </div>

                <input
                  ref={mediaLibraryInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleUploadImage(e, "media")}
                />

                <button
                  onClick={() => mediaLibraryInputRef.current?.click()}
                  className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Image File</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {mediaList.map((m) => (
                  <div
                    key={m.url}
                    className="group bg-white rounded-xl border border-[#DCDCDE] overflow-hidden shadow-sm flex flex-col"
                  >
                    <div className="relative aspect-square bg-brand-bgLight">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={m.url}
                        alt={m.filename}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="p-2.5 flex flex-col justify-between flex-1">
                      <span className="text-[11px] font-medium text-brand-dark truncate block">
                        {m.filename}
                      </span>
                      <button
                        onClick={() => copyToClipboard(m.url)}
                        className="mt-2 text-[10px] font-semibold text-primary hover:underline flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy URL</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION: SUBSCRIBERS */}
          {currentSection === "subscribers" && (
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
          {currentSection === "inquiries" && (
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
          {currentSection === "branding" && siteConfig && (
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

          {/* SECTION: SETTINGS & HOMEPAGE COPY */}
          {currentSection === "settings" && homepage && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h1 className="font-heading font-bold text-2xl text-brand-dark mb-1">
                  Homepage & Masterclass Content
                </h1>
                <p className="text-xs text-brand-muted">
                  Update headlines, highlights, and promotional banners without touching code.
                </p>
              </div>

              <form onSubmit={handleSaveHomepage} className="space-y-6">
                <div className="bg-white p-6 rounded-xl border border-[#DCDCDE] shadow-sm space-y-4">
                  <h3 className="font-heading font-bold text-sm text-brand-dark pb-2 border-b border-brand-borderLight">
                    Hero Section Copy
                  </h3>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-1">
                      Hero Badge
                    </label>
                    <input
                      type="text"
                      value={homepage.hero.badge}
                      onChange={(e) =>
                        setHomepage({
                          ...homepage,
                          hero: { ...homepage.hero, badge: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-lg border border-brand-border text-xs text-brand-dark"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-brand-dark mb-1">
                        Title Start
                      </label>
                      <input
                        type="text"
                        value={homepage.hero.titleStart}
                        onChange={(e) =>
                          setHomepage({
                            ...homepage,
                            hero: { ...homepage.hero, titleStart: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-brand-border text-xs text-brand-dark"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-brand-dark mb-1">
                        Highlight Keyword
                      </label>
                      <input
                        type="text"
                        value={homepage.hero.titleHighlight}
                        onChange={(e) =>
                          setHomepage({
                            ...homepage,
                            hero: { ...homepage.hero, titleHighlight: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-brand-border text-xs text-brand-dark"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-brand-dark mb-1">
                        Title End
                      </label>
                      <input
                        type="text"
                        value={homepage.hero.titleEnd}
                        onChange={(e) =>
                          setHomepage({
                            ...homepage,
                            hero: { ...homepage.hero, titleEnd: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-brand-border text-xs text-brand-dark"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-1">
                      Hero Subtitle
                    </label>
                    <textarea
                      rows={3}
                      value={homepage.hero.subtitle}
                      onChange={(e) =>
                        setHomepage({
                          ...homepage,
                          hero: { ...homepage.hero, subtitle: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-lg border border-brand-border text-xs text-brand-dark"
                    />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-[#DCDCDE] shadow-sm space-y-4">
                  <h3 className="font-heading font-bold text-sm text-brand-dark pb-2 border-b border-brand-borderLight">
                    Guidebook Masterclass Banner
                  </h3>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-1">
                      Masterclass Title
                    </label>
                    <input
                      type="text"
                      value={homepage.guidebook.title}
                      onChange={(e) =>
                        setHomepage({
                          ...homepage,
                          guidebook: { ...homepage.guidebook, title: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-lg border border-brand-border text-xs text-brand-dark"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-1">
                      Masterclass Description
                    </label>
                    <textarea
                      rows={2}
                      value={homepage.guidebook.subtitle}
                      onChange={(e) =>
                        setHomepage({
                          ...homepage,
                          guidebook: { ...homepage.guidebook, subtitle: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-lg border border-brand-border text-xs text-brand-dark"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-white text-xs font-semibold shadow transition-all duration-200 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Update Page Copy</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* Media Picker Modal (For inserting images from Media Library) */}
      {mediaPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-brand-border">
            <div className="flex items-center justify-between pb-3 border-b border-brand-borderLight">
              <h3 className="font-heading font-bold text-base text-brand-dark">
                Select from Media Library
              </h3>
              <button
                onClick={() => setMediaPickerOpen(false)}
                className="text-xs font-semibold text-brand-muted hover:text-brand-dark"
              >
                ✕ Close
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto grid grid-cols-3 sm:grid-cols-4 gap-3 p-1">
              {mediaList.map((m) => (
                <button
                  key={m.url}
                  type="button"
                  onClick={() => {
                    if (editingArticle) {
                      setEditingArticle({ ...editingArticle, img: m.url });
                      setMediaPickerOpen(false);
                      showToast("Featured image updated from library!");
                    }
                  }}
                  className="group relative aspect-square rounded-xl overflow-hidden border border-brand-border hover:border-primary hover:scale-105 transition-all focus:outline-none"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.url} alt={m.filename} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs">
                    Select
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
