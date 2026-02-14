'use client';

import { Search, X } from 'lucide-react';
import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface SearchBoxProps {
  placeholder?: string;
  className?: string;
  paramName?: string;
  baseUrl?: string;
}

export default function SearchBox({
  placeholder = 'Rechercher...',
  className = '',
  paramName = 'q',
  baseUrl,
}: SearchBoxProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get(paramName) || '';
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    
    if (query.trim()) {
      params.set(paramName, query.trim());
    } else {
      params.delete(paramName);
    }
    
    // Reset to page 1 on new search
    params.delete('page');
    
    const url = baseUrl || window.location.pathname;
    const queryString = params.toString();
    router.push(queryString ? `${url}?${queryString}` : url);
  }, [query, paramName, baseUrl, router, searchParams]);

  const handleClear = useCallback(() => {
    setQuery('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete(paramName);
    params.delete('page');
    
    const url = baseUrl || window.location.pathname;
    const queryString = params.toString();
    router.push(queryString ? `${url}?${queryString}` : url);
  }, [paramName, baseUrl, router, searchParams]);

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="relative flex items-center">
        <Search className="absolute left-4 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="
            w-full pl-11 pr-10 py-3 
            rounded-xl border border-slate-200 bg-white
            text-sm text-slate-700 placeholder:text-slate-400
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
            dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200
          "
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            aria-label="Effacer la recherche"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </form>
  );
}

// Simple version without router integration (for forms)
interface SimpleSearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  className?: string;
}

export function SimpleSearchBox({
  value,
  onChange,
  onSubmit,
  placeholder = 'Rechercher...',
  className = '',
}: SimpleSearchBoxProps) {
  return (
    <div className={`relative flex items-center ${className}`}>
      <Search className="absolute left-4 w-4 h-4 text-slate-400 pointer-events-none" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSubmit?.()}
        placeholder={placeholder}
        className="
          w-full pl-11 pr-4 py-3 
          rounded-xl border border-slate-200 bg-white
          text-sm text-slate-700 placeholder:text-slate-400
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
          dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200
        "
      />
    </div>
  );
}
