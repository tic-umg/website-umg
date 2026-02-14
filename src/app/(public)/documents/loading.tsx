import Container from "@/components/Container";
import PageLayout from "@/components/layout/PageLayout";
import { SidebarWidget } from "@/components/layout/SidebarLeft";
import SidebarRight from "@/components/layout/SidebarRight";
import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";

export default function DocumentsLoading() {
  return (
    <main className="bg-slate-50/60 dark:bg-slate-950">
      <section className="bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-white">
        <Container className="max-w-[1280px] px-5 md:px-10">
          <div className="py-6 md:py-8 space-y-3">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-8 w-72" />
            <Skeleton className="h-4 w-96" />
          </div>
        </Container>
      </section>

      <PageLayout
        variant="with-right"
        containerClassName="max-w-[1280px] px-5 md:px-10"
        sidebarRight={
          <SidebarRight sticky>
            <SidebarWidget title="Rechercher">
              <Skeleton className="h-10 w-full rounded-xl" />
            </SidebarWidget>
            <SidebarWidget title="Catégories">
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            </SidebarWidget>
            <SidebarWidget title="Informations">
              <SkeletonText lines={3} />
              <Skeleton className="mt-4 h-4 w-40" />
            </SidebarWidget>
            <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 p-6 text-white shadow-xl">
              <Skeleton className="h-4 w-32 bg-white/20" />
              <SkeletonText lines={3} className="mt-4" />
              <Skeleton className="mt-4 h-9 w-full rounded-xl bg-white/20" />
            </div>
          </SidebarRight>
        }
      >
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-start gap-4">
                <Skeleton className="h-14 w-14 rounded-xl" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 rounded-full" />
                  <Skeleton className="mt-3 h-5 w-3/4" />
                  <SkeletonText lines={2} className="mt-3" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
          <Skeleton className="h-10 w-56 rounded-xl" />
        </div>
      </PageLayout>
    </main>
  );
}
