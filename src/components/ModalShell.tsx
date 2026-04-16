// FILE: src/components/ModalShell.tsx
"use client";

import * as React from "react";

export type ModalShellProps = {
  onClose: () => void;
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  ariaLabel?: string;
  maxWidthPx?: number;
  lockScroll?: boolean;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
};

/**
 * Modal con header/footer fijos, body scrolleable (iOS friendly)
 * y bloqueo del scroll del fondo mientras está abierto.
 */
export function ModalShell({
  onClose,
  children,
  header,
  footer,
  ariaLabel = "Dialog",
  maxWidthPx = 560,
  lockScroll = true,
  initialFocusRef,
}: ModalShellProps) {
  const rootRef = React.useRef<HTMLDivElement | null>(null);

  useLockBodyScroll(lockScroll);

  React.useEffect(() => {
    const el = initialFocusRef?.current ?? rootRef.current;
    if (!el) return;

    const t = window.setTimeout(() => {
      try {
        (el as any).focus?.({ preventScroll: true });
      } catch {
        (el as any).focus?.();
      }
    }, 0);

    return () => window.clearTimeout(t);
  }, [initialFocusRef]);

  const onKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      tabIndex={-1}
      onKeyDown={onKeyDown}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: maxWidthPx,
          background: "#fff",
          borderRadius: 18,
          boxShadow: "0 12px 40px rgba(0, 0, 0, 0.2)",
          maxHeight:
            "calc(100dvh - 32px - env(safe-area-inset-top) - env(safe-area-inset-bottom))",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {header ? (
          <div
            style={{
              padding: 14,
              paddingBottom: 10,
              borderBottom: "1px solid #f2f2f2",
              flexShrink: 0,
            }}
          >
            {header}
          </div>
        ) : null}

        <div
          style={{
            padding: 14,
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
            overscrollBehavior: "contain",
            flex: "1 1 auto",
          }}
        >
          {children}
        </div>

        {footer ? (
          <div
            style={{
              padding: 14,
              paddingTop: 10,
              borderTop: "1px solid #f2f2f2",
              flexShrink: 0,
              paddingBottom: "calc(14px + env(safe-area-inset-bottom))",
            }}
          >
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function useLockBodyScroll(enabled: boolean) {
  React.useEffect(() => {
    if (!enabled) return;

    const html = document.documentElement;
    const body = document.body;

    const scrollY = window.scrollY;
    const prev = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyWidth: body.style.width,
      bodyPaddingRight: body.style.paddingRight,
    };

    const scrollbarWidth = window.innerWidth - html.clientWidth;
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";

    return () => {
      html.style.overflow = prev.htmlOverflow;
      body.style.overflow = prev.bodyOverflow;
      body.style.position = prev.bodyPosition;
      body.style.top = prev.bodyTop;
      body.style.width = prev.bodyWidth;
      body.style.paddingRight = prev.bodyPaddingRight;
      window.scrollTo(0, scrollY);
    };
  }, [enabled]);
}