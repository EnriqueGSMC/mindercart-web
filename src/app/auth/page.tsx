"use client";

import React from "react";
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
  const button: React.CSSProperties = { padding: 14, borderRadius: 12, border: "1px solid #12245e", fontSize: 18, cursor: "pointer" };
  return <main style={{ maxWidth: 440, margin: "32px auto", padding: 24, color: "#12245e" }}>
    <h1>MinderCart</h1>
    <label>{en ? "Language" : "Idioma"} <select value={lang} disabled={!!busy} onChange={e => { setError(""); setMessage(""); saveSettings({ ...state.settings, language: e.target.value === "en" ? "en" : "es" }); }}><option value="es">Español</option><option value="en">English</option></select></label>
    <h2>{en ? "Sign in" : "Iniciar sesión"}</h2>
    <p>{en ? "New here? Enter your email and a password, then choose Create account." : "¿Es tu primera vez? Ingresa tu correo y una contraseña y elige Crear cuenta."}</p>
    <form onSubmit={e => { e.preventDefault(); void run("login"); }} style={{ display: "grid", gap: 16 }}>
      <label>{en ? "Email" : "Correo"}<input style={{ width: "100%", padding: 12 }} type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={!!busy} /></label>
      <label>{en ? "Password" : "Contraseña"}<input style={{ width: "100%", padding: 12 }} type={visible ? "text" : "password"} autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required disabled={!!busy} /></label>
      <button type="button" onClick={() => setVisible(v => !v)}>{visible ? (en ? "Hide password" : "Ocultar contraseña") : (en ? "Show password" : "Mostrar contraseña")}</button>
      <button style={{ ...button, background: "#12245e", color: "white" }} disabled={!!busy || !session.enabled} type="submit">{en ? "Sign in" : "Iniciar sesión"}</button>
      <button style={button} disabled={!!busy || !session.enabled} type="button" onClick={() => void run("signup")}>{en ? "Create account" : "Crear cuenta"}</button>
      <button style={button} disabled={!!busy || !session.enabled} type="button" onClick={() => void run("reset")}>{en ? "Recover password" : "Recuperar contraseña"}</button>
      {busy ? <p role="status">{en ? "Processing… Please wait." : "Procesando… Espera un momento."}</p> : null}
      {error ? <p role="alert" style={{ color: "#b42318" }}>{error}</p> : null}
      {message ? <p role="status">{message}</p> : null}
      {session.error ? <><p role="alert">{en ? "Check your connection and retry." : "Revisa tu conexión y vuelve a intentar."}</p><button type="button" onClick={session.retry}>{en ? "Retry" : "Reintentar"}</button></> : null}
    </form>
  </main>;
}
