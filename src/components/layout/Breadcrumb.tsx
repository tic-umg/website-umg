'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Fil d'ariane"
      className={`flex items-center gap-2 text-sm ${className}`}
    >
      <Link
        href="/"
        className="flex items-center gap-1 text-slate-500 hover:text-indigo-600 transition-colors dark:text-slate-400"
      >
        <Home className="w-4 h-4" />
        <span className="sr-only">Accueil</span>
      </Link>

      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
          {item.href ? (
            <Link
              href={item.href}
              className="text-slate-500 hover:text-indigo-600 transition-colors dark:text-slate-400"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-900 font-medium dark:text-white">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
