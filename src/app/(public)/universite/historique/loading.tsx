import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";

export default function HistoriqueLoading() {
  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen">
      <div className="bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-white py-10 md:py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-10 space-y-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-52" />
          <Skeleton className="h-4 w-full max-w-[26rem]" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-10 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0 space-y-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <Skeleton className="h-4 w-40" />
                </div>
                <div className="p-4">
                  <SkeletonText lines={4} />
                </div>
              </div>
            ))}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <Skeleton className="h-4 w-56" />
              </div>
              <div className="p-4">
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                      <Skeleton className="h-16 w-full" />
                      <div className="p-2">
                        <Skeleton className="h-3 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <aside className="lg:w-64 flex-shrink-0 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                <Skeleton className="h-4 w-24" />
                <SkeletonText lines={3} className="mt-3" />
              </div>
            ))}
          </aside>
        </div>
      </div>
    </div>
  );
}
