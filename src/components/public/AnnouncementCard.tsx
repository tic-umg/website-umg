import Link from 'next/link';
import { AlertCircle, Bell, Info, ExternalLink } from 'lucide-react';
import type { Announcement } from '@/lib/types';

interface AnnouncementCardProps {
  announcement: Announcement;
  variant?: 'default' | 'compact' | 'banner';
  className?: string;
}

export default function AnnouncementCard({ 
  announcement, 
  variant = 'default',
  className = '' 
}: AnnouncementCardProps) {
  const priorityStyles = {
    high: {
      container: 'border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/30',
      icon: 'text-red-500',
      badge: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
    },
    medium: {
      container: 'border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/30',
      icon: 'text-amber-500',
      badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
    },
    low: {
      container: 'border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-950/30',
      icon: 'text-blue-500',
      badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
    },
  };

  const styles = priorityStyles[announcement.priority];

  const IconComponent = announcement.priority === 'high' ? AlertCircle : 
                       announcement.priority === 'medium' ? Bell : Info;

  const formattedDate = new Date(announcement.created_at).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
  });

  if (variant === 'banner') {
    return (
      <div className={`rounded-xl border p-4 ${styles.container} ${className}`}>
        <div className="flex items-start gap-3">
          <IconComponent className={`w-5 h-5 flex-shrink-0 mt-0.5 ${styles.icon}`} />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-900 dark:text-white">
              {announcement.title}
            </p>
            {announcement.content && (
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                {announcement.content}
              </p>
            )}
            {announcement.link_url && (
              <Link 
                href={announcement.link_url}
                className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-blue-600"
              >
                En savoir plus
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-start gap-3 py-3 ${className}`}>
        <IconComponent className={`w-4 h-4 flex-shrink-0 mt-0.5 ${styles.icon}`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-2">
            {announcement.title}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {formattedDate}
          </p>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`rounded-xl border p-4 ${styles.container} ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <IconComponent className={`w-5 h-5 flex-shrink-0 mt-0.5 ${styles.icon}`} />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles.badge}`}>
                {announcement.priority === 'high' ? 'Urgent' : 
                 announcement.priority === 'medium' ? 'Important' : 'Info'}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {formattedDate}
              </span>
            </div>
            <p className="font-semibold text-slate-900 dark:text-white">
              {announcement.title}
            </p>
            {announcement.content && (
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                {announcement.content}
              </p>
            )}
          </div>
        </div>
      </div>
      {announcement.link_url && (
        <div className="mt-3 pl-8">
          <Link 
            href={announcement.link_url}
            className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-blue-600"
          >
            En savoir plus
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}

// List of announcements for sidebar
interface AnnouncementListProps {
  announcements: Announcement[];
  maxItems?: number;
  className?: string;
}

export function AnnouncementList({ 
  announcements, 
  maxItems = 4,
  className = '' 
}: AnnouncementListProps) {
  const items = announcements.slice(0, maxItems);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className={`divide-y divide-slate-100 dark:divide-slate-800 ${className}`}>
      {items.map((announcement) => (
        <AnnouncementCard 
          key={announcement.id} 
          announcement={announcement} 
          variant="compact" 
        />
      ))}
    </div>
  );
}
