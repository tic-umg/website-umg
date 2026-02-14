import Container from "@/components/Container";
import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";

export default function OrganisationLoading() {
  return (
    <main className="bg-white dark:bg-slate-950">
      <section className="bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-white">
        <Container className="max-w-[1280px] px-5 md:px-10">
          <div className="py-10 md:py-12 space-y-3">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-full max-w-[26rem]" />
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container className="max-w-[1280px] px-5 md:px-10">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200/70 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">
                <div className="border-b border-slate-200/70 px-6 py-4">
                  <Skeleton className="h-3 w-40" />
                </div>
                <div className="space-y-8 px-6 py-6">
                  <div>
                    <Skeleton className="h-5 w-32" />
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full rounded-2xl" />
                      ))}
                    </div>
                  </div>
                  <div>
                    <Skeleton className="h-5 w-56" />
                    <div className="mt-4 space-y-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full rounded-2xl" />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Skeleton className="h-5 w-36" />
                    <div className="flex flex-wrap gap-2">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-9 w-24 rounded-full" />
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-9 w-24 rounded-full" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
                <Skeleton className="h-5 w-48" />
                <SkeletonText lines={4} className="mt-4" />
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
                <Skeleton className="h-5 w-32" />
                <div className="mt-4 space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-4 w-full" />
                  ))}
                </div>
              </div>
              <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
                <Skeleton className="h-5 w-28" />
                <SkeletonText lines={3} className="mt-4" />
              </div>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
