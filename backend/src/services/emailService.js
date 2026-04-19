const Mailjet = require('node-mailjet');

let mailjetClient = null;

function getClient() {
  if (!mailjetClient) {
    const apiKey = process.env.MJ_APIKEY_PUBLIC;
    const apiSecret = process.env.MJ_APIKEY_PRIVATE;

    if (!apiKey || !apiSecret || apiKey === 'your_api_key_here') {
      console.warn('⚠️  Mailjet credentials not configured — emails will be logged to console only.');
      return null;
    }

    mailjetClient = Mailjet.apiConnect(apiKey, apiSecret);
  }
  return mailjetClient;
}

/**
 * Send an email via Mailjet (or log to console if Mailjet is not configured)
 */
async function sendEmail({ to, toName, subject, htmlContent, textContent }) {
  const client = getClient();
  const fromEmail = process.env.FROM_EMAIL || 'noreply@vmacalculator.com';
  const fromName = process.env.FROM_NAME || 'VMA Calculator';

  if (!client) {
    // Fallback: log to console for development
    console.log('📧 EMAIL (console fallback):');
    console.log(`   To: ${toName} <${to}>`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Body: ${textContent || '(HTML only)'}`);
    return { success: true, fallback: true };
  }

  try {
    const result = await client.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: { Email: fromEmail, Name: fromName },
          To: [{ Email: to, Name: toName }],
          Subject: subject,
          TextPart: textContent,
          HTMLPart: htmlContent,
        },
      ],
    });

    console.log(`📧 Email sent to ${to}: ${subject}`);
    return { success: true, data: result.body };
  } catch (err) {
    console.error('❌ Mailjet error:', err.message);
    // Don't throw — email failure shouldn't break the flow
    return { success: false, error: err.message };
  }
}

/**
 * Send welcome email after registration
 */
async function sendWelcomeEmail(user) {
  const appUrl = process.env.APP_URL || 'http://localhost:5173';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;font-family:Arial,sans-serif;background-color:#f3f4f6;">
      <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
        <div style="background:#fff;border-radius:12px;padding:40px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          <div style="text-align:center;margin-bottom:30px;">
            <div style="display:inline-block;background:#2563eb;border-radius:12px;padding:12px;margin-bottom:16px;">
              <span style="color:#fff;font-size:24px;font-weight:bold;">VMA</span>
            </div>
            <h1 style="color:#1f2937;margin:0;">Welcome, ${user.username}! 🎉</h1>
          </div>
          <p style="color:#4b5563;font-size:16px;line-height:1.6;">
            Your account has been created successfully. You can now calculate, save, and track your VMA test results over time.
          </p>
          <div style="text-align:center;margin:30px 0;">
            <a href="${appUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;">
              Start Calculating
            </a>
          </div>
          <p style="color:#9ca3af;font-size:13px;text-align:center;margin-top:30px;">
            Developed by Maryam Karim — © 2026 VMA Calculator
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `Welcome ${user.username}! Your VMA Calculator account is ready. Visit ${appUrl} to start calculating.`;

  return sendEmail({
    to: user.email,
    toName: user.username,
    subject: 'Welcome to VMA Calculator! 🏃',
    htmlContent,
    textContent,
  });
}

/**
 * Send password reset email
 */
async function sendPasswordResetEmail(user, resetToken) {
  const appUrl = process.env.APP_URL || 'http://localhost:5173';
  const resetLink = `${appUrl}/reset-password/${resetToken}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;font-family:Arial,sans-serif;background-color:#f3f4f6;">
      <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
        <div style="background:#fff;border-radius:12px;padding:40px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          <div style="text-align:center;margin-bottom:30px;">
            <div style="display:inline-block;background:#2563eb;border-radius:12px;padding:12px;margin-bottom:16px;">
              <span style="color:#fff;font-size:24px;font-weight:bold;">VMA</span>
            </div>
            <h1 style="color:#1f2937;margin:0;">Reset Your Password</h1>
          </div>
          <p style="color:#4b5563;font-size:16px;line-height:1.6;">
            Hi <strong>${user.username}</strong>, we received a request to reset your password. Click the button below to set a new one:
          </p>
          <div style="text-align:center;margin:30px 0;">
            <a href="${resetLink}" style="display:inline-block;background:#2563eb;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;">
              Reset Password
            </a>
          </div>
          <p style="color:#6b7280;font-size:14px;line-height:1.6;">
            This link is valid for <strong>1 hour</strong>. If you did not request this, you can safely ignore this email.
          </p>
          <div style="margin-top:20px;padding:16px;background:#fef3c7;border-radius:8px;">
            <p style="color:#92400e;font-size:13px;margin:0;">
              🔒 If the button doesn't work, copy and paste this URL into your browser:<br/>
              <a href="${resetLink}" style="color:#2563eb;word-break:break-all;">${resetLink}</a>
            </p>
          </div>
          <p style="color:#9ca3af;font-size:13px;text-align:center;margin-top:30px;">
            Developed by Maryam Karim — © 2026 VMA Calculator
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `Hi ${user.username}, reset your password by visiting: ${resetLink} — This link expires in 1 hour.`;

  return sendEmail({
    to: user.email,
    toName: user.username,
    subject: 'Reset Your Password — VMA Calculator',
    htmlContent,
    textContent,
  });
}

module.exports = { sendEmail, sendWelcomeEmail, sendPasswordResetEmail };
