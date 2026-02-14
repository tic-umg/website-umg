import { ReactNode } from 'react';

interface SidebarLeftProps {
  children: ReactNode;
  className?: string;
}

export default function SidebarLeft({ children, className = '' }: SidebarLeftProps) {
  return (
    <aside
      className={`
        w-full lg:w-[260px] lg:flex-shrink-0
        space-y-6
        ${className}
      `}
    >
      {children}
    </aside>
  );
}

// Sidebar widget container component
interface SidebarWidgetProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function SidebarWidget({ title, children, className = '' }: SidebarWidgetProps) {
  return (
    <div
      className={`
        rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm
        dark:border-slate-800 dark:bg-slate-900
        ${className}
      `}
    >
      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
        {title}
      </h3>
      {children}
    </div>
  );
}
