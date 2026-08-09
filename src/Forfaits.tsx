import { useEffect, useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  Lock,
  Wallet,
  FileText,
  LogOut,
  ShieldCheck,
  Receipt,
  Camera,
  AlertTriangle,
} from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "./ThemeContext";
import { tokensFor } from "./tokens";
import { PRICING, ADDONS } from "./pricingData";
import ContactForm from "./ContactForm";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";

// Contenu propre à cette page — pas des données de tarification, donc pas
// dans pricingData.ts. Traduit les features brutes de chaque forfait en
// résultats concrets, à la manière du devis (voir evoweb-ops/playbook/
// 05-devis-contrat.md : « traduire ce qu'il t'a dit à l'appel »).
const IDEAL_FOR: Record<string, string> = {
  essentiel: "Idéal pour : être trouvé sur Google et générer des demandes de clients, sans entretien.",
  presence: "Idéal pour : bâtir aussi une image de marque reconnaissable, sur le site et les réseaux.",
  "sur-mesure": "Idéal pour : quand votre site vitrine doit aussi vendre en ligne, prendre des réservations ou gérer un catalogue.",
};

// Bullets en langage bénéfice — le "pourquoi" derrière chaque forfait, pas
// une redite de la liste technique de pricingData.ts. Le préfixe **...**
// (rendu en gras par renderBold) souligne l'héritage entre paliers.
const CONCRETE: Record<string, string[]> = {
  essentiel: [
    "Votre page répond tout de suite aux questions qu'on vous pose le plus souvent : vos heures, si vous faites tel travail, où vous êtes exactement, etc.",
    "Votre fiche Google mise à jour et confirmée à votre nom, pour que votre entreprise apparaisse sur Google Maps et dans les résultats de recherche quand quelqu'un cherche ce que vous offrez, dans votre ville.",
    "Le moyen de vous rejoindre (appeler, écrire, réserver) bien en vue et facile à utiliser sur mobile, peu importe ce que vos clients préfèrent.",
  ],
  presence: [
    "**Tout ce qu'il y a dans Essentiel**, avec une identité visuelle en plus : logo, couleurs et polices pensés pour votre entreprise, pas un gabarit générique.",
    "3 gabarits prêts à publier sur Facebook et Instagram, à vos couleurs, avec votre contenu déjà dedans.",
    "30 minutes pour apprendre à changer vos heures, ajouter une photo, changer un texte, vous-même, sans dépendre de moi.",
  ],
  "sur-mesure": [
    "**Tout ce qu'il y a dans Présence** (et donc dans Essentiel aussi), avec la vente en ligne, les réservations ou la gestion de produits.",
    "Une interface simple pour voir vos commandes ou vos réservations, pensée pour vous, pas pour un développeur.",
    "Le prix et le délai dépendent de ce qu'on construit ensemble, confirmés par écrit avec le devis, jamais improvisés.",
  ],
};

const NOT_INCLUDED = [
  "Rédaction de textes à partir de zéro : 200 $ si vous n'avez aucun texte de départ. Si vous en avez, même écrits à la main, la mise en forme est incluse. Cela me permet d'avoir votre contenu réel dès le départ, pour que le site soit prêt à publier rapidement et fidèle à votre entreprise.",
  "Séance photo professionnelle : vos photos sont utilisées quand elles conviennent; sinon, des images de banque bien choisies prennent le relais, pour qu'il n'y ait jamais d'espace vide en ligne.",
  "Au-delà des deux séries de modifications incluses : 45 $/h, toujours annoncé avant de le faire, jamais après.",
];

const ALWAYS_INCLUDED = [
  "Site rapide et responsive : téléphone, tablette, ordinateur",
  "Chargement sous 2 secondes",
  "Titre et description propres à chaque page, pour Google",
  "Formulaire de contact avec message de confirmation, achemine à votre courriel",
  "Vos heures, coordonnées et adresse visibles",
  "Vos coordonnées, peu importe comment vos clients préfèrent vous joindre",
  "Liens vers vos réseaux sociaux, si vous en avez",
  "Favicon à vos couleurs",
  "Politique de confidentialité et mention légale (Loi 25)",
  "Site en français (Loi 101)",
  "Hébergement inclus, aucune taxe ajoutée à la facture",
];

