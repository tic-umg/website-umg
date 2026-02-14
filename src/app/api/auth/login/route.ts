import { NextResponse } from "next/server";
import { TOKEN_COOKIE } from "@/lib/auth";

const API_URL = process.env.API_URL;

export async function POST(req: Request) {
  if (!API_URL) return NextResponse.json({ message: "API_URL missing" }, { status: 500 });

  const body = await req.json().catch(() => null);
  if (!body?.email || !body?.password) {
    return NextResponse.json({ message: "email & password required" }, { status: 422 });
  }

  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email: body.email, password: body.password }),
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) return NextResponse.json({ message: data?.message ?? "Login failed", error: data }, { status: res.status });

  const token = data?.data?.token;
  if (!token) return NextResponse.json({ message: "Token missing" }, { status: 500 });

  const response = NextResponse.json({ data: true });
  response.cookies.set({
    name: TOKEN_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}