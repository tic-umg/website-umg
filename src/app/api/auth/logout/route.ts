import { NextResponse } from "next/server";
import { TOKEN_COOKIE } from "@/lib/auth";

export async function POST() {
  const res = NextResponse.json({ data: true });
  res.cookies.set({ name: TOKEN_COOKIE, value: "", path: "/", maxAge: 0, httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" });
  return res;
}
