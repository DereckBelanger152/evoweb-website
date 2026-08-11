import type { VercelRequest, VercelResponse } from "@vercel/node";

// Ces deux valeurs sont volontairement recopiées de src/legal.ts au lieu d'être
// importées. Le paquet est en `"type": "module"`, donc le .js produit par
// Vercel est chargé comme un module ESM, et ESM exige une extension explicite
// sur les imports relatifs : `../src/legal` reste tel quel dans le contact.js
// déployé et Node échoue avec ERR_MODULE_NOT_FOUND — la fonction plante au
// chargement et TOUTE soumission du formulaire retourne 500. Une fonction
// serverless doit donc rester autonome : aucun import hors de api/. Si le nom
// ou le téléphone change, les mettre à jour ici ET dans src/legal.ts.
const LEGAL = {
  name: "Dereck Bélanger",
  phone: "5813086181",
} as const;

// Livraison via l'API HTTP de Resend plutôt que par SMTP. Deux raisons :
//   1. Une fonction serverless dispose d'environ 10 s pour répondre, et une
//      poignée de main SMTP à froid (connexion, TLS, authentification, envoi,
//      fermeture — deux fois) en consomme une part imprévisible. Un POST HTTPS
//      est comparativement immédiat.
//   2. Un compte Google ne se livre pas de courriel à lui-même : un message
//      envoyé depuis dereck@evoweb.ca vers contact@evoweb.ca (son propre alias)
//      n'obtient jamais l'étiquette « Boîte de réception » — il n'apparaît que
//      dans « Tous les messages », déjà marqué lu, sans notification. Passer par
//      un expéditeur externe le rend à Gmail comme un vrai courriel entrant.
//
// Aucune adresse n'est écrite ici : elles vivent en variables d'environnement,
// donc ni le lot JS ni le dépôt ne les exposent aux moissonneurs.
//
// Variables requises (Vercel > Project Settings > Environment Variables) :
//   RESEND_API_KEY      clé API Resend (resend.com > API Keys)
//   CONTACT_FROM_EMAIL  adresse publique d'expédition (contact@evoweb.ca). Son
//                       domaine doit être vérifié dans Resend, sinon l'envoi
//                       est refusé.
//   CONTACT_TO_EMAIL    boîte qui reçoit les notifications de leads.

const LIMITS = { name: 120, email: 200, message: 5000 };

// Le logo de la signature est servi par le site lui-même : un courriel ne peut
// pas embarquer d'image locale, et le PNG passe partout alors que le WebP du
// site ne s'affiche pas dans Outlook. Voir public/logo-email.png.
//
// Son fond doit rester transparent : la signature se pose sur le blanc de la
// boîte de réception, et un fond opaque y dessine une tuile sombre autour du
// symbole. Le creux du « e » est lui aussi transparent — c'est ce qui rend le
// symbole lisible aussi bien sur clair que sur sombre.
//
// Le `?v=` sert à forcer le rafraîchissement : Gmail ne charge pas l'image
// depuis evoweb.ca, il la relaie par son propre cache (googleusercontent.com),
// qui la garde longtemps et la partage entre tous les destinataires. Sans
// changement d'URL, remplacer le fichier ne suffit pas — l'ancienne version
// continue d'être servie. Incrémenter à chaque nouvelle version du logo.
const SITE_URL = "https://www.evoweb.ca";
const LOGO_URL = `${SITE_URL}/logo-email.png?v=2`;
const BRAND_PURPLE = "#7635D5";
const FONT_STACK =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";

// ── Fenêtres glissantes ────────────────────────────────────────────────────
// Le Map vit dans l'instance de fonction : il ne couvre pas toutes les
// instances simultanées, mais il coupe les rafales d'un même robot, qui est le
// cas réel. Un blocage strict exigerait un stockage partagé — disproportionné
// pour un formulaire de contact.
type Window = { windowMs: number; max: number; hits: Map<string, number[]> };

function createWindow(windowMs: number, max: number): Window {
  return { windowMs, max, hits: new Map() };
}

function exceeds(window: Window, key: string) {
  const now = Date.now();
  const recent = (window.hits.get(key) ?? []).filter((at) => now - at < window.windowMs);
  recent.push(now);
  window.hits.set(key, recent);

  if (window.hits.size > 500) {
    for (const [entry, times] of window.hits) {
      if (times.every((at) => now - at >= window.windowMs)) window.hits.delete(entry);
    }
  }

  return recent.length > window.max;
}

// Par IP : volontairement permissif, plusieurs visiteurs légitimes peuvent
// partager une même adresse (réseau d'entreprise, opérateur mobile). Perdre un
// vrai lead coûte plus cher que recevoir un pourriel, et le piège à robots
// filtre déjà l'essentiel.
const byIp = createWindow(60_000, 5);

// Par destinataire de l'accusé de réception. L'accusé part vers une adresse
// choisie par l'appelant : sans cette limite, le formulaire sert de relais pour
// expédier des courriels signés au nom de notre domaine vers la boîte de
// quelqu'un d'autre, à répétition. Une même adresse ne peut en recevoir plus de
// deux par heure, ce qu'un vrai visiteur n'atteint jamais.
const byRecipient = createWindow(3_600_000, 2);

// `x-forwarded-for` est falsifiable : un robot qui en change la valeur à chaque
// requête échapperait à la limite. Vercel écrit lui-même
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