const OWNERSHIP = [
  { service: "Nom de domaine (.ca / .com)", owner: "Vous, à la dénomination légale de votre entreprise", payer: "Votre carte", cost: "~20-25 $ / an" },
  { service: "Hébergement du site", owner: "Evoweb", payer: "Personne (inclus)", cost: "0 $" },
  { service: "Fiche Google Business", owner: "Vous", payer: "Personne (inclus)", cost: "0 $" },
];

const MAINTENANCE = {
  included: [
    "Jusqu'à 1 heure de modifications par mois",
    "Mises à jour techniques",
    "Petites corrections de textes et de photos",
  ],
  notIncluded: [
    "Nouvelles pages ou refonte du site",
    "Au-delà d'une heure : 45 $/h, toujours annoncé avant",
  ],
};

const TIMELINE = [
  {
    num: "01",
    title: "Appel de découverte : 15 minutes",
    desc: "On se parle au téléphone. Vous me racontez votre entreprise, je pose des questions. Aucune préparation de votre côté, aucun engagement.",
  },
  {
    num: "02",
    title: "Maquette gratuite",
    desc: "Je prépare une proposition visuelle avec vos vraies couleurs (celles de votre camion, de votre atelier, de votre local, jamais choisies au hasard dans une palette générique), vos photos quand elles s'y prêtent (sinon des images choisies pour vous représenter) et vos vrais avis Google. Présentée en direct, pas envoyée à froid par courriel. Elle reste à vous, même si vous n'allez pas plus loin.",
  },
  {
    num: "03",
    title: "Devis, puis contrat",
    desc: "Un devis d'une page qui reprend ce que vous m'avez dit, valide 7 jours (il peut être réactivé plus tard si le moment n'est pas bon). Si ça vous convient, un contrat en langage clair suit, pas en jargon d'avocat. Je vous lis à voix haute, avant la signature, ce qui n'est pas inclus, pour qu'il n'y ait pas de surprise.",
  },
  {
    num: "04",
    title: "Signature et dépôt (40 %)",
    desc: "Signature par un simple courriel de confirmation, ou une photo si vous préférez signer à la main. Le dépôt réserve votre place à mon calendrier : aucun travail ne commence avant qu'il soit reçu, et un reçu vous est envoyé le jour même. Je vous propose 2-3 noms de domaine déjà vérifiés disponibles (jamais une page blanche à remplir), puis on démarre avec ce que vous avez sous la main : vos heures, vos services en vrac, et si vous en avez, 5 à 10 photos prises au téléphone. Sinon, on choisit ensemble des images qui vous représentent bien.",
  },
  {
    num: "05",
    title: "Production : 2 à 3 semaines",
    desc: "Semaine 1 : votre identité visuelle et la maquette de la page d'accueil, que vous validez avant que je construise le reste (30 %). Semaine 2 : le site prend forme avec votre vrai contenu, un lien privé vous est envoyé pour le voir en cours de route. Semaine 3 : deux séries de modifications incluses, votre fiche Google, votre politique de confidentialité.",
  },
  {
    num: "06",
    title: "Mise en ligne et formation",
    desc: "Vous visitez le site fini sur un lien privé avant de payer le dernier versement (30 %). Jamais l'inverse. Puis on cherche votre entreprise sur Google, ensemble, sur votre téléphone : vous voyez votre fiche, vous touchez pour nous rejoindre (un appel, un message, une réservation, peu importe le moyen) et ça fonctionne, devant vous. C'est ce moment-là que je veux que vous viviez avant qu'on se quitte. Suivent 30 minutes de formation sur ce que vous voudrez changer vous-même, et une trousse complète : logos, couleurs, gabarits, guide écrit.",
  },
  {
    num: "07",
    title: "Suivi, 30 jours plus tard",
    desc: "Un appel pour voir comment ça se passe, avec de vrais chiffres de votre site. Les petits ajustements que vous n'osiez pas demander sont corrigés gratuitement. L'entretien mensuel est proposé une seule fois, sans insistance.",
  },
];

