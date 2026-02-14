import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function parseHosts(value?: string | null) {
  if (!value) return [];
  return value
    .split(",")
    .map((host) => host.trim())
    .filter(Boolean);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Always allow static assets and API routes
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes("/static") ||
    pathname.match(/\.(png|jpg|jpeg|svg|ico|css|js|woff|woff2|webp|gif)$/) ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const publicHosts = parseHosts(process.env.PUBLIC_HOSTS);
  const adminHosts = parseHosts(process.env.ADMIN_HOSTS);
  const currentHost = request.headers.get("host") || request.nextUrl.host;

  const isPublicHost = publicHosts.some((h) => currentHost === h);
  const isAdminHost = adminHosts.some((h) => currentHost === h);
  const isLocalhost = currentHost.includes("localhost");

  // 2. Public hosts: block /admin and redirect to home
  if (isPublicHost && pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 3. Admin host: redirect root and non-admin pages to /admin
  if (isAdminHost && !isLocalhost) {
    // Root path → redirect to admin login or dashboard
    if (pathname === "/") {
      const token = request.cookies.get("umg_admin_token")?.value;
      if (token) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    // Non-admin paths (except api, maintenance) → redirect to admin
    if (!pathname.startsWith("/admin") && pathname !== "/maintenance") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  // 4. Admin authentication check
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("umg_admin_token")?.value;
    // Handle both /admin/login and /admin/login/
    const isLoginPage = pathname === "/admin/login" || pathname === "/admin/login/";

    // IMPORTANT: Always allow access to /admin/login without any redirect.
    // The token may be expired/invalid - validation must happen on the backend.
    // This prevents redirect loops between /admin/login and /admin.
    if (isLoginPage) {
      return NextResponse.next();
    }

    // For other admin pages, require a token to exist (not validated here)
    // If no token, redirect to login page
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    return NextResponse.next();
  }

  // 5. Maintenance page is always accessible
  if (pathname === "/maintenance") {
    return NextResponse.next();
  }

  // 6. Check maintenance status for public routes
  try {
    const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`${apiUrl}/maintenance-status`, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
      cache: "no-store",
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      console.log("[Middleware] Maintenance check:", { pathname, maintenance_mode: data.maintenance_mode });

      if (data.maintenance_mode === true) {
        return NextResponse.rewrite(new URL("/maintenance", request.url));
      }
    }
  } catch (error) {
    // Ignore maintenance check errors when API is unreachable in dev.
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};