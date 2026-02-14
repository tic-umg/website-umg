import { publicGet } from "@/lib/public-api";
import ServicesPageClient from "./ServicesPageClient";

export const metadata = {
  title: "Services - Université de Mahajanga",
  description: "Les services administratifs et académiques de l'Université de Mahajanga",
};

type Service = {
  id: number;
  name: string;
  slug: string;
  chef_service: string | null;
  address: string | null;
  contact: string | null;
  logo: { url: string } | null;
  document: { id: number; title: string; slug: string; file_url: string | null } | null;
};

export default async function ServicesPage() {
  let services: Service[] = [];
  try {
    const res = await publicGet<{ data: Service[] }>("/services?per_page=50", 60);
    services = res.data || [];
  } catch {
    // No services yet
  }

  return <ServicesPageClient services={services} />;
}
