import { NextResponse } from "next/server";
import { authenticateAdminRequest, updateAdminPassword } from "@/lib/server/db";

export async function POST(request) {
  try {
    const session = await authenticateAdminRequest(request);

    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
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
