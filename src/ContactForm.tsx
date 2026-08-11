import { useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { track } from "@vercel/analytics";

// Chaque champ porte une vraie <label> reliée par htmlFor/id. Un placeholder
// n'en tient pas lieu : il disparaît dès la première frappe, et un lecteur
// d'écran n'a alors plus rien pour nommer le champ. La label est masquée
// visuellement (classe sr-only) pour ne rien changer au design.
const FIELDS = [
  {
    id: "contact-name",
    name: "name",
    type: "text",
    label: "Votre nom",
    placeholder: "Votre Nom",
    autoComplete: "name",
  },
  {
    id: "contact-email",
    name: "email",
    type: "email",
    label: "Votre adresse courriel",
    placeholder: "Votre Email",
    autoComplete: "email",
  },
] as const;

const FIELD_CLASSES = `w-full px-4 py-3 bg-transparent text-sm text-inherit transition-colors duration-200
  placeholder-[#645F72] dark:placeholder-[#9C97AA]
  border border-[#DCDAE2] dark:border-[#312E38]
  focus:border-[#7635D5] dark:focus:border-[#9B6CE9]
  outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
  focus-visible:outline-[#7635D5] dark:focus-visible:outline-[#9B6CE9]`;

const ContactForm = () => {
  const form = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error" | "throttled"
  >("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.current) return;

    const data = new FormData(form.current);

    setStatus("sending");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          message: data.get("message"),
          // Piège à robots : champ masqué hors-écran qu'un humain ne voit
          // jamais. Il est transmis tel quel — c'est le serveur qui tranche,
          // puisqu'un robot peut appeler /api/contact directement et
          // contourner n'importe quel contrôle fait ici.
          company: data.get("company"),
        }),
      });
      if (res.status === 429) {
        setStatus("throttled");
        return;
      }
      if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
    } catch (error) {
      setStatus("error");
      // L'échec est suivi autant que le succès : sans cela, une panne du
      // formulaire est invisible dans les statistiques et se confond avec
      // une absence de visiteurs.
      track("contact_form_error");
      console.error("Error sending message:", error);
      return;
    }

    setStatus("success");
    track("contact_form_submit");
    form.current.reset();
  };

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
          required
          className={`${FIELD_CLASSES} resize-none`}
        />
      </div>
      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full font-semibold px-8 py-3 text-sm uppercase tracking-wider transition-opacity hover:opacity-85 disabled:opacity-60 inline-flex items-center justify-center gap-2 group bg-[#7635D5] text-white
          focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7635D5] dark:focus-visible:outline-[#9B6CE9]"
      >
        {status === "sending" ? "Envoi en cours..." : "Envoyer le Message"}
        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
      </button>

      {/* Région live : le conteneur existe dès le premier rendu et reste
          monté, sinon un lecteur d'écran n'annonce pas le texte qui y
          apparaît. Le visiteur non voyant apprend ainsi que son message est
          parti — ou qu'il a échoué. */}
      <div role="status" aria-live="polite" className="min-h-[1.25rem]">
        {status === "success" && (
          <p className="text-sm pt-1 text-[#7635D5] dark:text-[#9B6CE9]">
            Message envoyé avec succès, merci pour votre confiance!
          </p>
        )}
        {status === "error" && (
          <p className="text-sm pt-1 text-[#B6202A] dark:text-[#F7A1A6]">
            Une erreur est survenue. Veuillez réessayer.
          </p>
        )}
        {status === "throttled" && (
          <p className="text-sm pt-1 text-[#B6202A] dark:text-[#F7A1A6]">
            Trop de tentatives. Patientez une minute avant de réessayer.
          </p>
        )}
      </div>

      {/* Mention de la finalité de la collecte, exigée par la Loi 25. */}
      <p className="text-xs leading-relaxed pt-2 text-[#645F72] dark:text-[#9C97AA]">
        Vos informations servent uniquement à répondre à votre demande. Elles ne sont jamais
        transmises à des tiers à des fins commerciales.{" "}
        <a
          href="/confidentialite"
          className="underline underline-offset-2 transition-opacity hover:opacity-70 text-[#7635D5] dark:text-[#9B6CE9]"
        >
          Politique de confidentialité
        </a>
      </p>
    </form>
  );
};

export default ContactForm;
