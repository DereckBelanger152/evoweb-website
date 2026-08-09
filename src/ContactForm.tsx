import { useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import { ArrowRight } from "lucide-react";

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
          className="w-full px-4 py-3 bg-transparent text-sm text-inherit outline-none transition-colors duration-200
            placeholder-[#645F72] dark:placeholder-[#9C97AA]
            border border-[#DCDAE2] dark:border-[#312E38]
            focus:border-[#7635D5] dark:focus:border-[#9B6CE9]"
        />
      ))}
      <textarea
        name="message"
        placeholder="Votre Message"
        rows={5}
        required
        className="w-full px-4 py-3 bg-transparent text-sm text-inherit outline-none transition-colors duration-200 resize-none
          placeholder-[#645F72] dark:placeholder-[#9C97AA]
          border border-[#DCDAE2] dark:border-[#312E38]
          focus:border-[#7635D5] dark:focus:border-[#9B6CE9]"
      />
      <button
        type="submit"
        className="w-full font-semibold px-8 py-3 text-sm uppercase tracking-wider transition-opacity hover:opacity-85 inline-flex items-center justify-center gap-2 group bg-[#7635D5] text-white"
      >
        Envoyer le Message
        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
      </button>
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
