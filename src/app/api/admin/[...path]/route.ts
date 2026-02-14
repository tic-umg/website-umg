import { NextResponse } from "next/server";
import { getAdminToken } from "@/lib/auth";

const API_URL = process.env.API_URL;

async function forward(req: Request, parts: string[]) {
  if (!API_URL) return NextResponse.json({ message: "API_URL missing" }, { status: 500 });

  const token = await getAdminToken();
  if (!token) return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });

  const url = new URL(req.url);
  const target = `${API_URL}/admin/${parts.join("/")}${url.search}`;

  const method = req.method.toUpperCase();
  const hasBody = !["GET", "HEAD"].includes(method);
  
  // Clone headers but handle Content-Type specially for multipart
  const headers = new Headers();
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("Accept", "application/json");
  
  // Preserve Content-Type from original request (important for multipart/form-data)
  const contentType = req.headers.get("content-type");
  if (contentType) {
    headers.set("Content-Type", contentType);
  }

  // For file uploads, we need to read the body as ArrayBuffer
  let body: ArrayBuffer | undefined;
  if (hasBody) {
    body = await req.arrayBuffer();
  }

  let r: Response;
  try {
    r = await fetch(target, {
      method,
      headers,
      body: body,
      cache: "no-store",
    });
  } catch (error) {
    console.error("[API Proxy] Failed to reach backend:", target, error instanceof Error ? error.message : error);
    return NextResponse.json({ 
      message: "API unreachable", 
      target,
      hint: "Vérifiez que le serveur Laravel est démarré (php artisan serve)"
    }, { status: 502 });
  }

  const buffer = await r.arrayBuffer();
  const respContentType = r.headers.get("content-type") || "application/json";

  if (buffer.byteLength === 0) {
    const message = r.ok ? "Empty response" : `API error ${r.status}`;
    return NextResponse.json({ message }, { status: r.status });
  }

  return new NextResponse(buffer, { status: r.status, headers: { "content-type": respContentType } });
}

export const GET = async (req: Request, ctx: { params: Promise<{ path: string[] }> }) => forward(req, (await ctx.params).path);
export const POST = async (req: Request, ctx: { params: Promise<{ path: string[] }> }) => forward(req, (await ctx.params).path);
export const PUT = async (req: Request, ctx: { params: Promise<{ path: string[] }> }) => forward(req, (await ctx.params).path);
export const PATCH = async (req: Request, ctx: { params: Promise<{ path: string[] }> }) => forward(req, (await ctx.params).path);
export const DELETE = async (req: Request, ctx: { params: Promise<{ path: string[] }> }) => forward(req, (await ctx.params).path);
