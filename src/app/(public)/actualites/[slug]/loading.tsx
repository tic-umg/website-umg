import Container from "@/components/Container";
import SidebarRight from "@/components/layout/SidebarRight";
import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";

export default function ArticleLoading() {
  return (
    <main className="bg-white dark:bg-slate-950">
      <section className="relative h-[52vh] min-h-[360px] md:h-[60vh] md:min-h-[420px] overflow-hidden">
        <Skeleton className="h-full w-full rounded-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/60 to-slate-950/90" />
        <Container className="h-full">
          <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white">
            <div className="flex flex-wrap justify-center gap-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-20 rounded-full" />
              ))}
            </div>
            <Skeleton className="mt-4 h-10 w-3/4" />
            <Skeleton className="mt-4 h-4 w-2/3" />
            <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </Container>
      </section>

      <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <Container>
          <div className="py-3">
            <Skeleton className="h-4 w-40" />
          </div>
        </Container>
      </div>

      <section className="py-12 md:py-16">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_300px]">
            <div className="space-y-10">
              <article className="prose prose-slate max-w-none dark:prose-invert">
                <SkeletonText lines={8} />
              </article>
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-7 w-20 rounded-full" />
                  ))}
                </div>
              </div>
              <div>
                <Skeleton className="h-6 w-40" />
                <Skeleton className="mt-2 h-4 w-64" />
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-28 w-full rounded-xl" />
                  ))}
                </div>
              </div>
            </div>

            <SidebarRight sticky>
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <Skeleton className="h-4 w-40" />
                <div className="mt-4 flex gap-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-9 w-9 rounded-full" />
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <Skeleton className="h-4 w-28" />
                <div className="mt-4 space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-4 w-full" />
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <Skeleton className="h-4 w-36" />
                <SkeletonText lines={3} className="mt-4" />
                <Skeleton className="mt-4 h-9 w-full rounded-xl" />
              </div>
            </SidebarRight>
          </div>
        </Container>
      </section>

      <section className="bg-slate-50 dark:bg-slate-900 py-16">
        <Container>
          <div className="flex items-center justify-between gap-4 mb-8">
            <div>
              <Skeleton className="h-3 w-24" />
              <Skeleton className="mt-2 h-6 w-48" />
            </div>
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <Skeleton className="h-32 w-full rounded-xl" />
                <Skeleton className="mt-4 h-5 w-3/4" />
                <SkeletonText lines={2} className="mt-3" />
              </div>
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}
