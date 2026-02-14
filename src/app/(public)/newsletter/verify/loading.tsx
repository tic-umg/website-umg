import Container from "@/components/Container";
import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";

export default function NewsletterVerifyLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-20 bg-[#f6f6f8] dark:bg-[#111318]">
      <Container>
        <div className="max-w-lg mx-auto p-8 bg-white dark:bg-[#1e2634] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex flex-col items-center text-center">
            <Skeleton className="h-12 w-12 rounded-full" />
            <Skeleton className="mt-4 h-6 w-48" />
            <SkeletonText lines={2} className="mt-3" />
            <Skeleton className="mt-6 h-10 w-40 rounded-lg" />
          </div>
        </div>
      </Container>
    </div>
  );
}
