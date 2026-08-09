import { useEffect, useState } from "react";
import { Sun, Moon, Menu, X } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "./ThemeContext";
import { tokensFor } from "./tokens";

// Bandeau d'annonce + navigation, partagés par toutes les pages. Sur la page
// d'accueil ("home"), les liens font défiler la page courante. La variante
// "subpage" (ex. /forfaits) sert une page de décision d'achat : pas de
// bandeau d'annonce ni de menu complet qui inviterait à repartir ailleurs,
// seulement le logo et un retour à l'accueil, pour garder l'attention sur
// la décision en cours.
const NAV_LINKS: [string, string][] = [
  ["accueil", "Accueil"],
  ["apropos", "À Propos"],
  ["services", "Services"],
    ["projets", "Projets"],
  ["processus", "Étapes"],
  ["tarifs", "Tarifs"],
  ["extras", "Extras"],
  ["contact", "Contact"],
];

type Props =
  | { variant: "home"; onNavigate: (id: string) => void }
  | { variant: "subpage" };

export default function SiteHeader(props: Props) {
  const { isDark, toggleTheme } = useTheme();
  const T = tokensFor(isDark);
  const isHome = props.variant === "home";

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(true);
  const [activeSection, setActiveSection] = useState("accueil");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      if (!isHome) return;
      const current = NAV_LINKS.map(([id]) => id).find((id) => {
        const el = document.getElementById(id);
        if (!el) return false;
        const { top, bottom } = el.getBoundingClientRect();
        return top <= 100 && bottom >= 100;
      });
      if (current) setActiveSection(current);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  const goTo = (id: string) => {
    if (props.variant === "home") {
      props.onNavigate(id);
    } else {
      window.location.href = `/#${id}`;
    }
    setMobileMenuOpen(false);
  };

  const bg = T.canvas;
  const text = T.textPrimary;
  const muted = T.textMuted;
  const border = T.borderDefault;
  const surf = T.surface;
  const accentText = T.textAccent;

  return (
    <>
      {/* ── ANNOUNCEMENT BAR ─────────────────────────────────────── */}
      {isHome && showPopup && (
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed top-0 left-0 right-0 z-[100] h-9 flex items-center justify-between px-4 sm:px-6"
          style={{ background: T.accent }}
        >
          <p className="text-white text-xs sm:text-sm font-medium truncate pr-4">
            Pas encore de site web ? Je vous prépare une maquette gratuite, sans engagement.{" "}
            <button
              onClick={() => goTo("processus")}
              className="underline underline-offset-2 hover:opacity-80"
            >
              Voir comment ça marche →
            </button>
          </p>
          <button
            onClick={() => setShowPopup(false)}
            className="flex-shrink-0 text-white/80 hover:text-white transition-opacity ml-4"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}

      {/* ── NAVIGATION ───────────────────────────────────────────── */}
      <nav
        className="fixed left-0 right-0 z-50 transition-all duration-300 py-4"
        style={{
          top: isHome && showPopup ? "2.25rem" : "0",
          background: isScrolled ? `${bg}F2` : "transparent",
          backdropFilter: isScrolled ? "blur(12px)" : "none",
          borderBottom: isScrolled ? `1px solid ${border}` : "none",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto px-6 flex items-center justify-between"
        >
          {isHome ? (
            <button onClick={() => goTo("accueil")} className="flex items-center gap-3">
              <img src="/logo-evoweb.webp" alt="Evoweb" width={256} height={256} className="h-10 w-10 object-contain" />
              <span className="font-display font-bold text-xl" style={{ color: text }}>
                Evoweb
              </span>
            </button>
          ) : (
            <a href="/" className="flex items-center gap-3">
              <img src="/logo-evoweb.webp" alt="Evoweb" width={256} height={256} className="h-10 w-10 object-contain" />
              <span className="font-display font-bold text-xl" style={{ color: text }}>
                Evoweb
              </span>
            </a>
          )}

          <div className="flex items-center gap-5">
            {isHome ? (
              <div className="hidden md:flex gap-6">
                {NAV_LINKS.map(([id, label]) => (
                  <button
                    key={id}
                    onClick={() => goTo(id)}
                    className="text-sm relative transition-colors"
                    style={{ color: activeSection === id ? accentText : muted }}
                  >
                    {label}
                    {activeSection === id && (
                      <span
                        className="absolute -bottom-1 left-0 right-0 h-px"
                        style={{ background: T.accent }}
                      />
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <a
                href="/"
                className="text-sm font-medium inline-flex items-center gap-2 transition-opacity hover:opacity-70"
                style={{ color: accentText }}
              >
                ← Retour à l'accueil
              </a>
            )}

            <button
              onClick={toggleTheme}
              className="p-2 transition-colors"
              style={{ border: `1px solid ${border}` }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = accentText)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = border)}
              aria-label="Changer de thème"
            >
              {isDark
                ? <Sun className="h-4 w-4" style={{ color: muted }} />
                : <Moon className="h-4 w-4" style={{ color: muted }} />}
            </button>

            {isHome && (
              <button
                className="md:hidden p-2 transition-colors"
                style={{ border: `1px solid ${border}` }}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Menu"
              >
                <Menu className="h-4 w-4" style={{ color: muted }} />
              </button>
            )}
          </div>
        </motion.div>

        {isHome && mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden px-6 py-4 flex flex-col gap-4"
            style={{ background: surf, borderTop: `1px solid ${border}` }}
          >
            {NAV_LINKS.map(([id, label]) => (
              <button
                key={id}
                onClick={() => goTo(id)}
                className="text-sm text-left"
                style={{ color: isHome && activeSection === id ? accentText : muted }}
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
