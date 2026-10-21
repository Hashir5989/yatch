"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  Edit3, 
  ExternalLink, 
  Copy, 
  Trash2, 
  Layers, 
  Search, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  X,
  FileText,
  Sparkles,
  ChevronRight
} from "lucide-react";
import CmsHeader from "@/components/cms/CmsHeader";
import { 
  getAllPages, 
  createPage, 
  duplicatePage, 
  deletePage 
} from "@/lib/cmsStore";

export default function AdminPagesScreen() {
  const router = useRouter();
  const [pages, setPages] = useState(() => getAllPages());
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // New Page Form State
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newTemplate, setNewTemplate] = useState("editorial_showcase");

  const loadPages = () => {
    setPages(getAllPages());
  };

  useEffect(() => {
    const handleUpdate = () => loadPages();
    window.addEventListener("asm-cms-change", handleUpdate);
    return () => window.removeEventListener("asm-cms-change", handleUpdate);
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDuplicate = (pageId, title) => {
    const dup = duplicatePage(pageId);
    if (dup) {
      loadPages();
      showToast(`Duplicated "${title}" as a draft`);
    }
  };

  const handleDelete = (pageId, title) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      const ok = deletePage(pageId);
      if (ok) {
        loadPages();
        showToast(`Deleted "${title}"`);
      }
    }
  };

  const handleCreatePage = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    let slug = newSlug.trim();
    if (!slug) {
      slug = "/" + newTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    }
    if (!slug.startsWith("/")) {
      slug = `/${slug}`;
    }

    const created = createPage({
      title: newTitle.trim(),
      slug,
      template: newTemplate,
    });

    setIsCreateModalOpen(false);
    setNewTitle("");
    setNewSlug("");
    showToast(`Created new page "${created.title}"`);
    router.push(`/admin/editor/${created.id}`);
  };

  // Auto-generate slug from title if user hasn't typed a custom slug
  const handleTitleChange = (val) => {
    setNewTitle(val);
    const generated = "/" + val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    setNewSlug(generated);
  };

  const filteredPages = pages.filter((p) => {
    return (
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const templates = [
    {
      id: "editorial_showcase",
      name: "Editorial Showcase",
      desc: "Hero banner, heritage story, featured yacht spotlight & gallery",
    },
    {
      id: "fleet_catalog",
      name: "Fleet Catalog",
      desc: "Hero, complete yacht filterable grid, specifications & enquiry",
    },
    {
      id: "heritage_craft",
      name: "Heritage & Craftsmanship",
      desc: "Shipyard origin story, milestones statistics, aerospace tech",
    },
    {
      id: "vip_concierge",
      name: "VIP Concierge & Booking",
      desc: "Private sea trial application, direct coordinates & advisor contacts",
    },
    {
      id: "blank",
      name: "Blank Page",
      desc: "Minimal starter with an empty structure to build from scratch",
    },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#070A0F]">
      <CmsHeader 
        title="Pages & Sections" 
        subtitle="Manage public pages, sections, content arrangements, and publishing status"
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-[#C5A880] text-[#080B10] px-5 py-2.5 rounded shadow-xl text-xs font-semibold tracking-wide flex items-center gap-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto w-full">
        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-2xl font-light text-white tracking-wide">
              Website Pages
            </h1>
            <p className="text-xs text-[#828F9E] mt-1">
              Select a page to open the visual three-panel editor or create a new page.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5E6A7A]" />
              <input
                type="text"
                placeholder="Search pages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 sm:w-64 bg-[#0E141E] border border-[#1E2736] rounded-sm pl-9 pr-4 py-2 text-xs text-white placeholder-[#5A6577] focus:outline-none focus:border-[#C5A880]"
              />
            </div>

            {/* Create Page Button */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="btn-gold px-4 py-2 text-xs font-semibold rounded-sm inline-flex items-center gap-2 tracking-wider"
            >
              <Plus className="w-4 h-4" />
              <span>Create Page</span>
            </button>
          </div>
        </div>

        {/* Pages Table / Card Grid */}
        <div className="bg-[#0A0D15] border border-[#19212E] rounded-sm overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0E131E] border-b border-[#1A2332] text-[#7A8798] uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-6 font-semibold">Page Title</th>
                  <th className="py-3.5 px-6 font-semibold">URL Slug</th>
                  <th className="py-3.5 px-6 font-semibold">Sections</th>
                  <th className="py-3.5 px-6 font-semibold">Publish Status</th>
                  <th className="py-3.5 px-6 font-semibold">Last Modified</th>
                  <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#151D2A] text-[#D1D9E4]">
                {filteredPages.map((page) => {
                  const isModified = page.status === "draft_modified";
                  const isHomePage = page.slug === "/";
                  const sectionsCount = page.sections?.length || 0;

                  return (
                    <tr
                      key={page.id}
                      className="hover:bg-[#0E141E] transition-colors group"
                    >
                      {/* Title */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-[#131A26] border border-[#232F42] flex items-center justify-center text-[#C5A880]">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <Link
                              href={`/admin/editor/${page.id}`}
                              className="font-serif text-sm font-medium text-white hover:text-[#C5A880] transition-colors flex items-center gap-1.5"
                            >
                              <span>{page.title}</span>
                              {isHomePage && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] bg-[#162235] text-[#C5A880] font-sans uppercase tracking-wider font-semibold">
                                  Home
                                </span>
                              )}
                            </Link>
                            <span className="text-[11px] text-[#697688] font-sans block mt-0.5">
                              {page.template?.replace(/_/g, " ").toUpperCase() || "CUSTOM"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* URL Slug */}
                      <td className="py-4 px-6 font-mono text-xs text-[#8E9AA8]">
                        {page.slug}
                      </td>

                      {/* Sections Count */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5 text-xs text-[#A7B3C2]">
                          <Layers className="w-3.5 h-3.5 text-[#C5A880]" />
                          <span>{sectionsCount} {sectionsCount === 1 ? "section" : "sections"}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        {isModified ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[10px] font-medium bg-amber-950/60 text-amber-300 border border-amber-800/60">
                            <AlertCircle className="w-3 h-3" />
                            <span>Draft Modified</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[10px] font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
                            <CheckCircle className="w-3 h-3" />
                            <span>Published</span>
                          </span>
                        )}
                      </td>

                      {/* Last Modified */}
                      <td className="py-4 px-6 text-[11px] text-[#6E7B8C]">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-[#5A6678]" />
                          <span>
                            {new Date(page.lastModified || "2026-04-12T10:30:00.000Z").toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Edit in Visual Editor */}
                          <Link
                            href={`/admin/editor/${page.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-[#18202D] hover:bg-[#C5A880] hover:text-[#080B10] text-[#E0C7A6] font-medium border border-[#2B384E] transition-all"
                            title="Open Visual Editor"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </Link>

                          {/* Preview Public Link */}
                          <Link
                            href={page.slug}
                            target="_blank"
                            className="p-1.5 rounded-sm text-[#8E9AA8] hover:text-white hover:bg-white/5 transition-colors"
                            title="View Public Page"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>

                          {/* Duplicate */}
                          <button
                            onClick={() => handleDuplicate(page.id, page.title)}
                            className="p-1.5 rounded-sm text-[#8E9AA8] hover:text-white hover:bg-white/5 transition-colors"
                            title="Duplicate Page"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          {/* Delete (if not home) */}
                          {!isHomePage && (
                            <button
                              onClick={() => handleDelete(page.id, page.title)}
                              className="p-1.5 rounded-sm text-[#8E9AA8] hover:text-red-400 hover:bg-red-950/20 transition-colors"
                              title="Delete Page"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Page Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div className="bg-[#0E131A] border border-[#222B3A] rounded-lg w-full max-w-xl flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#1E2636] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-[#17202D] border border-[#C5A880]/30 flex items-center justify-center text-[#C5A880]">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-lg text-white font-medium">
                    Create New Website Page
                  </h3>
                  <p className="text-xs text-[#828F9E]">
                    Enter title, URL slug, and choose a luxury starter template
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-[#8E9AA8] hover:text-white p-1.5 rounded hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreatePage} className="p-6 space-y-5">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#9DAAB8] mb-1.5 font-medium">
                  Page Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bespoke Interiors, Shipyard Tour, Gulf Charter"
                  value={newTitle}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#090D14] border border-[#1E2736] rounded-sm text-sm text-white focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#9DAAB8] mb-1.5 font-medium">
                  URL Slug *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="/bespoke-interiors"
                    value={newSlug}
                    onChange={(e) => setNewSlug(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#090D14] border border-[#1E2736] rounded-sm text-sm font-mono text-[#C5A880] focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
                <p className="text-[11px] text-[#637182] mt-1">
                  Public URL path where this page will be accessed on the site.
                </p>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#9DAAB8] mb-2 font-medium">
                  Choose Starter Template
                </label>
                <div className="space-y-2">
                  {templates.map((tpl) => (
                    <label
                      key={tpl.id}
                      onClick={() => setNewTemplate(tpl.id)}
                      className={`flex items-start gap-3 p-3 rounded-sm border cursor-pointer transition-all ${
                        newTemplate === tpl.id
                          ? "bg-[#141C28] border-[#C5A880] ring-1 ring-[#C5A880]"
                          : "bg-[#0A0D15] border-[#1C2533] hover:border-white/20"
                      }`}
                    >
                      <input
                        type="radio"
                        name="template"
                        checked={newTemplate === tpl.id}
                        onChange={() => setNewTemplate(tpl.id)}
                        className="mt-1 accent-[#C5A880]"
                      />
                      <div>
                        <div className="text-xs font-serif text-white font-medium">
                          {tpl.name}
                        </div>
                        <div className="text-[11px] text-[#7A8798] mt-0.5">
                          {tpl.desc}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#1E2636]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs text-[#8E9AA8] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-gold px-6 py-2.5 text-xs font-semibold rounded-sm tracking-wider"
                >
                  Create & Launch Editor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
