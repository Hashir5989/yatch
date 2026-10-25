import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { saveEnquiryServer, getEnquiriesServer, verifySessionToken } from "@/lib/server/db";


export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, phone, model, inquiryType, message } = body;

    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: "Name and email are required" },
        { status: 400 }
      );
    }

    const saved = saveEnquiryServer({
      name,
      email,
      phone: phone || "",
      model: model || "AS 100 Superyacht",
      inquiryType: inquiryType || "Sea Trial Request",
      message: message || "",
    });

    return NextResponse.json({ success: true, enquiry: saved });
  } catch (err) {
    console.error("Enquiry POST API error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to record enquiry" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("asm_admin_session")?.value;

    if (!token || !verifySessionToken(token)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const enquiries = getEnquiriesServer();
    return NextResponse.json({ success: true, enquiries });
  } catch (err) {
    console.error("Enquiry GET API error:", err);
    return NextResponse.json({ success: false, error: "Failed to load enquiries" }, { status: 500 });
  }
}
