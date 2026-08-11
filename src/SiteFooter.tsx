import { Github, Linkedin } from "lucide-react";
import { useTheme } from "./ThemeContext";
import { tokensFor, violet } from "./tokens";
import { LEGAL } from "./legal";
import ObfuscatedEmail from "./ObfuscatedEmail";

// Pied de page partagé par toutes les pages (accueil, confidentialité,
// forfaits). Ne pas dupliquer ce JSX ailleurs — importer ce composant, pour
// que le footer reste identique (largeur, liens, année) peu importe la page.
export default function SiteFooter() {
  const { isDark } = useTheme();
  const T = tokensFor(isDark);

  return (
    <footer
      className="py-12 px-6"
      style={{ background: T.sunken, borderTop: `1px solid ${T.borderSunken}` }}
    >
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <img src="/logo-evoweb.webp" alt="Evoweb" width={256} height={256} className="h-10 w-10 object-contain" />
            <span className="font-display font-bold text-lg" style={{ color: T.onSunken }}>Evoweb</span>
          </div>
          <div className="flex gap-6">
            {[
              { href: "https://github.com/DereckBelanger152", Icon: Github, label: "GitHub" },
              { href: "https://www.linkedin.com/in/dereck-bélanger-437259338/", Icon: Linkedin, label: "LinkedIn" },
            ].map(({ href, Icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors"
                style={{ color: T.mutedOnSunken }}
                onMouseEnter={(e) => (e.currentTarget.style.color = violet[400])}
                onMouseLeave={(e) => (e.currentTarget.style.color = T.mutedOnSunken)}
                aria-label={label}
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>

        <div
          className="mt-12 pt-8 flex flex-col sm:flex-row justify-between items-end gap-4"
          style={{ borderTop: `1px solid ${T.borderSunken}` }}
        >
          <div className="space-y-2">
            <p className="text-sm" style={{ color: T.mutedOnSunken }}>
              © {new Date().getFullYear()} {LEGAL.name}, faisant affaire sous le nom Evoweb.
              Tous droits réservés.
            </p>
            <p className="text-xs" style={{ color: T.mutedOnSunken }}>
              NEQ {LEGAL.neq} · {LEGAL.city} · <ObfuscatedEmail />
            </p>
            <a
              href="/confidentialite"
              className="text-xs inline-block transition-colors"
              style={{ color: T.mutedOnSunken }}
              onMouseEnter={(e) => (e.currentTarget.style.color = violet[400])}
              onMouseLeave={(e) => (e.currentTarget.style.color = T.mutedOnSunken)}
            >
              Politique de confidentialité
            </a>
          </div>
          <span
            className="font-display font-extrabold select-none leading-none hidden sm:block"
            style={{ fontSize: "clamp(2rem, 6vw, 5rem)", color: T.borderSunken, letterSpacing: "-0.04em" }}
          >
            EVOWEB
          </span>
        </div>
      </div>
    </footer>
  );
}
