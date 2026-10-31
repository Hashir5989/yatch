import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import dns from "dns";

// Ensure Node resolves IPv4 addresses first on modern networks
dns.setDefaultResultOrder?.("ipv4first");

/**
 * Hostinger Business Email & SMTP Dispatcher for ASMARATY Luxury Yachts
 * 
 * Domain: asmaraty.com
 * SMTP Host: smtp.hostinger.com
 * SMTP Port: 465 (SSL)
 * Mailbox: info@asmaraty.com
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
    const host = process.env.SMTP_HOST || "smtp.hostinger.com";
    const port = parseInt(process.env.SMTP_PORT || "465", 10);
    const secure = process.env.SMTP_SECURE 
      ? process.env.SMTP_SECURE === "true" 
      : port === 465;

    cachedTransporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 10000, // 10s
      greetingTimeout: 10000,
      socketTimeout: 15000,
      tls: {
        rejectUnauthorized: process.env.NODE_ENV === "production",
      },
    });
  }

  return cachedTransporter;
}

/**
 * Verify SMTP connection & credentials on demand
 */
export async function verifySmtpConnection() {
  const transporter = getTransporter();
  if (!transporter) {
    return { success: false, error: "SMTP environment variables are not configured." };
  }

  try {
    await transporter.verify();
    return { success: true, message: "Hostinger SMTP connection verified successfully." };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Dispatch luxury HTML email notification to info@asmaraty.com
 * Includes: Client Name, Email, Phone, Yacht Name/Model, Location, Country, Message, Date
 */
export async function sendEnquiryEmail(enquiry) {
  let transporter = getTransporter();
  let isTestAccount = false;

  // Graceful fallback to Ethereal or JSON mock transport if live credentials are not set in dev
  if (!transporter) {
    try {
      console.log("[SMTP] Live SMTP not configured. Attempting ephemeral test transporter for local verification...");
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
      console.log("[SMTP] External test transport unreachable. Falling back to offline JSON preview transport...");
      transporter = nodemailer.createTransport({
        jsonTransport: true,
      });
      isTestAccount = true;
    }
  }

  try {
    const fromName = process.env.SMTP_FROM_NAME || "ASMARATY Luxury Yachts";
    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || "info@asmaraty.com";
    const fromAddress = process.env.SMTP_FROM || `"${fromName}" <${fromEmail}>`;
    const recipient = process.env.CONTACT_RECIPIENT_EMAIL || "info@asmaraty.com";

    const firstName = enquiry.firstName || (enquiry.name ? enquiry.name.split(" ")[0] : "") || "Client";
    const lastName = enquiry.lastName || (enquiry.name ? enquiry.name.split(" ").slice(1).join(" ") : "") || "";
    const fullName = [firstName, lastName].filter(Boolean).join(" ") || "Client";
    const email = enquiry.email || "";
    const phone = enquiry.phone || "Not provided";
    const location = enquiry.location || "Not provided";
    const country = enquiry.country || "Not provided";
    const yachtModel = enquiry.model || enquiry.yachtModel || enquiry.yachtName || "";
    const message = enquiry.message || "";
    const enquiryId = enquiry.id || `enq-${Date.now()}`;
    const formattedDate = new Date(enquiry.createdAt || Date.now()).toLocaleString("en-US", {
      timeZone: "Asia/Dubai",
      dateStyle: "full",
      timeStyle: "medium",
    });

    const subject = yachtModel 
      ? `[ASMARATY Enquiry] ${fullName} — ${yachtModel} (${country})`
      : `[ASMARATY Enquiry] ${fullName} — ${country}`;

    // CID logo attachment for bulletproof rendering in Gmail, Apple Mail, Outlook
    const attachments = [];
    const logoCandidates = [
      path.join(process.cwd(), "public", "images", "asmaraty-logo.png"),
      path.join(process.cwd(), "public", "images", "asmaraty-logo-cropped.png"),
    ];
    const resolvedLogoPath = logoCandidates.find((p) => fs.existsSync(p));

    if (resolvedLogoPath) {
      attachments.push({
        filename: "asmaraty-logo.png",
        path: resolvedLogoPath,
        cid: "asmaratylogo",
      });
    }

    const textContent = `
NEW CLIENT ENQUIRY — ASMARATY LUXURY YACHTS
==================================================================
Reference ID:  ${enquiryId}
Date & Time:   ${formattedDate} (GST / UAE)
==================================================================

CLIENT DETAILS:
- Full Name:     ${fullName}
- Email Address: ${email}
- Phone:         ${phone}
- Location:      ${location}
- Country:       ${country}
${yachtModel ? `- Yacht Model:   ${yachtModel}\n` : ""}- Inquiry Status: New Direct Lead

CLIENT MESSAGE:
------------------------------------------------------------------
${message || "(No message body provided)"}
------------------------------------------------------------------

Reply directly to this email to respond to the client at: ${email}
ASMARATY SHIPYARD • AL SHAALI MARINE • RASHIDIA 1, AJMAN, UAE
    `.trim();

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      margin: 0;
      padding: 24px 12px;
      background-color: #05080E;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #E2E8F0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      max-width: 620px;
      margin: 0 auto;
      background-color: #0E1828;
      border: 1px solid #C6A155;
      border-radius: 4px;
      overflow: hidden;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
    }
    .header {
      background: linear-gradient(180deg, #0A1220 0%, #0E1828 100%);
      padding: 36px 32px 24px 32px;
      text-align: center;
      border-bottom: 1px solid rgba(198, 161, 85, 0.25);
    }
    .logo-img {
      max-height: 48px;
      width: auto;
      display: inline-block;
      border: 0;
      margin-bottom: 16px;
    }
    .eyebrow {
      font-size: 11px;
      color: #C6A155;
      letter-spacing: 0.26em;
      text-transform: uppercase;
      font-weight: 700;
      margin-bottom: 6px;
    }
    .headline {
      font-size: 24px;
      color: #FFFFFF;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      margin: 0;
      font-weight: 300;
    }
    .badge-yacht {
      display: inline-block;
      margin-top: 14px;
      padding: 6px 14px;
      background-color: rgba(198, 161, 85, 0.15);
      border: 1px solid rgba(198, 161, 85, 0.5);
      color: #DFBA73;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      border-radius: 2px;
    }
    .content {
      padding: 32px;
    }
    .section-title {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      color: #8E9DAE;
      font-weight: 700;
      margin: 0 0 14px 0;
      padding-bottom: 8px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .details-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 28px;
    }
    .details-table td {
      padding: 11px 4px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      font-size: 13px;
      vertical-align: top;
    }
    .details-table .label {
      color: #8E9DAE;
      text-transform: uppercase;
      font-size: 11px;
      letter-spacing: 0.08em;
      width: 34%;
      font-weight: 600;
    }
    .details-table .val {
      color: #FFFFFF;
      font-weight: 500;
    }
    .link-gold {
      color: #DFBA73;
      text-decoration: none;
    }
    .link-gold:hover {
      text-decoration: underline;
    }
    .link-white {
      color: #FFFFFF;
      text-decoration: none;
    }
    .message-container {
      margin-top: 24px;
    }
    .message-card {
      background-color: #070B12;
      border: 1px solid rgba(198, 161, 85, 0.25);
      border-left: 3px solid #C6A155;
      padding: 20px;
      border-radius: 2px;
      font-size: 13px;
      line-height: 1.7;
      color: #F1F5F9;
      white-space: pre-wrap;
      word-break: break-word;
    }
    .btn-row {
      text-align: center;
      margin: 32px 0 12px 0;
    }
    .reply-btn {
      display: inline-block;
      background-color: #C6A155;
      color: #08101C !important;
      text-decoration: none;
      padding: 14px 32px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      border-radius: 2px;
    }
    .footer {
      background-color: #080D16;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      padding: 24px 32px;
      text-align: center;
      font-size: 11px;
      color: #64748B;
      line-height: 1.6;
    }
    .footer-brand {
      color: #A0AEC0;
      font-weight: 600;
      margin-bottom: 4px;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      ${resolvedLogoPath ? `<img src="cid:asmaratylogo" alt="ASMARATY" class="logo-img" />` : ""}
      <div class="eyebrow">ASMARATY SHIPYARD &amp; MARINA • UAE</div>
      <h1 class="headline">New Client Enquiry</h1>
      ${yachtModel ? `<div class="badge-yacht">Vessel Interest: ${yachtModel}</div>` : ""}
    </div>

    <div class="content">
      <div class="section-title">Prospect Specifications</div>
      <table class="details-table">
        <tr>
          <td class="label">Full Name</td>
          <td class="val">${fullName}</td>
        </tr>
        <tr>
          <td class="label">Email Address</td>
          <td class="val"><a href="mailto:${email}" class="link-gold">${email}</a></td>
        </tr>
        <tr>
          <td class="label">Phone / WhatsApp</td>
          <td class="val"><a href="tel:${phone.replace(/\s+/g, '')}" class="link-white font-mono">${phone}</a></td>
        </tr>
        ${yachtModel ? `
        <tr>
          <td class="label">Yacht Model</td>
          <td class="val" style="color: #DFBA73; font-weight: 700;">${yachtModel}</td>
        </tr>` : ""}
        <tr>
          <td class="label">Location</td>
          <td class="val">${location}</td>
        </tr>
        <tr>
          <td class="label">Country</td>
          <td class="val">${country}</td>
        </tr>
        <tr>
          <td class="label">Received (GST)</td>
          <td class="val">${formattedDate}</td>
        </tr>
        <tr>
          <td class="label">Reference ID</td>
          <td class="val" style="font-family: monospace; color: #94A3B8;">${enquiryId}</td>
        </tr>
      </table>

      <div class="message-container">
        <div class="section-title">Client Message</div>
        <div class="message-card">${message || "(No message body provided)"}</div>
      </div>

      <div class="btn-row">
        <a href="mailto:${email}?subject=ASMARATY%20Shipyard%20Enquiry%20Response%20-%20Ref%20${enquiryId}" class="reply-btn">
          Direct Reply to Client
        </a>
      </div>
    </div>

    <div class="footer">
      <div class="footer-brand">AL SHAALI MARINE • ASMARATY LUXURY YACHTS</div>
      <div>RASHIDIA 1, AJMAN, United Arab Emirates</div>
      <div style="margin-top: 6px; font-size: 10px; color: #475569;">
        Confidential VIP enquiry notification delivered to <strong>${recipient}</strong> via Hostinger SMTP.
      </div>
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
    console.log(`[SMTP] Hostinger enquiry notification dispatched successfully to ${recipient}. Message ID: ${info.messageId}`);

    if (isTestAccount) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`[SMTP] 🔗 Webmail Preview URL: ${previewUrl}`);
      }
    }

    return { 
      success: true, 
      messageId: info.messageId, 
      recipient, 
      isTestAccount 
    };
  } catch (err) {
    console.error("[SMTP] Hostinger SMTP dispatch error:", err.message);
    return { 
      success: false, 
      error: err.message,
      code: err.code || "SMTP_DISPATCH_FAILURE" 
    };
  }
}
