import type { VercelRequest, VercelResponse } from "@vercel/node";

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

type Mail = {
  from: string;
  to: string;
  subject: string;
  text: string;
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
  const greeting = safeGreetingName(leadName);

  try {
    await send(
      {
        from: `Evoweb <${fromAddress}>`,
        to: leadEmail,
        reply_to: fromAddress,
        subject: "Message bien reçu — Evoweb",
        text: `Bonjour${greeting ? ` ${greeting}` : ""},\n\nVotre message a bien été reçu, merci pour votre confiance ! Je vous réponds sous 24h.\n\n— Dereck, Evoweb`,
      },
      apiKey,
    );
  } catch (error) {
    console.error("Échec de l'accusé de réception :", error);
  }

  return res.status(200).json({ ok: true });
}
