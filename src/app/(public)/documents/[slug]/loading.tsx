import Container from "@/components/Container";
import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";

export default function DocumentShowLoading() {
  return (
    <main className="py-10 bg-white dark:bg-slate-950">
      <Container>
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="mt-4 h-10 w-36 rounded-xl" />
        <div className="mt-8">
          <SkeletonText lines={8} />
        </div>
      </Container>
    </main>
  );
}
