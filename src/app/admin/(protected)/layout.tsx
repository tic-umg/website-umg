import AdminLayout from "@/components/admin/AdminLayout";

export const metadata = {
  title: "Administration | UMG",
  description: "Panneau d'administration de l'Université de Mahajanga",
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}
