"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuthSession } from "@/lib/firebase/auth-context";
import { signInUser, signUpUser, resetPasswordForUser } from "@/lib/firebase/auth-actions";
import { authErrorMessage, passwordResetMessage } from "@/lib/firebase/auth-messages";
import { useMinderCartState } from "@/lib/mindercart/hooks";
import { saveSettings } from "@/lib/mindercart/storage";

export default function AuthPage() {
  const session = useAuthSession();
  const router = useRouter();
  const state = useMinderCartState();
  const lang = state.settings.language;
  const en = lang === "en";
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [visible, setVisible] = React.useState(false);
  const [busy, setBusy] = React.useState("");
  const [error, setError] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [mode, setMode] = React.useState<"login" | "signup">("login");
  function changeMode(next: "login" | "signup") {
    setMode(next); setPassword(""); setVisible(false); setError(""); setMessage("");
  }
  React.useEffect(() => { if (session.status === "authenticated") router.replace("/"); }, [session.status, router]);
  async function run(action: "login" | "signup" | "reset") {
    if (busy) return;
    setError(""); setMessage("");
    if (action === "reset") {
      if (!email.trim()) { setError(en ? "Enter your email first." : "Primero ingresa tu correo."); return; }
      if (!window.confirm(en ? `Send password recovery instructions to ${email.trim()}?` : `¿Enviar instrucciones para recuperar tu contraseña a ${email.trim()}?`)) return;
    }
    setBusy(action);
    try {
      if (action === "reset") { await resetPasswordForUser(email); setMessage(passwordResetMessage(lang)); }
      else { await (action === "login" ? signInUser : signUpUser)(email, password); setPassword(""); }
    } catch (err) { setError(authErrorMessage(err, lang)); }
    finally { setBusy(""); }
  }
  const button: React.CSSProperties = { padding: 14, borderRadius: 16, border: "1px solid #dce1ef", background: "white", color: "#12245e", fontSize: 18, fontWeight: 800, cursor: "pointer" };
  return <main className="mc-auth-page">
    <style>{`
      .mc-auth-page { min-height: 100dvh; background: #f6f7fc; color: #12245e; padding-bottom: calc(100px + env(safe-area-inset-bottom)); }
      .mc-auth-header { background: #12245e; color: white; box-shadow: 0 6px 20px rgba(18,36,94,.12); }
      .mc-auth-brand { display: flex; align-items: center; gap: 12px; padding: calc(12px + env(safe-area-inset-top)) 16px 12px; }
      .mc-auth-logo { width: 52px; height: 52px; border-radius: 15px; overflow: hidden; background: white; flex-shrink: 0; box-shadow: 0 4px 12px rgba(0,0,0,.12); }
      .mc-auth-title { margin: 0; padding: 12px 16px 14px; border-top: 1px solid rgba(255,255,255,.18); font-size: 21px; line-height: 1.08; font-weight: 900; letter-spacing: -.02em; }
      .mc-auth-card { max-width: 440px; margin: 18px auto; padding: 20px; border-radius: 24px; border: 1px solid #dce1ef; background: white; box-shadow: 0 6px 20px rgba(18,36,94,.06); }
      .mc-auth-card input, .mc-auth-card select { box-sizing: border-box; border: 1px solid #dce1ef; border-radius: 14px; background: white; color: #12245e; font-size: 16px; }
      .mc-auth-card select { padding: 10px; }
      .mc-auth-card label { display: grid; gap: 8px; font-weight: 700; }
      .mc-auth-card button:disabled { opacity: .6; cursor: wait; }
      .mc-auth-footer { position: fixed; left: 0; right: 0; bottom: 0; height: calc(78px + env(safe-area-inset-bottom)); background: #12245e; border-top: 1px solid rgba(255,255,255,.08); box-shadow: 0 -8px 18px rgba(6,13,36,.16); pointer-events: none; }
      @media (max-width: 480px) { .mc-auth-card { margin: 18px 16px; padding: 16px; } }
    `}</style>
    <header className="mc-auth-header">
      <div className="mc-auth-brand">
        <div className="mc-auth-logo"><Image src="/mindercart-avatar.png" alt="" width={52} height={52} priority /></div>
        <div><div style={{ fontSize: 19, fontWeight: 900, lineHeight: 1.05, letterSpacing: "-.02em" }}>MinderCart</div><div style={{ marginTop: 4, fontSize: 12, color: "rgba(255,255,255,.88)" }}>{en ? "Never forget what to buy" : "Nunca olvides qué comprar"}</div></div>
      </div>
      <h1 className="mc-auth-title">{en ? "Sign in" : "Inicio de sesión"}</h1>
    </header>
    <section className="mc-auth-card" aria-label={en ? "Account access" : "Acceso a tu cuenta"}>
    <label>{en ? "Language" : "Idioma"} <select value={lang} disabled={!!busy} onChange={e => { setError(""); setMessage(""); saveSettings({ ...state.settings, language: e.target.value === "en" ? "en" : "es" }); }}><option value="es">Español</option><option value="en">English</option></select></label>
    <h2>{en ? "Welcome to MinderCart" : "Bienvenido a MinderCart"}</h2>
    <p>{en ? "Sign in or create an account to start your list." : "Inicia sesión o crea una cuenta para empezar tu lista."}</p>
    {mode === "signup" ? <h3>{en ? "Create a new account" : "Crear cuenta nueva"}</h3> : null}
    <form onSubmit={e => { e.preventDefault(); void run(mode); }} style={{ display: "grid", gap: 16 }}>
      <label>{en ? "Email" : "Correo"}<input style={{ width: "100%", padding: 12 }} type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={!!busy} /></label>
      <label>{en ? "Password" : "Contraseña"}<input style={{ width: "100%", padding: 12 }} type={visible ? "text" : "password"} autoComplete={mode === "signup" ? "new-password" : "current-password"} minLength={mode === "signup" ? 6 : undefined} value={password} onChange={e => setPassword(e.target.value)} required disabled={!!busy} /></label>
      <button type="button" onClick={() => setVisible(v => !v)}>{visible ? (en ? "Hide password" : "Ocultar contraseña") : (en ? "Show password" : "Mostrar contraseña")}</button>
      <button style={{ ...button, background: "#12245e", color: "white" }} disabled={!!busy || !session.enabled} type="submit">{mode === "login" ? (en ? "Sign in" : "Iniciar sesión") : (en ? "Create account" : "Crear cuenta")}</button>
      {mode === "login" ? <>
        <button style={button} disabled={!!busy || !session.enabled} type="button" onClick={() => void run("reset")}>{en ? "Forgot your password?" : "¿Olvidaste tu contraseña?"}</button>
        <p style={{ margin: 0 }}>{en ? "Don't have an account?" : "¿No tienes cuenta?"}</p>
        <button style={button} disabled={!!busy} type="button" onClick={() => changeMode("signup")}>{en ? "Create a new account" : "Crear cuenta nueva"}</button>
      </> : <button style={button} disabled={!!busy} type="button" onClick={() => changeMode("login")}>{en ? "Already have an account? Sign in" : "¿Ya tienes cuenta? Iniciar sesión"}</button>}
      {busy ? <p role="status">{en ? "Processing… Please wait." : "Procesando… Espera un momento."}</p> : null}
      {error ? <p role="alert" style={{ color: "#b42318" }}>{error}</p> : null}
      {message ? <p role="status">{message}</p> : null}
      {session.error ? <><p role="alert">{en ? "Check your connection and retry." : "Revisa tu conexión y vuelve a intentar."}</p><button type="button" onClick={session.retry}>{en ? "Retry" : "Reintentar"}</button></> : null}
    </form>
    </section>
    <div className="mc-auth-footer" aria-hidden="true" />
  </main>;
}
