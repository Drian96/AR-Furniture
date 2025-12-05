const { Resend } = require('resend');

// Initialize Resend with API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send verification code email using Resend
 * @param {string} to - Recipient email address
 * @param {string} code - 6-digit verification code
 */
async function sendVerificationEmail(to, code) {
  try {
    // Use custom email from .env (REQUIRED after domain verification)
    // Example: RESEND_FROM_EMAIL="Oneiric Furniture <noreply@oneiricfurniture.com>"
    const fromEmail = process.env.RESEND_FROM_EMAIL;

    const data = await resend.emails.send({
      from: fromEmail, 
      to: to,
      subject: 'Your Oneiric Furniture Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Welcome to Oneiric Furniture!</h2>

          <p>Thank you for signing up. Please use the verification code below to complete your registration:</p>

          <h1 style="font-size: 32px; color: #4A4A4A;">${code}</h1>

          <p>This code will expire in <strong>10 minutes</strong>.</p>

          <p>If you didn't request this code, you can safely ignore this email.</p>

          <br>
          <p>Best regards,<br>The Oneiric Furniture Team</p>
        </div>
      `
    });

    console.log('✅ Verification email sent successfully:', data.id);
    return data;

  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
}

module.exports = { sendVerificationEmail };
