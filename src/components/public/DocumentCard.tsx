import Link from 'next/link';
import { FileText, FileSpreadsheet, FileArchive, FileImage, Download, ExternalLink, Star, FileVideo, File, Presentation } from 'lucide-react';
import type { Document } from '@/lib/types';
import { getServerI18n } from "@/i18n/server";

// Custom PDF Icon component - clean and readable
function PdfIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Document shape */}
      <path d="M6 2C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2H6Z" fill="currentColor" fillOpacity="0.15"/>
      <path d="M14 2L20 8H15C14.4477 8 14 7.55228 14 7V2Z" fill="currentColor" fillOpacity="0.3"/>
      <path d="M6 2C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8M14 2L20 8M14 2V7C14 7.55228 14.4477 8 15 8H20M14 2H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      {/* PDF text */}
      <text x="12" y="16" textAnchor="middle" fill="currentColor" fontSize="6" fontWeight="bold" fontFamily="system-ui, sans-serif">PDF</text>
    </svg>
  );
}

// Custom Word Icon component
function WordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7 13L8.5 18L10 14.5L11.5 18L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

interface FileIconConfig {
  icon: React.ComponentType<{ className?: string }>;
  bgColor: string;
  iconColor: string;
  darkBgColor: string;
  darkIconColor: string;
}

interface DocumentCardProps {
  document: Document;
  variant?: 'default' | 'compact' | 'row';
  baseApiUrl?: string;
  className?: string;
}

