"use client";

import Image from "next/image";
import React from "react";

type Language = "en" | "es";

const MC_NAVY = "#12245E";
const MC_NAVY_TEXT = "#172554";
const MC_NAVY_SOFT = "#EEF2FF";
const MC_NAVY_LINE = "#D7DFF5";
const MC_NAVY_MUTED = "#5C6EA6";
const SUPPORT_EMAIL = "mindercartapp@gmail.com";
const BETA_FORM_URL = "https://forms.gle/hBYo5seaTRWJS47v6";

const copy = {
  en: {
    languageLabel: "Language",
    betaBadge: "Free private beta",
    headline: "Never forget what to buy.",
    intro:
      "MinderCart helps you capture what you need, reuse your lists, and move through the store with everything organized by category.",
    primaryCta: "Request beta access",
    supportCta: "Copy support email",
    supportCopied: "Email copied",
    benefitsTitle: "A simpler way to prepare and shop",
    benefits: [
      {
        title: "Add what you need in seconds",
        text: "Capture items anytime, before you forget.",
      },
      {
        title: "Create and reuse your own lists",
        text: "Save lists for weekly shopping, recipes, or special occasions.",
      },
      {
        title: "Shop faster, organized by category",
        text: "Spend less time searching and backtracking through the store.",
      },
    ],
    howTitle: "From the moment you remember it to the moment you buy it",
    modules: [
      {
        eyebrow: "My List",
        title: "Capture needs as they come up",
        text: "Add items quickly, including quantity, store, and an optional note or preference.",
      },
      {
        eyebrow: "My Lists",
        title: "Keep lists you can use again",
        text: "Create reusable lists for regular shopping, recipes, events, and other routines.",
      },
      {
        eyebrow: "Shopping",
        title: "Move through the store with clarity",
        text: "See items grouped by category and check them off while you shop.",
      },
    ],
    betaTitle: "Help shape MinderCart before its public launch",
    betaText:
      "We are inviting a limited number of households to use MinderCart during real grocery trips and share honest feedback.",
    betaPoints: [
      "Free access during the private beta",
      "Invitation-only participation",
      "Use MinderCart for at least three real shopping trips",
      "Share practical feedback about what worked and what did not",
    ],
    fitTitle: "Who we want to learn from",
    fitText:
      "We want a balanced group: people who shop for themselves, couples, families, iPhone users, Android users, English speakers, and Spanish speakers.",
    questionsTitle: "The beta application will ask",
    questions: [
      "Your name and email",
      "Your preferred language",
      "Whether you use iPhone or Android",
      "How often you shop for groceries",
      "How many people you normally shop for",
      "Who helps create the shopping list",
      "How you make your list today",
      "Your biggest shopping-list problem",
      "Why you would like to test MinderCart",
    ],
    applicationNote:
      "Complete the short form to apply for the free, invitation-only private beta.",
    footerSupport: "Support",
    privacy: "Privacy",
    terms: "Terms — Coming soon",
    rights: "MinderCart. Private beta.",
  },
  es: {
    languageLabel: "Idioma",
    betaBadge: "Beta privada gratuita",
    headline: "Nunca olvides qué comprar.",
    intro:
      "MinderCart te ayuda a anotar lo que necesitas, reutilizar tus listas y recorrer la tienda con todo organizado por categoría.",
    primaryCta: "Solicitar acceso a la beta",
    supportCta: "Copiar correo de soporte",
    supportCopied: "Correo copiado",
    benefitsTitle: "Una forma más sencilla de preparar y realizar tus compras",
    benefits: [
      {
        title: "Agrega lo que necesitas en segundos",
        text: "Anota artículos en cualquier momento, antes de olvidarlos.",
      },
      {
        title: "Crea y reutiliza tus propias listas",
        text: "Guarda listas para compras semanales, recetas u ocasiones especiales.",
      },
      {
        title: "Compra más rápido, organizado por categoría",
        text: "Pasa menos tiempo buscando y regresando por los mismos pasillos.",
      },
    ],
    howTitle: "Desde que lo recuerdas hasta que lo compras",
    modules: [
      {
        eyebrow: "Mi Lista",
        title: "Anota las necesidades cuando surgen",
        text: "Agrega artículos rápidamente, incluyendo cantidad, tienda y una nota o preferencia opcional.",
      },
      {
        eyebrow: "Mis Listas",
        title: "Conserva listas que puedas volver a usar",
        text: "Crea listas reutilizables para compras frecuentes, recetas, eventos y otras rutinas.",
      },
      {
        eyebrow: "De Compras",
        title: "Recorre la tienda con claridad",
        text: "Consulta los artículos por categoría y márcalos conforme realizas tus compras.",
      },
    ],
    betaTitle: "Ayuda a mejorar MinderCart antes de su lanzamiento público",
    betaText:
      "Estamos invitando a un número limitado de hogares para usar MinderCart durante compras reales y compartir comentarios honestos.",
    betaPoints: [
      "Acceso gratuito durante la beta privada",
      "Participación únicamente por invitación",
      "Usar MinderCart durante al menos tres compras reales",
      "Compartir comentarios prácticos sobre lo que funcionó y lo que no",
    ],
    fitTitle: "De quiénes queremos aprender",
    fitText:
      "Buscamos un grupo equilibrado: personas que compran para sí mismas, parejas, familias, usuarios de iPhone, usuarios de Android y personas que usan inglés o español.",
    questionsTitle: "La solicitud para la beta preguntará",
    questions: [
      "Tu nombre y correo electrónico",
      "Tu idioma preferido",
      "Si usas iPhone o Android",
      "Con qué frecuencia compras en el supermercado",
      "Para cuántas personas haces normalmente las compras",
      "Quién participa en la creación de la lista",
      "Cómo preparas actualmente tu lista",
      "Cuál es tu principal problema con las compras",
      "Por qué te gustaría probar MinderCart",
    ],
    applicationNote:
      "Completa el formulario breve para solicitar acceso a la beta privada gratuita y solo por invitación.",
    footerSupport: "Soporte",
    privacy: "Privacidad",
    terms: "Términos — Próximamente",
    rights: "MinderCart. Beta privada.",
  },
} as const;

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m5 12.5 4.2 4.2L19 7" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

