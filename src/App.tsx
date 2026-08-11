import { ExternalLink, ArrowRight } from "lucide-react";
import { useTheme } from "./ThemeContext";
import ContactForm from "./ContactForm";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import { motion } from "framer-motion";
import { tokensFor } from "./tokens";
import { PRICING, ADDONS, PROCESS } from "./pricingData";
import { useSEO } from "./useSEO";

const TECH_TAGS = [
  "React", "TypeScript", "Tailwind CSS", "Vite", "Node.js",
  "Next.js", "Framer Motion", "Vercel", "JavaScript", "HTML", "CSS",
  "React", "TypeScript", "Tailwind CSS", "Vite", "Node.js",
  "Next.js", "Framer Motion", "Vercel", "JavaScript", "HTML", "CSS",
];

function TechMarquee({ isDark }: { isDark: boolean }) {
  const T = tokensFor(isDark);
  return (
    <div
      className="overflow-hidden py-4"
      style={{ borderTop: `1px solid ${T.borderDefault}`, borderBottom: `1px solid ${T.borderDefault}` }}
    >
      <div className="flex whitespace-nowrap animate-marquee">
        {TECH_TAGS.map((tag, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-4 px-6 text-xs font-mono uppercase tracking-widest select-none"
            style={{ color: T.textMuted }}
          >
            {tag}
            <span style={{ color: T.accent }} aria-hidden>·</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const { isDark } = useTheme();

  useSEO("/");

  const projects = [
    {
      title: "Club IA Université Laval",
      description:
        "Site web pour le club d'Intelligence Artificielle de l'Université Laval. Moyenne de 230 visites/mois, >97% de performance desktop/mobile en continu",
      image: "/site-cia.webp",
      alt: "Site web pour club Intelligence Artificielle de mon université",
      tech: ["TypeScript", "Tailwind CSS", "Firebase", "i18n"],
      link: "https://cia.ift.ulaval.ca",
    },
    {
      title: "Site personnel",
      description:
        "Mon propre terrain de jeu : chaque nouvelle techno que j'apprends atterrit ici en premier. C'est ce site qui m'a permis de décrocher mes tout premiers clients.",
      image: "/site-portfolio.webp",
      alt: "Site web portfolio personnel",
      tech: ["TypeScript", "Tailwind CSS", "Framer Motion"],
      link: "https://www.dereckbelanger.me",
    },
    {
      title: "Lavage à pression provincial",
      description:
        "Client comblé, site livré: cette entreprise de lavage à pression a enfin une présence web à la hauteur de sa réputation sur le terrain.",
      image: "/site-lavagepression.webp",
      alt: "Site web pour lavage à pression provincial",
      tech: ["TypeScript", "Tailwind CSS", "Framer Motion"],
      link: "https://www.lavageapressionprovincial.com",
    },
    {
      title: "Café",
      description:
        "Site web fictif pour un café. Il est entièrement responsive et optimisé pour la performance.",
      image: "/site-cafe.webp",
      alt: "Site web pour un café fictif",
      tech: ["TypeScript", "Tailwind CSS", "JavaScript"],
      link: "https://coffeeshop-website-nine.vercel.app",
    },
  ];

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const T      = tokensFor(isDark);
  const bg     = T.canvas;
  const text   = T.textPrimary;
  const muted  = T.textMuted;
  const border = T.borderDefault;
  const surf   = T.surface;
  const accentText = T.textAccent;

  return (
    <div
      className="min-h-screen overflow-x-hidden font-body transition-colors duration-300"
      style={{ background: bg, color: text }}
    >
      <SiteHeader variant="home" onNavigate={scrollToSection} />

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
              <span style={{ color: accentText }}>personnalisé</span>
              <br />
              avec Evoweb.
            </h1>
            <p className="text-lg max-w-lg mb-10 leading-relaxed" style={{ color: muted }}>
              Je transforme vos idées en sites web modernes et 100% personnalisés
              pour vous démarquer de la concurrence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => scrollToSection("projets")}
                className="font-semibold px-8 py-3 text-sm uppercase tracking-wider transition-opacity hover:opacity-85 inline-flex items-center justify-center gap-2 group"
                style={{ background: T.accent, color: T.onAccent }}
              >
                Voir mes projets
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="px-8 py-3 text-sm uppercase tracking-wider transition-colors inline-flex items-center justify-center gap-2 group"
                style={{ border: `1px solid ${border}`, color: text }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = accentText)}
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
          onMouseEnter={(e) => (e.currentTarget.style.color = accentText)}
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
                  src="/photo-dereck.webp"
                  alt="Dereck Bélanger, fondateur Evoweb"
                  width={1200}
                  height={1600}
                  loading="lazy"
                  decoding="async"
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
                C'est moi qui m'occuperai de vous!
              </p>
              <div className="space-y-3 pt-2">
                {[
                  "React · TypeScript · Tailwind CSS · Framer Motion",
                  "Informatique, Université Laval",
                  "Passionné par les défis et l'apprentissage continu",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm" style={{ color: muted }}>
                    <span style={{ color: accentText }}>—</span>
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
                  style={{ color: accentText }}
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
                    style={{ background: T.accent }}
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
                style={{ color: accentText }}
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
                        width={1600}
                        height={900}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                      />
                    </div>
                  </div>

                  <div className="w-full md:w-1/2 space-y-4">
                    <span
                      className="font-mono text-xs uppercase tracking-wider"
                      style={{ color: accentText }}
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
                      style={{ color: accentText }}
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

      {/* ── COMMENT ÇA MARCHE ─────────────────────────────────────── */}
      <section
        id="processus"
        className="py-24 sm:py-32 px-6"
        style={{ borderTop: `1px solid ${border}` }}
      >
        <div className="container mx-auto">
          <span className="label mb-12 block">— Comment ça marche</span>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-12"
          >
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16">
              <h2
                className="font-display font-bold text-3xl sm:text-4xl max-w-xl"
                style={{ color: text }}
              >
                Vous n'avez jamais eu de site web ?
              </h2>
              <p className="text-sm max-w-sm sm:text-right leading-relaxed" style={{ color: muted }}>
                C'est le cas de la plupart de mes clients. Voici exactement comment ça se passe,
                du premier appel jusqu'à la mise en ligne.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px" style={{ background: border }}>
              {PROCESS.map((step) => (
                <div key={step.num} className="p-8 flex flex-col" style={{ background: bg }}>
                  <span
                    className="font-mono text-xs uppercase tracking-wider mb-4"
                    style={{ color: accentText }}
                  >
                    {step.num}
                  </span>
                  <h3 className="font-display font-semibold text-lg mb-3" style={{ color: text }}>
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: muted }}>
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>

            <div
              className="mt-px flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-8 py-6"
              style={{ background: surf }}
            >
              <p className="text-sm leading-relaxed max-w-2xl" style={{ color: muted }}>
                La maquette est gratuite et sans engagement. Si elle ne vous plaît pas, vous la
                gardez quand même et on en reste là.
              </p>
              <button
                onClick={() => scrollToSection("contact")}
                className="inline-flex items-center gap-2 text-sm font-semibold transition-all duration-200 hover:gap-4 flex-shrink-0"
                style={{ color: accentText }}
              >
                Demander ma maquette
                <ArrowRight className="h-4 w-4" />
              </button>
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
              <p className="text-sm max-w-sm sm:text-right leading-relaxed" style={{ color: muted }}>
                Les agences facturent souvent 3 000 $ et plus pour un site comparable. Je travaille seul, donc aucun
                bureau ni vendeur à payer. Comme petit fournisseur, aucune taxe (TPS/TVQ) ne
                s'ajoute non plus à votre facture. C'est là que vous économisez!
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
                          style={{ color: accentText }}
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
                              background: T.accent,
                              color: T.onAccent,
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
                        style={{ color: accentText }}
                      >
                        Démarrer
                        <ArrowRight className="h-4 w-4" />
                      </button>
                      <a
                        href={`/forfaits#${tier.slug}`}
                        className="block text-xs underline underline-offset-2 transition-opacity hover:opacity-70"
                        style={{ color: muted }}
                      >
                        En savoir plus
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Échéancier de paiement */}
            <div className="mt-10 p-6 sm:p-8" style={{ background: surf }}>
              <h3 className="font-display font-bold text-lg mb-2" style={{ color: text }}>
                Payé en trois versements
              </h3>
              <p className="text-sm mb-6 max-w-2xl leading-relaxed" style={{ color: muted }}>
                Vous ne payez jamais pour quelque chose que vous n'avez pas encore vu.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  ["40 %", "à la signature", "Réserve votre place à mon calendrier."],
                  [
                    "30 %",
                    "à l'approbation du design",
                    "Après une semaine : logo, couleurs et maquette de la page d'accueil, présentés en appel et approuvés avant que je construise le reste.",
                  ],
                  ["30 %", "avant la mise en ligne", "Le site est fini, vous l'avez visité."],
                ].map(([pct, when, why]) => (
                  <div key={when}>
                    <div
                      className="font-display font-extrabold text-2xl leading-none mb-2"
                      style={{ color: accentText }}
                    >
                      {pct}
                    </div>
                    <div className="text-sm font-semibold mb-1" style={{ color: text }}>
                      {when}
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: muted }}>
                      {why}
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-xs mt-6 leading-relaxed" style={{ color: muted }}>
                Aucune taxe applicable. Le seul frais qui s'ajoute est votre nom de domaine,
                environ 25 $ par année, payé directement à votre fournisseur et à votre nom.
                L'hébergement est inclus et il n'y a aucun abonnement obligatoire.
              </p>
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
                  Mises à jour, corrections, évolutions, sans vous en préoccuper.{" "}
                  <a
                    href="/forfaits#entretien"
                    className="underline underline-offset-2 transition-opacity hover:opacity-70"
                    style={{ color: accentText }}
                  >
                    Ce qui est inclus
                  </a>
                </span>
              </div>
              <span
                className="font-display font-bold text-lg flex-shrink-0"
                style={{ color: accentText }}
              >
                À partir de 75 $/mois
              </span>
            </div>

            {/* Trousse de démarrage — incluse gratuitement */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2 py-5"
              style={{ borderTop: `1px solid ${border}` }}
            >
              <div>
                <span className="text-sm font-semibold" style={{ color: text }}>
                  Trousse de démarrage
                </span>
                <span className="text-sm ml-3" style={{ color: muted }}>
                  Logos en couleur, blanc et noir, favicon, votre page de couleurs et polices,
                  3 gabarits pour vos réseaux sociaux, et un guide complet pour la suite des choses et/ou modifier votre site
                  vous-même, le tout dans un dossier prêt à partager.
                </span>
              </div>
              <span
                className="font-display font-bold text-lg flex-shrink-0"
                style={{ color: T.success }}
              >
                Incluse, gratuitement
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── SUPPLÉMENTS ───────────────────────────────────────────── */}
      <section
        id="extras"
        className="py-24 sm:py-32 px-6"
        style={{ borderTop: `1px solid ${border}` }}
      >
        <div className="container mx-auto">
          <span className="label mb-12 block">— Extras</span>
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
                Des extras, pas des forfaits
              </h2>
              <p className="text-sm max-w-sm sm:text-right leading-relaxed" style={{ color: muted }}>
                Chaque extra s'ajoute à n'importe lequel des 3 forfaits ci-dessus, en plus de
                votre trousse de démarrage déjà incluse. Prix fixe, une seule fois : jamais un
                abonnement caché, jamais flou.{" "}
                <a
                  href="/forfaits#extras-detail"
                  className="underline underline-offset-2 transition-opacity hover:opacity-70"
                  style={{ color: accentText }}
                >
                  En savoir plus
                </a>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {ADDONS.map((addon) => (
                <motion.div
                  key={addon.num}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="group flex flex-col"
                  style={{ border: `1px solid ${border}` }}
                >
                  <div className="relative overflow-hidden aspect-video">
                    <img
                      src={addon.image}
                      alt={addon.alt}
                      width={1200}
                      height={675}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                    />
                    <span
                      className="absolute top-3 right-3 font-mono text-xs font-bold px-2 py-1"
                      style={{ background: T.accent, color: T.onAccent }}
                    >
                      {addon.price}
                    </span>
                  </div>

                  <div className="p-6 flex flex-col gap-3 flex-1">
                    <div className="flex items-center gap-3">
                      <span
                        className="font-mono text-xs uppercase tracking-wider"
                        style={{ color: accentText }}
                      >
                        {addon.num}
                      </span>
                      <h3 className="font-display font-semibold text-base" style={{ color: text }}>
                        {addon.title}
                      </h3>
                    </div>
                    <p className="text-sm font-medium leading-snug" style={{ color: text }}>
                      {addon.pitch}
                    </p>
                    <p className="text-xs leading-relaxed" style={{ color: muted }}>
                      {addon.desc}
                    </p>
                    <p
                      className="text-[11px] leading-relaxed mt-auto pt-3"
                      style={{ color: muted, borderTop: `1px solid ${border}` }}
                    >
                      {addon.note}
                    </p>
                    <button
                      onClick={() => scrollToSection("contact")}
                      className="inline-flex items-center gap-2 text-sm font-semibold transition-all duration-200 hover:gap-4 mt-1"
                      style={{ color: accentText }}
                    >
                      Parlons-en
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            <div
              className="mt-10 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              style={{ background: surf }}
            >
              <div>
                <h3 className="font-display font-bold text-lg mb-1" style={{ color: text }}>
                  Combinez et économisez
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: muted }}>
                  2 extras : 10 % de rabais. 3 extras ou plus : 15 % de rabais.
                </p>
              </div>
              <button
                onClick={() => scrollToSection("contact")}
                className="inline-flex items-center gap-2 text-sm font-semibold flex-shrink-0 transition-all duration-200 hover:gap-4"
                style={{ color: accentText }}
              >
                Parlons-en
                <ArrowRight className="h-4 w-4" />
              </button>
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
                      <span style={{ color: accentText }}>—</span>
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

      <SiteFooter />
    </div>
  );
}
