import Link from 'next/link';
import { Calendar, MapPin, Clock, ArrowRight } from 'lucide-react';
import type { Event } from '@/lib/types';

interface EventCardProps {
  event: Event;
  variant?: 'default' | 'compact' | 'calendar';
  className?: string;
}

export default function EventCard({ 
  event, 
  variant = 'default',
  className = '' 
}: EventCardProps) {
  const startDate = new Date(event.start_date);
  const endDate = event.end_date ? new Date(event.end_date) : null;

  const day = startDate.getDate();
  const month = startDate.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase();
  const time = startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const fullDate = startDate.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  if (variant === 'calendar') {
    return (
      <div className={`flex gap-4 ${className}`}>
        {/* Calendar date box */}
        <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-indigo-600 text-white flex flex-col items-center justify-center">
          <span className="text-2xl font-bold leading-none">{day}</span>
          <span className="text-xs font-medium uppercase">{month}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-slate-900 dark:text-white line-clamp-2">
            {event.title}
          </h4>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {time}
            </span>
            {event.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {event.location}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-start gap-3 py-3 ${className}`}>
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex flex-col items-center justify-center">
          <span className="text-sm font-bold leading-none">{day}</span>
          <span className="text-[10px] uppercase">{month}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-1">
            {event.title}
          </p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {time}
            {event.location && ` · ${event.location}`}
          </p>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <article
      className={`
        rounded-2xl border border-slate-200/80 bg-white p-6 
        shadow-sm transition-all hover:shadow-lg
        dark:border-slate-800 dark:bg-slate-900
        ${className}
      `}
    >
      <div className="flex items-start gap-4">
        {/* Calendar date box */}
        <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white flex flex-col items-center justify-center shadow-lg">
          <span className="text-2xl font-bold leading-none">{day}</span>
          <span className="text-xs font-medium uppercase">{month}</span>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {event.title}
          </h3>
          
          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {fullDate}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {time}
            </span>
          </div>

          {event.location && (
            <div className="mt-2 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
              <MapPin className="w-4 h-4" />
              {event.location}
            </div>
          )}

          {event.description && (
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
              {event.description}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

// List of events for sidebar
interface EventListProps {
  events: Event[];
  maxItems?: number;
  className?: string;
}

export function EventList({ 
  events, 
  maxItems = 4,
  className = '' 
}: EventListProps) {
  const items = events.slice(0, maxItems);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className={`divide-y divide-slate-100 dark:divide-slate-800 ${className}`}>
      {items.map((event) => (
        <EventCard 
          key={event.id} 
          event={event} 
          variant="compact" 
        />
      ))}
      {events.length > maxItems && (
        <Link 
          href="/agenda"
          className="pt-3 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-blue-600"
        >
          Voir tout l'agenda
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}
