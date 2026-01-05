const nodemailer = require("nodemailer");

// Create email transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587, // Use port 587 instead of 465
  secure: false, // Use STARTTLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
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
                  <span class="detail-value">${bookingDetails.capacity} kW</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Base Cost:</span>
                  <span class="detail-value">₹${bookingDetails.baseCost.toLocaleString()}</span>
                </div>
                ${bookingDetails.subsidyApplied ? `
                <div class="detail-row">
                  <span class="detail-label">Subsidy Applied:</span>
                  <span class="detail-value">₹${bookingDetails.subsidyAmount.toLocaleString()}</span>
                </div>
                ` : ''}
                <div class="detail-row">
                  <span class="detail-label">Final Cost:</span>
                  <span class="detail-value" style="font-size: 18px;">₹${bookingDetails.finalCost.toLocaleString()}</span>
                </div>
                ${bookingDetails.emiEnabled ? `
                <div class="detail-row">
                  <span class="detail-label">EMI Plan:</span>
                  <span class="detail-value">${bookingDetails.emiYears} years @ ₹${bookingDetails.monthlyEmi.toLocaleString()}/month</span>
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
    console.error("❌ Failed to send booking confirmation email:", error);
    return false;
  }
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
