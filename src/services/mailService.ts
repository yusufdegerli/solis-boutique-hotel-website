import { Resend } from 'resend';

export async function sendConfirmationEmail(email: string, customerName: string) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn('⚠️ RESEND_API_KEY eksik. E-posta gönderilemedi.');
    return { success: false, error: 'API Key Missing' };
  }

  const resend = new Resend(apiKey);

  try {
    const { data, error } = await resend.emails.send({
      from: 'Solis Hotel <onboarding@resend.dev>', // Prodüksiyonda kendi domaininizi kullanmalısınız
      to: [email],
      subject: 'Rezervasyonunuz Onaylandı! - Solis Hotel',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
          <h2 style="color: #d4a373; text-align: center;">Solis Hotel'e Hoş Geldiniz</h2>
          <p>Sayın <strong>${customerName}</strong>,</p>
          <p>Solis Hotel'i tercih ettiğiniz için teşekkür ederiz. Rezervasyon işleminiz başarıyla onaylanmıştır.</p>
          <p>Sizi otelimizde ağırlamak ve unutulmaz bir konaklama deneyimi sunmak için sabırsızlanıyoruz.</p>
          
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #4b5563;">Herhangi bir sorunuz veya özel isteğiniz olursa bizimle iletişime geçmekten çekinmeyin.</p>
          </div>

          <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 30px;">
            Solis Hotel, İstanbul<br>
            +90 212 555 0123
          </p>
        </div>
      `,
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
