

const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendVerificationEmail(to, code) {
  await resend.emails.send({
    from: 'onboarding@resend.dev', // Default sender for dev/testing
    to,
    subject: 'Your AR-Furniture Verification Code',
    html: `<p>Your verification code is: <b>${code}</b></p>`
  });
}

module.exports = { sendVerificationEmail };
