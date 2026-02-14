"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { X, GraduationCap, Bell, Calendar, Info, AlertCircle, Star } from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

interface PopupItem {
  icon?: string;
  icon_color?: string;
  title: string;
  description?: string;
}

interface PopupData {
  id: number;
  title: string;
  content_html: string | null;
  button_text: string;
  button_url: string | null;
  image_url: string | null;
  icon: string | null;
  icon_color: string | null;
  items: PopupItem[] | null;
  delay_ms: number;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const STORAGE_KEY = "popupDismissed";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

// ============================================================================
// ICON MAPPING
// ============================================================================

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  "graduation-cap": GraduationCap,
  bell: Bell,
  calendar: Calendar,
  info: Info,
  "alert-circle": AlertCircle,
  star: Star,
};

const COLOR_MAP: Record<string, string> = {
  blue: "bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400",
  emerald: "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
  amber: "bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400",
  red: "bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400",
  purple: "bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400",
  slate: "bg-slate-500/10 dark:bg-slate-500/20 text-slate-600 dark:text-slate-400",
};

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function PopupIcon({ icon, color }: { icon?: string | null; color?: string | null }) {
  const IconComponent = icon ? ICON_MAP[icon] : Info;
  const colorClass = color ? COLOR_MAP[color] : COLOR_MAP.blue;

  if (!IconComponent) return null;

  return (
    <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${colorClass}`}>
      <IconComponent className="w-4 h-4" />
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function WelcomePopup() {
  const pathname = usePathname();
  const [popupData, setPopupData] = useState<PopupData | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Vérifie si le popup a déjà été fermé cette session
  const wasAlreadyDismissed = useCallback((popupId: number): boolean => {
    if (typeof window === "undefined") return false;
    const dismissed = sessionStorage.getItem(STORAGE_KEY);
    if (!dismissed) return false;
    try {
      const dismissedIds = JSON.parse(dismissed);
      return Array.isArray(dismissedIds) && dismissedIds.includes(popupId);
    } catch {
      return false;
    }
  }, []);

  // Enregistre la fermeture en sessionStorage
  const markAsDismissed = useCallback((popupId: number) => {
    if (typeof window === "undefined") return;
    try {
      const existing = sessionStorage.getItem(STORAGE_KEY);
      const dismissedIds = existing ? JSON.parse(existing) : [];
      if (!dismissedIds.includes(popupId)) {
        dismissedIds.push(popupId);
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(dismissedIds));
      }
    } catch {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify([popupId]));
    }
  }, []);

  // Fermeture du popup
  const handleClose = useCallback(() => {
    setIsVisible(false);
    if (popupData) {
      markAsDismissed(popupData.id);
    }
    document.body.style.overflow = "unset";
    setTimeout(() => {
      setShouldRender(false);
    }, 300);
  }, [popupData, markAsDismissed]);

  // Gestion de la touche ESC
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isVisible, handleClose]);

  // Chargement du popup depuis l'API
  useEffect(() => {
    const fetchPopup = async () => {
      try {
        const res = await fetch(`${API_URL}/popup/active?page=${encodeURIComponent(pathname)}`, {
          headers: { Accept: "application/json" },
          cache: "no-store",
        });

        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            setPopupData(json.data);
          }
        }
      } catch (error) {
        console.error("Error fetching popup:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPopup();
  }, [pathname]);

  // Affichage du popup après le délai
  useEffect(() => {
    if (isLoading || !popupData) return;

    // Vérifier si déjà fermé
    if (wasAlreadyDismissed(popupData.id)) return;

    const timer = setTimeout(() => {
      setShouldRender(true);
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    }, popupData.delay_ms);

    return () => clearTimeout(timer);
  }, [isLoading, popupData, wasAlreadyDismissed]);

  // Click sur bouton avec URL
  const handleButtonClick = () => {
    if (popupData?.button_url) {
      window.location.href = popupData.button_url;
    }
    handleClose();
  };

  // Ne rien rendre si pas de données ou pas visible
  if (!shouldRender || !popupData) return null;

  const titleId = `popup-title-${popupData.id}`;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 ${
        isVisible ? "animate-fade-in" : "opacity-0"
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className={`relative w-full sm:max-w-lg md:max-w-xl bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl transform transition-all duration-300 max-h-[90vh] sm:max-h-[85vh] flex flex-col ${
          isVisible ? "animate-slide-in-up scale-100 opacity-100" : "scale-95 opacity-0 translate-y-4"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 dark:border-slate-700 flex-shrink-0">
          <h2
            id={titleId}
            className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white pr-2"
          >
            {popupData.title}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 -mr-1 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-slate-800"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 text-sm sm:text-base text-slate-600 dark:text-slate-300 overflow-y-auto flex-1">
          {/* Image */}
          {popupData.image_url && (
            <div className="mb-4 rounded-xl overflow-hidden">
              <img
                src={popupData.image_url}
                alt=""
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          {/* Content HTML */}
          {popupData.content_html && (
            <div
              className="prose prose-sm dark:prose-invert max-w-none mb-4"
              dangerouslySetInnerHTML={{ __html: popupData.content_html }}
            />
          )}

          {/* Items List */}
          {popupData.items && popupData.items.length > 0 && (
            <div className="space-y-3">
              {popupData.items.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <PopupIcon icon={item.icon} color={item.icon_color} />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-slate-900 dark:text-white text-sm">
                      {item.title}
                    </h4>
                    {item.description && (
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl flex-shrink-0">
          <button
            type="button"
            onClick={handleButtonClick}
            className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-light rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-slate-800"
          >
            {popupData.button_text || "J'ai compris"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default WelcomePopup;
