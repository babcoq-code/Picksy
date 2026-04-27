import { siteConfig } from "@/lib/site";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata = {
  title: `Mentions légales — ${siteConfig.name}`,
  description: `Mentions légales de ${siteConfig.name} — éditeur, hébergeur, conditions générales d'utilisation du comparateur IA.`,
  robots: { index: true, follow: true },
  openGraph: {
    title: `Mentions légales — ${siteConfig.name}`,
    description: `Mentions légales de ${siteConfig.name} — éditeur, hébergeur, conditions générales d'utilisation du comparateur IA.`,
  },
};

export default function MentionsLegalesPage() {
  const { publisher, hosting, name, url } = siteConfig;
  return (
    <LegalPage
      title="Mentions légales"
      updatedAt="2026-01-15"
      description="Conformément aux articles 6-III et 19 de la loi n° 2004-575 du 21 juin 2004 pour la Confiance dans l'Économie Numérique (LCEN)."
    >
      <h2>1. Éditeur du service</h2>
      <p>
        Le site <strong>{name}</strong> (ci-après « le Service ») est édité par :
      </p>
      <ul>
        <li><strong>Nom :</strong> {publisher.name}</li>
        <li><strong>SIRET :</strong> {publisher.siret}</li>
        <li><strong>Adresse :</strong> {publisher.address}, {publisher.postalCode} {publisher.city}, {publisher.country}</li>
        <li><strong>Téléphone :</strong> {publisher.phone}</li>
        <li><strong>Email :</strong> {siteConfig.publisherEmail}</li>
      </ul>

      <h2>2. Directeur de la publication</h2>
      <p>Le directeur de la publication est <strong>{publisher.name}</strong>, en qualité de fondateur du Service.</p>

      <h2>3. Hébergeur</h2>
      <p>Le Service est hébergé par :</p>
      <ul>
        <li><strong>Société :</strong> {hosting.name}</li>
        <li><strong>Adresse :</strong> {hosting.address}</li>
        <li><strong>Téléphone :</strong> {hosting.phone}</li>
        <li><strong>Site web :</strong> <a href={hosting.website} target="_blank" rel="noopener noreferrer">{hosting.website}</a></li>
      </ul>

      <h2>4. Propriété intellectuelle</h2>
      <p>
        L'ensemble des contenus présents sur {url} (textes, graphismes, logos, icônes, 
        sons, logiciels) est la propriété exclusive de {publisher.name} ou de ses partenaires. 
        Toute reproduction, représentation, modification ou exploitation, totale ou partielle, 
        sans autorisation préalable écrite est interdite, conformément aux articles L. 335-2 
        et suivants du Code de la propriété intellectuelle.
      </p>

      <h2>5. Conditions d'utilisation</h2>
      <p>
        L'utilisateur reconnaît avoir pris connaissance des présentes mentions légales et 
        s'engage à les respecter. Le Service se réserve le droit de modifier ces mentions 
        à tout moment. L'utilisateur est invité à les consulter régulièrement.
      </p>

      <h2>6. Limitation de responsabilité</h2>
      <p>
        Le Service s'efforce d'assurer l'exactitude des informations diffusées, sans 
        pouvoir garantir leur exhaustivité. L'utilisateur utilise le Service sous sa seule 
        responsabilité. {name} ne saurait être tenu responsable des dommages directs ou 
        indirects résultant de l'utilisation du Service.
      </p>

      <h2>7. Contact</h2>
      <p>
        Pour toute question relative aux mentions légales, vous pouvez nous contacter à 
        l'adresse email suivante : <a href={`mailto:${siteConfig.publisherEmail}`}>{siteConfig.publisherEmail}</a>.
      </p>
    </LegalPage>
  );
}
