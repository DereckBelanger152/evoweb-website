// Pont vers la balise Google Ads chargée par index.html.
//
// Google fournit son extrait d'événement sous forme de <script> à coller dans
// le <head>. Tel quel, il ne convient pas ici : ce site est une application
// d'une seule page, donc un script placé dans le <head> s'exécute au
// chargement, et Google enregistrerait une conversion pour chaque visiteur
// plutôt que pour chaque formulaire envoyé. Le coût par conversion affiché
// dans Google Ads deviendrait fictif, et les enchères automatiques
// optimiseraient à partir de ce chiffre. L'événement est donc déclenché
// depuis le code, sur la réponse favorable du serveur.
//
// Passer par le lot JavaScript évite au passage une seconde empreinte SHA-256
// dans la politique de sécurité du contenu : le lot est servi par ce domaine,
// donc déjà couvert par `script-src 'self'`.

declare global {
  interface Window {
    // Optionnelle : la fonction est définie par gtag.js, que les bloqueurs de
    // publicités et les extensions de confidentialité empêchent couramment de
    // se charger. Ce n'est pas un cas d'erreur — un visiteur qui refuse le
    // suivi doit pouvoir envoyer le formulaire normalement.
    gtag?: (...args: unknown[]) => void;
  }
}

// Identifiant de l'action de conversion « Envoi de formulaire de lead »,
// fourni par l'interface Google Ads. Le fragment après la barre oblique est
// propre à cette action : le réutiliser pour une autre conversion les
// confondrait dans les rapports.
const LEAD_CONVERSION = "AW-18386837113/lgjrCJqr5eAcEPm8w79E";

export function reportLeadConversion() {
  window.gtag?.("event", "conversion", { send_to: LEAD_CONVERSION });
}
