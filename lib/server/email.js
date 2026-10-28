import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import dns from "dns";

// Ensure Node resolves IPv4 addresses first on Windows networks
dns.setDefaultResultOrder?.("ipv4first");

/**
 * Hostinger Business Email & Custom SMTP Dispatcher for ASMARATY
 */

let cachedTransporter = null;

export function isSmtpConfigured() {
  return Boolean(
    process.env.SMTP_HOST && 
    process.env.SMTP_USER && 
    process.env.SMTP_PASS
  );
}

export function getTransporter() {
  if (!isSmtpConfigured()) {
    return null;
  }

  if (!cachedTransporter) {
    const port = parseInt(process.env.SMTP_PORT || "465", 10);
    const secure = process.env.SMTP_SECURE 
      ? process.env.SMTP_SECURE === "true" 
      : port === 465;

    cachedTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: process.env.NODE_ENV === "production",
      },
    });
  }

  return cachedTransporter;
}

/**
 * Send notification email when a client submits an enquiry.
 * Contains ASMARATY brand logo and only the 7 client enquiry fields:
 * First Name, Last Name, Email, Phone, Location, Country, Message.
 */
export async function sendEnquiryEmail(enquiry) {
  let transporter = getTransporter();
  let isTestAccount = false;

  if (!transporter) {
    try {
      console.log("[SMTP] Live SMTP not configured. Creating local test mailbox for delivery to hashirbinali@gmail.com...");
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      isTestAccount = true;
    } catch (testErr) {
      console.warn("[SMTP] Could not create test transport:", testErr.message);
      return { success: false, reason: "smtp_not_configured" };
    }
  }

  try {
    const fromAddress = process.env.SMTP_FROM || `"ASMARATY Luxury Yachts" <info@asmaraty.ae>`;
    const recipient = process.env.CONTACT_RECIPIENT_EMAIL || "hashirbinali@gmail.com";

    const firstName = enquiry.firstName || (enquiry.name ? enquiry.name.split(" ")[0] : "") || "Client";
    const lastName = enquiry.lastName || (enquiry.name ? enquiry.name.split(" ").slice(1).join(" ") : "") || "";
    const fullName = [firstName, lastName].filter(Boolean).join(" ");
    const email = enquiry.email || "";
    const phone = enquiry.phone || "Not provided";
    const location = enquiry.location || "Not provided";
    const country = enquiry.country || "Not provided";
    const message = enquiry.message || "";

    const subject = `[ASMARATY Enquiry] ${fullName} — ${country}`;

    // Attach logo via CID for bulletproof email client rendering (Gmail, Apple Mail, Outlook)
    const attachments = [];
    const logoFileCandidates = [
      path.join(process.cwd(), "public", "images", "asmaraty-logo.png"),
      path.join(process.cwd(), "public", "images", "asmaraty-logo-cropped.png"),
    ];
    let resolvedLogoPath = logoFileCandidates.find((p) => fs.existsSync(p));

    if (resolvedLogoPath) {
      attachments.push({
        filename: "asmaraty-logo.png",
        path: resolvedLogoPath,
        cid: "asmaratylogo",
      });
    }

    const textContent = `
New ASMARATY Client Enquiry
===============================================
First Name:    ${firstName}
Last Name:     ${lastName}
Email Address: ${email}
Phone:         ${phone}
Location:      ${location}
Country:       ${country}
Date & Time:   ${new Date().toLocaleString("en-US", { timeZone: "Asia/Dubai" })} (GST)
Enquiry ID:    ${enquiry.id || "N/A"}

Message:
-----------------------------------------------
${message || "(No message body provided)"}
-----------------------------------------------

Hit Reply to respond directly to ${email}.
ASMARATY Luxury Yachts • Maritime District, United Arab Emirates
    `.trim();

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #070A0F; color: #E8EEF5; margin: 0; padding: 24px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #0E1522; border: 1px solid #C6A155; padding: 32px; border-radius: 4px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    .header { border-bottom: 1px solid rgba(198, 161, 85, 0.25); padding-bottom: 24px; margin-bottom: 24px; text-align: center; }
    .logo-wrap { text-align: center; margin-bottom: 16px; padding: 4px 0; }
    .gold-title { color: #C6A155; font-size: 22px; letter-spacing: 0.12em; text-transform: uppercase; margin: 0; font-weight: 600; }
    .eyebrow { font-size: 11px; color: #8E9DAE; letter-spacing: 0.24em; text-transform: uppercase; margin-bottom: 6px; font-weight: bold; }
    .table-details { width: 100%; border-collapse: collapse; margin-top: 8px; }
    .table-details td { padding: 11px 4px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 13px; }
    .label { color: #8E9DAE; text-transform: uppercase; font-size: 11px; letter-spacing: 0.08em; width: 36%; font-weight: 500; }
    .value { color: #FFFFFF; font-weight: 500; }
    .message-section { margin-top: 24px; }
    .message-heading { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #C6A155; font-weight: 600; margin-bottom: 8px; }
    .message-box { background-color: #080B10; border: 1px solid rgba(198, 161, 85, 0.2); padding: 18px; border-radius: 3px; font-size: 13px; line-height: 1.7; white-space: pre-wrap; color: #F0F4F8; }
    .footer { text-align: center; font-size: 11px; color: #6E7C8E; margin-top: 28px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 18px; line-height: 1.6; }
    .btn-wrap { text-align: center; margin-top: 24px; }
    .btn { display: inline-block; background-color: #C6A155; color: #080B10; text-decoration: none; padding: 13px 28px; font-size: 12px; font-weight: bold; letter-spacing: 0.12em; text-transform: uppercase; border-radius: 2px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-wrap">
        <img src="cid:asmaratylogo" alt="ASMARATY" style="max-height: 48px; width: auto; max-width: 220px; display: inline-block; border: 0;" />
      </div>
      <div class="eyebrow">ASMARATY SHIPYARD &amp; MARINA</div>
      <h1 class="gold-title">New Client Enquiry</h1>
    </div>

    <table class="table-details">
      <tr>
        <td class="label">First Name</td>
        <td class="value">${firstName}</td>
      </tr>
      <tr>
        <td class="label">Last Name</td>
        <td class="value">${lastName}</td>
      </tr>
      <tr>
        <td class="label">Email</td>
        <td class="value"><a href="mailto:${email}" style="color: #DFBA73; text-decoration: none;">${email}</a></td>
      </tr>
      <tr>
        <td class="label">Phone</td>
        <td class="value"><a href="tel:${phone}" style="color: #FFFFFF; text-decoration: none;">${phone}</a></td>
      </tr>
      <tr>
        <td class="label">Location</td>
        <td class="value">${location}</td>
      </tr>
      <tr>
        <td class="label">Country</td>
        <td class="value">${country}</td>
      </tr>
    </table>

    <div class="message-section">
      <div class="message-heading">Message:</div>
      <div class="message-box">${message || "(No message body provided)"}</div>
    </div>

    <div class="btn-wrap">
      <a href="mailto:${email}?subject=ASMARATY%20Shipyard%20Enquiry%20Response" class="btn">
        Reply to Client
      </a>
    </div>

    <div class="footer">
      <strong>AL SHAALI MARINE</strong> • RASHIDIA 1, AJMAN, United Arab Emirates<br>
      Confidential Prospective Client Lead (ID: ${enquiry.id || "N/A"})
    </div>
  </div>
</body>
</html>
    `.trim();

    const mailOptions = {
      from: fromAddress,
      to: recipient,
      replyTo: email,
      subject,
      text: textContent,
      html: htmlContent,
      attachments,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log(`[SMTP] Enquiry email dispatched successfully to ${recipient}. Message ID: ${info.messageId}`);
    if (isTestAccount) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`[SMTP] 🔗 Instant Webmail Preview: ${previewUrl}`);
      }
    }
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error("[SMTP] Error dispatching enquiry notification:", err.message);
    return { success: false, error: err.message };
  }
}