// Un formulaire hébergé sur un autre site peut envoyer un POST ici sans que le
// navigateur demande d'abord la permission, à condition d'employer un type de
// contenu « simple » (formulaire ou texte brut). Deux vérifications ferment la
// porte :
//   - le type de contenu doit être application/json, ce qui oblige le
//     navigateur à demander l'autorisation au préalable — autorisation que nous
//     ne donnons jamais, faute d'en-têtes CORS ;
//   - l'origine déclarée doit être notre propre domaine.
// Comparer avec l'en-tête `host` de la requête plutôt qu'avec une liste écrite
// en dur fait fonctionner du même coup la production, les déploiements de
// prévisualisation et `vercel dev`.
function isSameOrigin(req: VercelRequest) {
  const origin = req.headers.origin;
  if (typeof origin !== "string") return false;
  try {
    return new URL(origin).host === req.headers.host;
  } catch {
    return false;
  }
}

function isJsonRequest(req: VercelRequest) {
  const type = req.headers["content-type"];
  return typeof type === "string" && type.split(";")[0].trim() === "application/json";
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

// Neutralise les sauts de ligne avant l'insertion dans un sujet.
function oneLine(value: string) {
  return value.replace(/[\r\n]+/g, " ").trim();
}

// L'accusé de réception part vers une adresse choisie par l'appelant, signé DKIM
// au nom du domaine : tout ce qu'on y recopie doit donc être inoffensif. On ne
// garde que le premier mot du nom, réduit à des caractères de nom. Un lien, un
// numéro ou une adresse ne peuvent pas survivre à ce filtre, ce qui retire tout
// intérêt à détourner le formulaire pour faire envoyer un message depuis
// contact@evoweb.ca. La notification qui nous est destinée garde le nom intact :
// elle n'est lue que par nous.
function safeGreetingName(value: string) {
  const firstWord = value.trim().split(/\s+/)[0] ?? "";
  return firstWord.replace(/[^\p{L}'-]/gu, "").slice(0, 40);
}

function formatPhone(digits: string) {
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

// Accusé de réception, en HTML et en texte brut. Les deux versions partent
// ensemble : le client du destinataire choisit celle qu'il sait afficher, et un
// message qui offre les deux passe mieux les filtres antipourriel qu'un message
// uniquement HTML.
//
// Mise en page en tableaux et styles en attribut `style` : c'est ce que
// comprennent les clients de messagerie, dont Outlook, qui ignore une bonne part
// du CSS moderne et les feuilles de style externes.
//
// `greeting` traverse déjà safeGreetingName, qui ne laisse passer que des
// lettres : aucun caractère capable d'ouvrir une balise ne peut donc atteindre
// le HTML ci-dessous.
function buildAutoReply(greeting: string) {
  const hello = `Bonjour${greeting ? ` ${greeting}` : ""}!`;
  const phone = formatPhone(LEGAL.phone);

  const text = [
    hello,
    "",
    "Merci de m'avoir écrit. J'ai bien reçu votre message et je vous reviens d'ici 24 heures.",
    "",
    "J'apprécie votre confiance, et je suis impatient de vous aider.",
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
      <p style="margin:0 0 16px;">J'apprécie votre confiance, et je suis impatient de vous aider.</p>
      <p style="margin:0 0 20px;">À bientôt,</p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="padding-right:12px;vertical-align:middle;">
            <img src="${LOGO_URL}" width="40" height="40" alt="Evoweb" style="display:block;border:0;width:40px;height:40px;">
          </td>
          <td style="vertical-align:middle;font-family:${FONT_STACK};font-size:14px;line-height:1.45;color:#2b2733;">
            <strong>${LEGAL.name}</strong><br>
            Evoweb<br>
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

// Perdre un lead à cause d'un incident réseau ponctuel n'est pas acceptable : on
// retente une fois avant d'abandonner.
async function sendWithRetry(mail: Mail, apiKey: string) {
  try {
    await send(mail, apiKey);
  } catch (error) {
    console.error("Resend : première tentative échouée, nouvel essai —", error);
    await send(mail, apiKey);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Une réponse de formulaire n'a rien à faire dans un cache, quel qu'il soit.
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!isJsonRequest(req) || !isSameOrigin(req)) {
    return res.status(403).json({ error: "Origine refusée" });
  }

  if (exceeds(byIp, clientIp(req))) {
    return res.status(429).json({ error: "Trop de demandes, réessayez dans une minute." });
  }

  const body = (req.body ?? {}) as Record<string, unknown>;
  const { name, email, message, company } = body;

  // Piège à robots. La vérification est ici et non dans le navigateur : le point
  // d'entrée /api/contact est visible dans le lot JS, un robot peut donc
  // l'appeler directement en contournant tout contrôle client. On renvoie un
  // faux succès pour ne pas lui indiquer qu'il a été repéré.
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

  // Gmail regroupe en une seule conversation les messages au sujet identique :
  // l'horodatage garde chaque demande distincte et visible.
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

  // L'accusé de réception est secondaire : la notification est déjà partie, on
  // ne fait pas échouer la requête et on ne laisse pas le visiteur croire que
  // son message s'est perdu. Il est aussi le seul courriel que ce point d'entrée
  // expédie vers une adresse arbitraire, d'où la limite par destinataire.
  if (!exceeds(byRecipient, leadEmail.toLowerCase())) {
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
  }

  return res.status(200).json({ ok: true });
}
