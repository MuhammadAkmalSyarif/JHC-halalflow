const nodemailer = require('nodemailer');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, otp, internalSecret } = req.body;

  // Protect this endpoint from public abuse
  if (internalSecret !== process.env.JWT_SECRET) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const cleanSmtpPass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: cleanSmtpPass
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM || `"JHC HalalFlow" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Kode Verifikasi Reset Password - JHC HalalFlow',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #059669; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">JHC HalalFlow</h2>
          <p style="color: #64748b; margin: 4px 0 0 0; font-size: 13px;">Sistem Manajemen Sertifikasi Halal</p>
        </div>
        <div style="border-top: 1px solid #f1f5f9; padding-top: 20px;">
          <p style="color: #1e293b; font-size: 15px; line-height: 1.6; margin: 0 0 12px 0;">Halo,</p>
          <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
            Anda telah meminta untuk mereset kata sandi akun JHC HalalFlow Anda. Masukkan kode verifikasi berikut untuk melanjutkan proses reset password:
          </p>
          <div style="background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%); border: 1.5px dashed #059669; padding: 20px; text-align: center; border-radius: 12px; margin: 24px 0;">
            <span style="font-size: 12px; font-weight: 700; color: #065f46; letter-spacing: 1px; text-transform: uppercase;">Kode Verifikasi</span>
            <div style="font-size: 34px; font-weight: 800; color: #047857; letter-spacing: 8px; margin-top: 8px; font-family: monospace;">${otp}</div>
          </div>
          <p style="color: #64748b; font-size: 13px; line-height: 1.6; margin: 0 0 8px 0;">
            ⏳ Kode verifikasi ini berlaku selama <strong>1 jam</strong>. Demi keamanan, jangan bagikan kode ini kepada siapa pun.
          </p>
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, message: 'Email sent', info });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