const TRUST = [
  {
    Icon: Wallet,
    title: "Vous ne payez jamais à l'aveugle",
    desc: "Trois versements, chacun lié à quelque chose que vous avez déjà vu : votre place réservée, votre design approuvé, votre site visité. Le dernier se paie avant la mise en ligne, jamais après.",
  },
  {
    Icon: Lock,
    title: "Je ne vois jamais votre mot de passe ni votre carte",
    desc: "Votre domaine et votre fiche Google sont créés avec votre courriel et votre carte, jamais les miens. J'ai un accès de gestion que vous pouvez retirer en deux clics, en tout temps.",
  },
  {
    Icon: FileText,
    title: "Un contrat écrit pour vous",
    desc: "Ce qui est inclus, ce qui ne l'est pas, les délais, ce qui se passe si vous partez : tout est en langage clair, et je vous en lis les points importants à voix haute avant que vous signiez.",
  },
  {
    Icon: LogOut,
    title: "Partir ne coûte rien",
    desc: "Votre domaine, votre fiche Google et votre contenu sont à votre nom dès le départ. Le site lui-même est construit et hébergé sur les systèmes d'Evoweb. Si un jour vous voulez travailler avec quelqu'un d'autre, je vous transfère l'accès complet et une copie exportée du site dans les 10 jours ouvrables, sans frais, pour repartir ailleurs.",
  },
  {
    Icon: ShieldCheck,
    title: "Conforme aux lois du Québec, dès le départ",
    desc: "Politique de confidentialité, mention légale sous le formulaire et site en français : inclus d'office sur les trois forfaits, jamais vendus en extra.",
  },
  {
    Icon: Receipt,
    title: "Aucune taxe, aucun montant surprise",
    desc: "Comme petit fournisseur, je ne charge ni TPS ni TVQ. C'est écrit sur chaque facture. Le seul montant qui revient chaque année est votre nom de domaine, payé directement au fournisseur, jamais à moi.",
  },
  {
    Icon: Camera,
    title: "Un visuel qui vous représente, peu importe ce que vous avez sous la main",
    desc: "Vos photos quand elles sont bonnes, des images de banque soigneusement choisies quand elles ne le sont pas, ou qu'il n'y en a pas encore. Vos vrais avis Google, vos vraies réponses à l'appel de découverte. Jamais un espace réservé oublié en ligne.",
  },
];

