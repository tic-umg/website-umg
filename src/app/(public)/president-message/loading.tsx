import Container from "@/components/Container";
import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";

export default function PresidentMessageLoading() {
  return (
    <main className="bg-white dark:bg-slate-950">
      <section className="bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-white">
        <Container className="max-w-[1280px] px-5 md:px-10">
          <div className="py-6 md:py-8 space-y-3">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-8 w-72" />
            <Skeleton className="h-4 w-80" />
          </div>
        </Container>
      </section>
      <Container className="max-w-[1280px] px-5 md:px-10 py-10">
        <div className="grid md:grid-cols-[320px_1fr] gap-8 items-start">
          <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-48" />
            <SkeletonText lines={6} />
            <Skeleton className="h-10 w-32 rounded-full" />
          </div>
        </div>
      </Container>
    </main>
  );
}

