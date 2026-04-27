/**
 * TROVIIO — Brand Configuration
 * @version 1.0
 * @since 2026-04-27
 * @path /src/config/brand.ts
 * @description Source of truth pour toute référence à la marque dans le code.
 * Anciennement Picksy (rebrand avril 2026).
 * RENOMMER CE FICHIER EN : brand.ts — Placer dans /src/config/
 *
 * RÈGLE : Ne jamais hardcoder "Troviio" dans les composants.
 * Toujours importer depuis ce fichier.
 */

export const BRAND = {
  name: 'Troviio',
  formerName: 'Picksy',
  migrationDate: '2026-04-27',

  tagline: "L'IA anti-regret pour tes achats maison",
  taglineShort: 'Trouve. Compare. Choisis.',
  taglineHero: 'Bien acheter, enfin simple.',
  description:
    "Troviio est un comparateur IA de produits maison et tech. L'IA pose des questions de vie pour recommander le produit exact correspondant à tes besoins réels.",

  domain: 'troviio.com',
  url: 'https://www.troviio.com',
  domains: {
    primary: 'troviio.com',
    fr: 'troviio.fr',
    org: 'troviio.org',
    online: 'troviio.online',
    former: 'picksy.com',
  },

  emails: {
    support: 'support@troviio.com',
    legal: 'legal@troviio.com',
    privacy: 'privacy@troviio.com',
    noreply: 'noreply@troviio.com',
  },

  social: {
    x: 'https://x.com/troviio',
    linkedin: 'https://www.linkedin.com/company/troviio',
    instagram: 'https://www.instagram.com/troviio',
  },

  assets: {
    logoHorizontalLight: '/assets/brand/troviio-logo-horizontal-light.svg',
    logoHorizontalDark:  '/assets/brand/troviio-logo-horizontal-dark.svg',
    logoIcon:            '/assets/brand/troviio-icon.svg',
    logoWordmark:        '/assets/brand/troviio-wordmark.svg',
    logoAppIcon:         '/assets/brand/troviio-app-icon.svg',
    ogImage:             '/og-image.png',
  },

  /** Signature bicolore ii — concept clé de l'identité */
  signature: {
    concept:
      "Le double 'ii' est la signature de Troviio. Premier 'i' = Coral (produit A). Second 'i' = Mint (produit B). La comparaison dans le nom.",
    i1: { color: '#FF6B5F', name: 'Coral Pop' },
    i2: { color: '#3ED6A3', name: 'Mint Smart' },
    wordmarkHtml:
      'TROV<span style="color:#FF6B5F">i</span><span style="color:#3ED6A3">i</span>O',
  },

  copyright: `© ${new Date().getFullYear()} Troviio. Tous droits réservés.`,
} as const


export const COLORS = {
  coral:       '#FF6B5F',
  coralDark:   '#E5554A',
  coralLight:  '#FF9A92',
  mint:        '#3ED6A3',
  mintDark:    '#1BAE7D',
  blue:        '#4257FF',
  blueLight:   '#8C98FF',
  cream:       '#FFF7ED',
  ink:         '#161827',
  night:       '#0E1020',
  gray100:     '#EFE3D6',
  gray300:     '#B0AAA2',
  gray500:     '#7F7A76',
  amber:       '#FFB347',
} as const


export const SCORE_TIERS = [
  { min: 80, max: 100, label: 'Excellent', color: '#3ED6A3' },
  { min: 60, max: 79,  label: 'Bon',       color: '#4257FF' },
  { min: 40, max: 59,  label: 'Correct',   color: '#FFB347' },
  { min: 0,  max: 39,  label: 'Bas',       color: '#FF6B5F' },
] as const

export function getScoreColor(score: number): string {
  const tier = SCORE_TIERS.find((t) => score >= t.min && score <= t.max)
  return tier?.color ?? '#B0AAA2'
}

export function getScoreLabel(score: number): string {
  const tier = SCORE_TIERS.find((t) => score >= t.min && score <= t.max)
  return tier?.label ?? '—'
}

/** Calcule le stroke-dashoffset pour un anneau SVG */
export function getScoreOffset(score: number, circumference: number): number {
  return circumference - (score / 100) * circumference
}


export const BADGES = [
  { id: 'choix-expert', name: 'Choix Expert', emoji: '👑', bg: '#EEEEFF', color: '#4257FF' },
  { id: 'rapport-qp',   name: 'Rapport Q/P',  emoji: '💎', bg: '#EDFCF5', color: '#219966' },
  { id: 'fiable',       name: 'Fiable',        emoji: '🛡️', bg: '#FFF1F0', color: '#BF3F36' },
  { id: 'tendance',     name: 'Tendance',      emoji: '🔥', bg: '#FFE0DD', color: '#FF6B5F' },
  { id: 'nouveau',      name: 'Nouveau',       emoji: '✨', bg: '#D9DCFF', color: '#3545DB' },
] as const


export const USER_LEVELS = [
  { level: 1, name: 'Novice',      emoji: '🌱', bg: '#F0EDE8', color: '#7F7A76' },
  { level: 2, name: 'Curieux',     emoji: '🔍', bg: '#EEEEFF', color: '#8D96FF' },
  { level: 3, name: 'Connaisseur', emoji: '⭐', bg: '#D9DCFF', color: '#4257FF' },
  { level: 4, name: 'Expert',      emoji: '🏆', bg: '#FFE0DD', color: '#FF6B5F' },
  { level: 5, name: 'Troviio Pro', emoji: '💜', bg: 'linear-gradient(135deg, #FFE0DD, #D9DCFF)', color: '#161827' },
] as const


export type Badge     = (typeof BADGES)[number]
export type UserLevel = (typeof USER_LEVELS)[number]
export type ScoreTier = (typeof SCORE_TIERS)[number]
