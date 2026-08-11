import { useEffect, useState } from "react";
import { Sun, Moon, Menu, X } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "./theme-context";

// Bandeau d'annonce + navigation, partagés par toutes les pages. Sur la page
// d'accueil ("home"), les liens font défiler la page courante. La variante
// "subpage" (ex. /forfaits) sert une page de décision d'achat : pas de bandeau
// d'annonce ni de menu complet qui inviterait à repartir ailleurs, seulement le
// logo et un retour à l'accueil, pour garder l'attention sur la décision.
const NAV_LINKS: [id: string, label: string][] = [
  ["accueil", "Accueil"],
  ["apropos", "À Propos"],
  ["services", "Services"],
  ["projets", "Projets"],
  ["processus", "Étapes"],
  ["tarifs", "Tarifs"],
  ["extras", "Extras"],
  ["contact", "Contact"],
];

// Le bandeau est refermable, et la fermeture tient jusqu'à la fin de la
// session : `sessionStorage` plutôt que `localStorage`, parce que le rejet
// d'aujourd'hui ne devrait pas masquer l'offre pour toujours. Sans cela il
// réapparaissait à chaque page, y compris juste après avoir été fermé.
const DISMISS_KEY = "announcementDismissed";

function readDismissed() {
  try {
    return sessionStorage.getItem(DISMISS_KEY) === "true";
  } catch {
    return false;
  }
}

type Props =
  | { variant: "home"; onNavigate: (id: string) => void }
  | { variant: "subpage" };

