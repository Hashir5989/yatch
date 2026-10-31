import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { saveEnquiryServer, getEnquiriesServer, verifySessionToken } from "@/lib/server/db";
import { sendEnquiryEmail } from "@/lib/server/email";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// In-memory sliding-window deduplication store (sliding 60-second window)
const recentSubmissions = new Map();
const DEDUPE_WINDOW_MS = 60 * 1000;

function cleanupOldSubmissions() {
  const now = Date.now();
  for (const [key, timestamp] of recentSubmissions.entries()) {
    if (now - timestamp > DEDUPE_WINDOW_MS) {
      recentSubmissions.delete(key);
    }
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      firstName, 
      lastName, 
      name, 
      email, 
      phone, 
      location, 
      country, 
      message,
      model,
      yachtModel,
      yachtName
    } = body;

    const fName = (firstName || (name ? name.split(" ")[0] : "") || "").trim();
    const lName = (lastName || (name ? name.split(" ").slice(1).join(" ") : "") || "").trim();

    // Server-side validation for required fields
    if (!fName || fName.length < 1) {
      return NextResponse.json(
        { success: false, error: "Please provide your first name." },
        { status: 400 }
      );
    }

    if (!lName || lName.length < 1) {
      return NextResponse.json(
        { success: false, error: "Please provide your last name." },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const cleanPhone = typeof phone === "string" ? phone.trim().slice(0, 50) : "";
    if (!cleanPhone || cleanPhone.length < 3) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid phone number." },
        { status: 400 }
      );
    }

    const cleanLocation = typeof location === "string" ? location.trim().slice(0, 255) : "";
    if (!cleanLocation || cleanLocation.length < 1) {
      return NextResponse.json(
        { success: false, error: "Please provide your location." },
        { status: 400 }
      );
    }

    const cleanCountry = typeof country === "string" ? country.trim().slice(0, 100) : "";
    if (!cleanCountry || cleanCountry.length < 1) {
      return NextResponse.json(
        { success: false, error: "Please provide your country." },
        { status: 400 }
      );
    }

    const cleanMessage = typeof message === "string" ? message.trim().slice(0, 5000) : "";
    if (!cleanMessage || cleanMessage.length < 1) {
      return NextResponse.json(
        { success: false, error: "Please enter your message." },
        { status: 400 }
      );
    }

    const cleanFirstName = fName.slice(0, 100);
    const cleanLastName = lName.slice(0, 100);
    const cleanName = `${cleanFirstName} ${cleanLastName}`.trim();
    const cleanEmail = email.trim().toLowerCase().slice(0, 255);
    const cleanModel = typeof (model || yachtModel || yachtName) === "string" 
      ? (model || yachtModel || yachtName).trim().slice(0, 100) 
      : "";

    // Duplicate submission prevention
    cleanupOldSubmissions();
    const dedupeKey = `${cleanEmail}:${cleanMessage}`;
    if (recentSubmissions.has(dedupeKey)) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Your enquiry was already received. Please wait a moment before resubmitting." 
        },
        { status: 429 }
      );
    }
    recentSubmissions.set(dedupeKey, Date.now());

    // 1. Save enquiry to database (PostgreSQL customer_enquiries or fallback JSON)
    const saved = await saveEnquiryServer({
      firstName: cleanFirstName,
      lastName: cleanLastName,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      location: cleanLocation,
      country: cleanCountry,
      model: cleanModel,
      message: cleanMessage,
    });

    if (!saved) {
      throw new Error("Database failed to persist enquiry record");
    }

    // 2. Dispatch Hostinger SMTP email notification to info@asmaraty.com
    // Handled safely in try/catch so SMTP issues never discard a saved enquiry
    let emailDispatched = false;
    let emailError = null;

    try {
      const emailResult = await sendEnquiryEmail(saved);
      emailDispatched = Boolean(emailResult?.success);
      if (!emailDispatched) {
        emailError = emailResult?.error || "Email delivery failed";
      }
    } catch (emailErr) {
      emailError = emailErr.message;
      console.warn("[SMTP] Background Hostinger email dispatch error:", emailErr.message);
    }

    return NextResponse.json({ 
      success: true, 
      enquiry: saved,
      emailDispatched,
      ...(emailError ? { emailWarning: "Notification delivery pending" } : {})
    });
  } catch (err) {
    console.error("Enquiry POST API error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to submit enquiry. Please try again or contact us directly." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("asm_admin_session")?.value;

    if (!token || !verifySessionToken(token)) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    const enquiries = await getEnquiriesServer();
    return NextResponse.json({ success: true, enquiries });
  } catch (err) {
    console.error("Enquiry GET API error:", err);
    return NextResponse.json({ success: false, error: "Failed to retrieve enquiries" }, { status: 500 });
  }
}
