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
    title: "Terms of Use",
    intro:
      "These Terms of Use apply when you access or use the MinderCart website, web application, private beta, and related support. By using MinderCart, you agree to these Terms.",
    effectiveLabel: "Effective date",
    effectiveDate: "July 27, 2026",
    summaryTitle: "Terms at a glance",
    summaryCards: [
      {
        title: "Use MinderCart responsibly",
        text: "Use the service only for lawful personal or household shopping-list purposes and do not interfere with the service or other users.",
      },
      {
        title: "The private beta may change",
        text: "Features may be incomplete, modified, unavailable, or removed while MinderCart is being tested.",
      },
      {
        title: "MinderCart™ is protected",
        text: "The MinderCart™ name, logo, design, and software are protected. A U.S. federal trademark application is pending.",
      },
    ],
    sections: [
      {
        title: "1. Acceptance of these Terms",
        paragraphs: [
          "By accessing or using MinderCart, creating an account, joining a shared group, submitting a private-beta application, or receiving support, you agree to these Terms of Use and the Privacy Policy.",
          "If you do not agree, do not use MinderCart. If you use MinderCart on behalf of another person or organization, you represent that you are authorized to accept these Terms for them.",
        ],
      },
      {
        title: "2. Eligibility",
        paragraphs: [
          "You must be at least 13 years old to use MinderCart. If you are under the age of legal majority where you live, you may use MinderCart only with permission and supervision from a parent or legal guardian.",
          "MinderCart is not directed to children under 13. A parent or guardian who believes a child under 13 has used the service or provided personal information should contact us.",
        ],
      },
      {
        title: "3. Private-beta participation",
        paragraphs: [
          "MinderCart is currently offered as a limited private beta. Participation may require an invitation and may be limited to selected households, devices, locations, languages, or testing periods.",
          "Submitting an application does not guarantee access. We may accept, decline, pause, or end participation at our discretion, subject to applicable law.",
          "During the beta, features may contain errors, change without notice, operate differently across devices, or become temporarily unavailable. You should keep any important shopping information in a form you can access if the service is interrupted.",
        ],
      },
      {
        title: "4. Accounts and account security",
        paragraphs: [
          "You are responsible for providing accurate account information, maintaining the confidentiality of your credentials, and all activity that occurs through your account.",
          "Do not share your password or allow another person to impersonate you. Contact us promptly if you believe your account or device has been compromised.",
          "We may require verification of your identity before assisting with certain account, privacy, deletion, or security requests.",
        ],
      },
      {
        title: "5. Permitted use",
        paragraphs: [
          "MinderCart is intended to help users create, organize, reuse, share, and complete shopping lists and related household-shopping activities.",
          "You receive a limited, personal, nonexclusive, nontransferable, and revocable right to use the service in accordance with these Terms.",
        ],
        bullets: [
          "Use MinderCart only for lawful purposes.",
          "Use reasonable care when entering, sharing, and acting on shopping information.",
          "Respect the privacy and rights of people included in your groups or shared lists.",
          "Follow any instructions, limits, or testing requirements communicated for the private beta.",
        ],
      },
      {
        title: "6. Prohibited conduct",
        bullets: [
          "Accessing or using another person’s account without permission.",
          "Attempting to bypass authentication, security, rate limits, or access controls.",
          "Introducing malware, harmful code, automated abuse, scraping, or excessive requests.",
          "Reverse engineering, decompiling, copying, reselling, sublicensing, or commercially exploiting the service except where applicable law expressly permits it.",
          "Using MinderCart to violate law, infringe intellectual-property rights, harass others, commit fraud, or distribute unlawful or harmful content.",
          "Interfering with the operation of the service, its providers, shared groups, or other users.",
          "Misrepresenting your identity, beta eligibility, affiliation, or authority.",
        ],
      },
      {
        title: "7. Your content and shopping information",
        paragraphs: [
          "You retain ownership of the shopping lists, notes, custom items, preferences, feedback, and other content you create or submit, subject to the rights needed to operate the service.",
          "You grant MinderCart a limited, nonexclusive, worldwide license to host, store, reproduce, process, display, transmit, and modify your content only as reasonably necessary to provide, secure, support, and improve the service.",
          "You are responsible for the accuracy, legality, and appropriateness of the content you submit. Do not enter sensitive information that is unnecessary for a shopping-list service.",
        ],
      },
      {
        title: "8. Groups and shared lists",
        paragraphs: [
          "When you join or create a group or use shared-list features, other authorized members may be able to view, add, edit, mark, or remove shared content.",
          "You are responsible for choosing who joins your group and for understanding that changes made by one member may affect other members.",
          "Some simultaneous multi-device conflict scenarios are still being tested during the private beta. Do not rely on MinderCart as the only record of information that would cause significant harm if lost or changed.",
        ],
      },
      {
        title: "9. Third-party services",
        paragraphs: [
          "MinderCart relies on third-party services, including Google Firebase, Google Forms, Google Sheets, and website-hosting infrastructure. Those services may be governed by their own terms, privacy policies, availability, and security practices.",
          "MinderCart is not responsible for third-party services that are outside our reasonable control. Links to third-party sites do not imply endorsement.",
        ],
      },
      {
        title: "10. MinderCart™ intellectual property",
        paragraphs: [
          "MinderCart™, the MinderCart name, logos, visual identity, interface, software, source code, documentation, and other service materials are owned by or licensed to the operator of MinderCart and are protected by applicable intellectual-property laws.",
          "A United States federal trademark application for MinderCart is pending. The ™ symbol is used to identify trademark rights. The ® symbol is not used unless and until federal registration is granted.",
          "These Terms do not transfer ownership of MinderCart intellectual property to you. You may not use the MinderCart name, logo, or branding in a way that suggests sponsorship, endorsement, or affiliation without prior written permission.",
        ],
      },
      {
        title: "11. Feedback and honest reviews",
        paragraphs: [
          "You may send suggestions, ideas, bug reports, survey responses, and other feedback directly to MinderCart. We may use that direct feedback to evaluate and improve the service without owing compensation or creating an obligation to implement it.",
          "You retain the right to share truthful opinions and honest reviews about your experience. Nothing in these Terms prohibits, restricts, penalizes, or requires you to transfer ownership of an honest consumer review.",
        ],
      },
      {
        title: "12. Availability, changes, and updates",
        paragraphs: [
          "We may add, modify, limit, suspend, or discontinue features or the service, especially during the private beta. We may also release updates that affect compatibility, design, storage, synchronization, or supported devices.",
          "We do not guarantee that MinderCart will always be available, uninterrupted, secure, error-free, or compatible with every browser or device.",
        ],
      },
      {
        title: "13. Suspension and termination",
        paragraphs: [
          "You may stop using MinderCart at any time. Subject to available controls and applicable law, you may also request deletion of account-related information.",
          "We may suspend or terminate access when reasonably necessary to protect users, the service, or our providers; respond to unlawful or abusive conduct; enforce these Terms; address security risks; or end the private beta.",
          "Sections that by their nature should survive termination—including intellectual property, disclaimers, limitations of liability, and dispute-related provisions—will continue to apply.",
        ],
      },
      {
        title: "14. Disclaimer of warranties",
        paragraphs: [
          "To the maximum extent permitted by law, MinderCart is provided “as is” and “as available,” without warranties of any kind, whether express, implied, statutory, or otherwise.",
          "We do not warrant that shopping information will always be complete, current, synchronized, preserved, or available on every device. You remain responsible for checking your list, quantities, purchases, prices, allergens, safety information, and product suitability.",
          "Some jurisdictions do not allow certain warranty exclusions, so parts of this section may not apply to you.",
        ],
      },
      {
        title: "15. Limitation of liability",
        paragraphs: [
          "To the maximum extent permitted by law, MinderCart and the people involved in operating it will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages, or for loss of data, profits, goodwill, opportunities, or use arising from the service.",
          "To the maximum extent permitted by law, total liability for claims arising from or related to MinderCart will not exceed the greater of the amount you paid for the service during the 12 months before the claim or $100.",
          "These limitations do not apply where prohibited by law and do not limit rights that cannot legally be waived.",
        ],
      },
      {
        title: "16. Changes to these Terms",
        paragraphs: [
          "We may update these Terms as MinderCart changes. We will post the revised Terms and update the effective date. When required, we will provide additional notice.",
          "Continuing to use MinderCart after revised Terms take effect means you accept the updated Terms, except where applicable law requires another form of consent.",
        ],
      },
      {
        title: "17. General provisions",
        paragraphs: [
          "If any provision of these Terms is found unenforceable, the remaining provisions will continue in effect. A failure to enforce a provision is not a waiver.",
          "These Terms and the Privacy Policy form the current agreement governing use of MinderCart, except for additional written beta instructions or terms that expressly apply to a specific feature.",
          "You may not transfer your rights under these Terms without permission. We may transfer these Terms in connection with a reorganization, financing, acquisition, or transfer of the service, subject to applicable law.",
        ],
      },
      {
        title: "18. Contact",
        paragraphs: [
          "Questions about these Terms may be sent to mindercartapp@gmail.com. Include enough information for us to understand and respond to your request.",
        ],
      },
    ],
    footerNotice:
      "These Terms reflect the current private-beta version of MinderCart and may be updated before a broader commercial launch.",
    contactLabel: "Terms contact",
    copyContact: "Copy support email",
    contactCopied: "Email copied",
  },
  es: {
    languageLabel: "Idioma",
    backToBeta: "Volver a la beta privada",
    eyebrow: "Información legal de MinderCart",
    title: "Términos de Uso",
    intro:
      "Estos Términos de Uso se aplican cuando accedes o utilizas el sitio web, la aplicación web, la beta privada y el soporte relacionado con MinderCart. Al usar MinderCart, aceptas estos Términos.",
    effectiveLabel: "Fecha de vigencia",
    effectiveDate: "27 de julio de 2026",
    summaryTitle: "Los Términos en pocas palabras",
    summaryCards: [
      {
        title: "Usa MinderCart responsablemente",
        text: "Utiliza el servicio únicamente para fines legales relacionados con listas de compras personales o del hogar y no interfieras con el servicio ni con otros usuarios.",
      },
      {
        title: "La beta privada puede cambiar",
        text: "Las funciones pueden estar incompletas, modificarse, dejar de estar disponibles o eliminarse mientras MinderCart se encuentra en pruebas.",
      },
      {
        title: "MinderCart™ está protegido",
        text: "El nombre, logotipo, diseño y software de MinderCart™ están protegidos. Existe una solicitud federal de marca en proceso en Estados Unidos.",
      },
    ],
    sections: [
      {
        title: "1. Aceptación de estos Términos",
        paragraphs: [
          "Al acceder o utilizar MinderCart, crear una cuenta, unirte a un grupo compartido, enviar una solicitud para la beta privada o recibir soporte, aceptas estos Términos de Uso y la Política de Privacidad.",
          "Si no estás de acuerdo, no utilices MinderCart. Si utilizas MinderCart en nombre de otra persona u organización, declaras que tienes autorización para aceptar estos Términos en su nombre.",
        ],
      },
      {
        title: "2. Elegibilidad",
        paragraphs: [
          "Debes tener al menos 13 años para utilizar MinderCart. Si eres menor de la mayoría de edad legal donde resides, solamente puedes usar MinderCart con el permiso y la supervisión de tu padre, madre o tutor legal.",
          "MinderCart no está dirigido a menores de 13 años. Un padre, madre o tutor que considere que un menor de 13 años utilizó el servicio o proporcionó información personal debe contactarnos.",
        ],
      },
      {
        title: "3. Participación en la beta privada",
        paragraphs: [
          "Actualmente MinderCart se ofrece como una beta privada limitada. La participación puede requerir invitación y limitarse a hogares, dispositivos, ubicaciones, idiomas o periodos de prueba seleccionados.",
          "Enviar una solicitud no garantiza acceso. Podemos aceptar, rechazar, pausar o terminar una participación a nuestra discreción, sujeto a la ley aplicable.",
          "Durante la beta, las funciones pueden contener errores, cambiar sin previo aviso, funcionar de manera distinta entre dispositivos o dejar de estar disponibles temporalmente. Debes conservar cualquier información importante de compras en una forma que puedas consultar si el servicio se interrumpe.",
        ],
      },
      {
        title: "4. Cuentas y seguridad de la cuenta",
        paragraphs: [
          "Eres responsable de proporcionar información correcta, mantener la confidencialidad de tus credenciales y de toda actividad realizada mediante tu cuenta.",
          "No compartas tu contraseña ni permitas que otra persona se haga pasar por ti. Contáctanos de inmediato si consideras que tu cuenta o dispositivo fue comprometido.",
          "Podemos solicitar verificación de identidad antes de ayudar con determinadas solicitudes de cuenta, privacidad, eliminación o seguridad.",
        ],
      },
      {
        title: "5. Uso permitido",
        paragraphs: [
          "MinderCart está diseñado para ayudar a crear, organizar, reutilizar, compartir y completar listas de compras y actividades relacionadas con las compras del hogar.",
          "Recibes un derecho limitado, personal, no exclusivo, intransferible y revocable para utilizar el servicio conforme a estos Términos.",
        ],
        bullets: [
          "Utilizar MinderCart únicamente para fines legales.",
          "Tener un cuidado razonable al ingresar, compartir y utilizar información de compras.",
          "Respetar la privacidad y los derechos de las personas incluidas en tus grupos o listas compartidas.",
          "Seguir las instrucciones, límites o requisitos de prueba comunicados para la beta privada.",
        ],
      },
      {
        title: "6. Conductas prohibidas",
        bullets: [
          "Acceder o utilizar la cuenta de otra persona sin permiso.",
          "Intentar evadir autenticación, seguridad, límites de uso o controles de acceso.",
          "Introducir malware, código dañino, abuso automatizado, extracción masiva de datos o solicitudes excesivas.",
          "Realizar ingeniería inversa, descompilar, copiar, revender, sublicenciar o explotar comercialmente el servicio, salvo cuando la ley aplicable lo permita expresamente.",
          "Utilizar MinderCart para violar la ley, infringir derechos de propiedad intelectual, acosar, cometer fraude o distribuir contenido ilegal o dañino.",
          "Interferir con el funcionamiento del servicio, sus proveedores, grupos compartidos u otros usuarios.",
          "Dar información falsa sobre tu identidad, elegibilidad para la beta, afiliación o autoridad.",
        ],
      },
      {
        title: "7. Tu contenido e información de compras",
        paragraphs: [
          "Conservas la propiedad de las listas, notas, artículos personalizados, preferencias, comentarios y demás contenido que creas o envías, sujeto a los derechos necesarios para operar el servicio.",
          "Otorgas a MinderCart una licencia limitada, no exclusiva y mundial para alojar, almacenar, reproducir, procesar, mostrar, transmitir y modificar tu contenido únicamente en la medida razonablemente necesaria para proporcionar, proteger, dar soporte y mejorar el servicio.",
          "Eres responsable de la exactitud, legalidad y conveniencia del contenido que envías. No ingreses información sensible que no sea necesaria para un servicio de listas de compras.",
        ],
      },
      {
        title: "8. Grupos y listas compartidas",
        paragraphs: [
          "Cuando creas o te unes a un grupo, o utilizas listas compartidas, otros integrantes autorizados pueden ver, agregar, editar, marcar o eliminar contenido compartido.",
          "Eres responsable de decidir quién participa en tu grupo y de comprender que los cambios realizados por una persona pueden afectar a los demás integrantes.",
          "Durante la beta privada todavía se están probando algunos escenarios de conflicto por modificaciones simultáneas desde varios dispositivos. No dependas de MinderCart como el único registro de información cuya pérdida o modificación pudiera causarte un daño importante.",
        ],
      },
      {
        title: "9. Servicios de terceros",
        paragraphs: [
          "MinderCart depende de servicios de terceros, incluidos Google Firebase, Google Forms, Google Sheets e infraestructura de hosting. Esos servicios pueden regirse por sus propios términos, políticas de privacidad, disponibilidad y prácticas de seguridad.",
          "MinderCart no es responsable de servicios de terceros que estén fuera de nuestro control razonable. Los enlaces a sitios de terceros no implican respaldo o aprobación.",
        ],
      },
      {
        title: "10. Propiedad intelectual de MinderCart™",
        paragraphs: [
          "MinderCart™, el nombre MinderCart, sus logotipos, identidad visual, interfaz, software, código fuente, documentación y otros materiales del servicio son propiedad del operador de MinderCart o se utilizan bajo licencia y están protegidos por las leyes aplicables de propiedad intelectual.",
          "Existe una solicitud federal de marca para MinderCart en proceso en Estados Unidos. El símbolo ™ se utiliza para identificar derechos de marca. El símbolo ® no se utiliza a menos y hasta que se conceda el registro federal.",
          "Estos Términos no te transfieren la propiedad intelectual de MinderCart. No puedes utilizar el nombre, logotipo o elementos de marca de MinderCart de una manera que sugiera patrocinio, aprobación o afiliación sin autorización previa por escrito.",
        ],
      },
      {
        title: "11. Comentarios y reseñas honestas",
        paragraphs: [
          "Puedes enviar sugerencias, ideas, reportes de errores, respuestas a encuestas y otros comentarios directamente a MinderCart. Podemos utilizar esos comentarios directos para evaluar y mejorar el servicio sin obligación de compensación ni de implementar una sugerencia.",
          "Conservas el derecho de compartir opiniones verdaderas y reseñas honestas sobre tu experiencia. Nada en estos Términos prohíbe, restringe, penaliza o exige que transfieras la propiedad de una reseña honesta como consumidor.",
        ],
      },
      {
        title: "12. Disponibilidad, cambios y actualizaciones",
        paragraphs: [
          "Podemos agregar, modificar, limitar, suspender o descontinuar funciones o el servicio, especialmente durante la beta privada. También podemos publicar actualizaciones que afecten compatibilidad, diseño, almacenamiento, sincronización o dispositivos compatibles.",
          "No garantizamos que MinderCart esté siempre disponible, funcione sin interrupciones, sea completamente seguro, esté libre de errores o sea compatible con todos los navegadores y dispositivos.",
        ],
      },
      {
        title: "13. Suspensión y terminación",
        paragraphs: [
          "Puedes dejar de utilizar MinderCart en cualquier momento. Sujeto a los controles disponibles y a la ley aplicable, también puedes solicitar la eliminación de información relacionada con tu cuenta.",
          "Podemos suspender o terminar el acceso cuando sea razonablemente necesario para proteger a los usuarios, el servicio o nuestros proveedores; responder a conductas ilegales o abusivas; hacer cumplir estos Términos; atender riesgos de seguridad; o finalizar la beta privada.",
          "Las secciones que por su naturaleza deban continuar después de la terminación, incluidas propiedad intelectual, exclusiones de garantías, limitaciones de responsabilidad y disposiciones relacionadas con controversias, seguirán vigentes.",
        ],
      },
      {
        title: "14. Exclusión de garantías",
        paragraphs: [
          "En la máxima medida permitida por la ley, MinderCart se proporciona “tal como está” y “según disponibilidad”, sin garantías de ningún tipo, expresas, implícitas, legales o de otra naturaleza.",
          "No garantizamos que la información de compras esté siempre completa, actualizada, sincronizada, conservada o disponible en todos los dispositivos. Tú sigues siendo responsable de revisar tu lista, cantidades, compras, precios, alérgenos, información de seguridad y conveniencia de los productos.",
          "Algunas jurisdicciones no permiten determinadas exclusiones de garantías, por lo que ciertas partes de esta sección podrían no aplicarse.",
        ],
      },
      {
        title: "15. Limitación de responsabilidad",
        paragraphs: [
          "En la máxima medida permitida por la ley, MinderCart y las personas involucradas en su operación no serán responsables por daños indirectos, incidentales, especiales, consecuentes, ejemplares o punitivos, ni por pérdida de datos, ganancias, reputación, oportunidades o uso derivados del servicio.",
          "En la máxima medida permitida por la ley, la responsabilidad total por reclamaciones relacionadas con MinderCart no excederá la cantidad mayor entre lo que hayas pagado por el servicio durante los 12 meses anteriores a la reclamación o $100.",
          "Estas limitaciones no se aplican cuando la ley las prohíba y no limitan derechos que legalmente no puedan renunciarse.",
        ],
      },
      {
        title: "16. Cambios a estos Términos",
        paragraphs: [
          "Podemos actualizar estos Términos conforme cambie MinderCart. Publicaremos los Términos modificados y actualizaremos la fecha de vigencia. Cuando sea necesario, proporcionaremos un aviso adicional.",
          "Continuar utilizando MinderCart después de que los Términos actualizados entren en vigor significa que los aceptas, excepto cuando la ley aplicable requiera otra forma de consentimiento.",
        ],
      },
      {
        title: "17. Disposiciones generales",
        paragraphs: [
          "Si alguna disposición de estos Términos se considera inaplicable, las demás continuarán vigentes. El hecho de no exigir el cumplimiento de una disposición no constituye una renuncia.",
          "Estos Términos y la Política de Privacidad forman el acuerdo actual que regula el uso de MinderCart, salvo instrucciones adicionales por escrito para la beta o términos que se apliquen expresamente a una función específica.",
          "No puedes transferir tus derechos bajo estos Términos sin autorización. Podemos transferir estos Términos en relación con una reorganización, financiamiento, adquisición o transferencia del servicio, sujeto a la ley aplicable.",
        ],
      },
      {
        title: "18. Contacto",
        paragraphs: [
          "Puedes enviar preguntas sobre estos Términos a mindercartapp@gmail.com. Incluye suficiente información para comprender y responder tu solicitud.",
        ],
      },
    ],
    footerNotice:
      "Estos Términos reflejan la versión actual de la beta privada de MinderCart y pueden actualizarse antes de un lanzamiento comercial más amplio.",
    contactLabel: "Contacto sobre los Términos",
    copyContact: "Copiar correo de soporte",
    contactCopied: "Correo copiado",
  },
} as const;

