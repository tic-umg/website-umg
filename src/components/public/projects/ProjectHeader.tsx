import Container from "@/components/Container";
import Image from "next/image";

export type ProjectHeaderProps = {
  kicker?: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  imageAlt?: string;
};

export default function ProjectHeader({
  kicker = "Projets Internationale",
  title,
  description,
  imageUrl,
  imageAlt,
}: ProjectHeaderProps) {
  return (
    <section className="bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-white">
      <Container className="max-w-[1280px] px-5 md:px-10">
        <div className="py-6 md:py-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300">{kicker}</p>
              <h1 className="mt-3 text-xl md:text-3xl font-bold tracking-tight">{title}</h1>
              {description ? (
                <p className="mt-3 max-w-2xl text-base text-slate-600 dark:text-slate-300">{description}</p>
              ) : null}
            </div>

            {imageUrl ? (
              <div className="shrink-0">
                <div className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950/20">
                  <div className="relative h-14 w-40 md:h-16 md:w-48">
                    <Image
                      src={imageUrl}
                      alt={imageAlt || title}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
}
