import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken, updateAdminPassword } from "@/lib/server/db";


export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("asm_admin_session")?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const session = verifySessionToken(token);
    if (!session) {
      return NextResponse.json({ success: false, error: "Invalid session" }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    const result = await updateAdminPassword(currentPassword, newPassword, session.email);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.error("Password update API error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
