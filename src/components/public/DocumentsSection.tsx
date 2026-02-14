"use client";

import Link from "next/link";
import { FileText, Download, ArrowRight, File, FileCode, FileImage } from "lucide-react";
import type { Document } from "@/lib/types";
import { useI18n } from "@/components/i18n/LanguageProvider";

interface DocumentsSectionProps {
  documents: Document[];
}

export default function DocumentsSection({ documents }: DocumentsSectionProps) {
  const { t } = useI18n();
  // Get file icon based on type
  const getFileIcon = (fileType: string | null | undefined) => {
    if (!fileType) return FileText;

    if (fileType.includes('pdf')) return FileText;
    if (fileType.includes('word') || fileType.includes('document')) return File;
    if (fileType.includes('image')) return FileImage;
    if (fileType.includes('code') || fileType.includes('text')) return FileCode;
    return FileText;
  };

  const formatFileTypeShort = (fileType: string | null | undefined) => {
    const t = (fileType || "").toLowerCase();
    if (!t) return "DOC";
    if (t.includes("pdf")) return "PDF";
    if (t.includes("word") || t.includes("document") || t.includes("officedocument")) return "DOC";
    if (t.includes("image")) return "IMG";
    if (t.includes("text") || t.includes("plain") || t.includes("code")) return "TXT";
    return "DOC";
  };

  // Get file color based on type
  const getFileColor = (fileType: string | null | undefined) => {
    if (!fileType) return "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400";

    if (fileType.includes('pdf')) return "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400";
    if (fileType.includes('word') || fileType.includes('document')) return "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400";
    if (fileType.includes('image')) return "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400";
    if (fileType.includes('code') || fileType.includes('text')) return "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400";
    return "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400";
  };

  // Format file size
  const formatFileSize = (bytes: number | null | undefined) => {
    if (!bytes) return "N/A";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex flex-col h-full w-full max-w-[420px] lg:max-w-[380px] ml-auto">
      {/* Section Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {t("home.documents.title")}
          </h2>
          <Link
            href="/documents"
            className="inline-flex items-center gap-1 text-sm font-semibold text-amber-600 dark:text-amber-400 hover:gap-2 transition-all"
          >
            {t("home.documents.seeAll")}
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="h-1 w-16 bg-amber-600 rounded-full"></div>
      </div>

      {/* Documents List */}
      {documents && documents.length > 0 ? (
        <div className="space-y-4">
          {documents.slice(0, 6).map((doc) => {
            const IconComponent = getFileIcon(doc.file_type);
            const colorClasses = getFileColor(doc.file_type);
            const fileTypeLabel = formatFileTypeShort(doc.file_type);

            return (
              <div
                key={doc.id}
                className="group flex gap-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-3 hover:shadow-md hover:border-amber-200 dark:hover:border-amber-800 transition-all"
              >
                {/* Icon */}
                <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${colorClasses} shrink-0`}>
                  <IconComponent className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex flex-col flex-grow min-w-0">
                  <h3
                    className="text-sm font-bold text-slate-900 dark:text-white mb-1 leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2"
                    title={doc.title}
                  >
                    {doc.title}
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 min-w-0">
                    <span className="font-semibold uppercase">{fileTypeLabel}</span>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <span className="shrink-0">{formatFileSize(doc.file_size)}</span>
                    {doc.category?.name ? (
                      <>
                        <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">•</span>
                        <span className="text-amber-700 dark:text-amber-300 font-semibold truncate hidden sm:inline">
                          {doc.category.name}
                        </span>
                      </>
                    ) : null}
                  </div>
                </div>

                {/* Download Button */}
                <a
                  href={doc.file_url || "#"}
                  download
                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-600 hover:text-white dark:hover:bg-amber-600 transition-all shrink-0"
                  title={t("home.documents.download")}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-10 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800 border-dashed">
          <p className="text-slate-500 dark:text-slate-400 text-sm">{t("home.documents.empty")}</p>
        </div>
      )}
    </div>
  );
}
