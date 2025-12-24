'use server';

import { sendEmail } from '@/services/mailService';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalıdır"),
  surname: z.string().min(2, "Soyisim en az 2 karakter olmalıdır"),
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  message: z.string().min(10, "Mesaj en az 10 karakter olmalıdır"),
});

export async function sendContactMessage(formData: FormData) {
  const data = {
    name: formData.get('name'),
    surname: formData.get('surname'),
    email: formData.get('email'),
    message: formData.get('message'),
  };

  const validation = contactSchema.safeParse(data);

  if (!validation.success) {
    return { success: false, error: validation.error.errors[0].message };
  }

  const { name, surname, email, message } = validation.data;

  // Prepare email content for admin
  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
      <h2 style="color: #d4a373; text-align: center;">Yeni İletişim Mesajı</h2>
      
      <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Ad Soyad:</strong> ${name} ${surname}</p>
        <p><strong>E-posta:</strong> ${email}</p>
      </div>

      <div style="background-color: #ffffff; padding: 15px; border: 1px solid #f3f4f6; border-radius: 8px;">
        <h3 style="color: #374151; font-size: 16px; margin-top: 0;">Mesaj:</h3>
        <p style="color: #4b5563; line-height: 1.6; white-space: pre-wrap;">${message}</p>
      </div>

      <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 30px;">
        Bu mesaj web sitesi iletişim formundan gönderilmiştir.
      </p>
    </div>
  `;

  // Send to info@solisboutiquehotel.com
  const result = await sendEmail(
    'info@solisboutiquehotel.com',
    `Yeni İletişim Mesajı: ${name} ${surname}`,
    htmlContent
  );

  if (!result.success) {
    return { success: false, error: 'Mesaj gönderilemedi. Lütfen daha sonra tekrar deneyiniz.' };
  }

  return { success: true, message: 'Mesajınız başarıyla gönderildi.' };
}
