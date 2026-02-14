import { InstitutionalPageLayout } from "@/components/layout/InstitutionalPageLayout";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Découvrez comment l'Université de Mahajanga collecte, utilise et protège vos données personnelles.",
};

const UPDATE_DATE = "20 janvier 2026";

export default function PrivacyPolicyPage() {
  return (
    <InstitutionalPageLayout
      title="Politique de confidentialité"
      updatedAt={UPDATE_DATE}
    >
      <p className="lead mb-8">
        L'Université de Mahajanga s'engage à protéger la vie privée des visiteurs de son site web. Cette politique de confidentialité explique quelles données nous collectons et comment nous les utilisons.
      </p>
      
      <section>
        <h2 className="text-2xl font-bold mt-8 mb-4">Données personnelles collectées</h2>
        <p>Nous collectons différents types de données pour diverses finalités :</p>
        <ul>
          <li>
            <strong>Inscription à la newsletter :</strong> Lorsque vous vous inscrivez à notre newsletter, nous collectons votre adresse e-mail. Cette collecte est basée sur votre consentement explicite (opt-in).
          </li>
          <li>
            <strong>Formulaires de contact :</strong> Lorsque vous utilisez notre formulaire de contact, nous collectons votre nom, votre adresse e-mail et le contenu de votre message afin de pouvoir traiter votre demande.
          </li>
          <li>
            <strong>Données techniques et de navigation :</strong> Nous collectons des informations techniques (logs serveur, adresse IP) pour assurer la sécurité du site et pour établir des statistiques de fréquentation anonymes.
          </li>
        </ul>
      </section>
      
      <section>
        <h2 className="text-2xl font-bold mt-8 mb-4">Finalités de la collecte</h2>
        <p>Les données que nous collectons sont utilisées pour :</p>
        <ul>
            <li>Vous envoyer nos communications institutionnelles (newsletter).</li>
            <li>Répondre à vos demandes d'information.</li>
            <li>Assurer la sécurité et le bon fonctionnement de nos services.</li>
            <li>Améliorer l'expérience utilisateur et la qualité de notre site.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold mt-8 mb-4">Durées de conservation</h2>
        <p>Nous conservons vos données pour une durée limitée :</p>
        <ul>
          <li>
            <strong>Newsletter :</strong> Votre adresse e-mail est conservée tant que vous ne vous désinscrivez pas (un lien de désinscription est présent dans chaque e-mail).
          </li>
          <li>
            <strong>Formulaire de contact :</strong> Les données sont conservées le temps nécessaire au traitement de votre demande, et pour une durée maximale de 1 an.
          </li>
          <li>
            <strong>Logs techniques :</strong> Les logs serveur sont conservés pour une durée de 12 mois à des fins de sécurité.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold mt-8 mb-4">Partage des données</h2>
        <p>
          L'Université de Mahajanga ne vend ni ne loue vos données personnelles. Cependant, nous pouvons les partager avec des prestataires techniques pour les finalités décrites ci-dessus, notamment :
        </p>
        <ul>
          <li>Notre hébergeur backend : o2switch</li>
          <li>Notre hébergeur frontend : Vercel</li>
          <li>Notre solution d'envoi d'e-mails : [Non renseigné, à compléter si applicable]</li>
        </ul>
        <p>Ces partenaires sont tenus de respecter la confidentialité de vos données.</p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mt-8 mb-4">Cookies</h2>
        <p>
          Notre site utilise des cookies pour fonctionner. Vous pouvez gérer vos préférences en matière de cookies via le bandeau qui s'affiche lors de votre première visite.
        </p>
        <ul>
            <li><strong>Cookies techniques :</strong> Nécessaires au bon fonctionnement du site (session, sécurité).</li>
            <li>
                <strong>Cookies de mesure d'audience (si activés) :</strong> 
                {/* TODO: Vérifier si un outil d'analytics est en place. */}
                Nous utilisons potentiellement des outils comme Google Analytics pour mesurer l'audience de manière anonyme. Votre consentement est requis pour l'activation de ces cookies.
            </li>
        </ul>
         <p>Pour en savoir plus et gérer vos consentements, <Link href="/#cookie-settings">cliquez ici</Link>.</p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mt-8 mb-4">Sécurité des données</h2>
        <p>
          Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles pour protéger vos données contre la destruction, la perte, l'altération, la divulgation ou l'accès non autorisé.
        </p>
      </section>
      
      <section>
        <h2 className="text-2xl font-bold mt-8 mb-4">Vos droits</h2>
        <p>
          Conformément à la réglementation en vigueur, vous disposez des droits suivants concernant vos données personnelles :
        </p>
        <ul>
          <li>Droit d'accès</li>
          <li>Droit de rectification</li>
          <li>Droit à l'effacement (droit à l'oubli)</li>
          <li>Droit d'opposition</li>
          <li>Droit à la limitation du traitement</li>
        </ul>
        <p>
          Pour exercer ces droits, vous pouvez nous contacter à l'adresse suivante.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mt-8 mb-4">Contact (DPO / Administration)</h2>
        <p>
          Pour toute question relative à cette politique de confidentialité ou pour exercer vos droits, veuillez contacter notre Délégué à la Protection des Données (DPO) ou le service administratif compétent.
        </p>
        <ul>
          <li><strong>Par e-mail :</strong> infos@mahajanga-univ.mg</li>
        </ul>
      </section>
    </InstitutionalPageLayout>
  );
}
