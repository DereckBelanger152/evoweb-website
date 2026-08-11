// Données des forfaits, extras et étapes — source unique, consommée par
// App.tsx (page d'accueil) et Forfaits.tsx (page de détail /forfaits).
// Ne pas dupliquer ces tableaux ailleurs : c'est exactement le genre de copie
// qui a fait dériver les tokens de couleur avant qu'ils soient centralisés
// dans tokens.ts. Figma « Evoweb design system » reste la source visuelle.

export type PricingTier = {
  slug: string;
  num: string;
  name: string;
  desc: string;
  features: string[];
  price: string;
  delay: string;
  badge: string | null;
};

export const PRICING: PricingTier[] = [
  {
    slug: "essentiel",
    num: "01",
    name: "Essentiel",
    desc: "Une page complète et votre fiche Google, pour que vos clients vous trouvent et vous appellent.",
    features: [
      "Site vitrine",
      "Fiche Google Business",
      "Formulaire de contact",
      "Hébergement",
    ],
    price: "750 $",
    delay: "2 semaines",
    badge: null,
  },
  {
    slug: "presence",
    num: "02",
    name: "Présence",
    desc: "Votre identité au complet : un logo, vos couleurs, votre site et vos gabarits pour Facebook.",
    features: [
      "Site vitrine",
      "Fiche Google Business",
      "Formulaire de contact",
      "Hébergement",
      "Logo, couleurs et polices",
      "3 gabarits pour vos réseaux",
      "Formation de 30 minutes",
    ],
    price: "1 200 $",
    delay: "3 semaines",
    badge: "Le plus choisi",
  },
  {
    slug: "sur-mesure",
    num: "03",
    name: "Sur mesure",
    desc: "Tout ce qu'il y a dans Présence, avec la vente en ligne, les réservations ou la gestion de produits ajoutées par-dessus.",
    features: [
      "Site vitrine",
      "Fiche Google Business",
      "Formulaire de contact",
      "Hébergement",
      "Logo, couleurs et polices",
      "3 gabarits pour vos réseaux",
      "Formation de 30 minutes",
      "Paiements en ligne",
      "Gestion produits/commandes",
    ],
    price: "dès 2 000 $",
    delay: "Sur devis",
    badge: null,
  },
];

export type Addon = {
  num: string;
  title: string;
  price: string;
  image: string;
  alt: string;
  pitch: string;
  desc: string;
  note: string;
};