export default function TermsPage() {
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
    <main className="mc-terms-page">
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

        .mc-terms-page {
          min-height: 100dvh;
          background:
            radial-gradient(circle at 10% 0%, rgba(238, 242, 255, 0.95), transparent 38%),
            linear-gradient(180deg, #ffffff 0%, #f7f9ff 100%);
          color: ${MC_NAVY_TEXT};
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .mc-terms-container {
          width: min(980px, calc(100% - 32px));
          margin: 0 auto;
        }

        .mc-terms-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          padding: 20px 0;
        }

        .mc-terms-brand {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
          color: ${MC_NAVY};
          text-decoration: none;
        }

        .mc-terms-logo {
          width: 48px;
          height: 48px;
          flex: 0 0 auto;
          border-radius: 15px;
          overflow: hidden;
          background: #fff;
          box-shadow: 0 8px 24px rgba(18, 36, 94, 0.14);
        }

        .mc-terms-brand-name {
          color: ${MC_NAVY};
          font-size: 20px;
          line-height: 1;
          font-weight: 900;
          letter-spacing: -0.02em;
        }

        .mc-terms-brand-tagline {
          margin-top: 5px;
          color: ${MC_NAVY_MUTED};
          font-size: 12px;
          line-height: 1.2;
        }

        .mc-terms-language {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px;
          border: 1px solid ${MC_NAVY_LINE};
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.92);
          box-shadow: 0 4px 16px rgba(18, 36, 94, 0.06);
        }

        .mc-terms-language button {
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

        .mc-terms-language button.is-active {
          background: ${MC_NAVY};
          color: #fff;
        }

        .mc-terms-back {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: 34px;
          color: ${MC_NAVY};
          font-size: 14px;
          font-weight: 900;
          text-decoration: none;
        }

        .mc-terms-back::before {
          content: "←";
          font-size: 18px;
          line-height: 1;
        }

        .mc-terms-hero {
          padding: 38px 0 48px;
        }

        .mc-terms-eyebrow {
          color: ${MC_NAVY_MUTED};
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .mc-terms-hero h1 {
          margin: 14px 0 0;
          color: ${MC_NAVY};
          font-size: clamp(43px, 8vw, 72px);
          line-height: 0.98;
          letter-spacing: -0.055em;
        }

        .mc-terms-intro {
          max-width: 800px;
          margin: 24px 0 0;
          color: ${MC_NAVY_MUTED};
          font-size: clamp(17px, 2vw, 20px);
          line-height: 1.65;
        }

        .mc-terms-effective {
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

        .mc-terms-summary {
          padding: 0 0 54px;
        }

        .mc-terms-summary h2 {
          margin: 0 0 18px;
          color: ${MC_NAVY};
          font-size: 27px;
          letter-spacing: -0.025em;
        }

        .mc-terms-summary-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }

        .mc-terms-summary-card {
          padding: 20px;
          border: 1px solid ${MC_NAVY_LINE};
          border-radius: 19px;
          background: #fff;
          box-shadow: 0 10px 24px rgba(18, 36, 94, 0.05);
        }

        .mc-terms-summary-card h3 {
          margin: 0;
          color: ${MC_NAVY};
          font-size: 17px;
          line-height: 1.25;
        }

        .mc-terms-summary-card p {
          margin: 8px 0 0;
          color: ${MC_NAVY_MUTED};
          font-size: 14px;
          line-height: 1.55;
        }

        .mc-terms-content-wrap {
          padding: 54px 0 76px;
          border-top: 1px solid rgba(215, 223, 245, 0.8);
          background: #fff;
        }

        .mc-terms-content {
          display: grid;
          gap: 16px;
        }

        .mc-terms-section {
          padding: 24px;
          border: 1px solid ${MC_NAVY_LINE};
          border-radius: 20px;
          background: #fff;
        }

        .mc-terms-section h2 {
          margin: 0;
          color: ${MC_NAVY};
          font-size: 22px;
          line-height: 1.25;
          letter-spacing: -0.02em;
        }

        .mc-terms-section p {
          margin: 12px 0 0;
          color: ${MC_NAVY_MUTED};
          font-size: 15px;
          line-height: 1.7;
        }

        .mc-terms-section ul {
          margin: 14px 0 0;
          padding-left: 22px;
          color: ${MC_NAVY_MUTED};
          font-size: 15px;
          line-height: 1.65;
        }

        .mc-terms-section li + li {
          margin-top: 8px;
        }

        .mc-terms-contact {
          margin-top: 22px;
          padding: 22px;
          border-radius: 20px;
          background: ${MC_NAVY};
          color: #fff;
        }

        .mc-terms-contact strong {
          display: block;
          font-size: 14px;
          opacity: 0.78;
        }

        .mc-terms-contact-email {
          display: block;
          margin-top: 7px;
          color: #fff;
          font-size: 20px;
          font-weight: 900;
          word-break: break-word;
        }

        .mc-terms-contact button {
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

        .mc-terms-footer {
          padding: 32px 0 42px;
          border-top: 1px solid ${MC_NAVY_LINE};
          background: #fff;
        }

        .mc-terms-footer-inner {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
        }

        .mc-terms-footer-copy {
          max-width: 700px;
          color: ${MC_NAVY_MUTED};
          font-size: 13px;
          line-height: 1.55;
        }

        .mc-terms-footer a {
          color: ${MC_NAVY};
          font-size: 13px;
          font-weight: 900;
          text-decoration: none;
          white-space: nowrap;
        }

        @media (max-width: 760px) {
          .mc-terms-summary-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 560px) {
          .mc-terms-container {
            width: min(100% - 24px, 980px);
          }

          .mc-terms-header {
            align-items: flex-start;
          }

          .mc-terms-brand-tagline {
            display: none;
          }

          .mc-terms-language button {
            padding-inline: 10px;
          }

          .mc-terms-hero {
            padding-top: 32px;
          }

          .mc-terms-section {
            padding: 20px;
          }

          .mc-terms-footer-inner {
            flex-direction: column;
          }
        }
      `}</style>

      <header className="mc-terms-container mc-terms-header">
        <a className="mc-terms-brand" href="/beta">
          <div className="mc-terms-logo">
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
            <div className="mc-terms-brand-name">MinderCart</div>
            <div className="mc-terms-brand-tagline">
              {language === "en"
                ? "Never forget what to buy"
                : "Nunca olvides qué comprar"}
            </div>
          </div>
        </a>

        <div className="mc-terms-language" aria-label={content.languageLabel}>
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

      <div className="mc-terms-container">
        <a className="mc-terms-back" href="/beta">
          {content.backToBeta}
        </a>

        <section className="mc-terms-hero">
          <div className="mc-terms-eyebrow">{content.eyebrow}</div>
          <h1>{content.title}</h1>
          <p className="mc-terms-intro">{content.intro}</p>
          <div className="mc-terms-effective">
            {content.effectiveLabel}:{" "}
            <time dateTime="2026-07-27">{content.effectiveDate}</time>
          </div>
        </section>

        <section className="mc-terms-summary">
          <h2>{content.summaryTitle}</h2>
          <div className="mc-terms-summary-grid">
            {content.summaryCards.map((card) => (
              <article className="mc-terms-summary-card" key={card.title}>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </article>
            ))}
          </div>
        </section>
      </div>

      <div className="mc-terms-content-wrap">
        <div className="mc-terms-container">
          <div className="mc-terms-content">
            {content.sections.map((section) => (
              <section className="mc-terms-section" key={section.title}>
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

          <div className="mc-terms-contact">
            <strong>{content.contactLabel}</strong>
            <span className="mc-terms-contact-email">{SUPPORT_EMAIL}</span>
            <button type="button" onClick={copySupportEmail} aria-live="polite">
              {supportEmailCopied ? content.contactCopied : content.copyContact}
            </button>
          </div>
        </div>
      </div>

      <footer className="mc-terms-footer">
        <div className="mc-terms-container mc-terms-footer-inner">
          <div className="mc-terms-footer-copy">{content.footerNotice}</div>
          <a href="/beta">{content.backToBeta}</a>
        </div>
      </footer>
    </main>
  );
}
