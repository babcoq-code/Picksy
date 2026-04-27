import { siteConfig } from "@/lib/site";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata = {
  title: `Affiliation — ${siteConfig.name}`,
  description: `Politique d'affiliation de ${siteConfig.name} — transparence sur les liens commerciaux et le fonctionnement de notre comparateur indépendant.`,
  robots: { index: true, follow: true },
  openGraph: {
    title: `Affiliation — ${siteConfig.name}`,
    description: `Politique d'affiliation de ${siteConfig.name} — transparence sur les liens commerciaux.`,
  },
};

export default function AffiliationPage() {
  const { name, url } = siteConfig;
  return (
    <LegalPage
      title="Transparence & Affiliation"
      updatedAt="2026-01-15"
      description={`Comment ${name} fonctionne, comment nous sommes rémunérés et pourquoi vous pouvez nous faire confiance.`}
    >
      <h2>1. Un comparateur, pas un vendeur</h2>
      <p>
        {name} est un comparateur indépendant. Nous ne vendons aucun produit directement. 
        Notre rôle est de vous recommander le produit le plus adapté à vos besoins grâce 
        à notre assistant conversationnel alimenté par l'intelligence artificielle.
      </p>

      <h2>2. Comment sommes-nous rémunérés ?</h2>
      <p>
        {name} perçoit une commission lorsque vous cliquez sur un lien d'affiliation 
        présent sur le site et effectuez un achat chez l'un de nos partenaires marchands. 
        Cette commission est versée par le marchand et <strong>n'augmente en aucun cas 
        le prix que vous payez</strong>.
      </p>

      <h2>3. Indépendance totale des recommandations</h2>
      <p>
        Les recommandations de {name} sont basées <strong>uniquement sur vos critères</strong> 
        (budget, usage, préférences) et sur une analyse objective des caractéristiques 
        techniques des produits. Nous ne recommandons jamais un produit uniquement parce 
        que son affiliation est plus rémunératrice.
      </p>
      <ul>
        <li>Zéro biais commercial dans les suggestions.</li>
        <li>Tous les produits sont évalués selon les mêmes critères.</li>
        <li>Les partenaires marchands n'ont aucun droit de regard sur nos recommandations.</li>
      </ul>

      <h2>4. Liens d'affiliation</h2>
      <p>
        Lorsque vous accédez à un produit via un lien sur {url}, nous utilisons des liens 
        tracés qui nous permettent d'identifier la provenance de la vente. Ces liens 
        n'affectent ni le prix ni les conditions d'achat. Les principaux réseaux 
        d'affiliation avec lesquels nous travaillons incluent :
      </p>
      <ul>
        <li>Amazon PartnerNet (Programme Partenaires Amazon).</li>
        <li>Réseaux d'affiliation spécialisés dans l'électronique et le家居.</li>
      </ul>

      <h2>5. Transparence totale</h2>
      <p>
        Nous nous engageons à :
      </p>
      <ul>
        <li>Indiquer clairement les liens d'affiliation.</li>
        <li>Ne pas manipuler les résultats pour favoriser un partenaire.</li>
        <li>Publier régulièrement notre méthodologie de comparaison.</li>
        <li>Répondre à toutes les questions sur notre modèle économique.</li>
      </ul>

      <h2>6. Contact</h2>
      <p>
        Pour toute question relative à notre politique d'affiliation : 
        <a href={`mailto:${siteConfig.publisherEmail}`}>{siteConfig.publisherEmail}</a>.
      </p>
    </LegalPage>
  );
}