const FAQ = [
  {
    q: "Est-ce que je vais être « pris » avec vous ?",
    a: "Non. Le domaine et la fiche Google sont à votre nom dès le premier jour, et votre contenu vous appartient. Le site est construit et hébergé sur les systèmes d'Evoweb; si un jour vous voulez travailler avec quelqu'un d'autre, je vous transfère l'accès complet et une copie du site dans les 10 jours ouvrables, sans frais, pour repartir ailleurs.",
  },
  {
    q: "Un ami ou un neveu pourrait me faire ça moins cher, pourquoi pas lui ?",
    a: "C'est possible, et ça se peut que ce soit un bon choix. La différence se voit surtout dans six mois, s'il devient occupé : ici, il y a un contrat écrit, un échéancier et une facture. Et si un jour vous voulez que quelqu'un d'autre s'en occupe (lui ou n'importe qui), votre domaine et votre fiche Google sont déjà à votre nom, et je vous transfère le reste sans frais, c'est écrit au contrat.",
  },
  {
    q: "Qu'est-ce qui arrive si je n'aime pas le design ?",
    a: "L'appel et la maquette sont gratuits et sans engagement. Vous la gardez même si vous n'allez pas plus loin. Une fois le projet lancé, vous validez l'identité visuelle et la maquette de la page d'accueil avant que je construise le reste, puis deux séries de modifications sont incluses.",
  },
  {
    q: "De quoi avez-vous besoin de moi pour commencer ?",
    a: "Deux choses, envoyées quand ça vous adonne : vos heures d'ouverture exactes et la liste de vos services en vrac (je m'occupe de la mise en forme). Si vous avez 5 à 10 photos de votre local, prises au téléphone, tant mieux. Sinon, on choisit ensemble des images qui vous représentent bien. Le reste, je le complète avec vos avis Google et votre page Facebook.",
  },
  {
    q: "Y a-t-il des frais cachés ou un abonnement obligatoire ?",
    a: "Non. Le seul montant qui revient chaque année est votre nom de domaine (environ 25 $), payé directement au fournisseur. L'hébergement est inclus, sans abonnement. L'entretien mensuel est optionnel : si vous ne le prenez pas, le site continue de fonctionner pareil.",
  },
  {
    q: "Pourquoi c'est moins cher qu'une agence ?",
    a: "Je travaille seul, un projet à la fois, sans bureau ni vendeur à payer. Comme petit fournisseur, aucune taxe ne s'ajoute non plus à votre facture. Je suis aussi étudiant en informatique à l'Université Laval : ça explique le prix, pas la rigueur. Même contrat, même échéancier écrit, même sérieux.",
  },
  {
    q: "Le devis a-t-il une date d'expiration ?",
    a: "Oui, 7 jours, pas pour vous mettre de pression, mais pour qu'il y ait une date claire plutôt qu'un « on s'en reparle » qui traîne. S'il expire, il peut être réactivé plus tard, souvent au même prix.",
  },
  {
    q: "Combien de temps ça prend ?",
    a: "2 semaines pour Essentiel, 3 semaines pour Présence. Pour Sur mesure, ça dépend de ce qu'on construit (paiements, réservations, gestion de produits) : le délai est confirmé avec le devis.",
  },
  {
    q: "Est-ce que je vais pouvoir modifier mon site moi-même après ?",
    a: "Pour ce qui revient souvent (vos heures, une photo, un texte), oui : une formation de 30 minutes vous montre exactement comment, et vous repartez avec un guide écrit. Pour le reste, l'entretien mensuel existe justement pour ça.",
  },
  {
    q: "Mon site va-t-il être conforme aux lois du Québec ?",
    a: "Oui, sur les trois forfaits. La Loi 25 (renseignements personnels) et la Loi 96 (langue française) s'appliquent dès qu'un site a un formulaire de contact, donc à peu près tout le monde. Politique de confidentialité et site en français sont inclus d'office.",
  },
  {
    q: "Comment je paie, et est-ce sécuritaire ?",
    a: "En trois versements liés à ce que vous voyez : 40 % à la signature, 30 % quand vous approuvez le design fini, 30 % avant que le site devienne public. Par virement Interac (aucuns frais) ou par carte via une facture Stripe sécurisée (des frais de 2,9 % + 0,30 $ s'appliquent si vous choisissez cette option). Je ne vois et ne conserve jamais votre numéro de carte.",
  },
];

const QUICK_NAV: [string, string][] = [
  ["#plans", "Forfaits"],
  ["#extras-detail", "Extras"],
  ["#entretien", "Entretien"],
  ["#comment", "Comment je travaille"],
  ["#confiance", "Confiance & sécurité"],
  ["#faq", "Questions fréquentes"],
  ["#forfaits-contact", "Contact"],
];

// Rend le **texte** entre doubles astérisques en gras — utilisé pour
// souligner l'héritage entre paliers dans les bullets "Concrètement".
function renderBold(text: string) {
  return text.split(/\*\*(.*?)\*\*/g).map((part, i) =>
    i % 2 === 1 ? <strong key={i} className="font-semibold" style={{ color: "inherit" }}>{part}</strong> : part
  );
}

