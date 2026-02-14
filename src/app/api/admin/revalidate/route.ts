import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminToken } from "@/lib/auth";

export async function POST(req: Request) {
  const token = await getAdminToken();
  if (!token) return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const paths = Array.isArray(body?.paths) ? (body.paths as unknown[]) : [];

  const cleanPaths = paths
    .filter((p): p is string => typeof p === "string")
    .map((p) => (p.startsWith("/") ? p : `/${p}`));

  if (!cleanPaths.length) {
    return NextResponse.json({ message: "paths missing" }, { status: 400 });
  }

  for (const p of cleanPaths) {
    revalidatePath(p);
  }

  return NextResponse.json({ data: true, revalidated: cleanPaths });
}

