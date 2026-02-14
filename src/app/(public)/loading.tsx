import { Skeleton, SkeletonCard, SkeletonText } from "@/components/ui/Skeleton";

export default function PublicLoading() {
  return (
    <div className="w-full">
      <section className="px-6 sm:px-10 lg:px-16 pt-10 pb-12">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-12 w-full" />
            <SkeletonText lines={3} />
            <div className="flex gap-4">
              <Skeleton className="h-12 w-40 rounded-xl" />
              <Skeleton className="h-12 w-32 rounded-xl" />
            </div>
          </div>
          <div className="relative">
            <Skeleton className="h-72 w-full rounded-3xl" />
            <div className="absolute -bottom-6 left-6 right-6 grid grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 sm:px-10 lg:px-16 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 sm:px-10 lg:px-16 pb-20">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-10 w-28 rounded-xl" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
