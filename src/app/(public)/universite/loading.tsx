import Container from "@/components/Container";
import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";

export default function UniversiteLoading() {
  return (
    <main className="bg-white dark:bg-slate-950">
      <section className="bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-white">
        <Container className="max-w-[1280px] px-5 md:px-10">
          <div className="py-10 md:py-12 space-y-3">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-8 w-full max-w-[28rem]" />
            <Skeleton className="h-4 w-full max-w-[32rem]" />
            <div className="mt-6 flex flex-wrap gap-3">
              <Skeleton className="h-10 w-44 rounded-full" />
              <Skeleton className="h-10 w-48 rounded-full" />
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container className="max-w-[1280px] px-5 md:px-10">
          <div className="grid gap-6 md:grid-cols-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
                <Skeleton className="h-12 w-12 rounded-2xl" />
                <Skeleton className="mt-4 h-5 w-3/4" />
                <SkeletonText lines={2} className="mt-3" />
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-slate-50 py-16 dark:bg-slate-900">
        <Container className="max-w-[1280px] px-5 md:px-10">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <Skeleton className="h-3 w-24" />
              <Skeleton className="mt-3 h-7 w-64" />
              <SkeletonText lines={3} className="mt-4" />
            </div>
            <div className="grid grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="mt-3 h-4 w-24" />
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
