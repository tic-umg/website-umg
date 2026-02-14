import Container from "@/components/Container";
import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";

export default function TextesLoading() {
  return (
    <main>
      <section className="bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-white">
        <Container>
          <div className="py-10 md:py-12 space-y-3">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-64" />
          </div>
        </Container>
      </section>

      <section className="py-12">
        <Container>
          <div className="max-w-3xl mx-auto space-y-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <article key={i} className="bg-white rounded-2xl p-6 border border-slate-200">
                <Skeleton className="h-6 w-2/3" />
                <SkeletonText lines={4} className="mt-4" />
              </article>
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}
