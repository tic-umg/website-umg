'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  className?: string;
}

export default function Pagination({ 
  currentPage, 
  totalPages, 
  baseUrl,
  className = '' 
}: PaginationProps) {
  if (totalPages <= 1) return null;

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const showPages = 5; // Max pages to show
    
    if (totalPages <= showPages) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first, last, current and surrounding pages
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('ellipsis');
      }
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('ellipsis');
      }
      
      pages.push(totalPages);
    }
    
    return pages;
  };

  const getPageUrl = (page: number) => {
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}page=${page}`;
  };

  return (
    <nav 
      className={`flex flex-wrap items-center justify-between gap-4 ${className}`}
      aria-label="Pagination"
    >
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Page <span className="font-medium">{currentPage}</span> sur <span className="font-medium">{totalPages}</span>
      </p>
      
      <div className="flex items-center gap-1">
        {/* Previous button */}
        {currentPage > 1 ? (
          <Link
            href={getPageUrl(currentPage - 1)}
            className="flex items-center justify-center w-10 h-10 rounded-full text-slate-600 hover:bg-slate-100 transition-colors dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label="Page précédente"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
        ) : (
          <span className="flex items-center justify-center w-10 h-10 rounded-full text-slate-300 dark:text-slate-700 cursor-not-allowed">
            <ChevronLeft className="w-5 h-5" />
          </span>
        )}

        {/* Page numbers */}
        {getPageNumbers().map((page, index) => 
          page === 'ellipsis' ? (
            <span key={`ellipsis-${index}`} className="px-2 text-slate-400">
              …
            </span>
          ) : (
            <Link
              key={page}
              href={getPageUrl(page)}
              className={`
                flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold transition-colors
                ${page === currentPage
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                }
              `}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </Link>
          )
        )}

        {/* Next button */}
        {currentPage < totalPages ? (
          <Link
            href={getPageUrl(currentPage + 1)}
            className="flex items-center justify-center w-10 h-10 rounded-full text-slate-600 hover:bg-slate-100 transition-colors dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label="Page suivante"
          >
            <ChevronRight className="w-5 h-5" />
          </Link>
        ) : (
          <span className="flex items-center justify-center w-10 h-10 rounded-full text-slate-300 dark:text-slate-700 cursor-not-allowed">
            <ChevronRight className="w-5 h-5" />
          </span>
        )}
      </div>
    </nav>
  );
}
