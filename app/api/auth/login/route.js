import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminCredentials, createSessionToken } from "@/lib/server/db";


export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await verifyAdminCredentials(email, password);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = createSessionToken(user);
    const cookieStore = await cookies();

    // Determine if request is over HTTPS (respects proxy headers on EC2 / Hostinger)
    const proto = request.headers.get("x-forwarded-proto");
    const isHttps = proto === "https" || request.nextUrl.protocol === "https:";

    cookieStore.set("asm_admin_session", token, {
      httpOnly: true,
      secure: isHttps,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login API error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
