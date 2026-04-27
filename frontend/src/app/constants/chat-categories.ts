// src/app/constants/chat-categories.ts
// 32 catégories — parfaitement synchronisées avec CategoryGrid.tsx

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

  // ── MAISON ──────────────────────────────────────────────────
  {
    slug: "robot-aspirateur",
    emoji: "🤖",
    label: "Robot aspirateur",
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
    slug: "lave-linge",
    emoji: "🌀",
    label: "Lave-linge",
    subtext: "Du linge propre sans prise de tête",
    color: "#4257FF",
    openingQuestion: "Tu fais surtout des lessives pour quel volume de linge ?",
    openingOptions: ["Solo ou couple", "Famille régulière", "Grosses machines (enfants, sport)", "Petits espaces"],
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
    slug: "refrigerateur",
    emoji: "🧊",
    label: "Réfrigérateur",
    subtext: "Des aliments mieux conservés au quotidien",
    color: "#3ED6A3",
    openingQuestion: "Tu as surtout besoin de quel type de froid au quotidien ?",
    openingOptions: ["Frigo compact", "Combiné classique", "Grande capacité", "Multiportes familial"],
  },
  {
    slug: "purificateur-air",
    emoji: "🌬️",
    label: "Purificateur d'air",
    subtext: "Un air plus sain chez toi",
    color: "#3ED6A3",
    openingQuestion: "Tu veux surtout filtrer quoi dans ton intérieur ?",
    openingOptions: ["Allergies et pollen", "Poussières fines", "Odeurs et fumée", "Poils d'animaux"],
  },
  {
    slug: "friteuse-air",
    emoji: "🍟",
    label: "Friteuse à air",
    subtext: "Des plats croustillants avec moins d'huile",
    color: "#FFB020",
    openingQuestion: "Tu comptes surtout cuisiner pour combien de personnes ?",
    openingOptions: ["1 à 2 personnes", "3 à 4 personnes", "Famille nombreuse"],
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
    slug: "robot-cuisine",
    emoji: "👨‍🍳",
    label: "Robot cuisine",
    subtext: "Cuisiner plus vite, avec moins d'effort",
    color: "#FF6B5F",
    openingQuestion: "Tu veux surtout qu'il t'aide sur quel type de préparation ?",
    openingOptions: ["Repas complets", "Pâtisserie", "Découpe et râpe", "Soupes et sauces"],
  },
  {
    slug: "cave-a-vin",
    emoji: "🍷",
    label: "Cave à vin",
    subtext: "Tes bouteilles conservées à bonne température",
    color: "#FF6B5F",
    openingQuestion: "Tu veux surtout conserver ton vin pour quel usage ?",
    openingOptions: ["Service quotidien", "Vieillissement longue durée", "Les deux", "Petite collection"],
  },
  {
    slug: "four-encastrable",
    emoji: "🥧",
    label: "Four encastrable",
    subtext: "Des cuissons dignes d'un vrai chef",
    color: "#FFB020",
    openingQuestion: "Quel mode de nettoyage tu préfères pour ton four ?",
    openingOptions: ["Pyrolyse (automatique)", "Catalyse (parois spéciales)", "Vapeur (écologique)", "Je me démerde à la main"],
  },
  {
    slug: "climatiseur-mobile",
    emoji: "❄️",
    label: "Climatiseur mobile",
    subtext: "Garde ton intérieur toujours au frais",
    color: "#3ED6A3",
    openingQuestion: "C'est pour rafraîchir une pièce de quelle taille environ ?",
    openingOptions: ["Moins de 20 m²", "20 à 30 m²", "Plus de 30 m²"],
  },
  {
    slug: "serrure-connectee",
    emoji: "🔐",
    label: "Serrure connectée",
    subtext: "Sécurise ton entrée du bout des doigts",
    color: "#FF6B5F",
    openingQuestion: "Comment tu veux déverrouiller ta porte au quotidien ?",
    openingOptions: ["Empreinte digitale", "Code PIN", "Détection auto smartphone", "Télécommande"],
  },

  // ── TECH ────────────────────────────────────────────────────
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
    slug: "ordinateur-etudiant",
    emoji: "💻",
    label: "Ordinateur",
    subtext: "Puissance et mobilité pour tes journées",
    color: "#4257FF",
    openingQuestion: "Il te servira surtout pour quel type d'usage ?",
    openingOptions: ["Cours / bureautique", "Création / design / montage", "Dev / logiciels lourds"],
  },
  {
    slug: "imprimante",
    emoji: "🖨️",
    label: "Imprimante",
    subtext: "Imprimer facilement selon tes vrais besoins",
    color: "#4257FF",
    openingQuestion: "Tu imprimes surtout quel type de documents ?",
    openingOptions: ["Documents texte", "Photos", "École et devoirs", "Usage pro"],
  },
  {
    slug: "camera-securite",
    emoji: "📹",
    label: "Caméra sécurité",
    subtext: "Surveiller ton logement simplement, jour et nuit",
    color: "#4257FF",
    openingQuestion: "Tu veux surtout surveiller quel endroit ?",
    openingOptions: ["Intérieur", "Extérieur", "Entrée principale", "Garage ou jardin"],
  },
  {
    slug: "thermostat-connecte",
    emoji: "🌡️",
    label: "Thermostat connecté",
    subtext: "Chauffer mieux tout en économisant",
    color: "#3ED6A3",
    openingQuestion: "Ton chauffage fonctionne surtout avec quel système ?",
    openingOptions: ["Chaudière gaz / fioul", "Radiateurs électriques", "Pompe à chaleur", "Je ne sais pas"],
  },
  {
    slug: "montre-connectee",
    emoji: "⌚",
    label: "Montre connectée",
    subtext: "Suis ta santé et tes performances au poignet",
    color: "#4257FF",
    openingQuestion: "Quelle sera l'utilisation principale de ta future montre ?",
    openingOptions: ["Sport intensif / outdoor", "Suivi santé au quotidien", "Extension smartphone", "Style avant tout"],
  },
  {
    slug: "tablette-tactile",
    emoji: "🪟",
    label: "Tablette tactile",
    subtext: "Un grand écran nomade pour toutes tes envies",
    color: "#4257FF",
    openingQuestion: "À qui est principalement destinée cette tablette ?",
    openingOptions: ["Usage familial / enfants", "Films et séries", "Travail et productivité", "Dessin / création"],
  },
  {
    slug: "videoprojecteur",
    emoji: "📽️",
    label: "Vidéoprojecteur",
    subtext: "Le cinéma s'invite dans ton salon",
    color: "#FF6B5F",
    openingQuestion: "Comment tu comptes installer ce vidéoprojecteur ?",
    openingOptions: ["Fixe au plafond ou sur meuble", "Portable avec batterie", "Proche du mur (courte focale)"],
  },
  {
    slug: "ecran-pc",
    emoji: "🖥️",
    label: "Écran PC",
    subtext: "L'affichage parfait pour chaque activité",
    color: "#3ED6A3",
    openingQuestion: "Tu l'utilises surtout pour quoi ?",
    openingOptions: ["Télétravail / bureautique", "Gaming intensif", "Création graphique (photo / vidéo)", "Un mix"],
  },
  {
    slug: "station-electrique",
    emoji: "🔋",
    label: "Station électrique",
    subtext: "De l'énergie partout avec toi",
    color: "#3ED6A3",
    openingQuestion: "Tu veux alimenter quel type d'appareils avec cette batterie ?",
    openingOptions: ["Téléphone et ordinateur", "Électroménager (frigo, micro-ondes)", "Outils puissants", "Camping / van"],
  },
  {
    slug: "appareil-photo-hybride",
    emoji: "📷",
    label: "Appareil photo",
    subtext: "Immortalise tes souvenirs en qualité pro",
    color: "#4257FF",
    openingQuestion: "Tu veux surtout faire quoi avec ce boîtier ?",
    openingOptions: ["Photos de voyage / portraits", "Vidéo (vlog / YouTube)", "Un mix photo et vidéo", "Je débute"],
  },

  // ── MOBILITÉ ───────────────────────────────────────────────
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
    slug: "velo-electrique",
    emoji: "🚴",
    label: "Vélo électrique",
    subtext: "Reprendre le vélo sans jamais souffrir dans les côtes",
    color: "#3ED6A3",
    openingQuestion: "Tu vas surtout rouler dans quel contexte ?",
    openingOptions: ["Ville / trajets quotidiens", "Balades / chemins", "Avec du dénivelé"],
  },

  // ── CONFORT ────────────────────────────────────────────────
  {
    slug: "matelas",
    emoji: "🛏️",
    label: "Matelas",
    subtext: "Mieux dormir selon ta morphologie et position",
    color: "#FFB020",
    openingQuestion: "Tu dors le plus souvent dans quelle position ?",
    openingOptions: ["Sur le côté", "Sur le dos", "Sur le ventre", "Je bouge beaucoup"],
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
    slug: "tapis-de-course",
    emoji: "🏃",
    label: "Tapis de course",
    subtext: "Atteins tes objectifs sportifs à domicile",
    color: "#3ED6A3",
    openingQuestion: "Quel est ton objectif principal avec ce tapis ?",
    openingOptions: ["Marche active (ou sous bureau)", "Footing régulier", "Entraînement intensif (sprint)"],
  },

] as const;

export type ChatCategorySlug = typeof CHAT_CATEGORIES[number]["slug"];

/** Récupère une catégorie par son slug */
export function getCategoryBySlug(slug: string): ChatCategory | undefined {
  return CHAT_CATEGORIES.find((c) => c.slug === slug);
}
