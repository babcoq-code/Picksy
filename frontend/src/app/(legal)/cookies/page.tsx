import { siteConfig } from "@/lib/site";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata = {
  title: `Politique de cookies — ${siteConfig.name}`,
  description: `Politique de cookies de ${siteConfig.name} — types de cookies utilisés, finalités et paramétrage de vos préférences.`,
  robots: { index: true, follow: true },
  openGraph: {
    title: `Politique de cookies — ${siteConfig.name}`,
    description: `Politique de cookies de ${siteConfig.name} — types de cookies utilisés, finalités et paramétrage.`,
  },
};

export default function CookiesPage() {
  const { name } = siteConfig;
  return (
    <LegalPage
      title="Politique de cookies"
      updatedAt="2026-01-15"
      description={`Information sur les cookies utilisés par ${name} et comment les gérer.`}
    >
      <h2>1. Qu'est-ce qu'un cookie ?</h2>
      <p>
        Un cookie est un petit fichier texte déposé sur votre terminal (ordinateur, tablette, 
        smartphone) lors de la visite d'un site web. Il permet de stocker des informations 
        relatives à votre navigation pour faciliter votre expérience ou réaliser des mesures d'audience.
      </p>

      <h2>2. Cookies utilisés</h2>

      <h3>2.1 Cookies strictement nécessaires</h3>
      <p>
        Ces cookies sont essentiels au fonctionnement du site et ne peuvent pas être désactivés. 
        Ils permettent la navigation et l'accès aux fonctionnalités de base.
      </p>
      <ul>
        <li>Cookie de session (conservation de l'état de la conversation).</li>
        <li>Cookie de préférence de consentement.</li>
      </ul>

      <h3>2.2 Cookies de performance</h3>
      <p>
        Ces cookies nous permettent de mesurer l'audience et d'analyser les performances 
        du site pour l'améliorer (pages les plus visitées, taux de rebond, etc.).
      </p>
      <ul>
        <li>Statistiques de navigation anonymisées.</li>
        <li>Suivi des interactions avec l'assistant IA.</li>
      </ul>

      <h3>2.3 Cookies fonctionnels</h3>
      <p>
        Ces cookies permettent de mémoriser vos préférences et de personnaliser votre expérience.
      </p>
      <ul>
        <li>Mémorisation de vos critères de recherche.</li>
        <li>Préférences d'affichage.</li>
      </ul>

      <h2>3. Durée de conservation</h2>
      <p>
        Les cookies déposés sur votre terminal ont une durée de conservation maximale de 
        <strong>13 mois</strong> conformément aux recommandations de la CNIL.
      </p>

      <h2>4. Gestion des cookies</h2>
      <p>
        Vous pouvez à tout moment configurer ou désactiver les cookies via :
      </p>
      <ul>
        <li>
          <strong>Notre outil de préférences :</strong> accessible via le bouton 
          « Gérer mes cookies » présent en bas de chaque page.
        </li>
        <li>
          <strong>Les paramètres de votre navigateur :</strong> Chrome, Firefox, Safari, 
          Edge permettent de bloquer ou supprimer les cookies.
        </li>
      </ul>
      <p>
        Attention : la désactivation des cookies strictement nécessaires peut altérer 
        le fonctionnement du Service.
      </p>

      <h2>5. Consentement</h2>
      <p>
        Pour les cookies non essentiels, nous recueillons votre consentement préalable via 
        un bandeau d'information lors de votre première visite. Vous pouvez retirer votre 
        consentement à tout moment avec l'outil de préférences.
      </p>

      <h2>6. Contact</h2>
      <p>
        Pour toute question relative aux cookies, contactez-nous : 
        <a href={`mailto:${siteConfig.publisherEmail}`}>{siteConfig.publisherEmail}</a>.
      </p>
    </LegalPage>
  );
}
