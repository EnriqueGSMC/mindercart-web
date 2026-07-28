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

const copy = {
  en: {
    languageLabel: "Language",
    backToBeta: "Back to private beta",
    eyebrow: "MinderCart legal",
    title: "Privacy Policy",
    intro:
      "This Privacy Policy explains how MinderCart collects, uses, stores, and shares information when you use the MinderCart website, web application, private-beta application form, and related support.",
    effectiveLabel: "Effective date",
    effectiveDate: "July 27, 2026",
    summaryTitle: "Privacy at a glance",
    summaryCards: [
      {
        title: "Your lists are yours",
        text: "MinderCart uses your shopping information to provide the app and its features.",
      },
      {
        title: "Local and cloud storage",
        text: "Some information can stay in your browser. When you sign in, supported information may be synchronized through Firebase.",
      },
      {
        title: "No sale or targeted advertising",
        text: "MinderCart does not currently sell personal information or use it for targeted advertising.",
      },
    ],
    sections: [
      {
        title: "1. Scope of this policy",
        paragraphs: [
          "This policy applies to the MinderCart website, the MinderCart web application, the private-beta landing page, the beta application form, and communications with MinderCart support.",
          "For purposes of this policy, “MinderCart,” “we,” “us,” and “our” refer to the MinderCart service.",
        ],
      },
      {
        title: "2. Information we collect",
        paragraphs: [
          "We collect information that you provide, information created through your use of MinderCart, and limited technical information processed by the services that operate the app.",
        ],
        bullets: [
          "Account information, such as your email address and authentication identifiers when you create an account or sign in.",
          "Shopping content, such as items, quantities, units, stores, optional notes, reusable lists, active shopping lists, purchase history, custom items, and related list settings.",
          "Preferences, such as language, preferred store, and text-size settings.",
          "Group and sharing information, such as group membership, invitations, and the content shared within a group when those features are used.",
          "Support communications, including the information you send when contacting us.",
          "Private-beta application information, such as name, email, preferred language, device type, shopping frequency, household size, current list-making methods, and feedback.",
          "Technical information that may be processed by our hosting and service providers, such as browser type, device type, IP address, timestamps, error information, and basic request or security logs.",
        ],
      },
      {
        title: "3. Browser storage and guest use",
        paragraphs: [
          "MinderCart uses browser storage, including localStorage, to keep app state and preferences on your device. This can include your lists, shopping history, settings, saved lists, onboarding status, and pending synchronization data.",
          "You may use certain features without signing in. In that case, information generally remains in the browser on that device unless you later sign in and the app performs an available migration or synchronization.",
          "Clearing browser data, using private-browsing mode, changing devices, or uninstalling a browser can remove locally stored information.",
        ],
      },
      {
        title: "4. Account and cloud synchronization",
        paragraphs: [
          "When you sign in, MinderCart uses Google Firebase services for authentication and supported cloud synchronization. Depending on the feature, account identifiers, app state, saved lists, settings, group information, and pending synchronization data may be processed through Firebase.",
          "Passwords and sign-in credentials are handled by the authentication provider. MinderCart does not receive your password in plain text.",
          "Cloud synchronization is intended to help restore and use supported information across sessions or devices. During the private beta, some simultaneous multi-device conflict scenarios are still being tested.",
        ],
      },
      {
        title: "5. Private-beta application form",
        paragraphs: [
          "The private-beta application is hosted with Google Forms. Information you submit is received in the MinderCart form and may also be stored in a linked Google Sheet used to review applications and administer the beta.",
          "Submitting the form does not guarantee acceptance into the beta. We use the responses to select a balanced test group, communicate with applicants, understand shopping habits, and improve MinderCart.",
        ],
      },
      {
        title: "6. How we use information",
        bullets: [
          "Provide, maintain, and improve MinderCart.",
          "Authenticate users and synchronize supported information.",
          "Create, display, reuse, and organize shopping lists and purchase history.",
          "Enable group and shared-list features when selected by the user.",
          "Provide support and respond to questions or privacy requests.",
          "Select, communicate with, and learn from private-beta participants.",
          "Protect the service, investigate errors, prevent abuse, and maintain security.",
          "Comply with legal obligations and enforce applicable terms.",
        ],
      },
      {
        title: "7. When information is shared",
        paragraphs: [
          "We do not currently sell personal information, rent it to data brokers, or use it for targeted advertising.",
          "Information may be shared in the following limited circumstances:",
        ],
        bullets: [
          "With service providers that help operate MinderCart, including Google Firebase for authentication and cloud services, Google Forms and Google Sheets for the beta application, and our website hosting provider.",
          "With members of a group or shared list when you choose to use sharing features. Those people may be able to view or modify shared content according to the available functionality.",
          "When required by law, legal process, or a valid government request, or when reasonably necessary to protect rights, safety, users, or the service.",
          "In connection with a merger, financing, acquisition, reorganization, or transfer of the service, subject to appropriate notice and protections.",
        ],
      },
      {
        title: "8. Data retention",
        paragraphs: [
          "Locally stored information generally remains on the device until you remove it through the app, clear browser storage, or the browser removes it.",
          "Cloud information is retained for as long as reasonably necessary to provide the service, maintain the account, resolve disputes, protect the service, and meet legal obligations.",
          "Beta application and feedback information is retained as needed to administer the beta, communicate with applicants, analyze results, and improve MinderCart. We may delete or anonymize information when it is no longer needed.",
          "Backup copies and security logs may remain for a limited period after deletion because of routine backup, fraud-prevention, or legal processes.",
        ],
      },
      {
        title: "9. Your choices and privacy rights",
        paragraphs: [
          "Depending on where you live, applicable law may give you rights to request access, correction, deletion, or a copy of certain personal information, and to appeal a denied privacy request.",
          "MinderCart does not currently sell personal information or process it for targeted advertising. Therefore, there is currently no sale or targeted-advertising opt-out to activate.",
        ],
        bullets: [
          "Update supported preferences and list content directly in the app.",
          "Delete individual lists, items, or history through available app controls.",
          "Clear local browser data to remove information stored only on that device.",
          "Contact us to request access, correction, deletion, or export of account-related information.",
          "Unsubscribe from nonessential beta communications by replying to the message or contacting support.",
        ],
      },
      {
        title: "10. Security",
        paragraphs: [
          "We use reasonable administrative, technical, and organizational measures intended to protect information. We also rely on established service providers for authentication, hosting, form collection, and cloud infrastructure.",
          "No online service or storage method can guarantee absolute security. Keep your password confidential, use a secure device, and contact us if you believe your account or information has been compromised.",
        ],
      },
      {
        title: "11. International processing",
        paragraphs: [
          "MinderCart and its service providers may process information in the United States and in other locations where those providers operate. Privacy and data-protection laws may differ from those in your location.",
        ],
      },
      {
        title: "12. Children",
        paragraphs: [
          "MinderCart is not directed to children under 13, and we do not knowingly collect personal information from children under 13. A parent or guardian who believes a child has provided personal information should contact us so we can review and take appropriate action.",
        ],
      },
      {
        title: "13. Third-party services",
        paragraphs: [
          "MinderCart relies on third-party services, including Google Firebase, Google Forms, Google Sheets, and website-hosting infrastructure. Those providers process information under their own terms and privacy practices.",
          "Links to third-party websites or services are governed by the privacy policies of those third parties, not this policy.",
        ],
      },
      {
        title: "14. Changes to this policy",
        paragraphs: [
          "We may update this Privacy Policy as MinderCart changes. We will post the revised policy and update the effective date. When required, we will provide additional notice.",
        ],
      },
      {
        title: "15. Contact us",
        paragraphs: [
          "For privacy questions or requests, email mindercartapp@gmail.com. Please describe your request and include the email address associated with your MinderCart account, when applicable. We may need to verify your identity before completing certain requests.",
        ],
      },
    ],
    footerNotice:
      "This policy reflects the current private-beta version of MinderCart and may be updated before a broader commercial launch.",
    contactLabel: "Privacy contact",
    copyContact: "Copy privacy email",
    contactCopied: "Email copied",
  },
  es: {
    languageLabel: "Idioma",
    backToBeta: "Volver a la beta privada",
    eyebrow: "Información legal de MinderCart",
    title: "Política de Privacidad",
    intro:
      "Esta Política de Privacidad explica cómo MinderCart recopila, usa, almacena y comparte información cuando utilizas el sitio web, la aplicación web, el formulario de solicitud de la beta privada y el soporte relacionado con MinderCart.",
    effectiveLabel: "Fecha de vigencia",
    effectiveDate: "27 de julio de 2026",
    summaryTitle: "La privacidad en pocas palabras",
    summaryCards: [
      {
        title: "Tus listas son tuyas",
        text: "MinderCart usa la información de tus compras para proporcionar la aplicación y sus funciones.",
      },
      {
        title: "Almacenamiento local y en la nube",
        text: "Parte de la información puede permanecer en tu navegador. Cuando inicias sesión, la información compatible puede sincronizarse mediante Firebase.",
      },
      {
        title: "Sin venta ni publicidad dirigida",
        text: "Actualmente MinderCart no vende información personal ni la usa para publicidad dirigida.",
      },
    ],
    sections: [
      {
        title: "1. Alcance de esta política",
        paragraphs: [
          "Esta política se aplica al sitio web de MinderCart, la aplicación web de MinderCart, la landing de la beta privada, el formulario de solicitud de la beta y las comunicaciones con el soporte de MinderCart.",
          "Para efectos de esta política, “MinderCart”, “nosotros” y “nuestro” se refieren al servicio MinderCart.",
        ],
      },
      {
        title: "2. Información que recopilamos",
        paragraphs: [
          "Recopilamos información que proporcionas, información creada mediante el uso de MinderCart e información técnica limitada procesada por los servicios que operan la aplicación.",
        ],
        bullets: [
          "Información de cuenta, como tu correo electrónico e identificadores de autenticación cuando creas una cuenta o inicias sesión.",
          "Contenido de compras, como artículos, cantidades, unidades, tiendas, notas opcionales, listas reutilizables, listas activas de compras, historial, artículos personalizados y configuraciones relacionadas.",
          "Preferencias, como idioma, tienda preferida y tamaño del texto.",
          "Información de grupo y uso compartido, como integrantes, invitaciones y contenido compartido dentro de un grupo cuando se utilizan esas funciones.",
          "Comunicaciones de soporte, incluida la información que envías al contactarnos.",
          "Información de solicitud de la beta privada, como nombre, correo electrónico, idioma preferido, tipo de dispositivo, frecuencia de compras, tamaño del hogar, método actual para crear listas y comentarios.",
          "Información técnica que puede ser procesada por nuestros proveedores de hosting y servicios, como tipo de navegador, tipo de dispositivo, dirección IP, marcas de tiempo, información de errores y registros básicos de solicitudes o seguridad.",
        ],
      },
      {
        title: "3. Almacenamiento en el navegador y uso como invitado",
        paragraphs: [
          "MinderCart utiliza almacenamiento del navegador, incluido localStorage, para conservar en tu dispositivo el estado y las preferencias de la aplicación. Esto puede incluir listas, historial de compras, configuración, listas guardadas, estado del onboarding y datos pendientes de sincronización.",
          "Puedes utilizar ciertas funciones sin iniciar sesión. En ese caso, la información generalmente permanece en el navegador de ese dispositivo, salvo que posteriormente inicies sesión y la aplicación realice una migración o sincronización disponible.",
          "Borrar los datos del navegador, utilizar navegación privada, cambiar de dispositivo o desinstalar el navegador puede eliminar la información almacenada localmente.",
        ],
      },
      {
        title: "4. Cuenta y sincronización en la nube",
        paragraphs: [
          "Cuando inicias sesión, MinderCart utiliza servicios de Google Firebase para autenticación y sincronización compatible en la nube. Dependiendo de la función, los identificadores de cuenta, el estado de la aplicación, las listas guardadas, la configuración, la información de grupo y los datos pendientes de sincronización pueden procesarse mediante Firebase.",
          "Las contraseñas y credenciales de acceso son manejadas por el proveedor de autenticación. MinderCart no recibe tu contraseña en texto sin protección.",
          "La sincronización en la nube busca ayudar a restaurar y usar información compatible entre sesiones o dispositivos. Durante la beta privada todavía se están probando algunos escenarios de conflicto por modificaciones simultáneas en varios dispositivos.",
        ],
      },
      {
        title: "5. Formulario de solicitud para la beta privada",
        paragraphs: [
          "La solicitud de la beta privada está alojada en Google Forms. La información que envías se recibe en el formulario de MinderCart y también puede almacenarse en una hoja de Google Sheets vinculada para revisar solicitudes y administrar la beta.",
          "Enviar el formulario no garantiza el acceso a la beta. Utilizamos las respuestas para seleccionar un grupo equilibrado de pruebas, comunicarnos con los solicitantes, comprender hábitos de compra y mejorar MinderCart.",
        ],
      },
      {
        title: "6. Cómo utilizamos la información",
        bullets: [
          "Proporcionar, mantener y mejorar MinderCart.",
          "Autenticar usuarios y sincronizar información compatible.",
          "Crear, mostrar, reutilizar y organizar listas de compras e historial.",
          "Habilitar funciones de grupo y listas compartidas cuando el usuario las selecciona.",
          "Proporcionar soporte y responder preguntas o solicitudes de privacidad.",
          "Seleccionar, contactar y aprender de los participantes de la beta privada.",
          "Proteger el servicio, investigar errores, prevenir abuso y mantener la seguridad.",
          "Cumplir obligaciones legales y hacer cumplir los términos aplicables.",
        ],
      },
      {
        title: "7. Cuándo se comparte información",
        paragraphs: [
          "Actualmente no vendemos información personal, no la rentamos a intermediarios de datos ni la utilizamos para publicidad dirigida.",
          "La información puede compartirse en las siguientes circunstancias limitadas:",
        ],
        bullets: [
          "Con proveedores que ayudan a operar MinderCart, incluidos Google Firebase para autenticación y nube, Google Forms y Google Sheets para la solicitud de la beta y nuestro proveedor de hosting.",
          "Con integrantes de un grupo o lista compartida cuando eliges utilizar funciones de colaboración. Esas personas pueden ver o modificar contenido compartido conforme a las funciones disponibles.",
          "Cuando lo exija la ley, un proceso legal o una solicitud gubernamental válida, o cuando sea razonablemente necesario para proteger derechos, seguridad, usuarios o el servicio.",
          "En relación con una fusión, financiamiento, adquisición, reorganización o transferencia del servicio, sujeto a avisos y protecciones apropiadas.",
        ],
      },
      {
        title: "8. Conservación de información",
        paragraphs: [
          "La información almacenada localmente generalmente permanece en el dispositivo hasta que la eliminas desde la aplicación, borras el almacenamiento del navegador o el navegador la elimina.",
          "La información en la nube se conserva durante el tiempo razonablemente necesario para proporcionar el servicio, mantener la cuenta, resolver controversias, proteger el servicio y cumplir obligaciones legales.",
          "La información de solicitudes y comentarios de la beta se conserva según sea necesario para administrar la beta, comunicarnos con los solicitantes, analizar resultados y mejorar MinderCart. Podemos eliminarla o anonimizarla cuando deje de ser necesaria.",
          "Las copias de respaldo y los registros de seguridad pueden permanecer durante un periodo limitado después de una eliminación debido a procesos rutinarios de respaldo, prevención de fraude u obligaciones legales.",
        ],
      },
      {
        title: "9. Tus opciones y derechos de privacidad",
        paragraphs: [
          "Dependiendo de tu lugar de residencia, la ley aplicable puede otorgarte derechos para solicitar acceso, corrección, eliminación o una copia de determinada información personal, así como apelar una solicitud de privacidad rechazada.",
          "Actualmente MinderCart no vende información personal ni la procesa para publicidad dirigida. Por lo tanto, no existe en este momento una opción que debas activar para rechazar una venta o publicidad dirigida.",
        ],
        bullets: [
          "Actualizar preferencias e información de listas compatibles directamente en la aplicación.",
          "Eliminar listas, artículos o historial mediante los controles disponibles.",
          "Borrar los datos locales del navegador para eliminar información almacenada únicamente en ese dispositivo.",
          "Contactarnos para solicitar acceso, corrección, eliminación o exportación de información relacionada con la cuenta.",
          "Dejar de recibir comunicaciones no esenciales de la beta respondiendo al mensaje o contactando a soporte.",
        ],
      },
      {
        title: "10. Seguridad",
        paragraphs: [
          "Utilizamos medidas administrativas, técnicas y organizativas razonables destinadas a proteger la información. También dependemos de proveedores establecidos para autenticación, hosting, recopilación de formularios e infraestructura en la nube.",
          "Ningún servicio en línea o método de almacenamiento puede garantizar seguridad absoluta. Mantén tu contraseña confidencial, utiliza un dispositivo seguro y contáctanos si consideras que tu cuenta o información ha sido comprometida.",
        ],
      },
      {
        title: "11. Procesamiento internacional",
        paragraphs: [
          "MinderCart y sus proveedores pueden procesar información en Estados Unidos y en otros lugares donde operen dichos proveedores. Las leyes de privacidad y protección de datos pueden ser distintas a las de tu ubicación.",
        ],
      },
      {
        title: "12. Menores de edad",
        paragraphs: [
          "MinderCart no está dirigido a menores de 13 años y no recopilamos conscientemente información personal de menores de 13 años. Un padre, madre o tutor que considere que un menor proporcionó información personal debe contactarnos para que podamos revisar el caso y tomar las medidas apropiadas.",
        ],
      },
      {
        title: "13. Servicios de terceros",
        paragraphs: [
          "MinderCart depende de servicios de terceros, incluidos Google Firebase, Google Forms, Google Sheets e infraestructura de hosting. Esos proveedores procesan información conforme a sus propios términos y prácticas de privacidad.",
          "Los enlaces a sitios o servicios de terceros se rigen por las políticas de privacidad de esos terceros, no por esta política.",
        ],
      },
      {
        title: "14. Cambios a esta política",
        paragraphs: [
          "Podemos actualizar esta Política de Privacidad conforme cambie MinderCart. Publicaremos la versión actualizada y modificaremos la fecha de vigencia. Cuando sea necesario, proporcionaremos un aviso adicional.",
        ],
      },
      {
        title: "15. Contacto",
        paragraphs: [
          "Para preguntas o solicitudes de privacidad, escribe a mindercartapp@gmail.com. Describe tu solicitud e incluye el correo asociado con tu cuenta de MinderCart, cuando corresponda. Es posible que necesitemos verificar tu identidad antes de completar ciertas solicitudes.",
        ],
      },
    ],
    footerNotice:
      "Esta política refleja la versión actual de la beta privada de MinderCart y puede actualizarse antes de un lanzamiento comercial más amplio.",
    contactLabel: "Contacto de privacidad",
    copyContact: "Copiar correo de privacidad",
    contactCopied: "Correo copiado",
  },
} as const;

