import Container from "@/components/Container";
import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";

export default function ServicesLoading() {
  return (
    <main className="bg-white dark:bg-slate-950">
      <section className="bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-white">
        <Container className="max-w-[1280px] px-5 md:px-10">
          <div className="py-10 md:py-12 space-y-3">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-8 w-80" />
            <Skeleton className="h-4 w-full max-w-[28rem]" />
          </div>
        </Container>
      </section>

      <section className="py-12">
        <Container className="max-w-[1280px] px-5 md:px-10">
          <div className="rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-[#1e2736]">
            <div className="flex flex-col gap-4 lg:flex-row">
              <Skeleton className="h-12 w-full rounded-lg" />
              <div className="flex w-full flex-col gap-4 sm:flex-row lg:w-auto">
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white p-5 shadow-lg dark:border-slate-800 dark:bg-slate-900"
              >
                <Skeleton className="h-24 w-full rounded-2xl" />
                <Skeleton className="mt-4 h-5 w-3/4" />
                <SkeletonText lines={2} className="mt-3" />
                <Skeleton className="mt-4 h-4 w-32" />
              </div>
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}