// Extras à la carte : prix fixe, s'ajoutent à n'importe quel forfait
// ci-dessus. Ce ne sont pas des forfaits — juste des blocs optionnels.
export const ADDONS: Addon[] = [
  {
    num: "01",
    title: "Configuration Meta Ads",
    price: "175 $",
    image: "/meta-ads.webp",
    alt: "Configuration de publicité Facebook et Instagram",
    pitch:
      "Le référencement naturel prend des mois à porter fruit. Une campagne Meta peut vous amener des visiteurs dès le lendemain du lancement.",
    desc: "Installation d'un pixel de suivi (un outil discret qui indique à Facebook qui visite votre site, pour lui remontrer vos publicités plus tard ou trouver des gens qui vous ressemblent), puis structure de votre première campagne, prête à lancer sur Facebook et Instagram.",
    note: "Accès donné par gestionnaire d'entreprise, je ne vois jamais votre mot de passe. Budget publicitaire et gestion continue non inclus.",
  },
  {
    num: "02",
    title: "Carte d'affaires (design)",
    price: "75 $",
    image: "/business-cards.webp",
    alt: "Design de carte d'affaires recto-verso",
    pitch: "Votre identité visuelle, dans leur poche.",
    desc: "Design recto-verso à votre image, livré dans un format professionnel prêt à envoyer directement à l'imprimeur, sans les surprises de rognage ou de qualité qu'un fichier fait maison peut causer.",
    note: "Design seulement. L'impression se fait chez l'imprimeur de votre choix.",
  },
  {
    num: "03",
    title: "Gabarits réseaux sociaux additionnels",
    price: "100 $",
    image: "/social-media-templates.webp",
    alt: "Gabarits supplémentaires pour réseaux sociaux",
    pitch:
      "De quoi publier pendant des mois sans rouvrir un logiciel de design.",
    desc: "5 images supplémentaires, prêtes à publier, à vos couleurs et avec votre contenu déjà intégré, en plus des 3 déjà incluses au forfait Présence.",
    note: "Images finales, prêtes à publier telles quelles, pas des gabarits que vous modifiez vous-même. Pour du contenu en continu, c'est un service différent (gestion de réseaux sociaux). On en reparle si le besoin est là.",
  },
  {
    num: "04",
    title: "SEO local avancé",
    price: "150 $",
    image: "/advanced-seo.webp",
    alt: "Référencement local avancé",
    pitch:
      'Une recherche Google sur deux est locale : "plombier près de moi", "resto à Québec". Si vous n\'êtes pas configuré pour ça, vous êtes invisible au moment exact où quelqu\'un vous cherche.',
    desc: "Configuration de Google Search Console et Analytics (pour voir qui vous trouve et comment), mots-clés locaux ciblés, inscription dans les répertoires qui comptent (Pages Jaunes, chambre de commerce, annuaires de votre secteur), données structurées pour que Google comprenne exactement ce que vous offrez et où, et une base pour être trouvé par les outils de recherche IA (ChatGPT, Perplexity, Gemini, etc.), pas seulement la recherche Google classique.",
    note: "Le forfait inclut déjà une base solide (structure propre, site rapide, balises de base) qui permet à un moteur de recherche de vous lire. Ceci va plus loin : ça travaille activement à vous faire apparaître dans les résultats, pas juste à être techniquement lisible.",
  },
  {
    num: "05",
    title: "Infolettre : mise en place",
    price: "100 $",
    image: "/mailchimp.webp",
    alt: "Configuration d'infolettre courriel",
    pitch:
      "Arrêtez de perdre vos visiteurs une fois qu'ils quittent votre site.",
    desc: "Une infolettre, c'est une liste de courriels de vos clients et visiteurs à qui vous pouvez écrire en un clic (une promo, une nouveauté, un rappel), sans dépendre des algorithmes de Facebook ou Instagram pour être vu. Contrairement à une publication qui disparaît du fil en quelques heures, un courriel arrive directement dans leur boîte de réception. Je configure la plateforme (Brevo ou Mailchimp), le formulaire d'inscription sur votre site, et un premier gabarit de courriel prêt à envoyer.",
    note: "Accès donné comme collaborateur, je ne vois jamais votre mot de passe, retirable en tout temps.",
  },
];

// Les 4 étapes montrées dans la section « Comment ça marche » de la page
// d'accueil (version courte — la version longue est sur /forfaits).
export const PROCESS = [
  {
    num: "01",
    title: "Un appel de 15 minutes",
    desc: "Vous me parlez de votre entreprise. Aucune préparation de votre part, aucun engagement.",
  },
  {
    num: "02",
    title: "Une maquette gratuite",
    desc: "Je vous prépare une proposition avec vos vraies couleurs et vos vraies photos. Elle est à vous, même si vous n'allez pas plus loin.",
  },
  {
    num: "03",
    title: "Un prix fixe, écrit",
    desc: "Un devis d'une page, un contrat professionnel, trois versements. Je fonctionne aux pratiques standards et reconnues dans l'industrie du web. Vous savez exactement ce que ça coûte avant même de commencer.",
  },
  {
    num: "04",
    title: "En ligne en 3 semaines",
    desc: "Vos comptes sont créés à votre nom. Tout vous appartient à la fin, c'est écrit au contrat, vous n'êtes jamais obligé de refaire affaire avec moi après, ni de me garder comme développeur. Aucun engagement caché.",
  },
];
