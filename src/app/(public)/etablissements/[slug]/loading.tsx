import Container from "@/components/Container";
import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";

export default function EtablissementDetailLoading() {
  return (
    <main className="bg-white dark:bg-slate-950">
      <section className="relative overflow-hidden bg-slate-900 text-white">
        <Skeleton className="absolute inset-0 h-full w-full rounded-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/60 to-slate-950/90" />
        <Container>
          <div className="relative z-10 py-16 md:py-20 space-y-4">
            <Skeleton className="h-4 w-32" />
            <div className="flex flex-wrap items-center gap-6">
              <Skeleton className="h-20 w-20 rounded-2xl" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-72" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
                <div className="flex gap-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-9 w-24 rounded-full" />
                  ))}
                </div>
                <SkeletonText lines={6} className="mt-6" />
              </div>
            </div>
            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
                <Skeleton className="h-5 w-32" />
                <SkeletonText lines={3} className="mt-3" />
                <Skeleton className="mt-4 h-64 w-full rounded-2xl" />
                <Skeleton className="mt-4 h-4 w-40" />
              </div>
              <div className="rounded-3xl border border-slate-200/70 bg-gradient-to-br from-emerald-600 to-teal-600 p-6 shadow-lg">
                <Skeleton className="h-5 w-32" />
                <SkeletonText lines={2} className="mt-3" />
                <Skeleton className="mt-4 h-11 w-full rounded-2xl" />
              </div>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
