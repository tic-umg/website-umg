import Container from "@/components/Container";
import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";

export default function PartenairesLoading() {
  return (
    <main className="bg-slate-50/60 dark:bg-slate-950">
      <section className="bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-white">
        <Container className="max-w-[1280px] px-5 md:px-10">
          <div className="py-10 md:py-12 space-y-3">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-8 w-72" />
            <Skeleton className="h-4 w-full max-w-[26rem]" />
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container className="max-w-[1280px] px-5 md:px-10">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-start gap-3">
                  <Skeleton className="h-12 w-12 rounded-2xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <SkeletonText lines={2} className="mt-4" />
                <Skeleton className="mt-4 h-4 w-24" />
              </div>
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}
