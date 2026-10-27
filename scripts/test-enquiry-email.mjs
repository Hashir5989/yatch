import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local
const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const key = trimmed.substring(0, idx).trim();
        let val = trimmed.substring(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.substring(1, val.length - 1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  });
}

import { sendEnquiryEmail } from "../lib/server/email.js";

async function main() {
  console.log("============================================================");
  console.log("📨 Testing ASMARATY Enquiry Email with Logo & 7 Fields");
  console.log("============================================================");

  const sampleEnquiry = {
    id: `enq-test-${Date.now()}`,
    firstName: "Hashir",
    lastName: "Bin Ali",
    email: "hashirbinali@gmail.com",
    phone: "+971 50 123 4567",
    location: "Dubai Marina",
    country: "United Arab Emirates",
    message: "I would like to schedule a private consultation and tour of the shipyard facilities.",
  };

  console.log("Payload:", JSON.stringify(sampleEnquiry, null, 2));
  console.log("\nSending email via configured SMTP...");

  const result = await sendEnquiryEmail(sampleEnquiry);

  if (result.success) {
    console.log(`\n✅ Email successfully sent! Message ID: ${result.messageId}`);
    console.log(`Delivered to: ${process.env.CONTACT_RECIPIENT_EMAIL || "hashirbinali@gmail.com"}`);
  } else {
    console.error(`\n❌ Email delivery failed:`, result.error || result.reason);
  }
}

main().catch(console.error);
