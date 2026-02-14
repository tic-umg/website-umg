import { NextRequest, NextResponse } from "next/server";
import { getAdminToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

// This proxy is only for GET requests to list media.
// POST (uploads) will be handled directly by the client to avoid Vercel's payload limit.
export async function GET(request: NextRequest) {
  const token = await getAdminToken();

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { search } = new URL(request.url);

  try {
    const res = await fetch(`${API_URL}/admin/media${search}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Error fetching media list:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
