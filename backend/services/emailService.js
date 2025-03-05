import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

class EmailService {
  constructor() {
    this.transporter = this.createGmailTransporter();
  }

  /**
   * Create Gmail-specific email transporter
   * @returns {Object} Nodemailer Gmail transporter
   */
  createGmailTransporter() {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  /**
   * Generate a standardized HTML email template
   * @param {Object} params - Email content parameters
   * @returns {string} HTML email content
   */
  generateEmailTemplate(params) {
    const {
      title = "LifeFlow Notification",
      preheader = "Important Update",
      mainMessage,
      userName = "Valued Donor",
      details = [],
      additionalInfo = "",
      actionButton = null,
      companyName = "LifeFlow",
      bloodType = null,
      donorId = null,
    } = params;

    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title}</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              margin: 0; 
              padding: 0; 
              background-color: #f4f6f9;
            }
            .email-container { 
              max-width: 600px; 
              margin: 0 auto; 
              background-color: white; 
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              border-top: 5px solid #d9534f;
            }
            .header { 
              background-color: #d9534f; 
              color: white; 
              padding: 20px; 
              text-align: center;
            }
            .header img {
              max-width: 150px;
              margin-bottom: 10px;
            }
            .content { 
              padding: 25px; 
              background-color: white; 
            }
            .personalized-greeting {
              color: #d9534f;
              margin-bottom: 15px;
            }
            .details { 
              background-color: #f9f9f9; 
              padding: 15px; 
              margin: 15px 0; 
              border-left: 4px solid #d9534f; 
              border-radius: 3px;
            }
            .action-button { 
              display: inline-block; 
              background-color: #d9534f; 
              color: white !important; 
              padding: 12px 25px; 
              text-decoration: none; 
              border-radius: 5px; 
              margin: 15px 0;
              text-align: center;
              font-weight: bold;
            }
            .footer { 
              background-color: #f4f4f4; 
              text-align: center; 
              color: #666; 
              font-size: 12px; 
              padding: 15px;
              border-top: 1px solid #e0e0e0;
            }
            .medical-disclaimer {
              font-size: 10px;
              color: #666;
              margin-top: 15px;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <img src="https://lifeflow.org/logo.png" alt="LifeFlow Logo" />
              <h1>LifeFlow</h1>
              <p>${preheader}</p>
            </div>
            <div class="content">
              <h2 class="personalized-greeting">Dear ${userName},</h2>
              
              <p>${mainMessage}</p>
              
              ${
                details.length > 0
                  ? `
                <div class="details">
                  ${details
                    .map(
                      (detail) =>
                        `<p><strong>${detail.label}:</strong> ${detail.value}</p>`
                    )
                    .join("")}
                  ${
                    bloodType
                      ? `<p><strong>Blood Type:</strong> ${bloodType}</p>`
                      : ""
                  }
                  ${
                    donorId
                      ? `<p><strong>Donor ID:</strong> ${donorId}</p>`
                      : ""
                  }
                </div>
              `
                  : ""
              }
              
              ${additionalInfo ? `<p>${additionalInfo}</p>` : ""}
              
              ${
                actionButton
                  ? `
                <div style="text-align: center;">
                  <a href="${actionButton.link}" class="action-button">
                    ${actionButton.text}
                  </a>
                </div>
              `
                  : ""
              }
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} LifeFlow. Saving Lives Through Compassion.</p>
              <p>This is an automated message. Please do not reply.</p>
              <div class="medical-disclaimer">
                This communication is confidential and intended solely for the named recipient. 
                If you are not the intended recipient, please contact us immediately.
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Send a generic email
   * @param {Object} options - Email sending options
   * @returns {Promise} Email sending promise
   */
  async sendEmail(options) {
    const {
      to,
      subject,
      text,
      html,
      from = process.env.EMAIL_USER,
      userName = "Valued Donor",
    } = options;

    const mailOptions = {
      from,
      to,
      subject,
      text: text || "",
      html:
        html ||
        this.generateEmailTemplate({
          mainMessage: text || "No message content",
          userName,
        }),
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log("Email sent:", info.response);
      return info;
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  }

  /**
   * Send a template-based email
   * @param {Object} emailParams - Email template parameters
   * @returns {Promise} Email sending promise
   */
  async sendTemplateEmail(emailParams) {
    const {
      to,
      subject,
      templateParams,
      from = process.env.EMAIL_USER,
    } = emailParams;

    const html = this.generateEmailTemplate(templateParams);

    return this.sendEmail({
      from,
      to,
      subject,
      html,
      userName: templateParams.userName || "Valued Donor",
    });
  }

  /**
   * Send OTP email
   * @param {Object} otpParams - OTP email parameters
   * @returns {Promise} Email sending promise
   */
  async sendOTPEmail(otpParams) {
    const {
      email,
      otp,
      userName,
      expiryMinutes = 5,
      companyName = "LifeFlow",
    } = otpParams;

    return this.sendTemplateEmail({
      to: email,
      subject: `${companyName} - Your Verification Code`,
      templateParams: {
        title: "Account Verification",
        preheader: "Your One-Time Password (OTP)",
        userName,
        mainMessage:
          "We're securing your LifeFlow account. Please use the following One-Time Password (OTP) to complete your verification:",
        details: [
          { label: "OTP Code", value: otp },
          { label: "Expiry", value: `${expiryMinutes} minutes` },
        ],
        additionalInfo:
          "If you did not request this verification, please contact our support team immediately.",
        companyName,
      },
    });
  }

  /**
   * Send donor registration confirmation email
   * @param {Object} registrationParams - Donor registration details
   * @returns {Promise} Email sending promise
   */
  async sendDonorRegistrationEmail(registrationParams) {
    const {
      email,
      userName,
      bloodType,
      donorId,
      companyName = "LifeFlow",
    } = registrationParams;

    return this.sendTemplateEmail({
      to: email,
      subject: `Welcome to ${companyName}, ${userName}!`,
      templateParams: {
        title: "Donor Registration Confirmation",
        preheader: "Thank You for Registering",
        userName,
        bloodType,
        donorId,
        mainMessage:
          "Thank you for registering as a blood donor with LifeFlow. Your commitment can save lives.",
        details: [{ label: "Donor Status", value: "Registered" }],
        actionButton: {
          text: "View Donor Profile",
          link: "http://localhost/donor/profile",
        },
        additionalInfo:
          "We'll notify you about upcoming donation drives and how you can make a difference.",
        companyName,
      },
    });
  }
}

// Singleton instance
const emailService = new EmailService();
export default emailService;
