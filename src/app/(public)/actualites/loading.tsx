import Container from "@/components/Container";
import PageLayout from "@/components/layout/PageLayout";
import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";

export default function ActualitesLoading() {
  return (
    <main className="bg-slate-50/60 dark:bg-slate-950">
      <section className="bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-white">
        <Container className="max-w-[1280px] px-5 md:px-10">
          <div className="py-6 md:py-8 space-y-3">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-80" />
          </div>
        </Container>
      </section>

      <PageLayout
        variant="with-right"
        containerClassName="max-w-[1280px] px-5 md:px-10"
        sidebarRight={
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="mt-4 h-10 w-full rounded-xl" />
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <Skeleton className="h-4 w-24" />
              <div className="mt-4 space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <Skeleton className="h-4 w-28" />
              <div className="mt-4 flex flex-wrap gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-7 w-16 rounded-full" />
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <Skeleton className="h-4 w-36" />
              <div className="mt-4 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <Skeleton className="h-4 w-40" />
              <SkeletonText lines={3} className="mt-4" />
              <Skeleton className="mt-4 h-9 w-full rounded-xl" />
            </div>
          </div>
        }
      >
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <Skeleton className="h-40 w-full rounded-xl" />
              <Skeleton className="mt-4 h-5 w-3/4" />
              <SkeletonText lines={2} className="mt-3" />
              <Skeleton className="mt-4 h-4 w-32" />
            </div>
          ))}
        </div>
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
          <Skeleton className="h-10 w-56 rounded-xl" />
        </div>
      </PageLayout>
    </main>
  );
}
