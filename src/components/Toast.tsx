import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, X } from "lucide-react";

/*
 * App-level toast. Lives above the routes so it survives the unmount of
 * whatever triggered it (e.g. the reservation dialog closing on submit).
 * One toast at a time; a new one replaces the old. Rendered to <body> so no
 * ancestor's overflow or transform can clip it.
 */

interface ToastApi {
  show: (message: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}

const DISMISS_MS = 6500;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const nextId = useRef(0);

  const show = useCallback((message: string) => {
    nextId.current += 1;
    setToast({ id: nextId.current, message });
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(null), DISMISS_MS);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toast && (
        <ToastCard key={toast.id} message={toast.message} onClose={() => setToast(null)} />
      )}
    </ToastContext.Provider>
  );
}

function ToastCard({ message, onClose }: { message: string; onClose: () => void }) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    // Flip to the resting position next frame so the entry transition plays.
    const raf = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-5 right-5 z-[120] max-w-[calc(100vw-2.5rem)] transition-all duration-500 ease-out motion-reduce:transition-none ${
        shown ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
    >
      <div className="glass relative flex items-start gap-3 border-l-2 border-l-chili py-4 pl-4 pr-11 shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-chili" aria-hidden="true" />
        <p className="max-w-[34ch] text-sm leading-relaxed text-fg">{message}</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss"
          className="absolute right-2.5 top-2.5 text-fg-faint transition-colors hover:text-fg"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>,
    document.body,
  );
}
