/**
 * ASMARATY Luxury Yachts — SMTP Email Dispatch Test Utility
 * 
 * Tests sending a sample VIP client enquiry to your designated test email address.
 * 
 * Usage:
 *   node scripts/test-email.js [your-email@example.com]
 */

const fs = require("fs");
const path = require("path");

// Load .env.local if present
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

async function runTest() {
  const nodemailer = require("nodemailer");

  // Determine recipient email: from CLI argument, or .env.local, or prompt
  const targetEmail = process.argv[2] || process.env.CONTACT_RECIPIENT_EMAIL || "hashirbinali@gmail.com";

  console.log("\n============================================================");
  console.log("📨 ASMARATY Luxury Yachts — Test Email Dispatcher");
  console.log("============================================================");
  console.log(`• Destination / Test Recipient: ${targetEmail}`);

  let transporter;
  const isConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

  if (isConfigured) {
    console.log(`• Using SMTP Host: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT || 465}`);
    console.log(`• Authenticated User: ${process.env.SMTP_USER}`);

    const port = parseInt(process.env.SMTP_PORT || "465", 10);
    const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465;

    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    console.log("\n⚠️ Notice: No SMTP_HOST or SMTP_PASS found in .env.local.");
    console.log("Generating an instant test inbox via Ethereal Email (no real credentials needed)...");

    const testAccount = await nodemailer.createTestAccount();
    console.log(`✓ Ephemeral test mailbox generated: ${testAccount.user}`);

    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  try {
    console.log("\n• Verifying SMTP connection...");
    await transporter.verify();
    console.log("✓ SMTP Server is ready to deliver messages.");

    console.log(`• Dispatching sample ASMARATY G100 Enquiry to ${targetEmail}...`);
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || `"ASMARATY Luxury Yachts" <${process.env.SMTP_USER || "info@asmaraty.ae"}>`,
      to: targetEmail,
      replyTo: "sheikh.vip.buyer@advisory.ae",
      subject: "[ASMARATY Test] VIP Enquiry — G100 Superyacht",
      text: `
ASMARATY Luxury Yachts — Test Email Notification
===================================================
Status: SMTP Configuration Test Successful!
Target Recipient: ${targetEmail}
Vessel: ASMARATY G100 Superyacht
Client: Sheikh Mohammed Al-Qasimi
Inquiry Type: Private Sea Trial Request (Dubai Marina)
Timestamp: ${new Date().toISOString()}

This confirms that your email notifications and SMTP credentials
are working properly for receiving website leads.
      `.trim(),
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #08101C; color: #E8EEF5; padding: 30px; border-radius: 6px; max-width: 600px; margin: 0 auto; border: 1px solid #C6A155;">
          <h2 style="color: #C6A155; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 0;">ASMARATY Luxury Yachts</h2>
          <p style="font-size: 14px; color: #8E9DAE; text-transform: uppercase; letter-spacing: 0.15em;">SMTP Configuration Test</p>
          <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 20px 0;" />
          <p style="font-size: 15px; color: #FFFFFF;">✅ <strong>Email integration test was successful!</strong></p>
          <p style="font-size: 13px; line-height: 1.6; color: #B0BCCB;">
            This email confirms that incoming client enquiries from the ASMARATY website contact form will be delivered to <strong>${targetEmail}</strong>.
          </p>
          <div style="background-color: #0E1A2D; padding: 15px; border-left: 3px solid #C6A155; margin: 20px 0;">
            <p style="margin: 0; font-size: 13px; color: #E8EEF5;"><strong>Sample Lead:</strong> ASMARATY G100 Superyacht — Sea Trial Request</p>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #8E9DAE;">Client: Sheikh Mohammed Al-Qasimi (sheikh.vip.buyer@advisory.ae)</p>
          </div>
          <p style="font-size: 11px; color: #6E7C8E; text-align: center; margin-top: 25px;">
            ASMARATY Luxury Yachts • Maritime District, UAE
          </p>
        </div>
      `,
    });

    console.log(`\n🎉 Test email successfully sent! Message ID: ${info.messageId}`);

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`\n🔗 Instant Web Preview URL: ${previewUrl}`);
      console.log("(Open the URL above in your browser to inspect the formatted email)");
    } else {
      console.log(`✓ Email delivered to: ${targetEmail}`);
    }

  } catch (err) {
    console.error("\n❌ Error delivering test email:", err.message);
  }
}

runTest();
