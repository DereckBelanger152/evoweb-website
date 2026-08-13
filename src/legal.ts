// Identité légale d'Evoweb, affichée au pied de page et sur la page de
// confidentialité. La dénomination doit correspondre exactement au Registraire
// des entreprises du Québec, pas au nom commercial.
//
// `name` et `phone` sont aussi recopiés en tête de api/contact.ts : une fonction
// serverless ne peut rien importer hors de api/ (voir le commentaire là-bas).
// Les modifier ici implique de les modifier là aussi.
//
// L'adresse courriel n'est volontairement pas ici : elle vivrait en clair dans
// le lot JS, exploitable par n'importe quel moissonneur. Utiliser
// <ObfuscatedEmail /> partout où l'adresse doit être affichée.
export const LEGAL = {
  name: "Dereck Bélanger",
  neq: "2280738990",
  city: "Québec, QC",
  phone: "5813086181",
  // Personne responsable de la protection des renseignements personnels (Loi 25).
  privacyOfficer: "Dereck Bélanger",
  privacyUpdatedAt: "12 août 2026",
} as const;
