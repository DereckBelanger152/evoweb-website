import { useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import { ArrowRight } from "lucide-react";

const ACCENT      = "#7635D5";
const ACCENT_LIGHT = "#9B6CE9";

const ContactForm = () => {
  const form = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.current) return;

    const serviceId            = import.meta.env.VITE_REACT_APP_EMAILJS_SERVICE_ID;
    const templateIdForMessage = import.meta.env.VITE_REACT_APP_EMAILJS_TEMPLATE_ID_FOR_MESSAGE;
    const templateIdForReply   = import.meta.env.VITE_REACT_APP_EMAILJS_TEMPLATE_ID_FOR_REPLY;
    const publicKey            = import.meta.env.VITE_REACT_APP_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateIdForMessage || !templateIdForReply || !publicKey) {
      setStatus("error");
      console.error("Environment variables are not defined!");
      return;
    }

    try {
      await emailjs.sendForm(serviceId, templateIdForMessage, form.current, publicKey);
      await emailjs.sendForm(serviceId, templateIdForReply,   form.current, publicKey);
      setStatus("success");
      form.current.reset();
    } catch (error) {
      setStatus("error");
      console.error("Error sending email:", error);
    }
  };

  return (
    <form ref={form} onSubmit={handleSubmit} className="space-y-4">
      {(["text", "email"] as const).map((type) => (
        <input
          key={type}
          type={type}
          name={type === "text" ? "name" : "email"}
          placeholder={type === "text" ? "Votre Nom" : "Votre Email"}
          required
          className="w-full px-4 py-3 bg-transparent text-sm placeholder-[#71717A] outline-none transition-colors duration-200"
          style={{ border: "1px solid #342E56", color: "inherit" }}
          onFocus={(e) => (e.currentTarget.style.borderColor = ACCENT_LIGHT)}
          onBlur={(e)  => (e.currentTarget.style.borderColor = "#342E56")}
        />
      ))}
      <textarea
        name="message"
        placeholder="Votre Message"
        rows={5}
        required
        className="w-full px-4 py-3 bg-transparent text-sm placeholder-[#71717A] outline-none transition-colors duration-200 resize-none"
        style={{ border: "1px solid #342E56", color: "inherit" }}
        onFocus={(e) => (e.currentTarget.style.borderColor = ACCENT_LIGHT)}
        onBlur={(e)  => (e.currentTarget.style.borderColor = "#342E56")}
      />
      <button
        type="submit"
        className="w-full font-semibold px-8 py-3 text-sm uppercase tracking-wider transition-opacity hover:opacity-85 inline-flex items-center justify-center gap-2 group"
        style={{ background: ACCENT, color: "#FFFFFF" }}
      >
        Envoyer le Message
        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
      </button>
      {status === "success" && (
        <p className="text-sm pt-1" style={{ color: ACCENT_LIGHT }}>
          Message envoyé avec succès, merci pour votre confiance!
        </p>
      )}
      {status === "error" && (
        <p className="text-sm pt-1 text-red-400">
          Une erreur est survenue. Veuillez réessayer.
        </p>
      )}
      {/* Mention de la finalité de la collecte, exigée par la Loi 25. */}
      <p className="text-xs leading-relaxed pt-2" style={{ color: "#71717A" }}>
        Vos informations servent uniquement à répondre à votre demande. Elles ne sont jamais
        transmises à des tiers à des fins commerciales.{" "}
        <a
          href="/confidentialite"
          className="underline underline-offset-2 transition-opacity hover:opacity-70"
          style={{ color: ACCENT_LIGHT }}
        >
          Politique de confidentialité
        </a>
      </p>
    </form>
  );
};

export default ContactForm;
