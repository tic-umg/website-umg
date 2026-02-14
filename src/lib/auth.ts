import { cookies } from "next/headers";

export const TOKEN_COOKIE = "umg_admin_token";

export async function getAdminToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(TOKEN_COOKIE)?.value ?? null;
}