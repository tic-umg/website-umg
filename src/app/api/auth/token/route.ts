import { NextResponse } from "next/server";
import { getAdminToken } from "@/lib/auth";

export async function GET() {
  const token = await getAdminToken();

  if (!token) {
    return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
  }

  return NextResponse.json({ token });
}
