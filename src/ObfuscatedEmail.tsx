import { useState } from "react";

// L'adresse de contact n'existe nulle part en clair, ni dans ce fichier ni dans
// le lot JS produit : elle est stockée en codes de caractères et n'est
// assemblée en mémoire qu'au moment d'un vrai clic. Un moissonneur qui fouille
// le HTML statique ou le JS compilé à la recherche d'un motif d'adresse (regex,
// mailto:) ne trouve donc rien — ce qui couvre l'écrasante majorité des robots
// qui alimentent les listes de pourriel.
//
// Ce n'est pas étanche face à un robot qui exécuterait le JS ET simulerait un
// clic ; rien de purement côté navigateur ne peut l'être tout en restant
// lisible par un humain.
const LOCAL_PART = [99, 111, 110, 116, 97, 99, 116];
const DOMAIN_PART = [101, 118, 111, 119, 101, 98, 46, 99, 97];

const decode = (codes: number[]) => String.fromCharCode(...codes);

// Avant le clic : un bouton à l'apparence d'un lien, sans adresse dans le DOM.
// Après le clic : un vrai lien mailto, cliquable et copiable comme un autre.
export default function ObfuscatedEmail({ className = "" }: { className?: string }) {
  const [address, setAddress] = useState<string | null>(null);

  if (address) {
    return (
      <a href={`mailto:${address}`} className={className}>
        {address}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setAddress(`${decode(LOCAL_PART)}@${decode(DOMAIN_PART)}`)}
      className={`bg-transparent border-0 p-0 m-0 text-inherit font-[inherit] cursor-pointer underline decoration-dotted underline-offset-2 hover:opacity-70 transition-opacity ${className}`}
    >
      Afficher l'adresse courriel
    </button>
  );
}
