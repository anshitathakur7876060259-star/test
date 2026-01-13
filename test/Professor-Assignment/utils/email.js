const nodemailer = require('nodemailer');

// Check if email credentials are configured
const hasEmailConfig = process.env.SMTP_USER && process.env.SMTP_PASS && 
                       process.env.SMTP_USER !== 'your-email@gmail.com' && 
                       process.env.SMTP_PASS !== 'your-app-password';

// Configure nodemailer transporter only if credentials are provided
let transporter = null;
if (hasEmailConfig) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

// Send OTP email
async function sendOTPEmail(email, otp) {
  // If email is not configured, log OTP to console for development
  if (!hasEmailConfig || !transporter) {
    console.log('\n========================================');
    console.log('📧 OTP Email (Development Mode)');
    console.log('========================================');
    console.log(`To: ${email}`);
    console.log(`OTP: ${otp}`);
    console.log('========================================\n');
    console.log('⚠️  Email not configured. OTP logged above for testing.');
    console.log('   To enable email, set SMTP_USER and SMTP_PASS environment variables.\n');
    return { messageId: 'console-log', mode: 'development' };
  }

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: 'OTP for Assignment Approval',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Assignment Approval OTP</h2>
        <p>Dear Professor,</p>
        <p>You have requested to approve an assignment. Please use the following OTP to complete the approval:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #007bff; font-size: 32px; margin: 0;">${otp}</h1>
        </div>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
        <p>Best regards,<br>Assignment Review System</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending OTP email:', error.message);
    // Log OTP to console as fallback
    console.log('\n========================================');
    console.log('📧 OTP (Email Failed - Fallback)');
    console.log('========================================');
    console.log(`To: ${email}`);
    console.log(`OTP: ${otp}`);
    console.log('========================================\n');
    // Don't throw error - allow OTP to still work for development
    return { messageId: 'console-log', mode: 'fallback', error: error.message };
  }
}

module.exports = {
  sendOTPEmail
};
