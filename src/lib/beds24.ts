import { eachDayOfInterval, format, parseISO, differenceInCalendarDays } from 'date-fns';

const BEDS24_API_URL = 'https://beds24.com/api/v2';

/**
 * Update room availability in Beds24
 * @param roomId - Beds24 room ID
 * @param date - Date in YYYY-MM-DD format
 * @param count - Number of available rooms
 */
export const updateAvailability = async (
  roomId: string,
  date: string,
  count: number
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const apiKey = process.env.BEDS24_API_KEY;
    const propKey = process.env.BEDS24_PROP_KEY;

    if (!apiKey || !propKey) {
      throw new Error('Beds24 API Configuration missing (BEDS24_API_KEY or BEDS24_PROP_KEY)');
    }

    const url = `${BEDS24_API_URL}/inventory`;

    console.log(`Beds24 Availability Update: Room ${roomId}, Date ${date}, Count ${count}`);

    const payload = {
      authentication: {
        apiKey: apiKey,
        propKey: propKey
      },
      roomId: roomId,
      date: date,
      numAvailable: count
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'SolisHotelWebsite/1.0'
      },
      body: JSON.stringify(payload)
    });

    const contentType = response.headers.get("content-type");
    let data;
    if (contentType && contentType.indexOf("application/json") !== -1) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { message: text };
    }

    if (!response.ok) {
      console.error('Beds24 API Fail Status', response.status);
      console.error('Beds24 API Fail Response:', JSON.stringify(data, null, 2));
      throw new Error(data?.message || JSON.stringify(data) || 'Beds24 API request failed');
    }

    return { success: true, data };

  } catch (error: any) {
    let errorMsg = error.message;
    if (error.cause) {
      errorMsg += ` | Cause: ${JSON.stringify(error.cause)}`;
    }
    console.error('Beds24 Sync Error:', error);
    return { success: false, error: errorMsg };
  }
};

/**
 * Create a new booking in Beds24
 */
export const createBeds24Booking = async (bookingData: {
  arrival_date: string;
  departure_date: string;
  room_id: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
    country?: string;
    city?: string;
    address?: string;
  };
  guests_count: number;
  guest_names?: string[];
  total_price: number;
  currency?: string;
  unique_id?: string;
  notes?: string;
}): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const apiKey = process.env.BEDS24_API_KEY;
    const propKey = process.env.BEDS24_PROP_KEY;

    if (!apiKey || !propKey) {
      throw new Error('Beds24 API Configuration missing (BEDS24_API_KEY or BEDS24_PROP_KEY)');
    }

    const url = `${BEDS24_API_URL}/bookings`;

    console.log('--- BEDS24 BOOKING CREATE START ---');
    console.log(`Property Key: ${propKey}`);
    console.log(`API Key: ${apiKey ? apiKey.substring(0, 5) + '...' : 'MISSING'}`);

    // Calculate number of nights
    const arrivalDate = parseISO(bookingData.arrival_date);
    const departureDate = parseISO(bookingData.departure_date);
    const nightsCount = differenceInCalendarDays(departureDate, arrivalDate);
    const safeNightsCount = nightsCount > 0 ? nightsCount : 1;

    const payload = {
      authentication: {
        apiKey: apiKey,
        propKey: propKey
      },
      booking: {
        roomId: bookingData.room_id,
        arrival: bookingData.arrival_date,
        departure: bookingData.departure_date,
        numAdult: bookingData.guests_count,
        numChild: 0,
        guestFirstName: bookingData.customer.name.split(' ')[0] || bookingData.customer.name,
        guestName: bookingData.customer.name,
        guestEmail: bookingData.customer.email,
        guestPhone: bookingData.customer.phone || '',
        guestAddress: bookingData.customer.address || '',
        guestCity: bookingData.customer.city || '',
        guestCountry: bookingData.customer.country || 'TR',
        price: bookingData.total_price,
        currency: bookingData.currency || 'EUR',
        notes: bookingData.notes || '',
        referer: 'Website',
        bookId: bookingData.unique_id // Our internal reference
      }
    };

    console.log('--- BEDS24 PAYLOAD START ---');
    console.log(JSON.stringify(payload, null, 2));
    console.log('--- BEDS24 PAYLOAD END ---');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'SolisHotelWebsite/1.0'
      },
      body: JSON.stringify(payload)
    });

    const contentType = response.headers.get("content-type");
    let data;
    if (contentType && contentType.indexOf("application/json") !== -1) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { message: text };
    }

    if (!response.ok) {
      console.error('--- BEDS24 ERROR RESPONSE START ---');
      console.error('Status:', response.status);
      console.error('Body:', JSON.stringify(data, null, 2));

      let detailedError = data?.message || 'Beds24 Booking Creation Failed';

      if (data?.errors && Array.isArray(data.errors)) {
        const validationMessages = data.errors.map((e: any) =>
          typeof e === 'string' ? e : JSON.stringify(e)
        ).join(' | ');
        detailedError += ` (Details: ${validationMessages})`;
      }

      console.error('Detailed Error:', detailedError);
      console.error('--- BEDS24 ERROR RESPONSE END ---');

      throw new Error(detailedError);
    }

    console.log('Beds24 Booking Created Successfully:', data);
    return { success: true, data };

  } catch (error: any) {
    console.error('Beds24 Booking Error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Cancel a booking in Beds24
 */
export const cancelBeds24Booking = async (beds24BookingId: string): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const apiKey = process.env.BEDS24_API_KEY;
    const propKey = process.env.BEDS24_PROP_KEY;

    if (!apiKey || !propKey) {
      throw new Error('Beds24 API Configuration missing (BEDS24_API_KEY or BEDS24_PROP_KEY)');
    }

    const url = `${BEDS24_API_URL}/bookings`;
    console.log(`Beds24 Cancel Request: Booking ID ${beds24BookingId}`);

    const payload = {
      authentication: {
        apiKey: apiKey,
        propKey: propKey
      },
      bookId: beds24BookingId,
      status: 'cancelled'
    };

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'SolisHotelWebsite/1.0'
      },
      body: JSON.stringify(payload)
    });

    const contentType = response.headers.get("content-type");
    let data;
    if (contentType && contentType.indexOf("application/json") !== -1) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { message: text };
    }

    if (!response.ok) {
      console.error('Beds24 Cancel Booking Fail:', response.status, JSON.stringify(data, null, 2));
      throw new Error(data?.message || 'Beds24 Booking Cancellation Failed');
    }

    console.log('Beds24 Booking Cancelled Successfully:', data);
    return { success: true, data };

  } catch (error: any) {
    console.error('Beds24 Cancel Booking Error:', error);
    return { success: false, error: error.message };
  }
};