// Ce que chaque palier ajoute par-dessus le précédent, en toutes lettres —
// pour que l'héritage entre forfaits soit explicite dans "Ce qui est inclus".
const INHERITS_NOTE: Record<string, string> = {
  presence: "Tout ce qu'il y a dans Essentiel, plus :",
  "sur-mesure": "Tout ce qu'il y a dans Présence (et donc Essentiel aussi), plus :",
};

function FaqItem({ q, a, border, text, muted, accentText }: {
  q: string; a: string; border: string; text: string; muted: string; accentText: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: `1px solid ${border}` }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 py-6 text-left"
        aria-expanded={open}
      >
        <span className="font-display font-semibold text-base sm:text-lg" style={{ color: text }}>
          {q}
        </span>
        <ChevronDown
          className="h-5 w-5 flex-shrink-0 transition-transform duration-200"
          style={{ color: accentText, transform: open ? "rotate(180deg)" : "none" }}
        />
      </button>
      {open && (
        <p className="text-sm leading-relaxed pb-6 pr-8 max-w-2xl" style={{ color: muted }}>
          {a}
        </p>
      )}
    </div>
  );
}

export default function Forfaits() {
  const { isDark } = useTheme();
  const T = tokensFor(isDark);

  useEffect(() => {
    document.title = "Forfaits en détail : Evoweb";
  }, []);

  const bg = T.canvas;
  const text = T.textPrimary;
  const muted = T.textMuted;
  const border = T.borderDefault;
  const accentText = T.textAccent;

  const scrollToContact = () => {
    document.getElementById("forfaits-contact")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      className="min-h-screen overflow-x-hidden font-body transition-colors duration-300"
      style={{ background: bg, color: text }}
    >
      <SiteHeader variant="subpage" />

      <div className="container mx-auto px-6 pt-36 pb-16 max-w-4xl">
        <span className="label mb-6 block">— Forfaits en détail</span>
        <h1
          className="font-display font-extrabold text-3xl sm:text-5xl mb-6 leading-tight"
          style={{ color: text }}
        >
          Tout ce qu'il y a à savoir, avant de décider
        </h1>
        <p className="text-base sm:text-lg leading-relaxed max-w-2xl mb-10" style={{ color: muted }}>
          Cette page existe pour que vous n'ayez pas à deviner. Ce qui est inclus, ce qui ne l'est
          pas, comment ça se déroule, comment vous êtes protégé, et les questions qu'on me pose le
          plus souvent. S'il en manque une, écrivez-moi. Je préfère que tout soit clair avant que vous
          signiez!
        </p>

        <nav
          className="flex flex-wrap gap-x-6 gap-y-2 mb-20 pb-8"
          style={{ borderBottom: `1px solid ${border}` }}
        >
          {QUICK_NAV.map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="text-sm font-medium transition-opacity hover:opacity-70"
              style={{ color: accentText }}
            >
              {label}
            </a>
          ))}
        </nav>

        {/* ── FORFAITS ──────────────────────────────────────────── */}
        <section id="plans" className="mb-24 scroll-mt-24">
          <h2 className="font-display font-bold text-2xl sm:text-3xl mb-10" style={{ color: text }}>
            Les 3 forfaits
          </h2>

          <div className="mb-10 p-6 sm:p-8" style={{ background: T.surface }}>
            <h3 className="font-display font-bold text-lg mb-2" style={{ color: text }}>
              Sur les trois forfaits, sans exception
            </h3>
            <p className="text-sm leading-relaxed mb-5" style={{ color: muted }}>
              Avant même de comparer les forfaits ci-dessous : voici ce qui est acquis peu importe
              celui que vous choisissez.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
              {ALWAYS_INCLUDED.map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm" style={{ color: muted }}>
                  <span style={{ color: accentText }}>—</span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            {PRICING.map((tier) => (
              <motion.div
                key={tier.slug}
                id={tier.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="p-6 sm:p-8 scroll-mt-24"
                style={{ border: `1px solid ${border}` }}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="font-mono text-xs uppercase tracking-wider" style={{ color: accentText }}>
                      {tier.num}
                    </span>
                    <h3 className="font-display font-bold text-2xl" style={{ color: text }}>
                      {tier.name}
                    </h3>
                    {tier.badge && (
                      <span
                        className="text-xs font-mono uppercase tracking-wider px-2 py-0.5"
                        style={{ background: T.accent, color: T.onAccent }}
                      >
                        {tier.badge}
                      </span>
                    )}
                  </div>
                  <div className="sm:text-right flex-shrink-0">
                    <div className="font-display font-extrabold text-2xl sm:text-3xl leading-none" style={{ color: text }}>
                      {tier.price}
                    </div>
                    <div className="text-xs font-mono mt-1" style={{ color: muted }}>
                      Délai : {tier.delay}
                    </div>
                  </div>
                </div>

                <p className="text-sm sm:text-base leading-relaxed mb-1 max-w-2xl" style={{ color: muted }}>
                  {tier.desc}
                </p>
                <p className="text-xs font-medium mb-6" style={{ color: accentText }}>
                  {IDEAL_FOR[tier.slug]}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 sm:gap-14 mb-6">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider block mb-3" style={{ color: text }}>
                      Concrètement
                    </span>
                    <div className="space-y-2">
                      {CONCRETE[tier.slug].map((c) => (
                        <div key={c} className="flex items-start gap-2 text-sm leading-relaxed" style={{ color: muted }}>
                          <span className="flex-shrink-0" style={{ color: accentText }}>—</span>
                          <span>{renderBold(c)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-5 sm:p-6" style={{ background: T.surface }}>
                    <span className="text-xs font-semibold uppercase tracking-wider block mb-3" style={{ color: text }}>
                      Ce qui est inclus
                    </span>
                    {INHERITS_NOTE[tier.slug] && (
                      <p className="text-sm font-semibold mb-3" style={{ color: text }}>
                        {INHERITS_NOTE[tier.slug]}
                      </p>
                    )}
                    <div className="space-y-2">
                      {(() => {
                        const prevIndex = PRICING.findIndex((t) => t.slug === tier.slug) - 1;
                        const prevFeatures = prevIndex >= 0 ? PRICING[prevIndex].features : [];
                        const shownFeatures = tier.features.filter((f) => !prevFeatures.includes(f));
                        return shownFeatures.map((f) => (
                          <div key={f} className="text-sm" style={{ color: muted }}>
                            — {f}
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                </div>

                <button
                  onClick={scrollToContact}
                  className="inline-flex items-center gap-2 text-sm font-semibold transition-all duration-200 hover:gap-4"
                  style={{ color: accentText }}
                >
                  Démarrer avec {tier.name}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 p-6 sm:p-8" style={{ border: `1px solid ${border}` }}>
            <h3 className="font-display font-bold text-lg mb-2" style={{ color: text }}>
              Ce qui n'est pas inclus
            </h3>
            <p className="text-sm leading-relaxed mb-5" style={{ color: muted }}>
              Dit clairement, tout de suite, pour qu'il n'y ait de surprise ni d'un bord ni de l'autre.
            </p>
            <div className="space-y-3">
              {NOT_INCLUDED.map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm leading-relaxed" style={{ color: muted }}>
                  <span className="flex-shrink-0" style={{ color: accentText }}>—</span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── EXTRAS ───────────────────────────────────────── */}
        <section id="extras-detail" className="mb-24 scroll-mt-24">
          <h2 className="font-display font-bold text-2xl sm:text-3xl mb-3" style={{ color: text }}>
            Les extras
          </h2>
          <p className="text-sm sm:text-base leading-relaxed max-w-2xl mb-10" style={{ color: muted }}>
            Le détail technique de chaque extra, si vous voulez creuser avant de décider.
            S'ajoutent à n'importe lequel des 3 forfaits. Prix fixe, une seule fois : jamais un
            abonnement caché.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {ADDONS.map((addon) => (
              <div key={addon.num} className="p-6 flex flex-col gap-3" style={{ border: `1px solid ${border}` }}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs uppercase tracking-wider" style={{ color: accentText }}>
                      {addon.num}
                    </span>
                    <h3 className="font-display font-semibold text-base" style={{ color: text }}>
                      {addon.title}
                    </h3>
                  </div>
                  <span
                    className="font-mono text-xs font-bold px-2 py-1 flex-shrink-0"
                    style={{ background: T.accent, color: T.onAccent }}
                  >
                    {addon.price}
                  </span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: muted }}>
                  {addon.desc}
                </p>
                <p
                  className="text-[11px] leading-relaxed pt-3"
                  style={{ color: muted, borderTop: `1px solid ${border}` }}
                >
                  {addon.note}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── ENTRETIEN MENSUEL ─────────────────────────────────── */}
        <section id="entretien" className="mb-24 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="font-display font-bold text-2xl sm:text-3xl mb-3" style={{ color: text }}>
                Entretien mensuel
              </h2>
              <p className="text-sm sm:text-base leading-relaxed max-w-xl" style={{ color: muted }}>
                Optionnel, proposé une seule fois à la livraison, sans insistance. Si vous ne le
                prenez pas, le site continue de fonctionner exactement pareil.
              </p>
            </div>
            <div className="font-display font-extrabold text-2xl sm:text-3xl flex-shrink-0" style={{ color: text }}>
              75 $/mois
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2" style={{ border: `1px solid ${border}` }}>
            <div className="p-6 sm:p-8" style={{ borderBottom: `1px solid ${border}` }}>
              <span className="text-xs font-semibold uppercase tracking-wider block mb-4" style={{ color: accentText }}>
                Inclus
              </span>
              <div className="space-y-2">
                {MAINTENANCE.included.map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm" style={{ color: muted }}>
                    <span style={{ color: accentText }}>—</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div
              className="p-6 sm:p-8"
              style={{ borderBottom: `1px solid ${border}`, borderLeft: `1px solid ${border}` }}
            >
              <span className="text-xs font-semibold uppercase tracking-wider block mb-4" style={{ color: text }}>
                Pas inclus
              </span>
              <div className="space-y-2">
                {MAINTENANCE.notIncluded.map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm" style={{ color: muted }}>
                    <span style={{ color: muted }}>—</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── COMMENT JE TRAVAILLE ──────────────────────────────── */}
        <section id="comment" className="mb-24 scroll-mt-24">
          <h2 className="font-display font-bold text-2xl sm:text-3xl mb-10" style={{ color: text }}>
            Comment je travaille
          </h2>
          <div className="space-y-8">
            {TIMELINE.map((step) => (
              <div key={step.num} className="flex gap-6">
                <span className="font-mono text-sm flex-shrink-0 w-6 pt-1" style={{ color: accentText }}>
                  {step.num}
                </span>
                <div className="pb-2 pl-6" style={{ borderLeft: `1px solid ${border}` }}>
                  <h3 className="font-display font-semibold text-lg mb-2" style={{ color: text }}>
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed max-w-2xl" style={{ color: muted }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CONFIANCE & SÉCURITÉ ──────────────────────────────── */}
        <section id="confiance" className="mb-24 scroll-mt-24">
          <h2 className="font-display font-bold text-2xl sm:text-3xl mb-3" style={{ color: text }}>
            Confiance & sécurité
          </h2>
          <p className="text-sm sm:text-base leading-relaxed max-w-2xl mb-10" style={{ color: muted }}>
            Les questions qu'on ne pense pas toujours à poser, mais qui comptent le plus.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px mb-10" style={{ background: border }}>
            {TRUST.map(({ Icon, title, desc }) => (
              <div key={title} className="p-6 sm:p-8 flex flex-col gap-3" style={{ background: bg }}>
                <Icon className="h-5 w-5" style={{ color: accentText }} />
                <h3 className="font-display font-semibold text-base" style={{ color: text }}>
                  {title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: muted }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>

          <h3 className="font-display font-bold text-lg mb-4" style={{ color: text }}>
            Qui possède quoi
          </h3>
          <div style={{ border: `1px solid ${border}` }}>
            <div
              className="hidden sm:grid sm:grid-cols-4 gap-4 px-6 py-3"
              style={{ borderBottom: `1px solid ${border}`, background: T.surface }}
            >
              {["Service", "À qui", "Payé par", "Coût réel"].map((h) => (
                <span key={h} className="text-xs font-semibold uppercase tracking-wider" style={{ color: text }}>
                  {h}
                </span>
              ))}
            </div>
            {OWNERSHIP.map((row, i) => (
              <div
                key={row.service}
                className="grid grid-cols-1 sm:grid-cols-4 gap-1 sm:gap-4 px-6 py-4"
                style={{ borderBottom: i < OWNERSHIP.length - 1 ? `1px solid ${border}` : "none" }}
              >
                <span className="text-sm font-semibold sm:font-medium" style={{ color: text }}>
                  {row.service}
                </span>
                <span className="text-sm" style={{ color: muted }}>
                  <span className="sm:hidden font-semibold" style={{ color: text }}>À qui : </span>
                  {row.owner}
                </span>
                <span className="text-sm" style={{ color: muted }}>
                  <span className="sm:hidden font-semibold" style={{ color: text }}>Payé par : </span>
                  {row.payer}
                </span>
                <span className="text-sm font-mono" style={{ color: accentText }}>
                  <span className="sm:hidden font-semibold font-sans" style={{ color: text }}>Coût : </span>
                  {row.cost}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 p-6 sm:p-8 flex gap-4" style={{ border: `1px solid ${T.warning}` }}>
            <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: T.warning }} />
            <div>
              <h4 className="font-display font-semibold text-base mb-2" style={{ color: text }}>
                Un avertissement qui peut vous éviter une arnaque
              </h4>
              <p className="text-sm leading-relaxed" style={{ color: muted }}>
                Le seul montant qui revient chaque année est le renouvellement de votre domaine. Si
                vous recevez un courriel qui vous demande de payer pour votre domaine et qu'il ne
                vient pas exactement de votre fournisseur (indiqué dans votre document « Vos
                accès »), ne payez pas : c'est une fraude très répandue chez les petites
                entreprises. Transférez-le-moi avant de payer quoi que ce soit, je vous confirme en
                deux minutes.
              </p>
            </div>
          </div>
        </section>

        {/* ── FAQ ───────────────────────────────────────────────── */}
        <section id="faq" className="mb-24 scroll-mt-24">
          <h2 className="font-display font-bold text-2xl sm:text-3xl mb-10" style={{ color: text }}>
            Questions fréquentes
          </h2>
          <div style={{ borderTop: `1px solid ${border}` }}>
            {FAQ.map((item) => (
              <FaqItem
                key={item.q}
                q={item.q}
                a={item.a}
                border={border}
                text={text}
                muted={muted}
                accentText={accentText}
              />
            ))}
          </div>
        </section>

        {/* ── CONTACT ───────────────────────────────────────────── */}
        <section id="forfaits-contact" className="scroll-mt-24">
          <div className="p-8 sm:p-12" style={{ border: `1px solid ${border}` }}>
            <h2 className="font-display font-bold text-2xl sm:text-3xl mb-3" style={{ color: text }}>
              Prêt à commencer ?
            </h2>
            <p className="text-sm sm:text-base leading-relaxed max-w-xl mb-8" style={{ color: muted }}>
              Qu'on se soit déjà parlé ou non, voici comment démarrer : un message, et je vous
              réponds pour fixer un appel de 15 minutes, sans frais ni engagement.
            </p>
            <div className="max-w-xl">
              <ContactForm />
            </div>
          </div>
        </section>
      </div>

      <SiteFooter />
    </div>
  );
}
