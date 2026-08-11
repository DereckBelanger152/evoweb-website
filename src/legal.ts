// Identité légale d'Evoweb, affichée au pied de page, sur la page de
// confidentialité et sur les documents générés.
//
// À REMPLIR : remplace `name` et `neq` par les valeurs exactes du Registraire
// des entreprises du Québec. La dénomination légale doit être écrite comme au
// registre, pas comme le nom commercial.
// `name` et `phone` sont aussi recopiés en tête de api/contact.ts : une
// fonction serverless ne peut rien importer hors de api/ (voir le commentaire
// là-bas). Les modifier ici implique de les modifier là aussi.
// L'adresse courriel n'est volontairement pas ici : elle vivrait en clair
// dans le bundle JS, exploitable par n'importe quel moissonneur de
// courriels. Utiliser le composant <ObfuscatedEmail /> partout où l'adresse
// doit être affichée — voir src/ObfuscatedEmail.tsx.
export const LEGAL = {
  name: "Dereck Bélanger",
  neq: "2280738990",
  city: "Québec, QC",
  phone: "5813086181",
  // Personne responsable de la protection des renseignements personnels (Loi 25).
  privacyOfficer: "Dereck Bélanger",
  privacyUpdatedAt: "10 août 2026",
} as const;
