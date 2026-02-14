import PageLayout from "@/components/layout/PageLayout";
import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";

export default function EtablissementsLoading() {
  return (
    <main className="bg-slate-50/60 dark:bg-slate-950">
      <PageLayout variant="full" containerClassName="max-w-[1280px] px-5 md:px-10">
        <div className="mb-8 space-y-3">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-4 w-full max-w-[32rem]" />
        </div>

        <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 mb-8">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto_auto]">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-lg dark:border-slate-800 dark:bg-slate-900">
              <Skeleton className="h-40 w-full rounded-2xl" />
              <Skeleton className="mt-4 h-5 w-3/4" />
              <SkeletonText lines={2} className="mt-3" />
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-emerald-200/80 bg-emerald-50/70 p-5 shadow-sm dark:border-emerald-900/50 dark:bg-emerald-900/20">
          <Skeleton className="h-5 w-56" />
          <SkeletonText lines={2} className="mt-3" />
          <Skeleton className="mt-4 h-9 w-40 rounded-full" />
        </div>
      </PageLayout>
    </main>
  );
}
