// FILE: src/components/ScreenShell.tsx
"use client";

import * as React from "react";

export type ScreenShellProps = {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  style?: React.CSSProperties;
  contentStyle?: React.CSSProperties;
};

/**
 * Layout estándar de pantalla:
 * - header fijo (fuera del scroll)
 * - main scrolleable
 * - footer fijo (fuera del scroll)
 */
export function ScreenShell({ header, footer, children, style, contentStyle }: ScreenShellProps) {
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        ...style,
      }}
    >
      {header ? <div style={{ flex: "0 0 auto" }}>{header}</div> : null}

      <div
        style={{
          flex: "1 1 auto",
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          overscrollBehavior: "contain",
          ...contentStyle,
        }}
      >
        {children}
      </div>

      {footer ? (
        <div style={{ flex: "0 0 auto", paddingBottom: "env(safe-area-inset-bottom)" }}>{footer}</div>
      ) : null}
    </div>
  );
}
