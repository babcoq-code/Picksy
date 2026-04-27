import type { SiteConfig } from "@/types"

export type LegalPage = {
  title: string;
  href: string;
  emoji?: string;
};

export const legalPages: LegalPage[] = [
  { title: "Mentions légales", href: "/mentions-legales", emoji: "⚖️" },
  { title: "Politique de confidentialité", href: "/politique-confidentialite", emoji: "🔒" },
  { title: "Cookies", href: "/cookies", emoji: "🍪" },
  { title: "Affiliation", href: "/affiliation", emoji: "🤝" },
  { title: "Méthodologie", href: "/methodologie", emoji: "📊" },
  { title: "À propos", href: "/a-propos", emoji: "ℹ️" },
];

export const siteConfig: SiteConfig = {
  name: "Troviio",
  slogan: "C'est l'objet qui s'adapte à TOI, pas l'inverse",
  description:
    "Troviio est un comparateur intelligent de produits maison. L'IA analyse des centaines de sources techniques pour vous recommander le produit parfait pour vos besoins.",
  url: "https://picksy.babcoq.tech",
  ogImage: "https://picksy.babcoq.tech/og-image.png",

  // === Informations éditeur (à remplacer par les vraies) ===
  publisherName: "Sébastien Babcoq",
  publisherSiret: "xxx xxx xxx xxxxx",
  publisherAddress: "Adresse professionnelle à renseigner",
  publisherEmail: "contact@picksy.fr",
  publisherPhone: "+33 x xx xx xx xx",
  publisherRcs: "RCS xxx xxx xxx",
  publisherTva: "FRxx xxxxxxxxxx",

  // === Hébergeur ===
  hostName: "Hostinger International Ltd.",
  hostAddress: "61 Lordou Vironos Street, 6023 Larnaca, Chypre",
  hostEmail: "support@hostinger.com",

  // === CNIL ===
  cnilNumber: "xxxxx",

  // === Responsable publication ===
  editorName: "Sébastien Babcoq",
  editorAddress: "Adresse professionnelle à renseigner",
  editorEmail: "contact@picksy.fr",
  directorName: "Sébastien Babcoq",

  // === Objets pour compatibilité pages légales ===
  publisher: {
    name: "Sébastien Babcoq",
    siret: "xxx xxx xxx xxxxx",
    address: "Adresse professionnelle à renseigner",
    postalCode: "xxxxx",
    city: "Ville à renseigner",
    country: "France",
    phone: "+33 x xx xx xx xx",
  },
  hosting: {
    name: "Hostinger International Ltd.",
    address: "61 Lordou Vironos Street, 6023 Larnaca, Chypre",
    phone: "+370 5 214 1717",
    website: "https://www.hostinger.com",
  },
}
