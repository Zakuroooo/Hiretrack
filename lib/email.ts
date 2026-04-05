import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendPasswordResetEmail = async (email: string, name: string, resetUrl: string) => {
  try {
    
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Reset your HireTrack password',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #080c14; color: #e2f0ff; padding: 32px; border-radius: 12px; max-width: 500px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.06);">
          <h1 style="color: #e2f0ff; font-weight: 800; font-size: 24px; margin-top: 0;">
            <span style="color: #0ea5e9;">Hire</span>Track
          </h1>
          <p style="font-size: 16px;">Hi ${name},</p>
          <p style="color: #7096b8; line-height: 1.5; font-size: 15px;">We received a request to reset your password. Click below to reset it:</p>
          <div style="margin: 28px 0;">
            <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #0ea5e9, #2563eb); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; text-align: center;">Reset Password</a>
          </div>
          <p style="color: #4a6080; font-size: 13px; margin-bottom: 0;">This link expires in 1 hour.<br>If you didn't request this, you can safely ignore this email.</p>
        </div>
      `
    });
  } catch (error) {
    console.error('sendPasswordResetEmail failed:', error);
  }
};

export const sendStatusChangeEmail = async (email: string, name: string, company: string, role: string, newStatus: string) => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://hiretrack-brown.vercel.app';
    const boardLink = `${baseUrl}/dashboard/board`;
    
    const STAGE_COLORS: Record<string, string> = {
      Applied: '#38bdf8',
      Screening: '#f59e0b',
      Interview: '#a78bfa',
      Offer: '#22c55e',
      Rejected: '#ef4444'
    };
    
    const badgeColor = STAGE_COLORS[newStatus] || '#0ea5e9';
    
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Application update: ${company} — ${newStatus}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #080c14; color: #e2f0ff; padding: 32px; border-radius: 12px; max-width: 500px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.06);">
          <p style="font-size: 16px; margin-top: 0;">Hi ${name},</p>
          <p style="color: #7096b8; line-height: 1.5; font-size: 15px;">Your application status has been updated to <strong>${newStatus}</strong>.</p>
          
          <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); padding: 20px; border-radius: 10px; margin: 24px 0;">
            <p style="margin:0; font-weight: 600; font-size: 16px;">${company}</p>
            <p style="margin: 4px 0 16px 0; color: #7096b8; font-size: 14px;">${role}</p>
            <span style="background: ${badgeColor}22; color: ${badgeColor}; border: 1px solid ${badgeColor}44; padding: 6px 14px; border-radius: 999px; font-size: 13px; font-weight: 600; display: inline-block;">${newStatus}</span>
          </div>
          
          <div style="margin-bottom: 32px;">
            <a href="${boardLink}" style="display: inline-block; background: linear-gradient(135deg, #0ea5e9, #2563eb); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">Log in to HireTrack to view details</a>
          </div>
          
          <div style="border-top: 1px solid rgba(255,255,255,0.06); padding-top: 20px; text-align: center;">
            <p style="color: #4a6080; font-size: 12px; margin: 0; font-weight: 700; letter-spacing: 0.5px;">HIRETRACK</p>
          </div>
        </div>
      `
    });
  } catch (error) {
    console.error('sendStatusChangeEmail failed:', error);
  }
};

export const sendWelcomeEmail = async (email: string, name: string) => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://hiretrack-brown.vercel.app';
    const dashboardLink = `${baseUrl}/dashboard`;
    
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to HireTrack!',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #080c14; color: #e2f0ff; padding: 32px; border-radius: 12px; max-width: 500px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.06);">
          <h1 style="color: #e2f0ff; font-weight: 800; font-size: 24px; margin-top: 0; margin-bottom: 24px;">
            <span style="color: #0ea5e9;">Hire</span>Track
          </h1>
          <h2 style="font-size: 20px; font-weight: 600; margin-top:0;">Welcome, ${name}!</h2>
          <p style="color: #7096b8; line-height: 1.6; font-size: 15px; margin-bottom: 28px;">
            Thanks for joining HireTrack. It's time to organize your job search, optimize your resume with our AI matcher, and land your next opportunity.
          </p>
          <a href="${dashboardLink}" style="display: inline-block; background: linear-gradient(135deg, #0ea5e9, #2563eb); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600;">Go to Dashboard →</a>
        </div>
      `
    });
  } catch (error) {
    console.error('sendWelcomeEmail failed:', error);
  }
};
