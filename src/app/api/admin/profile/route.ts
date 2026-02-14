import { NextResponse, type NextRequest } from "next/server";
import { getAdminToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

export async function PUT(request: NextRequest) {
  console.log("[DEBUG] /api/admin/profile proxy route invoked.");

  const token = await getAdminToken();

  if (!token) {
    console.error("[DEBUG] No admin token found.");
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    console.error("[DEBUG] Invalid JSON body.");
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const backendUrl = `${API_URL}/auth/profile`;
  console.log(`[DEBUG] Forwarding PUT request to backend: ${backendUrl}`);

  try {
    const res = await fetch(backendUrl, {
      method: 'PUT',
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json",
      },
      body: JSON.stringify(body),
    });
    
    console.log(`[DEBUG] Backend response status: ${res.status}`);
    const data = await res.json();

    if (!res.ok) {
      console.error("[DEBUG] Backend returned an error:", data);
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error("[DEBUG] Profile update proxy fetch error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
