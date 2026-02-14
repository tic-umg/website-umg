"use client";

import { clsx } from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Tags,
  Mail,
  Users,
  Image,
  Settings,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  ExternalLink,
  Layers,
  Building2,
  Landmark,
  User,
  Briefcase,
  Handshake,
  Presentation,
  Crown,
  FolderKanban,
  Bell,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: "Slides", href: "/admin/slides", icon: <Presentation className="w-5 h-5" /> },
  { label: "Popups", href: "/admin/popups", icon: <Bell className="w-5 h-5" /> },
  { label: "Articles", href: "/admin/posts", icon: <FileText className="w-5 h-5" /> },
  { label: "Documents", href: "/admin/documents", icon: <FolderOpen className="w-5 h-5" /> },
  { label: "Établissements", href: "/admin/etablissements", icon: <Building2 className="w-5 h-5" /> },
  { label: "Services", href: "/admin/services", icon: <Briefcase className="w-5 h-5" /> },
  { label: "Partenaires", href: "/admin/partners", icon: <Handshake className="w-5 h-5" /> },
  { label: "Projets", href: "/admin/projects", icon: <FolderKanban className="w-5 h-5" /> },
  { label: "Pages Université", href: "/admin/organization", icon: <Landmark className="w-5 h-5" /> },
  { label: "Présidents/Recteurs", href: "/admin/presidents", icon: <Crown className="w-5 h-5" /> },
  { label: "Mot du Président", href: "/admin/president-message", icon: <User className="w-5 h-5" /> },
  { label: "Catégories", href: "/admin/categories", icon: <Layers className="w-5 h-5" /> },
  { label: "Tags", href: "/admin/tags", icon: <Tags className="w-5 h-5" /> },
  { label: "Médiathèque", href: "/admin/media", icon: <Image className="w-5 h-5" /> },
  { label: "Newsletter", href: "/admin/newsletter", icon: <Mail className="w-5 h-5" /> },
  { label: "Abonnés", href: "/admin/newsletter/subscribers", icon: <Users className="w-5 h-5" /> },
];

const bottomNavItems: NavItem[] = [
  { label: "Mon Profil", href: "/admin/profile", icon: <User className="w-5 h-5" /> },
  { label: "Paramètres", href: "/admin/settings", icon: <Settings className="w-5 h-5" /> },
];

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function AdminSidebar({ collapsed, onToggle }: AdminSidebarProps) {
  const pathname = usePathname();

  // Collect all hrefs for comparison
  const allHrefs = [...navItems, ...bottomNavItems].map(item => item.href);

  const isActive = (href: string) => {
    // Dashboard: exact match only
    if (href === "/admin") return pathname === "/admin";
    
    // Check if this href matches the current path
    const matches = pathname === href || pathname.startsWith(href + "/");
    if (!matches) return false;
    
    // Check if there's a more specific match in the navItems
    const hasMoreSpecificMatch = allHrefs.some(otherHref => 
      otherHref !== href && 
      otherHref.startsWith(href + "/") && 
      (pathname === otherHref || pathname.startsWith(otherHref + "/"))
    );
    
    return !hasMoreSpecificMatch;
  };

  return (
    <aside
      className={clsx(
        "fixed left-0 top-0 z-40 h-screen transition-all duration-300 flex flex-col",
        "bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-r border-slate-800/50",
        collapsed ? "w-20" : "w-72"
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
        <Link href="/admin" className="flex items-center gap-3 w-full">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in min-w-0">
              <p className="font-bold text-white text-sm truncate">UMG Admin</p>
              <p className="text-xs text-slate-400 truncate">Université Mahajanga</p>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        <div className="mb-3">
          {!collapsed && (
            <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Navigation
            </p>
          )}
        </div>
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                active
                  ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-white shadow-lg shadow-indigo-500/10"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
              )}
            >
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-r-full" />
              )}
              <div
                className={clsx(
                  "shrink-0 transition-transform duration-200",
                  active ? "text-indigo-400 scale-110" : "text-slate-500 group-hover:text-slate-300 group-hover:scale-105"
                )}
              >
                {item.icon}
              </div>
              {!collapsed && (
                <span className={clsx(
                  "font-medium text-sm animate-fade-in truncate",
                  active ? "text-white" : "text-slate-300"
                )}>{item.label}</span>
              )}
              {!collapsed && item.badge && (
                <span className="ml-auto bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="px-3 py-3 border-t border-slate-800/50 space-y-1">
        {/* View Site Link */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-slate-400 hover:bg-slate-800/50 hover:text-emerald-400"
        >
          <ExternalLink className="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-105" />
          {!collapsed && (
            <span className="font-medium text-sm animate-fade-in truncate">Voir le site</span>
          )}
        </a>

        {/* Settings */}
        {bottomNavItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                active
                  ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-white"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
              )}
            >
              <div
                className={clsx(
                  "shrink-0 transition-transform duration-200",
                  active ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300 group-hover:scale-105"
                )}
              >
                {item.icon}
              </div>
              {!collapsed && (
                <span className="font-medium text-sm animate-fade-in truncate">{item.label}</span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all shadow-lg hover:shadow-indigo-500/20"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>
    </aside>
  );
}
