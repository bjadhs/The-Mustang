import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import ReservationForm from "./ReservationForm";

/*
 * A modal reservation dialog, opened from any "Reserve a table" button in
 * place of the old new-tab link. Provider sits at the app root; buttons call
 * useReservationDialog().open(). The form and its success toast are unchanged;
 * on a successful booking the dialog closes and the (app-level) toast remains.
 */

interface DialogApi {
  open: () => void;
  close: () => void;
  isOpen: boolean;
}

const DialogContext = createContext<DialogApi | null>(null);

export function useReservationDialog(): DialogApi {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("useReservationDialog must be used within a ReservationDialogProvider");
  return ctx;
}

export function ReservationDialogProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <DialogContext.Provider value={{ open, close, isOpen }}>
      {children}
      {isOpen && <ReservationModal onClose={close} />}
    </DialogContext.Provider>
  );
}

type LenisLike = { stop: () => void; start: () => void };

function ReservationModal({ onClose }: { onClose: () => void }) {
  const [shown, setShown] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    restoreFocus.current = document.activeElement as HTMLElement | null;

    // Pause smooth scroll and lock the page behind the modal.
    const lenis = (window as unknown as { __mustangLenis?: LenisLike }).__mustangLenis;
    lenis?.stop();
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    // Play the entrance and move focus into the panel.
    const raf = requestAnimationFrame(() => {
      setShown(true);
      panelRef.current?.querySelector<HTMLElement>("input, select, button")?.focus();
    });

    return () => {
      document.removeEventListener("keydown", onKey);
      cancelAnimationFrame(raf);
      document.documentElement.style.overflow = prevOverflow;
      lenis?.start();
      restoreFocus.current?.focus?.();
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Reserve a table"
    >
      {/* Backdrop: dark smoked glass. Click to dismiss. */}
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        onClick={onClose}
        className={`absolute inset-0 cursor-default bg-black/70 backdrop-blur-sm transition-opacity duration-300 motion-reduce:transition-none ${
          shown ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={`relative w-full max-w-md transition-all duration-300 ease-out motion-reduce:transition-none ${
          shown ? "translate-y-0 opacity-100 scale-100" : "translate-y-4 opacity-0 scale-[0.98]"
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close reservation form"
          className="absolute -top-3 -right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-cream/25 bg-canvas-2 text-fg-dim shadow-lg transition-colors hover:border-chili hover:text-fg"
        >
          <X className="h-4 w-4" />
        </button>
        <ReservationForm onSuccess={onClose} />
      </div>
    </div>,
    document.body,
  );
}
