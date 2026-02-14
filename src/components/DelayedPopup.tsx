"use client";

import { useEffect, useRef, useState, useCallback, ReactNode } from "react";
import { X } from "lucide-react";

// ============================================================================
// CONFIGURATION
// ============================================================================
const STORAGE_KEY = "popupDismissed";
const DEFAULT_DELAY_MS = 60000; // 1 minute par défaut (configurable: 60000 = 1min, 120000 = 2min)

// ============================================================================
// TYPES
// ============================================================================
interface DelayedPopupProps {
  /** Indique si le site est en état de chargement */
  isLoading: boolean;
  /** Délai avant affichage en millisecondes (défaut: 60000 = 1 min) */
  delayMs?: number;
  /** Titre du popup */
  title?: string;
  /** Contenu du popup (peut être du JSX) */
  children: ReactNode;
  /** Callback appelé à la fermeture */
  onClose?: () => void;
  /** Désactiver la fermeture via overlay */
  disableOverlayClose?: boolean;
  /** Désactiver la persistence session (réaffichera à chaque visite) */
  disableSessionPersistence?: boolean;
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================
export function DelayedPopup({
  isLoading,
  delayMs = DEFAULT_DELAY_MS,
  title = "Information",
  children,
  onClose,
  disableOverlayClose = false,
  disableSessionPersistence = false,
}: DelayedPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const titleId = useRef(`popup-title-${Math.random().toString(36).slice(2, 9)}`);

  // Vérifie si le popup a déjà été fermé cette session
  const wasAlreadyDismissed = useCallback((): boolean => {
    if (disableSessionPersistence) return false;
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem(STORAGE_KEY) === "true";
  }, [disableSessionPersistence]);

  // Enregistre la fermeture en sessionStorage
  const markAsDismissed = useCallback(() => {
    if (disableSessionPersistence) return;
    if (typeof window === "undefined") return;
    sessionStorage.setItem(STORAGE_KEY, "true");
  }, [disableSessionPersistence]);

  // Fermeture du popup
  const handleClose = useCallback(() => {
    setIsVisible(false);
    markAsDismissed();
    onClose?.();
    // Restaurer le scroll du body
    document.body.style.overflow = "unset";
    // Délai pour l'animation de sortie
    setTimeout(() => {
      setShouldRender(false);
    }, 300);
  }, [markAsDismissed, onClose]);

  // Gestion de la touche ESC
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    },
    [handleClose]
  );

  // Gestion du clic sur l'overlay
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (disableOverlayClose) return;
      if (e.target === e.currentTarget) {
        handleClose();
      }
    },
    [disableOverlayClose, handleClose]
  );

  // Effet principal: démarrer le timer quand isLoading devient false
  useEffect(() => {
    // Nettoyer tout timer existant
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // Ne rien faire si en chargement ou déjà fermé cette session
    if (isLoading || wasAlreadyDismissed()) {
      return;
    }

    // Démarrer le timer
    timerRef.current = setTimeout(() => {
      setShouldRender(true);
      // Petit délai pour permettre le rendu avant l'animation
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    }, delayMs);

    // Cleanup
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isLoading, delayMs, wasAlreadyDismissed]);

  // Effet: gérer l'accessibilité quand le popup devient visible
  useEffect(() => {
    if (!isVisible) return;

    // Bloquer le scroll du body
    document.body.style.overflow = "hidden";

    // Écouter ESC
    document.addEventListener("keydown", handleKeyDown);

    // Focus sur le bouton Close
    const focusTimer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 100);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      clearTimeout(focusTimer);
    };
  }, [isVisible, handleKeyDown]);

  // Ne rien rendre si pas nécessaire
  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 ${
        isVisible ? "animate-fade-in" : "opacity-0"
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId.current}
      onClick={handleOverlayClick}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Modal - Mobile: bottom sheet, Desktop: centered */}
      <div
        ref={modalRef}
        className={`relative w-full sm:max-w-lg md:max-w-xl bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl transform transition-all duration-300 max-h-[90vh] sm:max-h-[85vh] flex flex-col ${
          isVisible ? "animate-slide-in-up scale-100 opacity-100" : "scale-95 opacity-0 translate-y-4"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 dark:border-slate-700 flex-shrink-0">
          <h2
            id={titleId.current}
            className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white pr-2"
          >
            {title}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={handleClose}
            className="p-2 -mr-1 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-slate-800"
            aria-label="Fermer le popup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body - Scrollable */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 text-sm sm:text-base text-slate-600 dark:text-slate-300 overflow-y-auto flex-1">
          {children}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl flex-shrink-0">
          <button
            type="button"
            onClick={handleClose}
            className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-light rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-slate-800"
          >
            J&apos;ai compris
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// HOOK UTILITAIRE (optionnel) - Pour gérer l'état de chargement
// ============================================================================
export function useDelayedPopup() {
  const [isLoading, setIsLoading] = useState(true);

  const markAsReady = useCallback(() => {
    setIsLoading(false);
  }, []);

  return { isLoading, markAsReady, setIsLoading };
}

// ============================================================================
// COMPOSANT WRAPPER AVEC SIMULATION (pour les tests/démo)
// ============================================================================
interface DelayedPopupWithLoadingProps {
  /** Délai de simulation du chargement initial (défaut: 2000ms) */
  simulatedLoadingMs?: number;
  /** Délai avant affichage du popup (défaut: 60000ms = 1 min) */
  popupDelayMs?: number;
  /** Titre du popup */
  title?: string;
  /** Contenu du popup */
  children: ReactNode;
}

export function DelayedPopupWithSimulatedLoading({
  simulatedLoadingMs = 2000,
  popupDelayMs = DEFAULT_DELAY_MS,
  title,
  children,
}: DelayedPopupWithLoadingProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, simulatedLoadingMs);

    return () => clearTimeout(timer);
  }, [simulatedLoadingMs]);

  return (
    <DelayedPopup isLoading={isLoading} delayMs={popupDelayMs} title={title}>
      {children}
    </DelayedPopup>
  );
}

export default DelayedPopup;
