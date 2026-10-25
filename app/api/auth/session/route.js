import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/server/db";


export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("asm_admin_session")?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const session = verifySessionToken(token);
    if (!session) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.id,
        email: session.email,
        name: session.name,
        role: session.role,
      },
    });
  } catch {
    return NextResponse.json({ authenticated: false, user: null });
  }
}
