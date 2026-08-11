import type { VercelRequest, VercelResponse } from "@vercel/node";
import nodemailer from "nodemailer";

// Reçoit les soumissions du formulaire de contact et les achemine par
// Google Workspace (SMTP Gmail), sans passer par un service tiers comme
// EmailJS. L'adresse de destination ne transite jamais vers le navigateur :
// elle vit uniquement ici, côté serveur — un moissonneur qui inspecte le
// site ou son bundle JS ne la trouvera jamais, puisqu'elle n'y est jamais
// envoyée.
//
// Variables d'environnement requises (Vercel > Project Settings >
// Environment Variables — jamais commitées, voir .env.example) :
//   GMAIL_USER          boîte Google Workspace utilisée pour l'envoi (ex. contact@evoweb.ca)
//   GMAIL_APP_PASSWORD  mot de passe d'application généré pour ce compte
//                        (nécessite la validation en 2 étapes sur le compte)
//   CONTACT_TO_EMAIL    optionnel — destinataire des messages, si différent de GMAIL_USER

const MAX_FIELD_LENGTH = 5000;

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = (req.body ?? {}) as Record<string, unknown>;
  const { name, email, message } = body;

  if (
    typeof name !== "string" || !name.trim() ||
    typeof email !== "string" || !isValidEmail(email.trim()) ||
    typeof message !== "string" || !message.trim()
  ) {
    return res.status(400).json({ error: "Champs invalides" });
  }

  if (name.length > MAX_FIELD_LENGTH || email.length > MAX_FIELD_LENGTH || message.length > MAX_FIELD_LENGTH) {
    return res.status(400).json({ error: "Champ trop long" });
  }

  const gmailUser = process.env.GMAIL_USER;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
  const to = process.env.CONTACT_TO_EMAIL || gmailUser;

  if (!gmailUser || !gmailAppPassword) {
    console.error("GMAIL_USER / GMAIL_APP_PASSWORD are not set");
    return res.status(500).json({ error: "Configuration serveur manquante" });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: gmailUser, pass: gmailAppPassword },
  });

  try {
    // Message principal, reçu dans la boîte de l'entreprise. Le
    // répondre-à pointe vers le visiteur pour pouvoir lui répondre
    // directement depuis Gmail.
    await transporter.sendMail({
      from: `Evoweb — Formulaire de contact <${gmailUser}>`,
      to,
      replyTo: email.trim(),
      subject: `Nouveau message de ${name.trim()} via evoweb.ca`,
      text: `Nom : ${name.trim()}\nCourriel : ${email.trim()}\n\n${message.trim()}`,
    });
  } catch (error) {
    console.error("Error sending contact notification:", error);
    return res.status(502).json({ error: "Envoi impossible" });
  }

  try {
    // Accusé de réception au visiteur. Un échec ici est secondaire : le
    // message principal est déjà rendu, on ne fait pas échouer la requête
    // pour ne pas laisser croire au visiteur que rien n'est parti.
    await transporter.sendMail({
      from: `Evoweb <${gmailUser}>`,
      to: email.trim(),
      subject: "Message bien reçu — Evoweb",
      text: `Bonjour ${name.trim()},\n\nVotre message a bien été reçu, merci pour votre confiance ! Je vous réponds sous 24h.\n\n— Dereck, Evoweb`,
    });
  } catch (error) {
    console.error("Error sending contact auto-reply:", error);
  }

  return res.status(200).json({ ok: true });
}
