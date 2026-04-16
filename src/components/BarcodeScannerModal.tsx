// ============================================================================
// FILE: src/components/BarcodeScannerModal.tsx   (REEMPLAZA COMPLETO)
// - Ahora soporta onDetected (nuevo) y onCode (legacy) para compatibilidad
// ============================================================================

"use client";

import React from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

type BaseProps = {
  open: boolean;
  onClose: () => void;
};

type Props =
  | (BaseProps & { onCode: (code: string) => void; onDetected?: never })
  | (BaseProps & { onDetected: (code: string) => void; onCode?: never })
  | (BaseProps & { onCode: (code: string) => void; onDetected: (code: string) => void });

function isSecureCameraContext() {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return window.isSecureContext || host === "localhost" || host === "127.0.0.1";
}

function hasCameraApi() {
  return typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;
}

export function BarcodeScannerModal(props: Props) {
  const { open, onClose } = props;
  const onDetected = "onDetected" in props ? props.onDetected : undefined;
  const onCode = "onCode" in props ? props.onCode : undefined;
  const fire = (code: string) => (onDetected ?? onCode)?.(code);

  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const readerRef = React.useRef<BrowserMultiFormatReader | null>(null);
  const controlsRef = React.useRef<any>(null);

  const [msg, setMsg] = React.useState("");
  const [manual, setManual] = React.useState("");

  const stopScanner = React.useCallback(() => {
    try {
      controlsRef.current?.stop?.();
    } catch {}
    controlsRef.current = null;

    try {
      (readerRef.current as any)?.reset?.();
    } catch {}
  }, []);

  React.useEffect(() => {
    if (!open) {
      stopScanner();
      setMsg("");
      setManual("");
      return;
    }

    if (!hasCameraApi()) {
      setMsg("La cámara no está disponible en este navegador/dispositivo.");
      return;
    }

    if (!isSecureCameraContext()) {
      setMsg(
        "La cámara solo funciona en HTTPS o localhost. En celular, si abriste la app con una IP local (por ejemplo http://192.168.x.x:3000), el navegador bloquea getUserMedia."
      );
      return;
    }

    let cancelled = false;

    const start = async () => {
      try {
        setMsg("");
        const reader = new BrowserMultiFormatReader();
        readerRef.current = reader;

        const devices = await BrowserMultiFormatReader.listVideoInputDevices();
        const preferred =
          devices.find((d) => /back|rear|environment|trasera/i.test(d.label)) ?? devices[0];

        if (!preferred?.deviceId) {
          setMsg("No se encontró una cámara disponible.");
          return;
        }

        controlsRef.current = await reader.decodeFromVideoDevice(
          preferred.deviceId,
          videoRef.current!,
          (result, error) => {
            if (cancelled) return;
            if (result?.getText?.()) {
              const code = result.getText();
              stopScanner();
              fire(code);
            }
            if (error) {
              // Ignorar errores intermedios de lectura mientras enfoca
            }
          }
        );
      } catch (e: any) {
        setMsg(String(e?.message || e || "No se pudo abrir la cámara."));
      }
    };

    void start();

    return () => {
      cancelled = true;
      stopScanner();
    };
  }, [open, stopScanner, onDetected, onCode]);

  if (!open) return null;

  return (
    <div className="cc-modal-backdrop" onClick={onClose}>
      <div className="cc-modal cc-scan-modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ fontWeight: 1000, fontSize: 18 }}>Código de barras</div>

        {msg ? (
          <div className="cc-scan-warn" style={{ marginTop: 10 }}>
            {msg}
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="cc-scan-video"
            style={{ marginTop: 12 }}
          />
        )}

        <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
          <input
            className="cc-input"
            placeholder="Captura manual"
            value={manual}
            onChange={(e) => setManual(e.target.value)}
          />

          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" className="cc-btn" style={{ flex: 1 }} onClick={onClose}>
              Cerrar
            </button>
            <button
              type="button"
              className="cc-btn cc-btn--primary"
              style={{ flex: 1 }}
              onClick={() => {
                const value = String(manual || "").trim();
                if (!value) return;
                stopScanner();
                fire(value);
              }}
            >
              Usar código
            </button>
          </div>
        </div>

        <style jsx>{`
          .cc-scan-modal {
            max-width: 560px;
          }
          .cc-scan-video {
            width: 100%;
            border-radius: 14px;
            background: #000;
            aspect-ratio: 4 / 3;
            object-fit: cover;
          }
          .cc-scan-warn {
            padding: 10px 12px;
            border-radius: 12px;
            border: 1px solid #f3c;
            background: #fff5fb;
            color: #a20055;
            font-weight: 700;
          }
        `}</style>
      </div>
    </div>
  );
}