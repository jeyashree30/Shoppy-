// BackEnd/utils/mailer.js
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

// ✅ Load environment variables from .env
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GOOGLE_MAIL,
    pass: process.env.GOOGLE_PASS,
  },
});

/**
 * Send an email using Gmail SMTP
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML content of the email
 */
const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: `"Shoppy Store 🛍️" <${process.env.GOOGLE_MAIL}>`,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent to", to);
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
  }
};

module.exports = sendEmail;
