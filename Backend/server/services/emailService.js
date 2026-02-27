const nodemailer = require("nodemailer");

const getEmailCredentials = () => {
  const user = String(process.env.EMAIL_USER || "").trim();
  const rawPassword = String(process.env.EMAIL_PASSWORD || "");
  const pass = rawPassword.replace(/\s+/g, "").trim();
  return { user, pass };
};

// Create email transporter
const emailCredentials = getEmailCredentials();
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587, // Use port 587 instead of 465
  secure: false, // Use STARTTLS
  auth: {
    user: emailCredentials.user,
    pass: emailCredentials.pass,
  },
  tls: {
    rejectUnauthorized: false, // Allow self-signed certificates in development
  },
  connectionTimeout: 10000, // 10 seconds timeout
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

// Send booking confirmation email
exports.sendBookingConfirmationEmail = async (userEmail, userName, bookingDetails) => {
  try {
    if (!emailCredentials.user || !emailCredentials.pass) {
      console.warn("⚠️ Booking confirmation email skipped: EMAIL_USER or EMAIL_PASSWORD not configured");
      return false;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER || "noreply@suryaurja.com",
      to: userEmail,
      subject: "🎉 Booking Confirmed - SuryaUrja Solar Solutions",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            .detail-label { font-weight: bold; color: #374151; }
            .detail-value { color: #16a34a; font-weight: 600; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
            .button { display: inline-block; background: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>☀️ SuryaUrja</h1>
              <h2>Booking Confirmed!</h2>
            </div>
            <div class="content">
              <p>Dear ${userName},</p>
              <p>Great news! Your solar system booking has been confirmed successfully.</p>
              
              <div class="details">
                <h3 style="color: #16a34a; margin-top: 0;">Booking Details</h3>
                <div class="detail-row">
                  <span class="detail-label">System Type:</span>
                  <span class="detail-value">${bookingDetails.systemType}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Capacity:</span>
                  <span class="detail-value">${bookingDetails.capacity || 0} kW</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Base Cost:</span>
                  <span class="detail-value">₹${(bookingDetails.baseCost || 0).toLocaleString()}</span>
                </div>
                ${bookingDetails.subsidyApplied ? `
                <div class="detail-row">
                  <span class="detail-label">Subsidy Applied:</span>
                  <span class="detail-value">₹${(bookingDetails.subsidyAmount || 0).toLocaleString()}</span>
                </div>
                ` : ''}
                <div class="detail-row">
                  <span class="detail-label">Final Cost:</span>
                  <span class="detail-value" style="font-size: 18px;">₹${(bookingDetails.finalCost || 0).toLocaleString()}</span>
                </div>
                ${bookingDetails.emiEnabled ? `
                <div class="detail-row">
                  <span class="detail-label">EMI Plan:</span>
                  <span class="detail-value">${bookingDetails.emiYears || 0} years @ ₹${(bookingDetails.monthlyEmi || 0).toLocaleString()}/month</span>
                </div>
                ` : ''}
              </div>

              <p><strong>What's Next?</strong></p>
              <ul>
                <li>Our installation team will contact you within 24-48 hours</li>
                <li>Site survey will be scheduled at your convenience</li>
                <li>Installation will be completed within 7-10 working days</li>
              </ul>

              <center>
                <a href="http://localhost:3000/dashboard" class="button">View Dashboard</a>
              </center>

              <p style="margin-top: 30px;">If you have any questions, feel free to reach out to our support team.</p>
              
              <p>Best regards,<br>
              <strong>SuryaUrja Team</strong><br>
              Green Energy Solar Solutions</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
              <p>&copy; 2026 SuryaUrja. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Booking confirmation email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error(
      "❌ Failed to send booking confirmation email:",
      error?.code || "EMAIL_ERROR",
      "-",
      error?.responseCode || "",
      error?.message || "Unknown error"
    );
    if (error?.code === "EAUTH") {
      console.error("👉 Check Gmail App Password in .env (16 chars, no spaces) and ensure 2-Step Verification is enabled.");
    }
    return false;
  }
};

// Send password reset email
exports.sendPasswordResetEmail = async (userEmail, userName, resetLink) => {
  const mailOptions = {
    from: process.env.EMAIL_USER || "noreply@suryaurja.com",
    to: userEmail,
    subject: "Reset your password",
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; background: #f8fafc; padding: 24px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
          <h2 style="color: #16a34a;">Hi ${userName || "there"},</h2>
          <p style="color: #334155; line-height: 1.6;">We received a request to reset your password. Click the button below to set a new password. This link will expire in 1 hour.</p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${resetLink}" style="background: #16a34a; color: #ffffff; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: bold;">Reset Password</a>
          </div>
          <p style="color: #475569; line-height: 1.6;">If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #0ea5e9;">${resetLink}</p>
          <p style="color: #94a3b8; font-size: 12px;">If you did not request a password reset, you can safely ignore this email.</p>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Send subsidy approval email
exports.sendSubsidyApprovalEmail = async (userEmail, userName, subsidyDetails) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || "noreply@suryaurja.com",
      to: userEmail,
      subject: "💰 Subsidy Approved - SuryaUrja Solar Solutions",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .highlight { background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
            .amount { font-size: 32px; color: #16a34a; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>☀️ SuryaUrja</h1>
              <h2>Subsidy Approved!</h2>
            </div>
            <div class="content">
              <p>Dear ${userName},</p>
              <p>Congratulations! Your subsidy application has been approved.</p>
              
              <div class="highlight">
                <p style="margin: 0; color: #6b7280;">Approved Amount</p>
                <p class="amount">₹${subsidyDetails.amount.toLocaleString()}</p>
              </div>

              <p>The subsidy amount will be disbursed to your account within <strong>5-7 business days</strong>.</p>
              
              <p>Best regards,<br>
              <strong>SuryaUrja Team</strong></p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Subsidy approval email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Failed to send subsidy approval email:", error);
    return false;
  }
};

// Send support ticket reply email
exports.sendSupportReplyEmail = async (userEmail, userName, ticketId, replyMessage) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || "noreply@suryaurja.com",
      to: userEmail,
      subject: `📧 New Reply to Your Support Ticket #${ticketId}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .reply { background: white; padding: 20px; border-left: 4px solid #16a34a; margin: 20px 0; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>☀️ SuryaUrja</h1>
              <h2>Support Ticket Update</h2>
            </div>
            <div class="content">
              <p>Dear ${userName},</p>
              <p>There's a new reply to your support ticket <strong>#${ticketId}</strong>:</p>
              
              <div class="reply">
                <p>${replyMessage}</p>
              </div>

              <p><a href="http://localhost:3000/messages">View Full Conversation</a></p>
              
              <p>Best regards,<br>
              <strong>SuryaUrja Support Team</strong></p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Support reply email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Failed to send support reply email:", error);
    return false;
  }
};

// Send contact form message to admin
exports.sendContactFormEmail = async (contactData) => {
  try {
    const { name, email, message } = contactData;
    
    const mailOptions = {
      from: process.env.EMAIL_USER || "noreply@suryaurja.com",
      to: "teamsuryaurjaa@gmail.com",
      subject: `📧 New Contact Form Submission from ${name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-box { background: white; padding: 20px; border-left: 4px solid #16a34a; margin: 20px 0; border-radius: 5px; }
            .sender-info { background: #f0fdf4; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .sender-info p { margin: 8px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>☀️ New Contact Form Submission</h1>
            </div>
            <div class="content">
              <div class="sender-info">
                <p><strong>From:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
              </div>

              <h3>Message:</h3>
              <div class="info-box">
                <p>${message.replace(/\n/g, '<br>')}</p>
              </div>

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              <p style="color: #6b7280; font-size: 12px;">This is an automated message from the contact form on your website.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Contact form email sent to admin:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Failed to send contact form email:", error);
    return false;
  }
};

// Send complaint ticket notification to admin
exports.sendComplaintTicketEmail = async (ticketData) => {
  try {
    const { ticketId, customerName, customerEmail, description, priority } = ticketData;
    
    const priorityColor = priority === "high" ? "#dc2626" : priority === "medium" ? "#f59e0b" : "#10b981";
    
    const mailOptions = {
      from: process.env.EMAIL_USER || "noreply@suryaurja.com",
      to: "teamsuryaurjaa@gmail.com",
      subject: `🚨 New Complaint Ticket #${ticketId} - Priority: ${priority?.toUpperCase()}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #fef2f2; padding: 30px; border-radius: 0 0 10px 10px; }
            .alert-box { background: white; border-left: 4px solid ${priorityColor}; padding: 20px; margin: 20px 0; border-radius: 5px; }
            .complaint-details { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #fee2e2; }
            .detail-label { font-weight: bold; color: #374151; }
            .detail-value { color: #dc2626; font-weight: 600; }
            .priority-badge { display: inline-block; background: ${priorityColor}; color: white; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; }
            .button { display: inline-block; background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚨 New Complaint Alert</h1>
              <h2>Ticket #${ticketId}</h2>
            </div>
            <div class="content">
              <p><strong>A new complaint ticket has been submitted.</strong></p>
              
              <div class="complaint-details">
                <h3 style="color: #dc2626; margin-top: 0;">Complaint Details</h3>
                <div class="detail-row">
                  <span class="detail-label">Ticket ID:</span>
                  <span class="detail-value">#${ticketId}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Customer:</span>
                  <span class="detail-value">${customerName}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Email:</span>
                  <span class="detail-value">${customerEmail}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Priority:</span>
                  <span><span class="priority-badge">${priority?.toUpperCase() || 'MEDIUM'}</span></span>
                </div>
              </div>

              <div class="alert-box">
                <h4 style="margin-top: 0;">Complaint Description:</h4>
                <p>${description.replace(/\n/g, '<br>')}</p>
              </div>

              <center>
                <a href="http://localhost:3000/admin/tickets" class="button">View Ticket</a>
              </center>

              <div class="footer" style="margin-top: 30px;">
                <p><strong>Action Required:</strong> Please review and respond to this complaint within 24 hours.</p>
                <p>This is an automated alert from the SuryaUrja support system. Please do not reply to this email.</p>
                <p>&copy; 2026 SuryaUrja. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Complaint ticket email sent to admin:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Failed to send complaint ticket email:", error);
    return false;
  }
};

// Send general ticket notification to admin (for all ticket types)
exports.sendTicketNotificationEmail = async (ticketData) => {
  try {
    const { ticketId, customerName, customerEmail, category, description, priority, subject } = ticketData;
    
    const priorityColor = priority === "high" || priority === "urgent" ? "#dc2626" : priority === "medium" ? "#f59e0b" : "#10b981";
    const categoryColors = {
      complaint: "#dc2626",
      technical: "#f59e0b",
      billing: "#8b5cf6",
      installation: "#3b82f6",
      maintenance: "#10b981",
      solar_upgrade: "#0ea5e9",
      solar_relocation: "#14b8a6",
      warranty: "#06b6d4",
      general: "#6b7280",
      feedback: "#ec4899",
      other: "#64748b"
    };
    
    const categoryColor = categoryColors[category] || "#6b7280";
    const isUrgent = category === "complaint" || priority === "urgent" || priority === "high";
    
    const mailOptions = {
      from: process.env.EMAIL_USER || "noreply@suryaurja.com",
      to: "teamsuryaurjaa@gmail.com",
      subject: `${isUrgent ? '🚨 URGENT - ' : '📧 '}New Support Ticket #${ticketId} - ${category.toUpperCase()}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, ${categoryColor} 0%, ${categoryColor}dd 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .ticket-details { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; border-left: 4px solid ${categoryColor}; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            .detail-label { font-weight: bold; color: #374151; }
            .detail-value { color: ${categoryColor}; font-weight: 600; }
            .priority-badge { display: inline-block; background: ${priorityColor}; color: white; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; }
            .category-badge { display: inline-block; background: ${categoryColor}; color: white; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
            .description-box { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; }
            .button { display: inline-block; background: ${categoryColor}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { color: #6b7280; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💬 New Support Ticket</h1>
              <h2>Ticket #${ticketId}</h2>
            </div>
            <div class="content">
              ${isUrgent ? '<p style="background: #fee2e2; color: #dc2626; padding: 12px; border-radius: 5px; font-weight: bold;">⚠️ This ticket requires immediate attention!</p>' : ''}
              
              <div class="ticket-details">
                <h3 style="color: ${categoryColor}; margin-top: 0;">Ticket Information</h3>
                <div class="detail-row">
                  <span class="detail-label">Ticket ID:</span>
                  <span class="detail-value">#${ticketId}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Category:</span>
                  <span><span class="category-badge">${category}</span></span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Priority:</span>
                  <span><span class="priority-badge">${priority?.toUpperCase() || 'MEDIUM'}</span></span>
                </div>
                ${subject ? `
                <div class="detail-row">
                  <span class="detail-label">Subject:</span>
                  <span class="detail-value">${subject}</span>
                </div>
                ` : ''}
              </div>

              <div class="ticket-details">
                <h3 style="color: #374151; margin-top: 0;">Customer Information</h3>
                <div class="detail-row">
                  <span class="detail-label">Name:</span>
                  <span class="detail-value">${customerName}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Email:</span>
                  <span class="detail-value">${customerEmail}</span>
                </div>
              </div>

              <div class="description-box">
                <h4 style="margin-top: 0; color: #374151;">Description:</h4>
                <p style="white-space: pre-wrap;">${description.replace(/\n/g, '<br>')}</p>
              </div>

              <center>
                <a href="http://localhost:3000/admin/tickets" class="button">View Ticket in Dashboard</a>
              </center>

              <div class="footer">
                <p><strong>Action Required:</strong> Please review and respond to this ticket as soon as possible.</p>
                <p>This is an automated notification from the SuryaUrja support system.</p>
                <p>&copy; 2026 SuryaUrja. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Ticket notification email sent to admin:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Failed to send ticket notification email:", error);
    return false;
  }
};

// Send maintenance plan subscription email
exports.sendMaintenancePlanSubscriptionEmail = async (userEmail, userName, planDetails) => {
  try {
    const planDurationText = {
      "1 Month": "1 Month",
      "6 Months": "6 Months",
      "1 Year": "1 Year",
      "Lifetime": "Lifetime",
    }[planDetails.planType] || planDetails.planType;

    const mailOptions = {
      from: process.env.EMAIL_USER || "noreply@suryaurja.com",
      to: userEmail,
      subject: "✅ Maintenance Plan Subscription Confirmed - SuryaUrja",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a; }
            .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
            .detail-label { font-weight: bold; color: #374151; }
            .detail-value { color: #16a34a; font-weight: 600; }
            .highlight-box { background: #f0fdf4; padding: 15px; border-radius: 6px; margin: 15px 0; }
            .button { display: inline-block; background: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>☀️ SuryaUrja</h1>
              <h2>Maintenance Plan Activated!</h2>
            </div>
            <div class="content">
              <p>Dear ${userName},</p>
              <p>🎉 Congratulations! Your maintenance plan subscription has been successfully activated.</p>
              
              <div class="details">
                <h3 style="color: #16a34a; margin-top: 0;">Plan Details</h3>
                <div class="detail-row">
                  <span class="detail-label">Plan Type:</span>
                  <span class="detail-value">${planDurationText}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Total Services:</span>
                  <span class="detail-value">${planDetails.servicesTotal || 0}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Services Used:</span>
                  <span class="detail-value">${planDetails.servicesUsed || 0}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Remaining Services:</span>
                  <span class="detail-value">${(planDetails.servicesTotal || 0) - (planDetails.servicesUsed || 0)}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Start Date:</span>
                  <span>${planDetails.startDate ? new Date(planDetails.startDate).toLocaleDateString('en-IN') : '-'}</span>
                </div>
                ${planDetails.endDate ? `
                <div class="detail-row">
                  <span class="detail-label">End Date:</span>
                  <span>${new Date(planDetails.endDate).toLocaleDateString('en-IN')}</span>
                </div>
                ` : ''}
                <div class="detail-row" style="border-bottom: none;">
                  <span class="detail-label">Amount Paid:</span>
                  <span class="detail-value" style="font-size: 18px;">₹${(planDetails.totalAmount || 0).toLocaleString()}</span>
                </div>
              </div>

              <div class="highlight-box">
                <h4 style="margin-top: 0; color: #16a34a;">📅 Next Service</h4>
                <p style="margin: 0;">Your first service is scheduled for: <strong>${planDetails.nextServiceDate ? new Date(planDetails.nextServiceDate).toLocaleDateString('en-IN') : '-'}</strong></p>
              </div>

              <p><strong>What to Expect:</strong></p>
              <ul style="color: #4b5563;">
                <li>Our technician will contact you 24 hours before the scheduled service</li>
                <li>Each service includes system cleaning, testing, and detailed inspection</li>
                <li>You'll receive a comprehensive report after each service completion</li>
                <li>Service reminders will be sent via email</li>
              </ul>

              <center>
                <a href="http://localhost:3000/user/maintenance" class="button">View My Plan</a>
              </center>

              <p>If you have any questions or need to reschedule, please don't hesitate to contact our support team.</p>
              
              <p style="margin-top: 30px;">Best regards,<br>
              <strong>SuryaUrja Team</strong><br>
              Green Energy Solar Solutions</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
              <p>&copy; 2026 SuryaUrja. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Maintenance plan subscription email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Failed to send maintenance plan subscription email:", error);
    return false;
  }
};

// Send maintenance service completion email
exports.sendMaintenanceServiceCompletedEmail = async (userEmail, userName, serviceDetails) => {
  try {
    const serviceTypeText = {
      "Cleaning": "System Cleaning",
      "Testing": "System Testing",
    }[serviceDetails.serviceType] || serviceDetails.serviceType;

    const mailOptions = {
      from: process.env.EMAIL_USER || "noreply@suryaurja.com",
      to: userEmail,
      subject: "✅ Maintenance Service Completed - SuryaUrja",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a; }
            .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
            .detail-label { font-weight: bold; color: #374151; }
            .detail-value { color: #16a34a; font-weight: 600; }
            .status-badge { display: inline-block; background: #10b981; color: white; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; }
            .remaining-box { background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; text-align: center; }
            .remaining-count { font-size: 36px; color: #3b82f6; font-weight: bold; }
            .remaining-text { color: #1e40af; font-weight: 600; margin-top: 5px; }
            .button { display: inline-block; background: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>☀️ SuryaUrja</h1>
              <h2>Service Completed Successfully!</h2>
            </div>
            <div class="content">
              <p>Dear ${userName},</p>
              <p>✅ Great news! Your maintenance service has been completed successfully.</p>
              
              <div class="details">
                <h3 style="color: #16a34a; margin-top: 0;">Service Details</h3>
                <div class="detail-row">
                  <span class="detail-label">Service Type:</span>
                  <span class="detail-value">${serviceTypeText}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Completed On:</span>
                  <span>${serviceDetails.completionTime ? new Date(serviceDetails.completionTime).toLocaleDateString('en-IN') + ' ' + new Date(serviceDetails.completionTime).toLocaleTimeString('en-IN') : '-'}</span>
                </div>
                ${serviceDetails.technicianName ? `
                <div class="detail-row">
                  <span class="detail-label">Technician:</span>
                  <span>${serviceDetails.technicianName}</span>
                </div>
                ` : ''}
                <div class="detail-row" style="border-bottom: none;">
                  <span class="detail-label">Status:</span>
                  <span><span class="status-badge">✓ COMPLETED</span></span>
                </div>
              </div>

              <div class="remaining-box">
                <p style="margin-top: 0; color: #1e40af; font-weight: 600;">Services Remaining</p>
                <div class="remaining-count">${serviceDetails.remainingServices}</div>
                <div class="remaining-text">${serviceDetails.remainingServices === 1 ? 'service left' : 'services left'} in your plan</div>
              </div>

              ${serviceDetails.workDone ? `
              <div class="details">
                <h4 style="margin-top: 0; color: #374151;">Work Completed</h4>
                <p>${serviceDetails.workDone}</p>
              </div>
              ` : ''}

              ${serviceDetails.nextServiceDate ? `
              <div class="details">
                <h4 style="margin-top: 0; color: #16a34a;">📅 Next Service Scheduled</h4>
                <p style="margin: 0;">Date: <strong>${new Date(serviceDetails.nextServiceDate).toLocaleDateString('en-IN')}</strong></p>
              </div>
              ` : ''}

              <p><strong>Next Steps:</strong></p>
              <ul style="color: #4b5563;">
                <li>You can download the detailed service report from your dashboard</li>
                <li>Keep the report for warranty and record purposes</li>
                ${serviceDetails.remainingServices > 0 ? `<li>Your next service is already scheduled - a reminder will be sent soon</li>` : `<li>Your plan has been completed - consider renewing for continued maintenance</li>`}
              </ul>

              <center>
                <a href="http://localhost:3000/user/maintenance" class="button">View Service Report</a>
              </center>

              <p>If you have any questions about the completed service, please contact our support team.</p>
              
              <p style="margin-top: 30px;">Best regards,<br>
              <strong>SuryaUrja Team</strong><br>
              Green Energy Solar Solutions</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
              <p>&copy; 2026 SuryaUrja. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Maintenance service completion email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Failed to send maintenance service completion email:", error);
    return false;
  }
};
