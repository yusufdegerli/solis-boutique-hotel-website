import { sendBookingStatusEmail } from './mailService';

/**
 * Sends a generic notification (Email + SMS) based on booking status.
 */
export async function sendBookingNotification(booking: {
  customer_email?: string | null;
  customer_name: string;
  customer_phone?: string | null;
  id?: string | number;
}, status: string) {

  const results = {
    email: false,
    sms: false
  };

  // 1. Email Notification
  if (booking.customer_email && booking.customer_email !== 'no-email@provided.com') {
    const emailRes = await sendBookingStatusEmail(
      booking.customer_email,
      booking.customer_name,
      status,
      booking.id?.toString()
    );
    results.email = emailRes.success;
  } else {
    console.log(`[Notification] Skipped Email: No valid email for ${booking.customer_name}`);
  }

  // 2. SMS Notification (Mock / Log)
  if (booking.customer_phone) {
    const smsRes = await sendMockSMS(
      booking.customer_phone,
      generateSMSMessage(status, booking.customer_name)
    );
    results.sms = smsRes.success;
  } else {
    console.log(`[Notification] Skipped SMS: No phone number for ${booking.customer_name}`);
  }

  return results;
}

/**
 * Mock SMS Sender
 * In a real app, integrate with Twilio, Netgsm, etc.
 */
async function sendMockSMS(phone: string, message: string) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Log the SMS as if it was sent
  console.log(`
📱 --- SMS SENT ---`);
  console.log(`To: ${phone}`);
  console.log(`Message: ${message}`);
  console.log(`-------------------
`);

  return { success: true };
}

function generateSMSMessage(status: string, name: string): string {
  switch (status) {
    case 'pending':
      return `Sn. ${name}, rezervasyon talebiniz alinmistir. Onay icin size donus yapilacaktir. Solis Hotel`;
    case 'confirmed':
      return `Sn. ${name}, rezervasyonunuz ONAYLANMISTIR. Sizi agirlamaktan mutluluk duyariz. Solis Hotel`;
    case 'cancelled':
      return `Sn. ${name}, rezervasyonunuz iptal edilmistir. Bilgi icin arayabilirsiniz. Solis Hotel`;
    case 'completed':
    case 'checked_out':
      return `Sn. ${name}, bizi tercih ettiginiz icin tesekkurler. Yine bekleriz. Solis Hotel`;
    default:
      return `Sn. ${name}, rezervasyon durumunuz guncellendi: ${status.toUpperCase()}. Solis Hotel`;
  }
}
