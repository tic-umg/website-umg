import { NextResponse } from "next/server";

const API_URL = process.env.API_URL;

export async function POST(req: Request) {
  if (!API_URL) return NextResponse.json({ message: "API_URL missing" }, { status: 500 });

  const body = await req.json().catch(() => null);
  if (!body?.email) return NextResponse.json({ message: "email required" }, { status: 422 });

  const r = await fetch(`${API_URL}/newsletter/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email: body.email }),
    cache: "no-store",
    redirect: "follow",
  }).catch(() => null);

  if (!r) return NextResponse.json({ message: "API unreachable" }, { status: 502 });

  const buffer = await r.arrayBuffer();
  const contentType = r.headers.get("content-type") || "application/json";
  return new NextResponse(buffer, { status: r.status, headers: { "content-type": contentType } });
}

