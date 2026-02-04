import { Resend } from 'resend';
import nodemailer from 'nodemailer';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || 'resend'; // 'resend' | 'gmail'

// Gmail SMTP Configuration
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_PASS = process.env.GMAIL_APP_PASSWORD;

// Generic send email function
export async function sendEmail(to: string, subject: string, html: string) {
  // ============================================
  // EMAIL TEMPORARILY DISABLED - Yusuf
  // Remove these lines to re-enable email sending
  // ============================================
  console.log(`📧 [EMAIL DISABLED] Would have sent to: ${to} | Subject: ${subject}`);
  return { success: true, data: { disabled: true } };
  // ============================================

  if (EMAIL_PROVIDER === 'gmail') {
    return sendViaGmail(to, subject, html);
  } else {
    return sendViaResend(to, subject, html);
  }
}

// 1. Gmail Implementation
async function sendViaGmail(to: string, subject: string, html: string) {
  if (!GMAIL_USER || !GMAIL_PASS) {
    console.warn('⚠️ GMAIL_USER veya GMAIL_APP_PASSWORD eksik.');
    return { success: false, error: 'Gmail Configuration Missing' };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"Solis Hotel" <${GMAIL_USER}>`,
      to: to,
      subject: subject,
      html: html,
    });

    return { success: true, data: info };
  } catch (err) {
    console.error('Gmail sending failed:', err);
    return { success: false, error: err };
  }
}

// 2. Resend Implementation
async function sendViaResend(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) {
    console.warn('⚠️ RESEND_API_KEY eksik.');
    return { success: false, error: 'API Key Missing' };
  }

  const resend = new Resend(RESEND_API_KEY);

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Solis Hotel <onboarding@resend.dev>',
      to: [to],
      subject: subject,
      html: html,
    });

    if (error) {
      console.error('Resend sending failed:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Resend service error:', err);
    return { success: false, error: err };
  }
}

// Template generator based on status
function getEmailTemplate(status: string, customerName: string, bookingId?: string, cancellationToken?: string) {
  const styles = {
    container: "font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;",
    header: "color: #d4a373; text-align: center;",
    text: "color: #374151; line-height: 1.6;",
    button: "display: inline-block; background-color: #ef4444; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 15px;",
    footer: "text-align: center; color: #9ca3af; font-size: 12px; margin-top: 30px;",
    highlight: "font-weight: bold; color: #d4a373;"
  };

  let title = "Rezervasyon Durumu";
  let message = "";
  let actionHtml = "";

  // Base URL
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const domain = process.env.NEXT_PUBLIC_APP_URL || (process.env.NEXT_PUBLIC_VERCEL_URL ? `${protocol}://${process.env.NEXT_PUBLIC_VERCEL_URL}` : 'http://localhost:3000');

  const baseUrl = domain.startsWith('http') ? domain : `${protocol}://${domain}`;
  const manageLink = cancellationToken ? `${baseUrl}/tr/reservation/manage/${cancellationToken}` : '#';

  switch (status) {
    case 'pending':
      title = "Rezervasyon Talebiniz Alındı";
      message = `Sayın <strong>${customerName}</strong>,<br><br>Rezervasyon talebiniz tarafımıza ulaşmıştır. Müsaitlik durumunu kontrol ettikten sonra size en kısa sürede onay veya bilgilendirme maili göndereceğiz.<br><br>Talep ID: #${bookingId}`;
      if (cancellationToken) {
        actionHtml = `
          <div style="text-align: center; margin: 20px 0;">
            <p style="font-size: 14px; color: #6b7280; margin-bottom: 10px;">Rezervasyonunuzu iptal etmeniz gerekirse:</p>
            <a href="${manageLink}" style="${styles.button}">Rezervasyonu Yönet / İptal Et</a>
          </div>
        `;
      }
      break;
    case 'confirmed':
      title = "Rezervasyonunuz Onaylandı!";
      message = `Sayın <strong>${customerName}</strong>,<br><br>Solis Hotel'i tercih ettiğiniz için teşekkür ederiz. Rezervasyon işleminiz başarıyla <strong>ONAYLANMIŞTIR</strong>.<br><br>Sizi otelimizde ağırlamak için sabırsızlanıyoruz.`;
      if (cancellationToken) {
        actionHtml = `
          <div style="text-align: center; margin: 20px 0;">
             <p style="font-size: 14px; color: #6b7280; margin-bottom: 10px;">Planlarınız değişirse rezervasyonunuzu buradan yönetebilirsiniz:</p>
            <a href="${manageLink}" style="${styles.button}">Rezervasyonu Yönet</a>
          </div>
        `;
      }
      break;
    case 'cancelled':
      title = "Rezervasyon İptali";
      message = `Sayın <strong>${customerName}</strong>,<br><br>Rezervasyonunuz iptal edilmiştir. Eğer bu işlemi siz yapmadıysanız lütfen bizimle iletişime geçiniz.`;
      break;
    case 'completed':
    case 'checked_out':
      title = "Bizi Tercih Ettiğiniz İçin Teşekkürler";
      message = `Sayın <strong>${customerName}</strong>,<br><br>Umarız konaklamanızdan memnun kalmışsınızdır. Sizi tekrar ağırlamaktan mutluluk duyarız.`;
      break;
    default:
      message = `Sayın <strong>${customerName}</strong>,<br><br>Rezervasyon durumunuz güncellendi: <strong>${status.toUpperCase()}</strong>.`;
  }

  return `
    <div style="${styles.container}">
      <h2 style="${styles.header}">${title}</h2>
      <p style="${styles.text}">${message}</p>
      
      ${actionHtml}

      <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; color: #4b5563;">Herhangi bir sorunuz olursa yanıtlayabilirsiniz.</p>
      </div>

      <p style="${styles.footer}">
        Solis Hotel, İstanbul<br>
        +90 212 555 0123
      </p>
    </div>
  `;
}

export async function sendBookingStatusEmail(email: string, customerName: string, status: string, bookingId?: string, cancellationToken?: string) {
  const html = getEmailTemplate(status, customerName, bookingId, cancellationToken);
  let subject = "Solis Hotel - Rezervasyon Bilgilendirme";
  if (status === 'confirmed') subject = "Rezervasyonunuz Onaylandı! - Solis Hotel";
  if (status === 'cancelled') subject = "Rezervasyon İptali - Solis Hotel";
  if (status === 'pending') subject = "Rezervasyon Talebiniz Alındı - Solis Hotel";

  return sendEmail(email, subject, html);
}

// Backward compatibility
export async function sendConfirmationEmail(email: string, customerName: string) {
  return sendBookingStatusEmail(email, customerName, 'confirmed');
}