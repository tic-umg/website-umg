export const metadata = {
  title: "Connexion | UMG Admin",
  description: "Connexion au panneau d'administration",
};

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Login page doesn't use the admin layout, just renders children directly
  return <>{children}</>;
}
