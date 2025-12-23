import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;

// Generic send email function
export async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) {
    console.warn('⚠️ RESEND_API_KEY eksik. E-posta gönderilemedi: ' + subject);
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
      console.error('Email sending failed:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Email service error:', err);
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

  // Base URL (assuming localhost for dev or production URL from env)
  // Vercel usually sets NEXT_PUBLIC_VERCEL_URL but it doesn't include https://
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
  // Extract title from HTML simply or define map
  let subject = "Solis Hotel - Rezervasyon Bilgilendirme";
  if (status === 'confirmed') subject = "Rezervasyonunuz Onaylandı! - Solis Hotel";
  if (status === 'cancelled') subject = "Rezervasyon İptali - Solis Hotel";
  if (status === 'pending') subject = "Rezervasyon Talebiniz Alındı - Solis Hotel";

  return sendEmail(email, subject, html);
}

// Backward compatibility (optional, but good practice if other files use it)
export async function sendConfirmationEmail(email: string, customerName: string) {
  return sendBookingStatusEmail(email, customerName, 'confirmed');
}

