import { useState, useEffect } from "react";
import {
  ExternalLink,
  Github,
  ArrowRight,
  Sun,
  Moon,
  Linkedin,
  X,
  Menu,
} from "lucide-react";
import { useTheme } from "./ThemeContext";
import ContactForm from "./ContactForm";
import { motion } from "framer-motion";
import { Analytics } from "@vercel/analytics/react";

// ─── Color tokens ────────────────────────────────────────────────────────
const C = {
  accent:       "#7635D5",
  accentLight:  "#9B6CE9",
  bgDark:       "#111113",   // neutral charcoal — no purple tint
  surfaceDark:  "#1A1A1E",
  bgLight:      "#F5F5F8",   // cool near-white
  surfaceLight: "#FFFFFF",
  textDark:     "#EEEDF5",
  textLight:    "#18181B",
  mutedDark:    "#8F8F9E",
  mutedLight:   "#5E5C7A",
  borderDark:   "#2E2E38",
  borderLight:  "#DDDBE8",
} as const;

const TECH_TAGS = [
  "React", "TypeScript", "Tailwind CSS", "Vite", "Node.js",
  "Next.js", "Framer Motion", "Vercel", "JavaScript", "HTML", "CSS",
  "React", "TypeScript", "Tailwind CSS", "Vite", "Node.js",
  "Next.js", "Framer Motion", "Vercel", "JavaScript", "HTML", "CSS",
];

const PRICING = [
  {
    num: "01",
    name: "Site Vitrine",
    desc: "Un site professionnel pour présenter votre entreprise au monde.",
    features: ["Design unique", "Responsive mobile", "Formulaire de contact", "Hébergement assisté"],
    price: "À partir de 400 $",
    delay: "2–3 semaines",
    badge: null,
  },
  {
    num: "02",
    name: "Site Sur Mesure",
    desc: "Application React complète avec animations et fonctionnalités avancées.",
    features: ["React + TypeScript", "Animations Framer Motion", "Architecture optimisée", "SEO intégré"],
    price: "À partir de 900 $",
    delay: "4–8 semaines",
    badge: null,
  },
  {
    num: "03",
    name: "Site Transactionnel",
    desc: "Boutique en ligne, réservations ou paiements intégrés directement à votre site.",
    features: ["Intégration Stripe", "Gestion produits/commandes", "Interface admin", "Formation incluse"],
    price: "À partir de 1 800 $",
    delay: "Sur devis",
    badge: "Nouveau",
  },
];

