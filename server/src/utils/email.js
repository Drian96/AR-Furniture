const { Resend } = require('resend');

// Initialize Resend with API key from environment variables
// Make sure RESEND_API_KEY is set in your .env file
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send verification code email using Resend
 * This function is used for both signup verification and password reset
 * 
 * @param {string} to - Recipient email address
 * @param {string} code - 6-digit verification code
 * @returns {Promise} - Resend API response
 */
async function sendVerificationEmail(to, code) {
  try {
    // Get the sender email from environment variable
    // Defaults to onboarding@resend.dev (Resend's free tier default)
    // You can set RESEND_FROM_EMAIL in your .env file if you have a verified domain
    // Example: RESEND_FROM_EMAIL=noreply@yourdomain.com
    const fromEmail = 'onboarding@resend.dev';
    
    // Send email using Resend API
    // Using onboarding@resend.dev for free tier (no domain verification needed)
    const data = await resend.emails.send({
      from: 'AR-Furniture <onboarding@resend.dev>', // Sender name and email
      to: to, // Recipient email
      subject: 'Your Oneiric Furniture Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to Oneiric Furniture!</h2>
          <p>Thank you for signing up. Please use the verification code below to complete your registration:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #007bff; font-size: 32px; margin: 0;">${code}</h1>
          </div>
          <p>This code will expire in 10 minutes for security reasons.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 14px;">Best regards,<br>The AR-Furniture Team</p>
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
