import type { VercelRequest, VercelResponse } from "@vercel/node";
import { LEGAL } from "../src/legal";

// Livraison via l'API HTTP de Resend plutôt que par SMTP. Deux raisons :
//   1. Une fonction serverless dispose d'environ 10 s pour répondre, et une
//      poignée de main SMTP à froid (connexion, TLS, authentification, envoi,
//      fermeture — deux fois) en consomme une part imprévisible. Un POST
//      HTTPS est comparativement immédiat.
//   2. Un compte Google ne se livre pas de courriel à lui-même : un message
//      envoyé depuis dereck@evoweb.ca vers contact@evoweb.ca (son propre
//      alias) n'obtient jamais l'étiquette « Boîte de réception » — il
//      n'apparaît que dans « Tous les messages », déjà marqué lu, sans
//      notification. Passer par un expéditeur externe le rend à Gmail comme
//      un vrai courriel entrant.
//
// Aucune adresse n'est écrite ici : elles vivent en variables
// d'environnement, donc ni le bundle JS ni le dépôt ne les exposent aux
// moissonneurs d'adresses.
//
// Variables requises (Vercel > Project Settings > Environment Variables) :
//   RESEND_API_KEY      clé API Resend (resend.com > API Keys)
//   CONTACT_FROM_EMAIL  adresse publique d'expédition (contact@evoweb.ca).
//                       Son domaine doit être vérifié dans Resend, sinon
//                       l'envoi est refusé.
//   CONTACT_TO_EMAIL    boîte qui reçoit les notifications de leads.

const LIMITS = { name: 120, email: 200, message: 5000 };

// Le logo de la signature est servi par le site lui-même : un courriel ne
// peut pas embarquer d'image locale, et le PNG passe partout alors que le
// WebP du site ne s'affiche pas dans Outlook. Voir public/logo-email.png.
const SITE_URL = "https://www.evoweb.ca";
const LOGO_URL = `${SITE_URL}/logo-email.png`;
const BRAND_PURPLE = "#7635D5";
const FONT_STACK =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";

// Fenêtre glissante par IP. Le Map vit dans l'instance de fonction : il ne
// couvre pas toutes les instances simultanées, mais il coupe les rafales
// d'un même robot, qui est le cas réel. Un blocage strict exigerait un
// stockage partagé — disproportionné pour un formulaire de contact.
// Volontairement permissif : plusieurs visiteurs légitimes peuvent partager
// une même IP (réseau d'entreprise, opérateur mobile). Perdre un vrai lead
// coûte plus cher que recevoir un pourriel, et le piège à robots filtre déjà
// l'essentiel. Le but ici est seulement de couper les rafales.
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 5;
const recentHits = new Map<string, number[]>();

function isRateLimited(ip: string) {
  const now = Date.now();
  const hits = (recentHits.get(ip) ?? []).filter((at) => now - at < RATE_WINDOW_MS);
  hits.push(now);
  recentHits.set(ip, hits);

  if (recentHits.size > 500) {
    for (const [key, times] of recentHits) {
      if (times.every((at) => now - at >= RATE_WINDOW_MS)) recentHits.delete(key);
    }
  }

  return hits.length > RATE_MAX;
}