function TechMarquee({ isDark }: { isDark: boolean }) {
  const border = isDark ? C.borderDark : C.borderLight;
  const muted  = isDark ? C.mutedDark  : C.mutedLight;
  return (
    <div
      className="overflow-hidden py-4"
      style={{ borderTop: `1px solid ${border}`, borderBottom: `1px solid ${border}` }}
    >
      <div className="flex whitespace-nowrap animate-marquee">
        {TECH_TAGS.map((tag, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-4 px-6 text-xs font-mono uppercase tracking-widest select-none"
            style={{ color: muted }}
          >
            {tag}
            <span style={{ color: C.accent }} aria-hidden>·</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [isScrolled, setIsScrolled]         = useState(false);
  const [activeSection, setActiveSection]   = useState("accueil");
  const { isDark, toggleTheme }             = useTheme();
  const [showPopup, setShowPopup]           = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      const sections = ["accueil", "apropos", "services", "projets", "tarifs", "contact"];
      const current = sections.find((id) => {
        const el = document.getElementById(id);
        if (!el) return false;
        const { top, bottom } = el.getBoundingClientRect();
        return top <= 100 && bottom >= 100;
      });
      if (current) setActiveSection(current);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const projects = [
    {
      title: "Club IA Université Laval",
      description: "Site pour un club étudiant en intelligence artificielle",
      image: "/cia_presentation.png",
      alt: "Site web pour club Intelligence Artificielle de mon université",
      tech: ["TypeScript", "Tailwind CSS"],
      link: "https://cia.ift.ulaval.ca",
    },
    {
      title: "Site personnel",
      description: "Mon site portfolio si vous voulez en savoir plus sur moi!",
      image: "portfolio_presentation.png",
      alt: "Site web portfolio personnel",
      tech: ["TypeScript", "JavaScript", "CSS", "HTML"],
      link: "https://www.dereckbelanger.me",
    },
    {
      title: "Lavage à pression provincial",
      description: "Compagnie québecoise de service de lavage à pression",
      image: "lavagepression.png",
      alt: "Site web pour lavage à pression provincial",
      tech: ["TypeScript", "JavaScript", "CSS", "HTML"],
      link: "https://www.lavageapressionprovincial.com",
    },
    {
      title: "Café",
      description: "Un prototype de site web pour une boutique de café fictive",
      image: "/cafe_presentation.png",
      alt: "Site web pour un café fictif",
      tech: ["TypeScript", "CSS", "JavaScript", "HTML"],
      link: "https://coffeeshop-website-nine.vercel.app",
    },
    {
      title: "Garage",
      description: "Un prototype de site web pour un garage fictif",
      image: "garage.png",
      alt: "Site web pour un garage fictif",
      tech: ["TypeScript", "JavaScript", "CSS"],
      link: "https://garage-website-alpha.vercel.app",
    },
  ];

  const navLinks: [string, string][] = [
    ["accueil",  "Accueil"],
    ["apropos",  "À Propos"],
    ["services", "Services"],
    ["projets",  "Projets"],
    ["tarifs",   "Tarifs"],
    ["contact",  "Contact"],
  ];

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  const bg     = isDark ? C.bgDark     : C.bgLight;
  const text   = isDark ? C.textDark   : C.textLight;
  const muted  = isDark ? C.mutedDark  : C.mutedLight;
  const border = isDark ? C.borderDark : C.borderLight;
  const surf   = isDark ? C.surfaceDark : C.surfaceLight;

  return (
    <div
      className="min-h-screen overflow-x-hidden font-body transition-colors duration-300"
      style={{ background: bg, color: text }}
    >
      <Analytics />

      {/* ── ANNOUNCEMENT BAR ─────────────────────────────────────── */}
      {showPopup && (
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed top-0 left-0 right-0 z-[100] h-9 flex items-center justify-between px-4 sm:px-6"
          style={{ background: C.accent }}
        >
          <p className="text-white text-xs sm:text-sm font-medium truncate pr-4">
            Nouveauté! Sites transactionnels disponibles — tarif réduit pour les premiers clients.{" "}
            <button
              onClick={() => scrollToSection("tarifs")}
              className="underline underline-offset-2 hover:opacity-80"
            >
              Voir les tarifs →
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
          top: showPopup ? "2.25rem" : "0",
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
          <button onClick={() => scrollToSection("accueil")} className="flex items-center gap-3">
            <img src="evoweb_logo.png" alt="Evoweb" className="h-10 w-10 object-contain" />
            <span className="font-display font-bold text-xl" style={{ color: text }}>
              Evoweb
            </span>
          </button>

          <div className="flex items-center gap-5">
            <div className="hidden md:flex gap-6">
              {navLinks.map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => scrollToSection(id)}
                  className="text-sm relative transition-colors"
                  style={{ color: activeSection === id ? C.accentLight : muted }}
                >
                  {label}
                  {activeSection === id && (
                    <span
                      className="absolute -bottom-1 left-0 right-0 h-px"
                      style={{ background: C.accent }}
                    />
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={toggleTheme}
              className="p-2 transition-colors"
              style={{ border: `1px solid ${border}` }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = C.accentLight)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = border)}
              aria-label="Changer de thème"
            >
              {isDark
                ? <Sun  className="h-4 w-4" style={{ color: muted }} />
                : <Moon className="h-4 w-4" style={{ color: muted }} />}
            </button>

            <button
              className="md:hidden p-2 transition-colors"
              style={{ border: `1px solid ${border}` }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              <Menu className="h-4 w-4" style={{ color: muted }} />
            </button>
          </div>
        </motion.div>

        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden px-6 py-4 flex flex-col gap-4"
            style={{ background: surf, borderTop: `1px solid ${border}` }}
          >
            {navLinks.map(([id, label]) => (
              <button
                key={id}
                onClick={() => scrollToSection(id)}
                className="text-sm text-left"
                style={{ color: activeSection === id ? C.accentLight : muted }}
              >
                {label}
              </button>
            ))}
          </motion.div>
        )}
      </nav>

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section
        id="accueil"
        className="min-h-screen flex flex-col justify-center px-6 relative pt-36 pb-16"
      >
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="label mb-5 block">Une idée en tête ?</span>
            <h1
              className="font-display font-extrabold leading-[0.9] tracking-tight mb-8"
              style={{ fontSize: "clamp(3rem, 10vw, 9rem)", color: text }}
            >
              Créez votre
              <br />
              site web
              <br />
              <span style={{ color: C.accentLight }}>personnalisé</span>
              <br />
              avec Evoweb.
            </h1>
            <p className="text-lg max-w-lg mb-10 leading-relaxed" style={{ color: muted }}>
              Je transforme vos idées en sites web modernes et 100% personnalisés
              vous permettant de vous démarquer de la concurrence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => scrollToSection("projets")}
                className="font-semibold px-8 py-3 text-sm uppercase tracking-wider transition-opacity hover:opacity-85 inline-flex items-center justify-center gap-2 group"
                style={{ background: C.accent, color: "#FFFFFF" }}
              >
                Voir mes projets
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="px-8 py-3 text-sm uppercase tracking-wider transition-colors inline-flex items-center justify-center gap-2 group"
                style={{ border: `1px solid ${border}`, color: text }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = C.accentLight)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = border)}
              >
                Me contacter
                <ExternalLink className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>
        <button
          onClick={() => scrollToSection("apropos")}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-lg transition-colors"
          style={{ color: muted }}
          onMouseEnter={(e) => (e.currentTarget.style.color = C.accentLight)}
          onMouseLeave={(e) => (e.currentTarget.style.color = muted)}
          aria-label="Défiler vers le bas"
        >
          ↓
        </button>
      </section>

      {/* ── TECH MARQUEE ─────────────────────────────────────────── */}
      <TechMarquee isDark={isDark} />

      {/* ── À PROPOS ──────────────────────────────────────────────── */}
      <section
        id="apropos"
        className="py-24 sm:py-32 px-6"
        style={{ borderTop: `1px solid ${border}` }}
      >
        <div className="container mx-auto">
          <span className="label mb-12 block">— À Propos</span>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex flex-col md:flex-row items-start gap-12 mt-12"
          >
            <div className="w-full md:w-5/12 flex-shrink-0">
              <div className="overflow-hidden" style={{ border: `1px solid ${border}` }}>
                <img
                  src="profil.png"
                  alt="Dereck Bélanger — Fondateur Evoweb"
                  className="w-full h-auto object-cover grayscale hover:grayscale-0 transition-all duration-700"
                />
              </div>
            </div>

            <div className="w-full md:w-7/12 space-y-6 md:pt-4">
              <h2
                className="font-display font-bold text-3xl sm:text-4xl leading-tight"
                style={{ color: text }}
              >
                Fondateur d'Evoweb
              </h2>
              <p className="leading-relaxed" style={{ color: muted }}>
                Bonjour! Je suis Dereck, étudiant en informatique à l'Université Laval
                et développeur web passionné. Je combine créativité et expertise technique
                pour créer des expériences web qui satisfont vos besoins.
                C'est moi s'occuperai de vous!
              </p>
              <div className="space-y-3 pt-2">
                {[
                  "React · TypeScript · Tailwind CSS · Framer Motion",
                  "Informatique, Université Laval",
                  "Passionné par les défis et l'apprentissage continu",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm" style={{ color: muted }}>
                    <span style={{ color: C.accentLight }}>—</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── DIFFERENTIATORS STRIP ────────────────────────────────── */}
      <div className="px-6" style={{ borderTop: `1px solid ${border}` }}>
        <div className="container mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px" style={{ background: border }}>
            {[
              { stat: "5+",   label: "Projets livrés" },
              { stat: "100%", label: "Entièrement sur mesure" },
              { stat: "1:1",  label: "Contact direct avec votre dev" },
            ].map(({ stat, label }) => (
              <div key={stat} className="py-10 px-8" style={{ background: bg }}>
                <div
                  className="font-display font-extrabold text-4xl sm:text-5xl mb-2 leading-none"
                  style={{ color: C.accentLight }}
                >
                  {stat}
                </div>
                <div className="text-sm" style={{ color: muted }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── SERVICES ──────────────────────────────────────────────── */}
      <section
        id="services"
        className="py-24 sm:py-32 px-6"
        style={{ borderTop: `1px solid ${border}` }}
      >
        <div className="container mx-auto">
          <span className="label mb-12 block">— Services</span>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-12"
          >
            <h2
              className="font-display font-bold text-3xl sm:text-4xl mb-16"
              style={{ color: text }}
            >
              Mes Services
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-px" style={{ background: border }}>
              {[
                {
                  title: "Développement Web",
                  desc: "Sites web personnalisés construits avec des technologies modernes et performantes, du premier pixel à la mise en ligne.",
                },
                {
                  title: "Maintien et entretien",
                  desc: "Votre site en ligne, c'est un actif. Je m'occupe des mises à jour, correctifs et évolutions pour qu'il reste impeccable.",
                },
                {
                  title: "Consultation UI/UX",
                  desc: "Besoin de conseils avant de lancer ? Je vous guide vers une expérience utilisateur optimale pour vos visiteurs.",
                },
              ].map((service, i) => (
                <div
                  key={i}
                  className="p-8 sm:p-10 group transition-colors duration-300"
                  style={{ background: bg }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = surf)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = bg)}
                >
                  <h3 className="font-display font-semibold text-lg mb-4" style={{ color: text }}>
                    {service.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: muted }}>
                    {service.desc}
                  </p>
                  <div
                    className="mt-8 h-px w-0 group-hover:w-full transition-all duration-500"
                    style={{ background: C.accent }}
                  />
                </div>
              ))}
            </div>

            <div
              className="mt-px flex items-center justify-between px-8 py-5"
              style={{ background: surf, borderTop: `1px solid ${border}` }}
            >
              <p className="text-sm" style={{ color: muted }}>
                Vous avez un projet en tête ?
              </p>
              <button
                onClick={() => scrollToSection("contact")}
                className="inline-flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-70"
                style={{ color: C.accentLight }}
              >
                Parlons-en
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── PROJETS ───────────────────────────────────────────────── */}
      <section
        id="projets"
        className="py-24 sm:py-32 px-6"
        style={{ borderTop: `1px solid ${border}` }}
      >
        <div className="container mx-auto">
          <span className="label mb-12 block">— Projets</span>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-12"
          >
            <h2
              className="font-display font-bold text-3xl sm:text-4xl mb-16"
              style={{ color: text }}
            >
              Quelques-uns de mes projets
            </h2>

            <div className="flex flex-col gap-20 max-w-5xl">
              {projects.map((project, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className={`flex flex-col ${
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  } gap-8 md:gap-16 items-center`}
                >
                  <div className="w-full md:w-1/2 flex-shrink-0">
                    <div
                      className="overflow-hidden aspect-video group"
                      style={{ border: `1px solid ${border}` }}
                    >
                      <img
                        src={project.image}
                        alt={project.alt}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                      />
                    </div>
                  </div>

                  <div className="w-full md:w-1/2 space-y-4">
                    <span
                      className="font-mono text-xs uppercase tracking-wider"
                      style={{ color: C.accentLight }}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3
                      className="font-display font-semibold text-xl md:text-2xl"
                      style={{ color: text }}
                    >
                      {project.title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: muted }}>
                      {project.description}
                    </p>
                    {project.tech.length > 0 && (
                      <p className="text-xs font-mono" style={{ color: muted }}>
                        {project.tech.join(" · ")}
                      </p>
                    )}
                    <a
                      href={project.link as string}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm transition-all duration-200 hover:gap-4"
                      style={{ color: C.accentLight }}
                    >
                      Voir le Projet
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── TARIFS ────────────────────────────────────────────────── */}
      <section
        id="tarifs"
        className="py-24 sm:py-32 px-6"
        style={{ borderTop: `1px solid ${border}` }}
      >
        <div className="container mx-auto">
          <span className="label mb-12 block">— Tarifs</span>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-12"
          >
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16">
              <h2
                className="font-display font-bold text-3xl sm:text-4xl"
                style={{ color: text }}
              >
                Tarifs transparents
              </h2>
              <p className="text-sm max-w-sm sm:text-right" style={{ color: muted }}>
                Étudiant passionné, tarifs compétitifs. Pas de surprise, pas de frais cachés.
              </p>
            </div>

            {/* Pricing rows */}
            <div style={{ borderTop: `1px solid ${border}` }}>
              {PRICING.map((tier, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="group"
                  style={{ borderBottom: `1px solid ${border}` }}
                >
                  <div
                    className="flex flex-col md:flex-row md:items-start gap-6 py-8 px-2 transition-colors duration-200"
                    style={{ background: "transparent" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = surf)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    {/* Left: number + name + features */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-4">
                        <span
                          className="font-mono text-xs uppercase tracking-wider"
                          style={{ color: C.accentLight }}
                        >
                          {tier.num}
                        </span>
                        <h3
                          className="font-display font-bold text-xl sm:text-2xl"
                          style={{ color: text }}
                        >
                          {tier.name}
                        </h3>
                        {tier.badge && (
                          <span
                            className="text-xs font-mono uppercase tracking-wider px-2 py-0.5"
                            style={{
                              background: C.accent,
                              color: "#fff",
                            }}
                          >
                            {tier.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-sm leading-relaxed max-w-xl" style={{ color: muted }}>
                        {tier.desc}
                      </p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1">
                        {tier.features.map((f) => (
                          <span
                            key={f}
                            className="text-xs font-mono"
                            style={{ color: muted }}
                          >
                            — {f}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Right: price + delay + CTA */}
                    <div className="md:text-right flex-shrink-0 space-y-3">
                      <div
                        className="font-display font-extrabold text-2xl sm:text-3xl leading-none"
                        style={{ color: text }}
                      >
                        {tier.price}
                      </div>
                      <div className="text-xs font-mono" style={{ color: muted }}>
                        Délai : {tier.delay}
                      </div>
                      <button
                        onClick={() => scrollToSection("contact")}
                        className="inline-flex items-center gap-2 text-sm font-semibold transition-all duration-200 hover:gap-4"
                        style={{ color: C.accentLight }}
                      >
                        Démarrer
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Maintenance add-on note */}
            <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2 py-5"
              style={{ borderTop: `1px solid ${border}` }}
            >
              <div>
                <span className="text-sm font-semibold" style={{ color: text }}>
                  Maintien mensuel
                </span>
                <span className="text-sm ml-3" style={{ color: muted }}>
                  Mises à jour, corrections, évolutions — sans vous en préoccuper.
                </span>
              </div>
              <span
                className="font-display font-bold text-lg flex-shrink-0"
                style={{ color: C.accentLight }}
              >
                À partir de 75 $/mois
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CONTACT ───────────────────────────────────────────────── */}
      <section
        id="contact"
        className="py-24 sm:py-32 px-6"
        style={{ borderTop: `1px solid ${border}` }}
      >
        <div className="container mx-auto">
          <span className="label mb-12 block">— Contact</span>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mt-12 p-8 sm:p-12"
            style={{ border: `1px solid ${border}` }}
          >
            <div className="flex flex-col md:flex-row gap-12">
              <div className="w-full md:w-1/2 space-y-6">
                <h2
                  className="font-display font-bold text-3xl sm:text-4xl"
                  style={{ color: text }}
                >
                  Travaillons Ensemble
                </h2>
                <p className="leading-relaxed" style={{ color: muted }}>
                  Prêt à démarrer votre projet ? Des questions sur les tarifs ou les
                  disponibilités ? Envoyez-moi un message et je vous réponds rapidement.
                </p>
                <div className="pt-2 space-y-1">
                  {[
                    "Réponse sous 24h",
                    "Devis gratuit et sans engagement",
                    "Disponible pour des projets au Québec et partout ailleurs",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 text-sm"
                      style={{ color: muted }}
                    >
                      <span style={{ color: C.accentLight }}>—</span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-full md:w-1/2">
                <ContactForm />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────── */}
      <footer
        className="py-12 px-6"
        style={{ background: "#080609", borderTop: `1px solid #1E1E24` }}
      >
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <img src="evoweb_logo.png" alt="Evoweb" className="h-10 w-10 object-contain" />
              <span className="font-display font-bold text-lg text-[#EEEDF5]">Evoweb</span>
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
                  style={{ color: "#555560" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = C.accentLight)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#555560")}
                  aria-label={label}
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          <div
            className="mt-12 pt-8 flex flex-col sm:flex-row justify-between items-end gap-4"
            style={{ borderTop: `1px solid #1E1E24` }}
          >
            <p className="text-sm" style={{ color: "#555560" }}>
              © {new Date().getFullYear()} Dereck Bélanger — Tous droits réservés.
            </p>
            <span
              className="font-display font-extrabold select-none leading-none hidden sm:block"
              style={{ fontSize: "clamp(2rem, 6vw, 5rem)", color: "#1E1E24", letterSpacing: "-0.04em" }}
            >
              EVOWEB
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
