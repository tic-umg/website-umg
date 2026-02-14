import { InstitutionalPageLayout } from "@/components/layout/InstitutionalPageLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions Légales",
  description: "Consultez les mentions légales du site officiel de l'Université de Mahajanga.",
};

const UPDATE_DATE = "20 janvier 2026";

export default function LegalNoticePage() {
  return (
    <InstitutionalPageLayout
      title="Mentions Légales"
      updatedAt={UPDATE_DATE}
    >
      <section>
        <h2 className="text-2xl font-bold mb-4">Éditeur du site</h2>
        <p>
          Le présent site web, accessible à l’adresse www.mahajanga-univ.mg, est l’éditeur de l’Université de Mahajanga, établissement public à caractère scientifique, culturel et professionnel.
        </p>
        <ul>
          <li><strong>Dénomination :</strong> Université de Mahajanga (UMG)</li>
          <li><strong>Adresse :</strong> Mahajanga 401, Madagascar</li>
          <li><strong>Téléphone :</strong> +261 34 93 452 51</li>
          <li><strong>Email :</strong> infos@mahajanga-univ.mg</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold mt-8 mb-4">Directeur de la publication et Développeur</h2>
        <p>
          Le directeur de la publication est la DTIC de l’Université de Mahajanga en exercice.
        </p>
        <ul>
          <li><strong>Développeur :</strong> Service TIC, M. BEZARA Florent</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold mt-8 mb-4">Hébergement</h2>
        <p>
          Le site web du backend est hébergé par o2switch, et le frontend par Vercel.
        </p>
        <ul>
          <li><strong>Hébergeur backend :</strong> o2switch</li>
          <li><strong>Site web o2switch :</strong> <a href="https://www.o2switch.fr" target="_blank" rel="noopener noreferrer">www.o2switch.fr</a></li>
          <li><strong>Hébergeur frontend :</strong> Vercel</li>
          <li><strong>Site web Vercel :</strong> <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">vercel.com</a></li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold mt-8 mb-4">Propriété intellectuelle</h2>
        <p>
          L'ensemble de ce site (contenus, textes, images, vidéos, logos, marques) constitue une œuvre protégée par la législation en vigueur sur la propriété intellectuelle. Sauf autorisation préalable et écrite de l’Université de Mahajanga, toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite.
        </p>
        <p>
          L'exploitation non autorisée du site ou de l'un quelconque des éléments qu'il contient sera considérée comme constitutive d'une contrefaçon et poursuivie conformément aux dispositions légales.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mt-8 mb-4">Responsabilité</h2>
        <p>
          L’Université de Mahajanga s’efforce de fournir sur le site des informations aussi précises que possible. Toutefois, elle ne pourra être tenue responsable des omissions, des inexactitudes et des carences dans la mise à jour, qu’elles soient de son fait ou du fait des tiers partenaires qui lui fournissent ces informations.
        </p>
        <p>
          Toutes les informations indiquées sur le site sont données à titre indicatif et sont susceptibles d’évoluer.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mt-8 mb-4">Liens externes</h2>
        <p>
          Le site peut contenir des liens hypertextes vers d’autres sites. L’Université de Mahajanga n’a pas la possibilité de vérifier le contenu des sites ainsi visités et n’assumera en conséquence aucune responsabilité de ce fait.
        </p>
      </section>

        <section>
        <h2 className="text-2xl font-bold mt-8 mb-4">Mise à jour</h2>
        <p>
          Les présentes mentions légales peuvent être modifiées à tout moment. L'utilisateur est invité à les consulter régulièrement.
        </p>
      </section>
    </InstitutionalPageLayout>
  );
}