// `x-forwarded-for` est falsifiable : un robot qui en change la valeur à
// chaque requête échapperait à la limite. Vercel écrit lui-même
// `x-vercel-forwarded-for` en amont de la fonction, hors de portée de
// l'appelant — on s'y fie en premier.
function clientIp(req: VercelRequest) {
  const header =
    req.headers["x-vercel-forwarded-for"] ??
    req.headers["x-real-ip"] ??
    req.headers["x-forwarded-for"];
  const value = Array.isArray(header) ? header[0] : header;
  return value?.split(",")[0]?.trim() || "inconnue";
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

// Neutralise les sauts de ligne avant l'insertion dans un sujet.
function oneLine(value: string) {
  return value.replace(/[\r\n]+/g, " ").trim();
}

// L'accusé de réception part vers une adresse choisie par l'appelant, signé
// DKIM au nom du domaine : tout ce qu'on y recopie doit donc être inoffensif.
// On ne garde que le premier mot du nom, réduit à des caractères de nom.
// Un lien, un numéro ou une adresse ne peuvent pas survivre à ce filtre, ce
// qui retire tout intérêt à détourner le formulaire pour faire envoyer un
// message depuis contact@evoweb.ca. La notification qui nous est destinée
// garde le nom intact : elle n'est lue que par nous.
function safeGreetingName(value: string) {
  const firstWord = value.trim().split(/\s+/)[0] ?? "";
  return firstWord.replace(/[^\p{L}'-]/gu, "").slice(0, 40);
}

function formatPhone(digits: string) {
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

// Accusé de réception, en HTML et en texte brut. Les deux versions partent
// ensemble : le client d'un destinataire choisit celle qu'il sait afficher,
// et un message qui offre les deux passe mieux les filtres antipourriel
// qu'un message uniquement HTML.
//
// Mise en page en tableaux et styles en attribut `style` : c'est ce que
// comprennent les clients de messagerie, dont Outlook, qui ignore une bonne
// part du CSS moderne et les feuilles de style externes.
//
// `greeting` traverse déjà safeGreetingName, qui ne laisse passer que des
// lettres : aucun caractère capable d'ouvrir une balise ne peut donc
// atteindre le HTML ci-dessous.
function buildAutoReply(greeting: string) {
  const hello = `Bonjour${greeting ? ` ${greeting}` : ""}!`;
  const phone = formatPhone(LEGAL.phone);

  const text = [
    hello,
    "",
    "Merci de m'avoir écrit. J'ai bien reçu votre message et je vous reviens d'ici 24 heures.",
    "",
    `J'apprécie votre confiance, et je suis impatient de vous aider.`,
    "",
    "À bientôt,",
    "",
    LEGAL.name,
    "Evoweb",
    SITE_URL.replace("https://", ""),
  ].join("\n");

  const html = `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#ffffff;">
  <tr>
    <td style="padding:24px;font-family:${FONT_STACK};font-size:15px;line-height:1.6;color:#2b2733;">
      <p style="margin:0 0 16px;">${hello}</p>
      <p style="margin:0 0 16px;">Merci de m'avoir écrit. J'ai bien reçu votre message et je vous reviens d'ici 24 heures.</p>
      <p style="margin:0 0 24px;">Si c'est pressant, appelez-moi au <a href="tel:+1${LEGAL.phone}" style="color:${BRAND_PURPLE};text-decoration:none;">${phone}</a>.</p>
      <p style="margin:0 0 20px;">À bientôt,</p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="padding-right:12px;vertical-align:middle;">
            <img src="${LOGO_URL}" width="40" height="40" alt="Evoweb" style="display:block;border:0;width:40px;height:40px;">
          </td>
          <td style="vertical-align:middle;font-family:${FONT_STACK};font-size:14px;line-height:1.45;color:#2b2733;">
            <strong>${LEGAL.name}</strong><br>
            <a href="${SITE_URL}" style="color:${BRAND_PURPLE};text-decoration:none;">${SITE_URL.replace("https://", "")}</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;

  return { text, html };
}

type Mail = {
  from: string;
  to: string;
  subject: string;
  text: string;
  html?: string;
  reply_to?: string;
};

async function send(mail: Mail, apiKey: string) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(mail),
  });

  if (!response.ok) {
    throw new Error(`Resend a répondu ${response.status} : ${await response.text()}`);
  }
}

// Perdre un lead à cause d'un incident réseau ponctuel n'est pas acceptable :
// on retente une fois avant d'abandonner.
async function sendWithRetry(mail: Mail, apiKey: string) {
  try {
    await send(mail, apiKey);
  } catch (error) {
    console.error("Resend : première tentative échouée, nouvel essai —", error);
    await send(mail, apiKey);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (isRateLimited(clientIp(req))) {
    return res.status(429).json({ error: "Trop de demandes, réessayez dans une minute." });
  }

  const body = (req.body ?? {}) as Record<string, unknown>;
  const { name, email, message, company } = body;

  // Piège à robots. La vérification est ici et non dans le navigateur : le
  // point d'entrée /api/contact est visible dans le bundle, un robot peut
  // donc l'appeler directement en contournant tout contrôle client. On
  // renvoie un faux succès pour ne pas lui indiquer qu'il a été repéré.
  if (company !== undefined && company !== null && String(company).trim() !== "") {
    return res.status(200).json({ ok: true });
  }

  if (
    typeof name !== "string" || !name.trim() || name.length > LIMITS.name ||
    typeof email !== "string" || !isValidEmail(email.trim()) || email.length > LIMITS.email ||
    typeof message !== "string" || !message.trim() || message.length > LIMITS.message
  ) {
    return res.status(400).json({ error: "Champs invalides" });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.CONTACT_FROM_EMAIL;
  const notifyTo = process.env.CONTACT_TO_EMAIL;

  if (!apiKey || !fromAddress || !notifyTo) {
    console.error("RESEND_API_KEY / CONTACT_FROM_EMAIL / CONTACT_TO_EMAIL manquants");
    return res.status(500).json({ error: "Configuration serveur manquante" });
  }

  const leadName = oneLine(name);
  const leadEmail = email.trim();

  // Gmail regroupe en une seule conversation les messages au sujet
  // identique : l'horodatage garde chaque demande distincte et visible.
  const receivedAt = new Date().toLocaleString("fr-CA", {
    timeZone: "America/Toronto",
    dateStyle: "short",
    timeStyle: "short",
  });

  try {
    await sendWithRetry(
      {
        from: `Formulaire Evoweb <${fromAddress}>`,
        to: notifyTo,
        reply_to: leadEmail,
        subject: `Nouveau lead — ${leadName} (${receivedAt})`,
        text: `Nom : ${leadName}\nCourriel : ${leadEmail}\n\n${message.trim()}`,
      },
      apiKey,
    );
  } catch (error) {
    console.error("Échec de la notification de lead :", error);
    return res.status(502).json({ error: "Envoi impossible" });
  }

  // L'accusé de réception est secondaire : la notification est déjà partie,
  // on ne fait pas échouer la requête et on ne laisse pas le visiteur croire
  // que son message s'est perdu.
  const autoReply = buildAutoReply(safeGreetingName(leadName));

  try {
    await send(
      {
        from: `Evoweb <${fromAddress}>`,
        to: leadEmail,
        reply_to: fromAddress,
        subject: "Merci pour votre message",
        text: autoReply.text,
        html: autoReply.html,
      },
      apiKey,
    );
  } catch (error) {
    console.error("Échec de l'accusé de réception :", error);
  }

  return res.status(200).json({ ok: true });
}
