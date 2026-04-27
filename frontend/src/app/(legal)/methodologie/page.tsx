import { siteConfig } from "@/lib/site";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata = {
  title: `Méthodologie — ${siteConfig.name}`,
  description: `Méthodologie de comparaison de ${siteConfig.name} conforme au Décret n° 2024-753 — transparence des algorithmes, critères de notation et classement.`,
  robots: { index: true, follow: true },
  openGraph: {
    title: `Méthodologie — ${siteConfig.name}`,
    description: `Méthodologie de comparaison de ${siteConfig.name} conforme au Décret n° 2024-753.`,
  },
};

export default function MethodologiePage() {
  const { name, url } = siteConfig;
  return (
    <LegalPage
      title="Méthodologie de comparaison"
      updatedAt="2026-01-15"
      description={`Conformément au Décret n° 2024-753 du 1er juillet 2024 relatif à la transparence des outils de comparaison en ligne — ${name}.`}
    >
      <div className="info-box">
        <strong>Conformité réglementaire</strong>
        <p>
          Cette page est établie conformément au <strong>Décret n° 2024-753</strong> du 1er juillet 2024 
          pris pour l'application des articles L. 111-17 et L. 111-17-1 du Code de la consommation, 
          relatifs à la transparence des outils de comparaison en ligne.
        </p>
      </div>

      <h2>1. Présentation du service</h2>
      <p>
        {name} est un comparateur en ligne utilisant l'intelligence artificielle pour 
        recommander des produits maison et tech. Notre service fonctionne via un entretien 
        conversationnel où l'utilisateur exprime ses besoins et contraintes. L'IA analyse 
        ces informations pour proposer les produits les plus adaptés.
      </p>

      <h2>2. Critères de comparaison</h2>
      <p>Les produits sont évalués selon les critères suivants, pondérés en fonction des préférences utilisateur :</p>
      <ul>
        <li><strong>Prix :</strong> rapport qualité-prix et positionnement budgétaire.</li>
        <li><strong>Performances :</strong> caractéristiques techniques mesurables (puissance, autonomie, capacité).</li>
        <li><strong>Qualité perçue :</strong> notes et avis utilisateurs agrégés.</li>
        <li><strong>Fiabilité :</strong> taux de panne, durabilité, service après-vente.</li>
        <li><strong>Éco-responsabilité :</strong> consommation énergétique, recyclabilité, indice de réparabilité.</li>
      </ul>

      <h2>3. Fonctionnement de l'algorithme</h2>
      <p>
        Notre modèle d'IA utilise un traitement en langage naturel (NLP) pour interpréter 
        les réponses de l'utilisateur pendant l'entretien. Les étapes sont les suivantes :
      </p>
      <ol>
        <li><strong>Collecte des préférences</strong> — l'utilisateur répond à une série de questions sur son usage, son budget et ses priorités.</li>
        <li><strong>Analyse sémantique</strong> — l'IA extrait les critères implicites et explicites.</li>
        <li><strong>Filtrage multidimensionnel</strong> — les produits sont filtrés et pondérés selon les critères.</li>
        <li><strong>Classement personnalisé</strong> — une liste ordonnée est proposée, avec les scores par critère.</li>
      </ol>

      <h2>4. Sources des données</h2>
      <p>
        Les informations sur les produits proviennent de :
      </p>
      <ul>
        <li>Fiches techniques officielles des fabricants.</li>
        <li>Avis vérifiés et agrégés.</li>
        <li>Tests comparatifs de sources indépendantes.</li>
        <li>Prix actualisés en temps réel via les flux des marchands partenaires.</li>
      </ul>

      <h2>5. Actualisation</h2>
      <p>
        Les données du comparateur sont mises à jour régulièrement. Les prix et 
        disponibilités sont actualisés quotidiennement. Les caractéristiques techniques 
        sont révisées à chaque nouveau modèle ou mise à jour fabricant.
      </p>

      <h2>6. Classement et impartialité</h2>
      <p>
        Le classement est entièrement déterminé par l'adéquation entre les critères 
        exprimés par l'utilisateur et les caractéristiques des produits. Aucun partenaire 
        commercial n'influence le classement. Les relations d'affiliation sont clairement 
        indiquées (voir notre <a href="/affiliation">page Affiliation</a>).
      </p>

      <h2>7. Limites</h2>
      <p>
        {name} s'efforce de fournir les recommandations les plus pertinentes possibles, 
        mais nous ne pouvons garantir l'exhaustivité du catalogue. Certains produits 
        peuvent ne pas être référencés. L'utilisateur est invité à croiser les informations 
        et à vérifier les fiches produits avant tout achat.
      </p>

      <h2>8. Contact</h2>
      <p>
        Pour toute question sur notre méthodologie ou pour signaler une inexactitude : 
        <a href={`mailto:${siteConfig.publisherEmail}`}>{siteConfig.publisherEmail}</a>.
      </p>
    </LegalPage>
  );
}