export default function SiteHeader(props: Props) {
  const { isDark, toggleTheme } = useTheme();
  const isHome = props.variant === "home";

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dismissed, setDismissed] = useState(readDismissed);
  const [activeSection, setActiveSection] = useState("accueil");

  const showBanner = isHome && !dismissed;

  // Écouteur passif : le navigateur n'a pas à attendre de savoir si on va
  // appeler preventDefault() avant de défiler. React ignore un setState qui
  // ne change rien, donc ce booléen ne provoque un rendu qu'aux deux
  // franchissements du seuil.
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Section active mise en évidence dans la navigation. Un IntersectionObserver
  // plutôt qu'un getBoundingClientRect() par section à chaque événement de
  // défilement : lire la géométrie d'un élément force le navigateur à
  // recalculer la mise en page, et le faire huit fois par image saccadait le
  // défilement sur mobile. L'observateur, lui, ne rappelle qu'au franchissement.
  //
  // rootMargin réduit la zone d'observation à une bande horizontale entre 100 px
  // (juste sous l'en-tête fixe) et 40 % de la hauteur de l'écran.
  //
  // On tient à jour l'ensemble des sections présentes dans cette bande, puis on
  // retient la première dans l'ordre du document. Se contenter de la dernière
  // entrée reçue serait fragile : l'observateur ne rappelle qu'avec les sections
  // dont la visibilité a changé, et rien ne garantit leur ordre dans le tableau.
  useEffect(() => {
    if (!isHome) return;

    const ids = NAV_LINKS.map(([id]) => id);
    const inBand = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) inBand.add(entry.target.id);
          else inBand.delete(entry.target.id);
        }
        const current = ids.find((id) => inBand.has(id));
        if (current) setActiveSection(current);
      },
      { rootMargin: "-100px 0px -60% 0px" },
    );

    for (const id of ids) {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    }
    return () => observer.disconnect();
  }, [isHome]);

  // Échappement ferme le menu mobile. Sans cela, un visiteur au clavier ouvre
  // le menu et n'a aucun moyen d'en sortir sans le parcourir en entier.
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileMenuOpen]);

  const goTo = (id: string) => {
    if (props.variant === "home") {
      props.onNavigate(id);
    } else {
      window.location.href = `/#${id}`;
    }
    setMobileMenuOpen(false);
  };

  const dismissBanner = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, "true");
    } catch {
      // Stockage bloqué : le bandeau se referme quand même pour cette page.
    }
  };

  const brand = (
    <>
      <img
        src="/logo-evoweb.webp"
        alt=""
        width={256}
        height={256}
        className="h-10 w-10 object-contain"
      />
      <span className="font-display font-bold text-xl text-fg">Evoweb</span>
    </>
  );

  return (
    <>
      {/* Premier élément focusable de la page : permet à qui navigue au clavier
          de sauter la navigation plutôt que de la retraverser à chaque page.
          Déplacé hors de l'écran par une translation plutôt que par `sr-only` :
          le couple sr-only / not-sr-only laisse deux règles se disputer la
          propriété `position`, et laquelle gagne dépend de l'ordre dans lequel
          Tailwind les écrit. Une translation ne souffre d'aucune ambiguïté. */}
      <a
        href="#contenu"
        className="fixed top-2 left-2 z-[200] -translate-y-24 focus:translate-y-0 transition-transform bg-brand text-on-brand px-4 py-2 text-sm font-semibold"
      >
        Aller au contenu
      </a>

      {showBanner && (
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed top-0 left-0 right-0 z-[100] h-9 flex items-center justify-between px-4 sm:px-6 bg-brand"
        >
          {/* Le bandeau entier est cliquable. Auparavant, le texte long et le
              lien vivaient dans un <p class="truncate"> : sur mobile, le « … »
              coupait précisément le lien, donc l'appel à l'action du bandeau
              était invisible là où passe la majorité du trafic. Le texte court
              en dessous de sm tient sans troncature. */}
          <button
            onClick={() => goTo("processus")}
            className="flex-1 min-w-0 text-left text-on-brand text-xs sm:text-sm font-medium truncate pr-4 hover:opacity-90 transition-opacity"
          >
            <span className="sm:hidden">Maquette gratuite, sans engagement</span>
            <span className="hidden sm:inline">
              Pas encore de site web ? Je vous prépare une maquette gratuite, sans engagement.
            </span>{" "}
            <span className="underline underline-offset-2">
              <span className="hidden sm:inline">Voir comment ça marche </span>→
            </span>
          </button>
          <button
            onClick={dismissBanner}
            className="flex-shrink-0 text-on-brand/80 hover:text-on-brand transition-opacity ml-4"
            aria-label="Fermer le bandeau"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </motion.div>
      )}

      <nav
        aria-label="Navigation principale"
        className={`fixed left-0 right-0 z-50 py-4 transition-all duration-300 ${
          showBanner ? "top-9" : "top-0"
        } ${
          isScrolled
            ? "bg-canvas/95 backdrop-blur-md border-b border-line"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto px-6 flex items-center justify-between"
        >
          {isHome ? (
            <button onClick={() => goTo("accueil")} className="flex items-center gap-3">
              {brand}
            </button>
          ) : (
            <a href="/" className="flex items-center gap-3">
              {brand}
            </a>
          )}

          <div className="flex items-center gap-5">
            {isHome ? (
              <div className="hidden md:flex gap-6">
                {NAV_LINKS.map(([id, label]) => {
                  const isActive = activeSection === id;
                  return (
                    <button
                      key={id}
                      onClick={() => goTo(id)}
                      aria-current={isActive ? "true" : undefined}
                      className={`text-sm relative transition-colors hover:text-accent ${
                        isActive ? "text-accent" : "text-muted"
                      }`}
                    >
                      {label}
                      {isActive && (
                        <span className="absolute -bottom-1 left-0 right-0 h-px bg-brand" />
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <a
                href="/"
                className="text-sm font-medium inline-flex items-center gap-2 text-accent transition-opacity hover:opacity-70"
              >
                ← Retour à l'accueil
              </a>
            )}

            <button
              onClick={toggleTheme}
              className="p-2 border border-line hover:border-accent transition-colors text-muted"
              aria-label={isDark ? "Passer au thème clair" : "Passer au thème sombre"}
            >
              {isDark ? (
                <Sun className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Moon className="h-4 w-4" aria-hidden="true" />
              )}
            </button>

            {isHome && (
              <button
                className="md:hidden p-2 border border-line hover:border-accent transition-colors text-muted"
                onClick={() => setMobileMenuOpen((open) => !open)}
                aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
                aria-expanded={mobileMenuOpen}
                aria-controls="menu-mobile"
              >
                {mobileMenuOpen ? (
                  <X className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Menu className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            )}
          </div>
        </motion.div>

        {isHome && mobileMenuOpen && (
          <motion.div
            id="menu-mobile"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden px-6 py-4 flex flex-col gap-4 bg-surface border-t border-line"
          >
            {NAV_LINKS.map(([id, label]) => (
              <button
                key={id}
                onClick={() => goTo(id)}
                aria-current={activeSection === id ? "true" : undefined}
                className={`text-sm text-left ${
                  activeSection === id ? "text-accent" : "text-muted"
                }`}
              >
                {label}
              </button>
            ))}
          </motion.div>
        )}
      </nav>
    </>
  );
}
