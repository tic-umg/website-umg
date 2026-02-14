export type NetworkProblemKind = "offline" | "timeout" | "slow" | "unreachable";

function isOffline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

function isAbortError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  return "name" in error && (error as { name?: unknown }).name === "AbortError";
}

function getConnectionHintKind(): NetworkProblemKind | null {
  if (typeof navigator === "undefined") return null;
  const anyNavigator = navigator as Navigator & {
    connection?: { effectiveType?: string; downlink?: number; saveData?: boolean };
  };
  const connection = anyNavigator.connection;
  if (!connection) return null;
  if (connection.saveData) return "slow";
  const effectiveType = connection.effectiveType;
  if (effectiveType === "slow-2g" || effectiveType === "2g") return "slow";
  if (typeof connection.downlink === "number" && connection.downlink > 0 && connection.downlink < 0.8) return "slow";
  return null;
}

export function getNetworkProblemKind(error: unknown): NetworkProblemKind | null {
  if (isOffline()) return "offline";
  if (isAbortError(error)) return "timeout";
  const hint = getConnectionHintKind();
  if (hint) return hint;

  if (error instanceof TypeError) return "unreachable";
  if (error && typeof error === "object" && "message" in error) {
    const message = String((error as { message?: unknown }).message ?? "");
    if (message.toLowerCase().includes("failed to fetch")) return "unreachable";
  }
  return null;
}

export function getFriendlyNetworkErrorMessage(error: unknown): string {
  const kind = getNetworkProblemKind(error);
  switch (kind) {
    case "offline":
      return "Vous êtes hors ligne. Vérifiez votre connexion Internet puis réessayez.";
    case "timeout":
      return "La connexion est trop lente (délai dépassé). Réessayez dans quelques instants.";
    case "slow":
      return "Connexion Internet faible. Réessayez ou passez à un réseau plus stable.";
    case "unreachable":
      return "Impossible de joindre le serveur. Vérifiez votre connexion puis réessayez.";
    default:
      return "Une erreur réseau est survenue. Réessayez dans quelques instants.";
  }
}

function anySignal(signals: AbortSignal[]): AbortSignal {
  // Modern browsers support AbortSignal.any()
  const anyAbortSignal = (AbortSignal as unknown as { any?: (s: AbortSignal[]) => AbortSignal }).any;
  if (anyAbortSignal) return anyAbortSignal(signals);

  const controller = new AbortController();
  const onAbort = () => controller.abort();
  for (const signal of signals) {
    if (signal.aborted) return signal;
    signal.addEventListener("abort", onAbort, { once: true });
  }
  return controller.signal;
}

export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs = 20_000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const signal = init.signal ? anySignal([init.signal, controller.signal]) : controller.signal;
    return await fetch(input, { ...init, signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

