import type { ReactNode } from 'react';

type InstitutionalPageLayoutProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  updatedAt?: string;
};

export function InstitutionalPageLayout({ title, subtitle, children, updatedAt }: InstitutionalPageLayoutProps) {
  return (
    <div className="bg-white dark:bg-gray-900/50 py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <header className="mb-8 md:mb-12 text-center">
            <h1 className="text-3xl md:text-5xl font-extrabold text-primary dark:text-white mb-2 tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300">
                {subtitle}
              </p>
            )}
          </header>

          <div className="prose prose-lg dark:prose-invert max-w-none prose-a:text-blue-600 hover:prose-a:text-blue-800 dark:prose-a:text-blue-400 dark:hover:prose-a:text-blue-300">
            {children}
          </div>

          {updatedAt && (
             <footer className="mt-12 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Dernière mise à jour : {updatedAt}
                </p>
            </footer>
          )}
        </div>
      </div>
    </div>
  );
}
