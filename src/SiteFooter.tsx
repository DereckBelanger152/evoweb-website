import { Github, Linkedin } from "lucide-react";
import { LEGAL } from "./legal";
import ObfuscatedEmail from "./ObfuscatedEmail";

const SOCIALS = [
  { href: "https://github.com/DereckBelanger152", Icon: Github, label: "GitHub" },
  {
    href: "https://www.linkedin.com/in/dereck-bélanger-437259338/",
    Icon: Linkedin,
    label: "LinkedIn",
  },
];

// Pied de page partagé par toutes les pages. Ne pas dupliquer ce JSX ailleurs —
// importer ce composant, pour que le footer reste identique (largeur, liens,
// année) peu importe la page.
//
// Le puits reste sombre dans les deux thèmes, d'où les jetons `-sunken` : le
// texte et les liens y ont besoin de leurs propres contrastes, indépendants du
// thème choisi par le visiteur.
export default function SiteFooter() {
  return (
    <footer className="py-12 px-6 bg-sunken border-t border-line-sunken">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <img
              src="/logo-evoweb.webp"
              alt=""
              width={256}
              height={256}
              loading="lazy"
              decoding="async"
              className="h-10 w-10 object-contain"
            />
            <span className="font-display font-bold text-lg text-on-sunken">Evoweb</span>
          </div>
          <div className="flex gap-6">
            {SOCIALS.map(({ href, Icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-sunken hover:text-accent-sunken transition-colors"
                aria-label={label}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>

        <div className="mt-12 pt-8 flex flex-col sm:flex-row justify-between items-end gap-4 border-t border-line-sunken">
          <div className="space-y-2 text-muted-sunken">
            <p className="text-sm">
              © {new Date().getFullYear()} {LEGAL.name}, faisant affaire sous le nom Evoweb.
              Tous droits réservés.
            </p>
            <p className="text-xs">
              NEQ {LEGAL.neq} · {LEGAL.city} · <ObfuscatedEmail />
            </p>
            <a
              href="/confidentialite"
              className="text-xs inline-block hover:text-accent-sunken transition-colors"
            >
              Politique de confidentialité
            </a>
          </div>
          <span
            className="font-display font-extrabold select-none leading-none hidden sm:block text-line-sunken tracking-[-0.04em] text-[clamp(2rem,6vw,5rem)]"
            aria-hidden="true"
          >
            EVOWEB
          </span>
        </div>
      </div>
    </footer>
  );
}
