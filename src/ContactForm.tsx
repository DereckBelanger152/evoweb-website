import { useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { track } from "@vercel/analytics";
import { reportLeadConversion } from "./gtag";

// Chaque champ porte une vraie <label> reliée par htmlFor/id. Un placeholder
// n'en tient pas lieu : il disparaît dès la première frappe, et un lecteur
// d'écran n'a alors plus rien pour nommer le champ. La label est masquée
// visuellement (sr-only) pour ne rien changer au design.
//
// `maxLength` reprend les limites de api/contact.ts. Le serveur reste la seule
// autorité — cette borne évite seulement au visiteur d'écrire un long message
// pour se le faire refuser ensuite.
const FIELDS = [
  {
    id: "contact-name",
    name: "name",
    type: "text",
    label: "Votre nom",
    placeholder: "Votre Nom",
    autoComplete: "name",
    maxLength: 120,
  },
  {
    id: "contact-email",
    name: "email",
    type: "email",
    label: "Votre adresse courriel",
    placeholder: "Votre Email",
    autoComplete: "email",
    maxLength: 200,
  },
] as const;

const FIELD_CLASSES =
  "w-full px-4 py-3 bg-transparent text-sm text-fg placeholder:text-muted " +
  "border border-line focus:border-accent transition-colors duration-200";

// Une fonction serverless peut rester silencieuse (démarrage à froid, incident
// réseau). Sans cette limite, le bouton resterait bloqué sur « Envoi en
// cours... » sans jamais rien dire au visiteur.
//
// AbortSignal.timeout n'existe pas avant Safari 16. Sans ce garde-fou, l'appel
// lèverait une exception sur ces navigateurs et le formulaire — le seul chemin
// de conversion du site — deviendrait inutilisable pour eux. Sans minuterie, la
// requête aboutit quand même : on perd la limite, pas l'envoi.
const TIMEOUT_MS = 15_000;

function timeoutSignal() {
  return typeof AbortSignal.timeout === "function" ? AbortSignal.timeout(TIMEOUT_MS) : undefined;
}

type Status = "idle" | "sending" | "success" | "error" | "throttled";

const MESSAGES: Partial<Record<Status, { text: string; className: string }>> = {
  success: {
    text: "Message envoyé avec succès, merci pour votre confiance!",
    className: "text-accent",
  },
  error: {
    text: "Une erreur est survenue. Veuillez réessayer.",
    className: "text-danger",
  },
  throttled: {
    text: "Trop de tentatives. Patientez une minute avant de réessayer.",
    className: "text-danger",
  },
};

export default function ContactForm() {
  const form = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<Status>("idle");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.current || status === "sending") return;

    const data = new FormData(form.current);
    setStatus("sending");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: timeoutSignal(),
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          message: data.get("message"),
          // Piège à robots : champ masqué hors-écran qu'un humain ne voit
          // jamais. Il est transmis tel quel — c'est le serveur qui tranche,
          // puisqu'un robot peut appeler /api/contact directement et contourner
          // n'importe quel contrôle fait ici.
          company: data.get("company"),
        }),
      });

      if (response.status === 429) {
        setStatus("throttled");
        return;
      }
      if (!response.ok) throw new Error(`Réponse ${response.status}`);
    } catch (error) {
      setStatus("error");
      // L'échec est suivi autant que le succès : sans cela, une panne du
      // formulaire est invisible dans les statistiques et se confond avec une
      // absence de visiteurs.
      track("contact_form_error");
      console.error("Envoi du formulaire de contact impossible :", error);
      return;
    }

    setStatus("success");
    track("contact_form_submit");
    // Après le `return` de la branche d'erreur : seul un message réellement
    // acheminé compte comme conversion. Un envoi refusé pour cause de limite
    // de débit ou d'erreur serveur n'en est pas une.
    reportLeadConversion();
    form.current.reset();
  };

  const message = MESSAGES[status];

  return (
    <form ref={form} onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-px w-px opacity-0"
      />

      {FIELDS.map((field) => (
        <div key={field.name}>
          <label htmlFor={field.id} className="sr-only">
            {field.label}
          </label>
          <input
            id={field.id}
            type={field.type}
            name={field.name}
            placeholder={field.placeholder}
            autoComplete={field.autoComplete}
            maxLength={field.maxLength}
            required
            className={FIELD_CLASSES}
          />
        </div>
      ))}

      <div>
        <label htmlFor="contact-message" className="sr-only">
          Votre message
        </label>
        <textarea
          id="contact-message"
          name="message"
          placeholder="Votre Message"
          rows={5}
          maxLength={5000}
          required
          className={`${FIELD_CLASSES} resize-none`}
        />
      </div>

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full font-semibold px-8 py-3 text-sm uppercase tracking-wider bg-brand text-on-brand transition-opacity hover:opacity-85 disabled:opacity-60 inline-flex items-center justify-center gap-2 group"
      >
        {status === "sending" ? "Envoi en cours..." : "Envoyer le Message"}
        <ArrowRight
          className="h-4 w-4 group-hover:translate-x-1 transition-transform"
          aria-hidden="true"
        />
      </button>

      {/* Région live : le conteneur existe dès le premier rendu et reste monté,
          sinon un lecteur d'écran n'annonce pas le texte qui y apparaît. Le
          visiteur non voyant apprend ainsi que son message est parti — ou
          qu'il a échoué. */}
      <div role="status" aria-live="polite" className="min-h-[1.25rem]">
        {message && <p className={`text-sm pt-1 ${message.className}`}>{message.text}</p>}
      </div>

      {/* Mention de la finalité de la collecte, exigée par la Loi 25. */}
      <p className="text-xs leading-relaxed pt-2 text-muted">
        Vos informations servent uniquement à répondre à votre demande. Elles ne sont jamais
        transmises à des tiers à des fins commerciales.{" "}
        <a
          href="/confidentialite"
          className="underline underline-offset-2 text-accent transition-opacity hover:opacity-70"
        >
          Politique de confidentialité
        </a>
      </p>
    </form>
  );
}
