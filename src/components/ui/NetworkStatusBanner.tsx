"use client";

import { useEffect, useMemo, useState } from "react";
import { WifiOff } from "lucide-react";
import { Button } from "@/components/ui/Button";

type ConnectionInfo = {
  effectiveType?: string;
  downlink?: number;
  saveData?: boolean;
};

function readConnectionInfo(): ConnectionInfo | null {
  if (typeof navigator === "undefined") return null;
  const anyNavigator = navigator as Navigator & { connection?: ConnectionInfo };
  return anyNavigator.connection ?? null;
}

function isSlowConnection(info: ConnectionInfo | null): boolean {
  if (!info) return false;
  if (info.saveData) return true;
  if (info.effectiveType === "slow-2g" || info.effectiveType === "2g") return true;
  if (typeof info.downlink === "number" && info.downlink > 0 && info.downlink < 0.8) return true;
  return false;
}

export function NetworkStatusBanner() {
  const [online, setOnline] = useState(true);
  const [connection, setConnection] = useState<ConnectionInfo | null>(null);

  useEffect(() => {
    setOnline(navigator.onLine);
    setConnection(readConnectionInfo());

    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    const anyNavigator = navigator as Navigator & { connection?: { addEventListener?: Function; removeEventListener?: Function } };
    const onConnectionChange = () => setConnection(readConnectionInfo());
    anyNavigator.connection?.addEventListener?.("change", onConnectionChange);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      anyNavigator.connection?.removeEventListener?.("change", onConnectionChange);
    };
  }, []);

  const showSlow = useMemo(() => online && isSlowConnection(connection), [online, connection]);
  if (online && !showSlow) return null;

  return (
    <div className="sticky top-0 z-[60] w-full">
      <div
        className={[
          "flex items-center justify-between gap-3 px-4 py-2 text-sm border-b",
          online ? "bg-amber-50 text-amber-900 border-amber-200" : "bg-red-50 text-red-900 border-red-200",
        ].join(" ")}
      >
        <div className="flex items-center gap-2">
          <WifiOff className="w-4 h-4" />
          <span className="font-medium">
            {online ? "Connexion faible détectée." : "Vous êtes hors ligne."}
          </span>
          <span className="hidden sm:inline text-slate-600">
            {online ? "Certaines actions peuvent échouer." : "Vérifiez votre connexion Internet."}
          </span>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => window.location.reload()}
          className={online ? "border-amber-300" : "border-red-300"}
        >
          Réessayer
        </Button>
      </div>
    </div>
  );
}

