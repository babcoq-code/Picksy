import { siteConfig } from "@/lib/site";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata = {
  title: `Politique de confidentialité — ${siteConfig.name}`,
  description: `Politique de confidentialité de ${siteConfig.name} — collecte, traitement et protection de vos données personnelles sur le comparateur IA.`,
  robots: { index: true, follow: true },
  openGraph: {
    title: `Politique de confidentialité — ${siteConfig.name}`,
    description: `Politique de confidentialité de ${siteConfig.name} — collecte, traitement et protection de vos données personnelles.`,
  },
};

export default function PolitiqueConfidentialitePage() {
  const { publisher, name } = siteConfig;
  return (
    <LegalPage
      title="Politique de confidentialité"
      updatedAt="2026-01-15"
      description={`Comment ${name} collecte, utilise et protège vos données personnelles, conformément au Règlement Général sur la Protection des Données (RGPD).`}
    >
      <h2>1. Responsable du traitement</h2>
      <p>
        Le responsable du traitement des données à caractère personnel est <strong>{publisher.name}</strong>, 
        dont les coordonnées sont indiquées dans les <a href="/mentions-legales">mentions légales</a>.
      </p>

      <h2>2. Données collectées</h2>
      <p>Dans le cadre de l'utilisation du Service, nous pouvons collecter les données suivantes :</p>
      <ul>
        <li><strong>Données de navigation :</strong> pages visitées, durée de session, interactions avec l'assistant conversationnel.</li>
        <li><strong>Données de préférences :</strong> réponses fournies lors de l'entretien conversationnel (besoins, budget, critères).</li>
        <li><strong>Données techniques :</strong> adresse IP, type de navigateur, système d'exploitation, résolution d'écran.</li>
        <li><strong>Cookies :</strong> voir notre <a href="/cookies">politique cookies</a> pour le détail.</li>
      </ul>

      <h2>3. Finalités du traitement</h2>
      <p>Vos données sont traitées pour les finalités suivantes :</p>
      <ul>
        <li>Fournir et améliorer le service de recommandation par IA.</li>
        <li>Personnaliser l'expérience utilisateur.</li>
        <li>Analyser les performances et l'audience du site.</li>
        <li>Assurer la sécurité et le bon fonctionnement du Service.</li>
      </ul>

      <h2>4. Base légale</h2>
      <p>Le traitement de vos données repose sur :</p>
      <ul>
        <li><strong>L'intérêt légitime</strong> (amélioration du service, analyse d'audience).</li>
        <li><strong>Le consentement</strong> (dépôt de cookies non essentiels).</li>
        <li><strong>L'exécution de mesures précontractuelles</strong> (réponse à vos demandes).</li>
      </ul>

      <h2>5. Durée de conservation</h2>
      <p>
        Vos données sont conservées pour une durée n'excédant pas celle nécessaire aux 
        finalités pour lesquelles elles sont collectées :
      </p>
      <ul>
        <li>Données de navigation : 13 mois maximum.</li>
        <li>Données de préférences : 24 mois après la dernière interaction.</li>
        <li>Données techniques : 12 mois.</li>
      </ul>

      <h2>6. Destinataires des données</h2>
      <p>
        Vos données sont exclusivement destinées à {publisher.name} et ne sont pas vendues 
        à des tiers. Elles peuvent être transmises à nos sous-traitants techniques 
        (hébergeur, services d'analyse) dans le cadre strict des finalités définies.
      </p>

      <h2>7. Vos droits</h2>
      <p>Conformément au RGPD, vous disposez des droits suivants :</p>
      <ul>
        <li>Droit d'accès (article 15 RGPD).</li>
        <li>Droit de rectification (article 16 RGPD).</li>
        <li>Droit à l'effacement (article 17 RGPD).</li>
        <li>Droit à la limitation du traitement (article 18 RGPD).</li>
        <li>Droit à la portabilité (article 20 RGPD).</li>
        <li>Droit d'opposition (article 21 RGPD).</li>
      </ul>
      <p>
        Pour exercer vos droits, contactez-nous à : <a href={`mailto:${siteConfig.publisherEmail}`}>{siteConfig.publisherEmail}</a>. 
        Vous avez également le droit d'introduire une réclamation auprès de la CNIL.
      </p>

      <h2>8. Sécurité</h2>
      <p>
        Nous mettons en œuvre toutes les mesures techniques et organisationnelles 
        appropriées pour garantir la sécurité et la confidentialité de vos données 
        personnelles (chiffrement HTTPS, accès restreints, audits réguliers).
      </p>

      <h2>9. Transferts hors UE</h2>
      <p>
        Vos données ne font pas l'objet de transferts en dehors de l'Union Européenne. 
        En cas de recours à un sous-traitant situé hors UE, nous nous assurons que des 
        garanties appropriées sont mises en place (Clauses Contractuelles Types).
      </p>
    </LegalPage>
  );
}
