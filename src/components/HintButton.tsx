"use client";

import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  hint: string;
  bubbleMs?: number;
};

export function HintButton({ hint, bubbleMs = 1100, style, onClick, ...rest }: Props) {
  const [show, setShow] = React.useState(false);
  const timer = React.useRef<number | null>(null);

  const clear = () => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = null;
  };

  const showBubble = () => {
    clear();
    setShow(true);
    timer.current = window.setTimeout(() => setShow(false), bubbleMs);
  };

  React.useEffect(() => () => clear(), []);

  return (
    <span
      style={{ position: "relative", display: "inline-flex" }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      <button
        {...rest}
        title={hint}
        aria-label={hint}
        onPointerDown={(e) => {
          // móvil: burbuja
          showBubble();
          rest.onPointerDown?.(e);
        }}
        onClick={(e) => onClick?.(e)}
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          border: "1px solid #111",
          background: "white",
          fontWeight: 1000,
          ...style,
        }}
      >
        {rest.children}
      </button>

      {show ? (
        <span
          style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#111",
            color: "white",
            padding: "6px 10px",
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 900,
            whiteSpace: "nowrap",
            boxShadow: "0 10px 24px rgba(0,0,0,0.18)",
            pointerEvents: "none",
          }}
        >
          {hint}
        </span>
      ) : null}
    </span>
  );
}