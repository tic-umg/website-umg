import { ReactNode } from 'react';
import Container from '@/components/Container';

type LayoutVariant = 'full' | 'with-left' | 'with-right' | 'three-column';

interface PageLayoutProps {
  children: ReactNode;
  sidebarLeft?: ReactNode;
  sidebarRight?: ReactNode;
  variant?: LayoutVariant;
  className?: string;
  containerClassName?: string;
}

export default function PageLayout({
  children,
  sidebarLeft,
  sidebarRight,
  variant = 'full',
  className = '',
  containerClassName = '',
}: PageLayoutProps) {
  // Determine grid layout based on variant and provided sidebars
  const getGridClasses = () => {
    switch (variant) {
      case 'three-column':
        return 'lg:grid lg:grid-cols-[260px_1fr_300px] lg:gap-8';
      case 'with-left':
        return 'lg:grid lg:grid-cols-[260px_1fr] lg:gap-8';
      case 'with-right':
        return 'lg:grid lg:grid-cols-[1fr_300px] lg:gap-8';
      case 'full':
      default:
        return '';
    }
  };

  return (
    <div className={`py-8 md:py-12 ${className}`}>
      <Container className={containerClassName}>
        <div className={getGridClasses()}>
          {/* Left Sidebar - Hidden on mobile, shown first in grid */}
          {(variant === 'three-column' || variant === 'with-left') && sidebarLeft && (
            <div className="hidden lg:block order-1">
              {sidebarLeft}
            </div>
          )}

          {/* Main Content - Always present */}
          <main className={`
            order-2 min-w-0
            ${variant !== 'full' ? 'mb-8 lg:mb-0' : ''}
          `}>
            {children}
          </main>

          {/* Right Sidebar */}
          {(variant === 'three-column' || variant === 'with-right') && sidebarRight && (
            <div className="order-3 mt-8 lg:mt-0">
              {sidebarRight}
            </div>
          )}

          {/* Mobile: Left sidebar content at bottom */}
          {(variant === 'three-column' || variant === 'with-left') && sidebarLeft && (
            <div className="lg:hidden order-4 mt-8">
              {sidebarLeft}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}

// Page header component for consistent page titles
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  label?: string;
  children?: ReactNode;
  className?: string;
  variant?: 'default' | 'gradient' | 'dark';
}

export function PageHeader({
  title,
  subtitle,
  label,
  children,
  className = '',
  variant = 'gradient',
}: PageHeaderProps) {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-white',
    gradient: 'bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700 text-white',
    dark: 'bg-gradient-to-br from-slate-900 via-indigo-700 to-blue-700 text-white',
  };

  return (
    <section className={`relative overflow-hidden ${variantStyles[variant]} ${className}`}>
      <Container>
        <div className="py-16 md:py-20">
          {label && (
            <p className={`text-sm uppercase tracking-[0.2em] ${
              variant === 'default' ? 'text-indigo-600' : 'text-indigo-100'
            }`}>
              {label}
            </p>
          )}
          <h1 className="mt-3 text-3xl md:text-5xl font-bold tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className={`mt-4 max-w-2xl text-lg ${
              variant === 'default' ? 'text-slate-600 dark:text-slate-300' : 'text-indigo-100'
            }`}>
              {subtitle}
            </p>
          )}
          {children}
        </div>
      </Container>
    </section>
  );
}
