import { NextResponse } from "next/server";
import { authenticateAdminRequest, createSessionToken } from "@/lib/server/db";

export async function GET(request) {
  try {
    const session = await authenticateAdminRequest(request);

    if (!session) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const token = createSessionToken(session);

    return NextResponse.json({
      authenticated: true,
      token,
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