export default function BetaPage() {
  const [language, setLanguage] = React.useState<Language>("en");
  const [supportEmailCopied, setSupportEmailCopied] = React.useState(false);
  const content = copy[language];

  React.useEffect(() => {
    const browserLanguage = window.navigator.language.toLowerCase();
    setLanguage(browserLanguage.startsWith("es") ? "es" : "en");
  }, []);

  React.useEffect(() => {
    const previousLanguage = document.documentElement.lang;
    document.documentElement.lang = language;

    return () => {
      document.documentElement.lang = previousLanguage;
    };
  }, [language]);

  async function copySupportEmail() {
    let copied = false;

    try {
      await window.navigator.clipboard.writeText(SUPPORT_EMAIL);
      copied = true;
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = SUPPORT_EMAIL;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      copied = document.execCommand("copy");
      document.body.removeChild(textarea);
    }

    if (!copied) return;

    setSupportEmailCopied(true);
    window.setTimeout(() => setSupportEmailCopied(false), 2200);
  }

  return (
    <main className="mc-beta-page">
      <style>{`
        :root {
          color-scheme: light;
        }

        * {
          box-sizing: border-box;
        }

        html,
        body {
          min-height: 100%;
          height: auto !important;
          overflow-x: hidden !important;
          overflow-y: auto !important;
        }

        body > .mc-app-frame,
        .mc-app-frame {
          min-height: 100dvh !important;
          height: auto !important;
          overflow: visible !important;
        }

        .mc-beta-page {
          min-height: 100dvh;
          background:
            radial-gradient(circle at 10% 0%, rgba(238, 242, 255, 0.95), transparent 38%),
            linear-gradient(180deg, #ffffff 0%, #f7f9ff 100%);
          color: ${MC_NAVY_TEXT};
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .mc-beta-container {
          width: min(1120px, calc(100% - 32px));
          margin: 0 auto;
        }

        .mc-beta-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          padding: 20px 0;
        }

        .mc-beta-brand {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .mc-beta-logo {
          width: 48px;
          height: 48px;
          flex: 0 0 auto;
          border-radius: 15px;
          overflow: hidden;
          background: #fff;
          box-shadow: 0 8px 24px rgba(18, 36, 94, 0.14);
        }

        .mc-beta-brand-name {
          color: ${MC_NAVY};
          font-size: 20px;
          line-height: 1;
          font-weight: 900;
          letter-spacing: -0.02em;
        }

        .mc-beta-brand-tagline {
          margin-top: 5px;
          color: ${MC_NAVY_MUTED};
          font-size: 12px;
          line-height: 1.2;
        }

        .mc-beta-language {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px;
          border: 1px solid ${MC_NAVY_LINE};
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.92);
          box-shadow: 0 4px 16px rgba(18, 36, 94, 0.06);
        }

        .mc-beta-language button {
          min-height: 34px;
          padding: 7px 12px;
          border: 0;
          border-radius: 999px;
          background: transparent;
          color: ${MC_NAVY_MUTED};
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
        }

        .mc-beta-language button.is-active {
          background: ${MC_NAVY};
          color: #fff;
        }

        .mc-beta-hero {
          display: grid;
          grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.8fr);
          gap: 44px;
          align-items: center;
          padding: 72px 0 82px;
        }

        .mc-beta-badge {
          display: inline-flex;
          align-items: center;
          min-height: 32px;
          padding: 6px 11px;
          border: 1px solid ${MC_NAVY_LINE};
          border-radius: 999px;
          background: ${MC_NAVY_SOFT};
          color: ${MC_NAVY};
          font-size: 13px;
          font-weight: 900;
        }

        .mc-beta-hero h1 {
          max-width: 720px;
          margin: 20px 0 0;
          color: ${MC_NAVY};
          font-size: clamp(46px, 7vw, 78px);
          line-height: 0.98;
          letter-spacing: -0.055em;
        }

        .mc-beta-hero-copy {
          max-width: 680px;
          margin: 24px 0 0;
          color: ${MC_NAVY_MUTED};
          font-size: clamp(18px, 2vw, 22px);
          line-height: 1.55;
        }

        .mc-beta-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 30px;
        }

        .mc-beta-button {
          min-height: 50px;
          padding: 13px 18px;
          border-radius: 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border: 1px solid ${MC_NAVY};
          background: ${MC_NAVY};
          color: #fff;
          font-size: 15px;
          font-weight: 900;
          text-decoration: none;
          box-shadow: 0 12px 28px rgba(18, 36, 94, 0.2);
          cursor: pointer;
        }

        .mc-beta-button svg {
          width: 18px;
          height: 18px;
          fill: none;
          stroke: currentColor;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .mc-beta-button--secondary {
          border-color: ${MC_NAVY_LINE};
          background: #fff;
          color: ${MC_NAVY};
          box-shadow: none;
        }

        .mc-beta-preview {
          position: relative;
          padding: 18px;
          border: 1px solid ${MC_NAVY_LINE};
          border-radius: 30px;
          background: rgba(255, 255, 255, 0.95);
          box-shadow: 0 30px 70px rgba(18, 36, 94, 0.17);
        }

        .mc-beta-preview::before {
          content: "";
          position: absolute;
          inset: -24px;
          z-index: -1;
          border-radius: 42px;
          background: ${MC_NAVY_SOFT};
          transform: rotate(-3deg);
        }

        .mc-beta-preview-top {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 14px;
          border-radius: 20px;
          background: ${MC_NAVY};
          color: #fff;
        }

        .mc-beta-preview-mark {
          width: 40px;
          height: 40px;
          flex: 0 0 auto;
          border-radius: 12px;
          overflow: hidden;
          display: grid;
          place-items: center;
          background: #fff;
        }

        .mc-beta-preview-title {
          font-size: 17px;
          font-weight: 900;
        }

        .mc-beta-preview-subtitle {
          margin-top: 3px;
          color: rgba(255, 255, 255, 0.82);
          font-size: 11px;
        }

        .mc-beta-preview-list {
          display: grid;
          gap: 9px;
          padding: 16px 2px 2px;
        }

        .mc-beta-preview-category {
          padding: 8px 11px;
          border: 1px solid ${MC_NAVY_LINE};
          border-radius: 11px;
          background: ${MC_NAVY_SOFT};
          color: ${MC_NAVY};
          font-size: 12px;
          font-weight: 900;
        }

        .mc-beta-preview-row {
          min-height: 50px;
          padding: 10px 12px;
          display: grid;
          grid-template-columns: 20px minmax(0, 1fr) auto;
          gap: 10px;
          align-items: center;
          border: 1px solid #edf0fa;
          border-radius: 13px;
          background: #fff;
        }

        .mc-beta-preview-check {
          width: 18px;
          height: 18px;
          border: 2px solid ${MC_NAVY_LINE};
          border-radius: 6px;
        }

        .mc-beta-preview-name {
          font-size: 14px;
          font-weight: 800;
        }

        .mc-beta-preview-note {
          margin-top: 2px;
          color: ${MC_NAVY_MUTED};
          font-size: 11px;
        }

        .mc-beta-preview-qty {
          color: ${MC_NAVY_MUTED};
          font-size: 12px;
          white-space: nowrap;
        }

        .mc-beta-section {
          padding: 82px 0;
        }

        .mc-beta-section--white {
          background: #fff;
          border-top: 1px solid rgba(215, 223, 245, 0.75);
          border-bottom: 1px solid rgba(215, 223, 245, 0.75);
        }

        .mc-beta-section-heading {
          max-width: 760px;
          margin: 0 auto 34px;
          text-align: center;
        }

        .mc-beta-section-heading h2 {
          margin: 0;
          color: ${MC_NAVY};
          font-size: clamp(32px, 4vw, 48px);
          line-height: 1.08;
          letter-spacing: -0.035em;
        }

        .mc-beta-section-heading p {
          margin: 16px auto 0;
          color: ${MC_NAVY_MUTED};
          font-size: 17px;
          line-height: 1.6;
        }

        .mc-beta-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
        }

        .mc-beta-card {
          min-height: 100%;
          padding: 24px;
          border: 1px solid ${MC_NAVY_LINE};
          border-radius: 22px;
          background: #fff;
          box-shadow: 0 12px 28px rgba(18, 36, 94, 0.06);
        }

        .mc-beta-card-number {
          width: 38px;
          height: 38px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          background: ${MC_NAVY};
          color: #fff;
          font-size: 14px;
          font-weight: 900;
        }

        .mc-beta-card-eyebrow {
          color: ${MC_NAVY_MUTED};
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .mc-beta-card h3 {
          margin: 18px 0 0;
          color: ${MC_NAVY};
          font-size: 21px;
          line-height: 1.2;
          letter-spacing: -0.02em;
        }

        .mc-beta-card p {
          margin: 10px 0 0;
          color: ${MC_NAVY_MUTED};
          font-size: 15px;
          line-height: 1.6;
        }

        .mc-beta-beta-panel {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(300px, 0.85fr);
          gap: 28px;
          align-items: start;
          padding: 34px;
          border-radius: 30px;
          background: ${MC_NAVY};
          color: #fff;
          box-shadow: 0 28px 68px rgba(18, 36, 94, 0.2);
        }

        .mc-beta-beta-panel h2 {
          margin: 0;
          font-size: clamp(32px, 4vw, 48px);
          line-height: 1.08;
          letter-spacing: -0.035em;
        }

        .mc-beta-beta-panel p {
          margin: 16px 0 0;
          color: rgba(255, 255, 255, 0.82);
          font-size: 17px;
          line-height: 1.6;
        }

        .mc-beta-check-list {
          display: grid;
          gap: 12px;
          margin: 24px 0 0;
          padding: 0;
          list-style: none;
        }

        .mc-beta-check-list li {
          display: grid;
          grid-template-columns: 22px minmax(0, 1fr);
          gap: 10px;
          align-items: start;
          color: rgba(255, 255, 255, 0.94);
          font-size: 15px;
          line-height: 1.45;
        }

        .mc-beta-check-list svg {
          width: 20px;
          height: 20px;
          fill: none;
          stroke: currentColor;
          stroke-width: 2.2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .mc-beta-questions {
          padding: 22px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.08);
        }

        .mc-beta-questions h3 {
          margin: 0;
          font-size: 19px;
          line-height: 1.25;
        }

        .mc-beta-questions ol {
          margin: 16px 0 0;
          padding-left: 22px;
          color: rgba(255, 255, 255, 0.84);
          font-size: 14px;
          line-height: 1.55;
        }

        .mc-beta-questions li + li {
          margin-top: 7px;
        }

        .mc-beta-note {
          margin-top: 18px !important;
          font-size: 13px !important;
          color: rgba(255, 255, 255, 0.7) !important;
        }

        .mc-beta-cta-row {
          margin-top: 24px;
        }

        .mc-beta-cta-row .mc-beta-button {
          border-color: #fff;
          background: #fff;
          color: ${MC_NAVY};
          box-shadow: none;
        }

        .mc-beta-fit {
          max-width: 830px;
          margin: 30px auto 0;
          padding: 22px 24px;
          border: 1px solid ${MC_NAVY_LINE};
          border-radius: 20px;
          background: ${MC_NAVY_SOFT};
          text-align: center;
        }

        .mc-beta-fit strong {
          color: ${MC_NAVY};
        }

        .mc-beta-fit p {
          margin: 8px 0 0;
          color: ${MC_NAVY_MUTED};
          line-height: 1.55;
        }

        .mc-beta-footer {
          padding: 34px 0 42px;
          border-top: 1px solid ${MC_NAVY_LINE};
          background: #fff;
        }

        .mc-beta-footer-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }

        .mc-beta-footer-left {
          color: ${MC_NAVY_MUTED};
          font-size: 13px;
        }

        .mc-beta-footer-links {
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-end;
          gap: 16px;
          color: ${MC_NAVY_MUTED};
          font-size: 13px;
        }

        .mc-beta-footer-links a {
          color: ${MC_NAVY};
          font-weight: 800;
          text-decoration: none;
        }

        @media (max-width: 860px) {
          .mc-beta-hero,
          .mc-beta-beta-panel {
            grid-template-columns: 1fr;
          }

          .mc-beta-hero {
            padding-top: 48px;
          }

          .mc-beta-preview {
            max-width: 540px;
          }

          .mc-beta-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 560px) {
          .mc-beta-container {
            width: min(100% - 24px, 1120px);
          }

          .mc-beta-header {
            align-items: flex-start;
          }

          .mc-beta-brand-tagline {
            display: none;
          }

          .mc-beta-language button {
            padding-inline: 10px;
          }

          .mc-beta-hero {
            gap: 36px;
            padding: 40px 0 58px;
          }

          .mc-beta-hero h1 {
            font-size: clamp(43px, 14vw, 62px);
          }

          .mc-beta-actions {
            display: grid;
          }

          .mc-beta-button {
            width: 100%;
          }

          .mc-beta-section {
            padding: 58px 0;
          }

          .mc-beta-card,
          .mc-beta-beta-panel {
            padding: 22px;
          }

          .mc-beta-footer-inner {
            align-items: flex-start;
            flex-direction: column;
          }

          .mc-beta-footer-links {
            justify-content: flex-start;
          }
        }
      `}</style>

      <header className="mc-beta-container mc-beta-header">
        <div className="mc-beta-brand">
          <div className="mc-beta-logo">
            <Image
              src="/mindercart-avatar.png"
              alt="MinderCart"
              width={48}
              height={48}
              priority
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <div>
            <div className="mc-beta-brand-name">MinderCart</div>
            <div className="mc-beta-brand-tagline">
              {language === "en" ? "Never forget what to buy" : "Nunca olvides qué comprar"}
            </div>
          </div>
        </div>

        <div className="mc-beta-language" aria-label={content.languageLabel}>
          <button
            type="button"
            className={language === "en" ? "is-active" : ""}
            aria-pressed={language === "en"}
            onClick={() => setLanguage("en")}
          >
            English
          </button>
          <button
            type="button"
            className={language === "es" ? "is-active" : ""}
            aria-pressed={language === "es"}
            onClick={() => setLanguage("es")}
          >
            Español
          </button>
        </div>
      </header>

      <section className="mc-beta-container mc-beta-hero">
        <div>
          <div className="mc-beta-badge">{content.betaBadge}</div>
          <h1>{content.headline}</h1>
          <p className="mc-beta-hero-copy">{content.intro}</p>

          <div className="mc-beta-actions">
            <a
              className="mc-beta-button"
              href={BETA_FORM_URL}
              target="_blank"
              rel="noreferrer"
            >
              {content.primaryCta}
              <ArrowIcon />
            </a>
            <button
              type="button"
              className="mc-beta-button mc-beta-button--secondary"
              onClick={copySupportEmail}
              aria-live="polite"
            >
              {supportEmailCopied ? content.supportCopied : content.supportCta}
            </button>
          </div>
        </div>

        <div className="mc-beta-preview" aria-label="MinderCart preview">
          <div className="mc-beta-preview-top">
            <div className="mc-beta-preview-mark">
              <Image
                src="/mindercart-avatar.png"
                alt="MinderCart"
                width={40}
                height={40}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div>
              <div className="mc-beta-preview-title">MinderCart</div>
              <div className="mc-beta-preview-subtitle">
                {language === "en" ? "Shopping organized by category" : "Compras organizadas por categoría"}
              </div>
            </div>
          </div>

          <div className="mc-beta-preview-list">
            <div className="mc-beta-preview-category">
              {language === "en" ? "Dairy & Refrigerated" : "Lácteos y refrigerados"}
            </div>
            <div className="mc-beta-preview-row">
              <span className="mc-beta-preview-check" />
              <div>
                <div className="mc-beta-preview-name">
                  {language === "en" ? "Milk" : "Leche"}
                </div>
                <div className="mc-beta-preview-note">
                  {language === "en" ? "Lactose-free" : "Sin lactosa"}
                </div>
              </div>
              <div className="mc-beta-preview-qty">1</div>
            </div>
            <div className="mc-beta-preview-row">
              <span className="mc-beta-preview-check" />
              <div>
                <div className="mc-beta-preview-name">
                  {language === "en" ? "Greek yogurt" : "Yogurt griego"}
                </div>
              </div>
              <div className="mc-beta-preview-qty">2</div>
            </div>

            <div className="mc-beta-preview-category">
              {language === "en" ? "Produce" : "Frutas y verduras"}
            </div>
            <div className="mc-beta-preview-row">
              <span className="mc-beta-preview-check" />
              <div>
                <div className="mc-beta-preview-name">
                  {language === "en" ? "Avocados" : "Aguacates"}
                </div>
              </div>
              <div className="mc-beta-preview-qty">4</div>
            </div>
          </div>
        </div>
      </section>

      <section className="mc-beta-section mc-beta-section--white">
        <div className="mc-beta-container">
          <div className="mc-beta-section-heading">
            <h2>{content.benefitsTitle}</h2>
          </div>

          <div className="mc-beta-grid">
            {content.benefits.map((benefit, index) => (
              <article className="mc-beta-card" key={benefit.title}>
                <div className="mc-beta-card-number">{index + 1}</div>
                <h3>{benefit.title}</h3>
                <p>{benefit.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mc-beta-section">
        <div className="mc-beta-container">
          <div className="mc-beta-section-heading">
            <h2>{content.howTitle}</h2>
          </div>

          <div className="mc-beta-grid">
            {content.modules.map((module) => (
              <article className="mc-beta-card" key={module.eyebrow}>
                <div className="mc-beta-card-eyebrow">{module.eyebrow}</div>
                <h3>{module.title}</h3>
                <p>{module.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mc-beta-section mc-beta-section--white">
        <div className="mc-beta-container">
          <div className="mc-beta-beta-panel">
            <div>
              <h2>{content.betaTitle}</h2>
              <p>{content.betaText}</p>

              <ul className="mc-beta-check-list">
                {content.betaPoints.map((point) => (
                  <li key={point}>
                    <CheckIcon />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>

              <div className="mc-beta-cta-row">
                <a
                  className="mc-beta-button"
                  href={BETA_FORM_URL}
                  target="_blank"
                  rel="noreferrer"
                >
                  {content.primaryCta}
                  <ArrowIcon />
                </a>
              </div>
            </div>

            <aside className="mc-beta-questions">
              <h3>{content.questionsTitle}</h3>
              <ol>
                {content.questions.map((question) => (
                  <li key={question}>{question}</li>
                ))}
              </ol>
              <p className="mc-beta-note">{content.applicationNote}</p>
            </aside>
          </div>

          <div className="mc-beta-fit">
            <strong>{content.fitTitle}</strong>
            <p>{content.fitText}</p>
          </div>
        </div>
      </section>

      <footer className="mc-beta-footer">
        <div className="mc-beta-container mc-beta-footer-inner">
          <div className="mc-beta-footer-left">{content.rights}</div>
          <div className="mc-beta-footer-links">
            <span>
              {content.footerSupport}: {SUPPORT_EMAIL}
            </span>
            <a href="/privacy">{content.privacy}</a>
            <span>{content.terms}</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
