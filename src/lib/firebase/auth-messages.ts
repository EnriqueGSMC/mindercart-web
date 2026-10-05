export function authErrorMessage(error: unknown, language: string): string {
  const en = language === "en";
  const value = error as { code?: string; message?: string } | null;
  const code = value?.code || "";
  const text = value?.message || "";
  const is = (name: string) => code === name || text.includes(name);
  if (is("auth/invalid-credential") || is("auth/wrong-password") || is("auth/user-not-found")) return en ? "Check your email and password. If you forgot your password, choose Recover password." : "Revisa tu correo y contraseña. Si olvidaste tu contraseña, elige Recuperar contraseña.";
  if (is("auth/email-already-in-use")) return en ? "This email already has an account. Sign in or recover your password." : "Este correo ya tiene una cuenta. Inicia sesión o recupera tu contraseña.";
  if (is("auth/invalid-email")) return en ? "Enter a valid email address." : "Ingresa un correo válido.";
  if (is("auth/weak-password")) return en ? "Use a password with at least 6 characters." : "Usa una contraseña de al menos 6 caracteres.";
  if (is("auth/too-many-requests")) return en ? "Too many attempts. Wait a few minutes and try again." : "Hubo demasiados intentos. Espera unos minutos y vuelve a intentar.";
  if (is("auth/network-request-failed") || is("auth/request-timeout")) return en ? "We could not confirm the request. Check your connection and try again." : "No pudimos confirmar la solicitud. Revisa tu conexión y vuelve a intentar.";
  if (is("auth/user-disabled")) return en ? "This account is disabled. Contact support." : "Esta cuenta está deshabilitada. Contacta a soporte.";
  if (code === "invalid-input") return en ? "Enter your email and password." : "Ingresa tu correo y contraseña.";
  return en ? "We could not complete the request. Please try again." : "No pudimos completar la solicitud. Vuelve a intentar.";
}

export function passwordResetMessage(language: string) {
  return language === "en" ? "If an account exists for this email, you will receive a password reset email. Check Spam or Junk too." : "Si hay una cuenta con este correo, recibirás un correo para restablecer tu contraseña. Revisa también Spam o Correo no deseado.";
}