export default async function DocumentCard({
  document,
  variant = 'default',
  baseApiUrl = process.env.NEXT_PUBLIC_API_URL || '',
  className = ''
}: DocumentCardProps) {
  const { lang, t } = await getServerI18n();

  // Determine icon and colors based on file type
  const getFileConfig = (): FileIconConfig => {
    const type = document.file_type?.toLowerCase() || '';

    // PDF
    if (type.includes('pdf')) {
      return {
        icon: PdfIcon,
        bgColor: 'bg-red-50',
        iconColor: 'text-red-600',
        darkBgColor: 'dark:bg-red-900/30',
        darkIconColor: 'dark:text-red-400',
      };
    }

    // Word documents
    if (type.includes('word') || type.includes('document') || type.includes('docx') || type.includes('doc') || type.includes('msword')) {
      return {
        icon: WordIcon,
        bgColor: 'bg-blue-50',
        iconColor: 'text-blue-600',
        darkBgColor: 'dark:bg-blue-900/30',
        darkIconColor: 'dark:text-blue-400',
      };
    }

    // Excel/Spreadsheets
    if (type.includes('spreadsheet') || type.includes('excel') || type.includes('xlsx') || type.includes('xls') || type.includes('csv')) {
      return {
        icon: FileSpreadsheet,
        bgColor: 'bg-emerald-50',
        iconColor: 'text-emerald-600',
        darkBgColor: 'dark:bg-emerald-900/30',
        darkIconColor: 'dark:text-emerald-400',
      };
    }

    // PowerPoint
    if (type.includes('presentation') || type.includes('powerpoint') || type.includes('pptx') || type.includes('ppt')) {
      return {
        icon: Presentation,
        bgColor: 'bg-orange-50',
        iconColor: 'text-orange-600',
        darkBgColor: 'dark:bg-orange-900/30',
        darkIconColor: 'dark:text-orange-400',
      };
    }

    // Images
    if (type.includes('image') || type.includes('png') || type.includes('jpg') || type.includes('jpeg') || type.includes('gif') || type.includes('webp')) {
      return {
        icon: FileImage,
        bgColor: 'bg-purple-50',
        iconColor: 'text-purple-600',
        darkBgColor: 'dark:bg-purple-900/30',
        darkIconColor: 'dark:text-purple-400',
      };
    }

    // Videos
    if (type.includes('video') || type.includes('mp4') || type.includes('avi') || type.includes('mov') || type.includes('webm')) {
      return {
        icon: FileVideo,
        bgColor: 'bg-pink-50',
        iconColor: 'text-pink-600',
        darkBgColor: 'dark:bg-pink-900/30',
        darkIconColor: 'dark:text-pink-400',
      };
    }

    // Archives
    if (type.includes('archive') || type.includes('zip') || type.includes('rar') || type.includes('7z') || type.includes('tar') || type.includes('gz')) {
      return {
        icon: FileArchive,
        bgColor: 'bg-amber-50',
        iconColor: 'text-amber-600',
        darkBgColor: 'dark:bg-amber-900/30',
        darkIconColor: 'dark:text-amber-400',
      };
    }

    // Text files
    if (type.includes('text') || type.includes('txt')) {
      return {
        icon: FileText,
        bgColor: 'bg-slate-100',
        iconColor: 'text-slate-600',
        darkBgColor: 'dark:bg-slate-700',
        darkIconColor: 'dark:text-slate-300',
      };
    }

    // Default
    return {
      icon: File,
      bgColor: 'bg-slate-100',
      iconColor: 'text-slate-500',
      darkBgColor: 'dark:bg-slate-700',
      darkIconColor: 'dark:text-slate-400',
    };
  };

  const fileConfig = getFileConfig();
  const FileIcon = fileConfig.icon;

  // Format file size
  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return null;
    if (lang === "fr") {
      if (bytes < 1024) return `${bytes} o`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
    }
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const fileSize = formatFileSize(document.file_size);
  const fileType = document.file_type?.toUpperCase() || 'PDF';

  const formattedDate = new Date(document.created_at).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const downloadUrl = document.file_url || `${baseApiUrl}/documents/${document.id}/download`;

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-3 py-3 ${className}`}>
        <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${fileConfig.bgColor} ${fileConfig.darkBgColor} flex items-center justify-center relative`}>
          <FileIcon className={`w-5 h-5 ${fileConfig.iconColor} ${fileConfig.darkIconColor}`} />
          {document.is_important && (
            <Star className="w-3 h-3 text-amber-500 fill-amber-500 absolute -top-1 -right-1" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <Link
            href={`/documents/${document.slug}`}
            className="text-sm font-medium text-slate-900 dark:text-white hover:text-blue-600 line-clamp-1"
          >
            {document.title}
          </Link>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {fileType} {fileSize && `· ${fileSize}`}
          </p>
        </div>
        <a
          href={downloadUrl}
          className="flex-shrink-0 p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
          title={t("documents.download")}
        >
          <Download className="w-4 h-4" />
        </a>
      </div>
    );
  }

  if (variant === 'row') {
    return (
      <div
        className={`
          flex flex-col md:flex-row md:items-center md:justify-between gap-4
          rounded-xl border border-slate-200/80 bg-white px-5 py-4
          shadow-sm transition-all hover:shadow-lg
          dark:border-slate-800 dark:bg-slate-900
          ${className}
        `}
      >
        <div className="flex items-start gap-4">
          <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${fileConfig.bgColor} ${fileConfig.darkBgColor} flex items-center justify-center relative`}>
            <FileIcon className={`w-6 h-6 ${fileConfig.iconColor} ${fileConfig.darkIconColor}`} />
            {document.is_important && (
              <Star className="w-4 h-4 text-amber-500 fill-amber-500 absolute -top-1 -right-1" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Link
                href={`/documents/${document.slug}`}
                className="text-lg font-semibold text-slate-900 dark:text-white hover:text-blue-600 transition-colors"
              >
                {document.title}
              </Link>
              {document.is_important && (
                <Star className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0" />
              )}
            </div>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 line-clamp-1">
              {document.excerpt || t("documents.fallbackExcerpt")}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 md:flex-shrink-0">
          <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-300">
            {fileType} {fileSize && `· ${fileSize}`}
          </span>
          <a
            href={downloadUrl}
            className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
          >
            <Download className="w-4 h-4" />
            {t("documents.download")}
          </a>
        </div>
      </div>
    );
  }

  // Default variant (card)
  return (
    <div
      className={`
        rounded-2xl border border-slate-200/80 bg-white p-6
        shadow-sm transition-all hover:shadow-lg
        dark:border-slate-800 dark:bg-slate-900
        ${className}
      `}
    >
      <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 w-14 h-14 rounded-xl ${fileConfig.bgColor} ${fileConfig.darkBgColor} flex items-center justify-center relative`}>
          <FileIcon className={`w-7 h-7 ${fileConfig.iconColor} ${fileConfig.darkIconColor}`} />
          {document.is_important && (
            <Star className="w-4 h-4 text-amber-500 fill-amber-500 absolute -top-1 -right-1" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {document.category && (
              <span className="rounded-full bg-indigo-100 dark:bg-indigo-900/50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:text-indigo-300">
                {document.category.name}
              </span>
            )}
            {document.is_important && (
              <span className="rounded-full bg-amber-100 dark:bg-amber-900/50 p-1 text-xs font-medium text-amber-700 dark:text-amber-300 flex items-center">
                <Star className="w-3 h-3 fill-current" />
              </span>
            )}
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {formattedDate}
            </span>
          </div>
          <Link
            href={`/documents/${document.slug}`}
            className="text-lg font-bold text-slate-900 dark:text-white hover:text-blue-600 transition-colors"
          >
            {document.title}
          </Link>
          {document.excerpt && (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
              {document.excerpt}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {fileType} {fileSize && `· ${fileSize}`}
        </span>
        <a
          href={downloadUrl}
          className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-blue-600"
        >
          <Download className="w-4 h-4" />
          {t("documents.download")}
        </a>
      </div>
    </div>
  );
}

// Document list for sidebars
interface DocumentListProps {
  documents: Document[];
  maxItems?: number;
  className?: string;
}

export async function DocumentList({
  documents,
  maxItems = 5,
  className = '',
}: DocumentListProps) {
  const { t } = await getServerI18n();
  const items = documents.slice(0, maxItems);

  if (items.length === 0) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400 italic">
        {t("documents.none")}
      </p>
    );
  }

  return (
    <div className={`divide-y divide-slate-100 dark:divide-slate-800 ${className}`}>
      {items.map((doc) => (
        <DocumentCard key={doc.id} document={doc} variant="compact" />
      ))}
      {documents.length > maxItems && (
        <Link
          href="/documents"
          className="pt-3 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-blue-600"
        >
          {t("documents.viewAll")}
          <ExternalLink className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}
