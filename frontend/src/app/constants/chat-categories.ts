// src/app/constants/chat-categories.ts

export interface ChatCategory {
  slug: string;
  emoji: string;
  label: string;
  subtext: string;
  color: string;
  openingQuestion: string;
  openingOptions: readonly string[];
}

export const CHAT_CATEGORIES: readonly ChatCategory[] = [
  {
    slug: "aspirateur-robot",
    emoji: "🤖",
    label: "Aspirateur robot",
    subtext: "Nettoie tout seul pendant que tu fais autre chose",
    color: "#FF6B5F",
    openingQuestion: "Chez toi, il devra surtout gérer quel type de sol ?",
    openingOptions: ["Sols durs (parquet / carrelage)", "Tapis ou moquette", "Un mix des deux"],
  },
  {
    slug: "aspirateur-balai",
    emoji: "🧹",
    label: "Aspirateur balai",
    subtext: "Léger, rapide, idéal pour les passages du quotidien",
    color: "#FF6B5F",
    openingQuestion: "Tu veux surtout l'utiliser pour quel type de ménage ?",
    openingOptions: ["Petits passages rapides", "Tout l'appartement / maison", "Poils d'animaux"],
  },
  {
    slug: "machine-cafe",
    emoji: "☕",
    label: "Machine à café",
    subtext: "Le café parfait, à ton rythme, chaque matin",
    color: "#FFB020",
    openingQuestion: "Tu bois plutôt quel type de café au quotidien ?",
    openingOptions: ["Expresso court", "Café long", "Boissons lactées (cappuccino, latte)"],
  },
  {
    slug: "tv-oled",
    emoji: "📺",
    label: "TV / Écran",
    subtext: "Une image qui te fait oublier que c'est un écran",
    color: "#4257FF",
    openingQuestion: "Ta TV servira surtout à quoi ?",
    openingOptions: ["Films / séries", "Sport / TV en journée", "Gaming"],
  },
  {
    slug: "casque-audio",
    emoji: "🎧",
    label: "Casque audio",
    subtext: "Ton monde sonore, sans compromis",
    color: "#4257FF",
    openingQuestion: "Tu vas surtout l'utiliser dans quel contexte ?",
    openingOptions: ["Transports / bruit extérieur", "Travail / appels / visios", "Maison / musique"],
  },
  {
    slug: "ordinateur-etudiant",
    emoji: "💻",
    label: "Ordinateur",
    subtext: "Puissance et mobilité pour tes journées",
    color: "#4257FF",
    openingQuestion: "Il te servira surtout pour quel type d'usage ?",
    openingOptions: ["Cours / bureautique", "Création / design / montage", "Dev / logiciels lourds"],
  },
  {
    slug: "lave-vaisselle",
    emoji: "🍽️",
    label: "Lave-vaisselle",
    subtext: "Plus jamais la corvée de vaisselle",
    color: "#3ED6A3",
    openingQuestion: "Tu fais tourner un lave-vaisselle pour combien de personnes en général ?",
    openingOptions: ["1 à 2 personnes", "3 à 4 personnes", "5 personnes ou plus"],
  },
  {
    slug: "trottinette-electrique",
    emoji: "🛴",
    label: "Trottinette",
    subtext: "Tes trajets urbains sans effort ni voiture",
    color: "#3ED6A3",
    openingQuestion: "Tes trajets font plutôt quelle distance au quotidien ?",
    openingOptions: ["Moins de 5 km", "5 à 15 km", "Plus de 15 km"],
  },
  {
    slug: "poussette",
    emoji: "👶",
    label: "Poussette",
    subtext: "Confort et mobilité pour toi et ton enfant",
    color: "#FFB020",
    openingQuestion: "Tu vas surtout l'utiliser dans quel environnement ?",
    openingOptions: ["Ville / trottoirs / transports", "Campagne / chemins", "Un mix des deux"],
  },
  {
    slug: "barre-son",
    emoji: "🔊",
    label: "Barre de son",
    subtext: "Le son de ton salon mérite mieux que les hauts-parleurs TV",
    color: "#4257FF",
    openingQuestion: "Tu veux surtout améliorer quoi avec ta TV ?",
    openingOptions: ["Dialogues plus clairs", "Effet cinéma / basses", "Musique aussi"],
  },
  {
    slug: "smartphone",
    emoji: "📱",
    label: "Smartphone",
    subtext: "Le téléphone qui correspond vraiment à ton usage",
    color: "#FF6B5F",
    openingQuestion: "Qu'est-ce qui compte le plus dans ton usage au quotidien ?",
    openingOptions: ["Photos / vidéos", "Autonomie longue durée", "Fluidité / jeux"],
  },
  {
    slug: "velo-electrique",
    emoji: "🚴",
    label: "Vélo électrique",
    subtext: "Reprendre le vélo sans jamais souffrir dans les côtes",
    color: "#3ED6A3",
    openingQuestion: "Tu vas surtout rouler dans quel contexte ?",
    openingOptions: ["Ville / trajets quotidiens", "Balades / chemins", "Avec du dénivelé"],
  },
] as const;

export type ChatCategorySlug = typeof CHAT_CATEGORIES[number]["slug"];

export function getCategoryBySlug(slug: string): ChatCategory | undefined {
  return CHAT_CATEGORIES.find((c) => c.slug === slug);
}
