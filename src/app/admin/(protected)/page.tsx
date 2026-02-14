"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  FolderOpen,
  Users,
  Building2,
  TrendingUp,
  Plus,
  ArrowRight,
  Mail,
  Calendar,
  Clock,
  Landmark,
} from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SkeletonDashboard } from "@/components/ui/Skeleton";

interface Stats {
  posts: number;
  documents: number;
  subscribers: number;
  etablissements: number;
  campaigns: number;
  categories: number;
}

interface RecentPost {
  id: number;
  title: string;
  status: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch all stats in parallel
        const [postsRes, docsRes, subsRes, etabRes, campaignsRes, catsRes] = await Promise.all([
          fetch("/api/admin/posts?per_page=5"),
          fetch("/api/admin/documents?per_page=1"),
          fetch("/api/admin/newsletter/subscribers?per_page=1"),
          fetch("/api/admin/etablissements?per_page=1"),
          fetch("/api/admin/newsletter/campaigns?per_page=1"),
          fetch("/api/admin/categories?per_page=1"),
        ]);

        const [postsData, docsData, subsData, etabData, campaignsData, catsData] = await Promise.all([
          postsRes.json(),
          docsRes.json(),
          subsRes.json(),
          etabRes.json(),
          campaignsRes.json(),
          catsRes.json(),
        ]);

        // Extract totals from pagination meta
        setStats({
          posts: postsData.meta?.total ?? postsData.data?.length ?? 0,
          documents: docsData.meta?.total ?? docsData.data?.length ?? 0,
          subscribers: subsData.meta?.total ?? subsData.data?.length ?? 0,
          etablissements: etabData.meta?.total ?? etabData.data?.length ?? 0,
          campaigns: campaignsData.meta?.total ?? campaignsData.data?.length ?? 0,
          categories: catsData.meta?.total ?? catsData.data?.length ?? 0,
        });

        // Recent posts
        setRecentPosts(postsData.data?.slice(0, 5) ?? []);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        setStats({ posts: 0, documents: 0, subscribers: 0, etablissements: 0, campaigns: 0, categories: 0 });
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const quickActions = [
    { label: "Nouvel article", href: "/admin/posts/create", icon: <FileText className="w-5 h-5" />, color: "indigo" },
    { label: "Ajouter document", href: "/admin/documents/create", icon: <FolderOpen className="w-5 h-5" />, color: "emerald" },
    { label: "Campagne newsletter", href: "/admin/newsletter/campaigns/create", icon: <Mail className="w-5 h-5" />, color: "violet" },
    { label: "Nouvel établissement", href: "/admin/etablissements", icon: <Building2 className="w-5 h-5" />, color: "amber" },
  ];

  // Loading state with skeleton
  if (loading) {
    return <SkeletonDashboard />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tableau de bord</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Bienvenue sur le panneau d'administration
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Calendar className="w-4 h-4" />
          <span>{new Date().toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Articles"
          value={stats?.posts ?? 0}
          icon={<FileText className="w-6 h-6" />}
          color="indigo"
        />
        <StatCard
          title="Documents"
          value={stats?.documents ?? 0}
          icon={<FolderOpen className="w-6 h-6" />}
          color="emerald"
        />
        <StatCard
          title="Abonnés newsletter"
          value={stats?.subscribers ?? 0}
          icon={<Users className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Établissements"
          value={stats?.etablissements ?? 0}
          icon={<Building2 className="w-6 h-6" />}
          color="amber"
        />
      </div>

      {/* Quick Actions */}
      <Card padding="lg">
        <CardHeader>Actions rapides</CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex flex-col items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  {action.icon}
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  {action.label}
                </span>
              </Link>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Posts */}
        <div className="lg:col-span-2">
          <Card padding="none">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 dark:text-white">Articles récents</h3>
              <Link
                href="/admin/posts"
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium flex items-center gap-1"
              >
                Voir tout <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {recentPosts.length > 0 ? (
                recentPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/admin/posts/${post.id}/edit`}
                    className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {post.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(post.created_at).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <Badge variant={post.status === "published" ? "success" : "default"}>
                      {post.status === "published" ? "Publié" : post.status === "draft" ? "Brouillon" : post.status}
                    </Badge>
                  </Link>
                ))
              ) : (
                <div className="px-6 py-8 text-center text-slate-500">
                  Aucun article récent
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          {/* Overview Card */}
          <Card>
            <CardHeader>Vue d'ensemble</CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Campagnes
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">{stats?.campaigns ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <Landmark className="w-4 h-4" />
                    Catégories
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">{stats?.categories ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Établissements
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">{stats?.etablissements ?? 0}</span>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader>Liens rapides</CardHeader>
            <CardBody>
              <div className="space-y-2">
                <Link
                  href="/admin/newsletter"
                  className="flex items-center gap-3 p-3 bg-violet-50 dark:bg-violet-900/20 rounded-xl hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors"
                >
                  <Mail className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  <span className="text-sm font-medium text-slate-900 dark:text-white">Newsletter</span>
                </Link>
                <Link
                  href="/admin/etablissements"
                  className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                >
                  <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm font-medium text-slate-900 dark:text-white">Établissements</span>
                </Link>
                <Link
                  href="/admin/organization"
                  className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                >
                  <Landmark className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <span className="text-sm font-medium text-slate-900 dark:text-white">Pages Université</span>
                </Link>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
