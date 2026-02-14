import Container from "@/components/Container";
import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";

export default function ContactLoading() {
  return (
    <main className="bg-slate-50/70 dark:bg-slate-950">
      <section className="bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-white">
        <Container className="max-w-[1280px] px-5 md:px-10">
          <div className="py-10 md:py-12 space-y-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-60" />
            <Skeleton className="h-4 w-full max-w-[28rem]" />
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container className="max-w-[1280px] px-5 md:px-10">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
              <Skeleton className="h-6 w-48" />
              <SkeletonText lines={2} className="mt-3" />
              <div className="mt-6 space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-xl" />
                ))}
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-12 w-40 rounded-xl" />
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
                <Skeleton className="h-5 w-36" />
                <div className="mt-4 space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-4 w-full" />
                  ))}
                </div>
              </div>
              <div className="rounded-3xl border border-slate-200/70 bg-white p-4 shadow-lg dark:border-slate-800 dark:bg-slate-900">
                <Skeleton className="h-64 w-full rounded-2xl" />
              </div>
              <div className="rounded-3xl bg-gradient-to-br from-indigo-600 to-blue-600 p-6 text-white shadow-lg">
                <Skeleton className="h-5 w-40" />
                <SkeletonText lines={2} className="mt-3" />
              </div>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
