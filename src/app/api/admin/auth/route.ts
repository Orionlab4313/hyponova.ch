import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { password } = await request.json();
  if (password === (process.env.ADMIN_PASSWORD || "HypoAdmin2026!")) {
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