export default function PrivacyPage() {
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
    <main className="mc-privacy-page">
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

        .mc-privacy-page {
          min-height: 100dvh;
          background:
            radial-gradient(circle at 10% 0%, rgba(238, 242, 255, 0.95), transparent 38%),
            linear-gradient(180deg, #ffffff 0%, #f7f9ff 100%);
          color: ${MC_NAVY_TEXT};
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .mc-privacy-container {
          width: min(980px, calc(100% - 32px));
          margin: 0 auto;
        }

        .mc-privacy-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          padding: 20px 0;
        }

        .mc-privacy-brand {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
          color: ${MC_NAVY};
          text-decoration: none;
        }

        .mc-privacy-logo {
          width: 48px;
          height: 48px;
          flex: 0 0 auto;
          border-radius: 15px;
          overflow: hidden;
          background: #fff;
          box-shadow: 0 8px 24px rgba(18, 36, 94, 0.14);
        }

        .mc-privacy-brand-name {
          color: ${MC_NAVY};
          font-size: 20px;
          line-height: 1;
          font-weight: 900;
          letter-spacing: -0.02em;
        }

        .mc-privacy-brand-tagline {
          margin-top: 5px;
          color: ${MC_NAVY_MUTED};
          font-size: 12px;
          line-height: 1.2;
        }

        .mc-privacy-language {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px;
          border: 1px solid ${MC_NAVY_LINE};
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.92);
          box-shadow: 0 4px 16px rgba(18, 36, 94, 0.06);
        }

        .mc-privacy-language button {
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

        .mc-privacy-language button.is-active {
          background: ${MC_NAVY};
          color: #fff;
        }

        .mc-privacy-back {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: 34px;
          color: ${MC_NAVY};
          font-size: 14px;
          font-weight: 900;
          text-decoration: none;
        }

        .mc-privacy-back::before {
          content: "←";
          font-size: 18px;
          line-height: 1;
        }

        .mc-privacy-hero {
          padding: 38px 0 48px;
        }

        .mc-privacy-eyebrow {
          color: ${MC_NAVY_MUTED};
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .mc-privacy-hero h1 {
          margin: 14px 0 0;
          color: ${MC_NAVY};
          font-size: clamp(43px, 8vw, 72px);
          line-height: 0.98;
          letter-spacing: -0.055em;
        }

        .mc-privacy-intro {
          max-width: 800px;
          margin: 24px 0 0;
          color: ${MC_NAVY_MUTED};
          font-size: clamp(17px, 2vw, 20px);
          line-height: 1.65;
        }

        .mc-privacy-effective {
          display: inline-flex;
          margin-top: 22px;
          padding: 8px 12px;
          border: 1px solid ${MC_NAVY_LINE};
          border-radius: 999px;
          background: ${MC_NAVY_SOFT};
          color: ${MC_NAVY};
          font-size: 13px;
          font-weight: 900;
        }

        .mc-privacy-summary {
          padding: 0 0 54px;
        }

        .mc-privacy-summary h2 {
          margin: 0 0 18px;
          color: ${MC_NAVY};
          font-size: 27px;
          letter-spacing: -0.025em;
        }

        .mc-privacy-summary-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }

        .mc-privacy-summary-card {
          padding: 20px;
          border: 1px solid ${MC_NAVY_LINE};
          border-radius: 19px;
          background: #fff;
          box-shadow: 0 10px 24px rgba(18, 36, 94, 0.05);
        }

        .mc-privacy-summary-card h3 {
          margin: 0;
          color: ${MC_NAVY};
          font-size: 17px;
          line-height: 1.25;
        }

        .mc-privacy-summary-card p {
          margin: 8px 0 0;
          color: ${MC_NAVY_MUTED};
          font-size: 14px;
          line-height: 1.55;
        }

        .mc-privacy-content-wrap {
          padding: 54px 0 76px;
          border-top: 1px solid rgba(215, 223, 245, 0.8);
          background: #fff;
        }

        .mc-privacy-content {
          display: grid;
          gap: 16px;
        }

        .mc-privacy-section {
          padding: 24px;
          border: 1px solid ${MC_NAVY_LINE};
          border-radius: 20px;
          background: #fff;
        }

        .mc-privacy-section h2 {
          margin: 0;
          color: ${MC_NAVY};
          font-size: 22px;
          line-height: 1.25;
          letter-spacing: -0.02em;
        }

        .mc-privacy-section p {
          margin: 12px 0 0;
          color: ${MC_NAVY_MUTED};
          font-size: 15px;
          line-height: 1.7;
        }

        .mc-privacy-section ul {
          margin: 14px 0 0;
          padding-left: 22px;
          color: ${MC_NAVY_MUTED};
          font-size: 15px;
          line-height: 1.65;
        }

        .mc-privacy-section li + li {
          margin-top: 8px;
        }

        .mc-privacy-contact {
          margin-top: 22px;
          padding: 22px;
          border-radius: 20px;
          background: ${MC_NAVY};
          color: #fff;
        }

        .mc-privacy-contact strong {
          display: block;
          font-size: 14px;
          opacity: 0.78;
        }

        .mc-privacy-contact-email {
          display: block;
          margin-top: 7px;
          color: #fff;
          font-size: 20px;
          font-weight: 900;
          word-break: break-word;
        }

        .mc-privacy-contact button {
          min-height: 42px;
          margin-top: 16px;
          padding: 10px 14px;
          border: 1px solid rgba(255, 255, 255, 0.72);
          border-radius: 13px;
          background: #fff;
          color: ${MC_NAVY};
          font-size: 14px;
          font-weight: 900;
          cursor: pointer;
        }

        .mc-privacy-footer {
          padding: 32px 0 42px;
          border-top: 1px solid ${MC_NAVY_LINE};
          background: #fff;
        }

        .mc-privacy-footer-inner {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
        }

        .mc-privacy-footer-copy {
          max-width: 700px;
          color: ${MC_NAVY_MUTED};
          font-size: 13px;
          line-height: 1.55;
        }

        .mc-privacy-footer a {
          color: ${MC_NAVY};
          font-size: 13px;
          font-weight: 900;
          text-decoration: none;
          white-space: nowrap;
        }

        @media (max-width: 760px) {
          .mc-privacy-summary-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 560px) {
          .mc-privacy-container {
            width: min(100% - 24px, 980px);
          }

          .mc-privacy-header {
            align-items: flex-start;
          }

          .mc-privacy-brand-tagline {
            display: none;
          }

          .mc-privacy-language button {
            padding-inline: 10px;
          }

          .mc-privacy-hero {
            padding-top: 32px;
          }

          .mc-privacy-section {
            padding: 20px;
          }

          .mc-privacy-footer-inner {
            flex-direction: column;
          }
        }
      `}</style>

      <header className="mc-privacy-container mc-privacy-header">
        <a className="mc-privacy-brand" href="/beta">
          <div className="mc-privacy-logo">
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
            <div className="mc-privacy-brand-name">MinderCart</div>
            <div className="mc-privacy-brand-tagline">
              {language === "en"
                ? "Never forget what to buy"
                : "Nunca olvides qué comprar"}
            </div>
          </div>
        </a>

        <div className="mc-privacy-language" aria-label={content.languageLabel}>
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

      <div className="mc-privacy-container">
        <a className="mc-privacy-back" href="/beta">
          {content.backToBeta}
        </a>

        <section className="mc-privacy-hero">
          <div className="mc-privacy-eyebrow">{content.eyebrow}</div>
          <h1>{content.title}</h1>
          <p className="mc-privacy-intro">{content.intro}</p>
          <div className="mc-privacy-effective">
            {content.effectiveLabel}:{" "}
            <time dateTime="2026-07-27">{content.effectiveDate}</time>
          </div>
        </section>

        <section className="mc-privacy-summary">
          <h2>{content.summaryTitle}</h2>
          <div className="mc-privacy-summary-grid">
            {content.summaryCards.map((card) => (
              <article className="mc-privacy-summary-card" key={card.title}>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </article>
            ))}
          </div>
        </section>
      </div>

      <div className="mc-privacy-content-wrap">
        <div className="mc-privacy-container">
          <div className="mc-privacy-content">
            {content.sections.map((section) => (
              <section className="mc-privacy-section" key={section.title}>
                <h2>{section.title}</h2>
                {"paragraphs" in section
                  ? section.paragraphs?.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))
                  : null}
                {"bullets" in section && section.bullets ? (
                  <ul>
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>

          <div className="mc-privacy-contact">
            <strong>{content.contactLabel}</strong>
            <span className="mc-privacy-contact-email">{SUPPORT_EMAIL}</span>
            <button type="button" onClick={copySupportEmail} aria-live="polite">
              {supportEmailCopied ? content.contactCopied : content.copyContact}
            </button>
          </div>
        </div>
      </div>

      <footer className="mc-privacy-footer">
        <div className="mc-privacy-container mc-privacy-footer-inner">
          <div className="mc-privacy-footer-copy">{content.footerNotice}</div>
          <a href="/beta">{content.backToBeta}</a>
        </div>
      </footer>
    </main>
  );
}
