import { useTheme } from "./ThemeContext";
import { LEGAL } from "./legal";
import { tokensFor } from "./tokens";

type Section = { title: string; body: string[] };

const SECTIONS: Section[] = [
  {
    title: "Responsable de la protection des renseignements personnels",
    body: [
      `${LEGAL.privacyOfficer}, propriétaire d'Evoweb, agit comme responsable de la protection des renseignements personnels.`,
      `Vous pouvez le joindre à ${LEGAL.email} pour toute question, ou pour une demande d'accès, de rectification ou de retrait de vos renseignements.`,
    ],
  },
  {
    title: "Quels renseignements sont recueillis",
    body: [
      "Par le formulaire de contact : votre nom, votre adresse courriel et le contenu de votre message. Ces renseignements sont fournis volontairement par vous.",
      "Dans le cadre d'un mandat : les renseignements nécessaires à l'exécution du contrat et à la facturation, soit le nom de l'entreprise, ses coordonnées et le nom de la personne responsable.",
      "Statistiques de visite : ce site utilise Vercel Analytics, un outil de mesure d'achalandage qui ne dépose aucun témoin et ne permet pas de vous identifier personnellement. Les données recueillies sont agrégées.",
      "Ce site n'utilise aucun témoin publicitaire et ne fait aucun suivi publicitaire.",
    ],
  },
  {
    title: "Pourquoi ils sont recueillis",
    body: [
      "Pour répondre à votre demande, préparer une soumission, exécuter un mandat, produire la facturation et tenir les livres comptables, et comprendre l'achalandage du site afin de l'améliorer.",
      "Vos renseignements ne sont utilisés à aucune autre fin. Ils ne sont jamais vendus, loués ni échangés.",
    ],
  },
  {
    title: "À qui ils sont communiqués",
    body: [
      "Evoweb ne communique aucun renseignement personnel à des tiers, sauf aux fournisseurs nécessaires au fonctionnement du site et de l'entreprise : EmailJS pour la transmission des messages du formulaire, Vercel pour l'hébergement et les statistiques, et Stripe pour le traitement des paiements par carte.",
      "Ces fournisseurs peuvent traiter ou héberger des données à l'extérieur du Québec, notamment aux États-Unis. Ils sont soumis à leurs propres engagements de confidentialité et de sécurité. En communiquant avec Evoweb par le formulaire, vous consentez à ce que votre message transite par ces services.",
    ],
  },
  {
    title: "Combien de temps ils sont conservés",
    body: [
      "Les demandes sans suite sont conservées 12 mois, puis supprimées.",
      "Les dossiers de clients sont conservés 7 ans après la fin du mandat, tel que l'exigent les obligations fiscales.",
      "Les statistiques de visite sont agrégées et ne font l'objet d'aucune conservation individuelle.",
    ],
  },
  {
    title: "Comment ils sont protégés",
    body: [
      "L'accès est limité à la seule personne responsable. Les comptes sont protégés par une authentification à deux facteurs et le site est servi en HTTPS.",
      "Aucun renseignement bancaire ni de carte de crédit n'est conservé par Evoweb. Les paiements par carte sont traités directement par Stripe.",
    ],
  },
  {
    title: "Vos droits",
    body: [
      "Vous pouvez en tout temps demander à consulter les renseignements détenus à votre sujet, les faire corriger s'ils sont inexacts, en demander la suppression sous réserve des obligations légales de conservation, ou retirer votre consentement.",
      `Les demandes sont traitées dans un délai maximal de 30 jours. Écrivez à ${LEGAL.email}.`,
      "Vous pouvez également porter plainte auprès de la Commission d'accès à l'information du Québec.",
    ],
  },
  {
    title: "Incident de confidentialité",
    body: [
      "En cas d'incident présentant un risque de préjudice sérieux, Evoweb en avise sans délai les personnes concernées ainsi que la Commission d'accès à l'information, et consigne l'incident dans un registre.",
    ],
  },
  {
    title: "Modifications",
    body: [
      "Toute modification à cette politique est publiée sur cette page, avec une date de mise à jour révisée.",
    ],
  },
];

export default function Confidentialite() {
  const { isDark } = useTheme();
  const T = tokensFor(isDark);
  const bg = T.canvas;
  const text = T.textPrimary;
  const muted = T.textMuted;
  const border = T.borderDefault;

  return (
    <div
      className="min-h-screen font-body transition-colors duration-300"
      style={{ background: bg, color: text }}
    >
      <div className="container mx-auto px-6 py-20 sm:py-28 max-w-3xl">
        <a
          href="/"
          className="text-sm inline-flex items-center gap-2 mb-16 transition-opacity hover:opacity-70"
          style={{ color: T.textAccent }}
        >
          ← Retour à evoweb.ca
        </a>

        <h1
          className="font-display font-extrabold text-3xl sm:text-5xl mb-4 leading-tight"
          style={{ color: text }}
        >
          Politique de confidentialité
        </h1>
        <p className="text-sm mb-12" style={{ color: muted }}>
          Dernière mise à jour : {LEGAL.privacyUpdatedAt}
        </p>

        <p className="text-base leading-relaxed mb-16" style={{ color: muted }}>
          Evoweb ({LEGAL.name}, NEQ {LEGAL.neq}) s'engage à protéger les renseignements
          personnels qui lui sont confiés. Cette page explique quels renseignements sont
          recueillis, pourquoi, et ce que vous pouvez exiger à leur sujet.
        </p>

        <div className="space-y-12">
          {SECTIONS.map((section) => (
            <section key={section.title}>
              <h2
                className="font-display font-bold text-lg sm:text-xl mb-4 pb-3"
                style={{ color: text, borderBottom: `1px solid ${border}` }}
              >
                {section.title}
              </h2>
              <div className="space-y-3">
                {section.body.map((paragraph, i) => (
                  <p key={i} className="text-sm leading-relaxed" style={{ color: muted }}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-20 pt-8 text-sm" style={{ borderTop: `1px solid ${border}`, color: muted }}>
          <p className="font-semibold mb-1" style={{ color: text }}>
            {LEGAL.name}
          </p>
          <p>faisant affaire sous le nom Evoweb</p>
          <p>NEQ {LEGAL.neq}</p>
          <p>{LEGAL.city}</p>
          <p>{LEGAL.email}</p>
        </div>
      </div>
    </div>
  );
}
