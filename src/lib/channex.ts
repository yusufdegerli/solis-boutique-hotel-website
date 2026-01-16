import { eachDayOfInterval, format, parseISO, differenceInCalendarDays } from 'date-fns';

const BASE_URL = process.env.CHANNEX_API_BASE_URL || 'https://app.channex.io/api/v1';

export const updateAvailability = async (
  roomTypeId: string,
  ratePlanId: string,
  date: string,
  count: number
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const apiKey = process.env.API_KEY_CHANNEX;
    const propertyId = process.env.HOTEL_BOUTIQUE_ID;

    if (!apiKey || !propertyId) {
      throw new Error('Channex API Configuration missing (API_KEY_CHANNEX or HOTEL_BOUTIQUE_ID)');
    }

    const url = `${BASE_URL}/availability`;

    console.log(`Channex Request: ${url} Room: ${roomTypeId} Rate: ${ratePlanId} Date: ${date} Count: ${count}`);

    const payload = {
      values: [
        {
          property_id: propertyId,
          room_type_id: roomTypeId,
          rate_plan_id: ratePlanId,
          date_from: date,
          date_to: date,
          availability: count
        }
      ]
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'user-api-key': apiKey,
        'apikey': apiKey,
        'User-Agent': 'SolisHotelWebsite/1.0 (Vercel; Node.js)'
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
      console.error('Channex API Fail Status', response.status);
      console.error('Channex API Fail Response:', JSON.stringify(data, null, 2));
      throw new Error(data?.message || JSON.stringify(data) || 'Channex API request failed');
    }

    return { success: true, data };

  } catch (error: any) {
    let errorMsg = error.message;
    if (error.cause) {
      errorMsg += ` | Cause: ${JSON.stringify(error.cause)}`;
    }
    console.error('Channex Sync Error Full:', error);
    return { success: false, error: errorMsg };
  }
};

export const createChannexBooking = async (bookingData: {
  arrival_date: string;
  departure_date: string;
  room_type_id: string;
  rate_plan_id: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
    country?: string;
    city?: string;
    address?: string;
  };
  guests_count: number;
  guest_names?: string[]; // ["Ad Soyad", "Ad2 Soyad2", ...]
  total_price: number;
  currency?: string;
  unique_id?: string; // Our internal UUID
  notes?: string;
}): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const apiKey = process.env.API_KEY_CHANNEX;
    const propertyId = process.env.HOTEL_BOUTIQUE_ID;

    if (!apiKey || !propertyId) {
      throw new Error('Channex API Configuration missing (API_KEY_CHANNEX or HOTEL_BOUTIQUE_ID)');
    }

    const url = `${BASE_URL}/bookings`;

    // --- DEBUG: Environment Check ---
    console.log('--- CHANNEX CONFIG CHECK ---');
    console.log(`Property ID: ${propertyId ? propertyId : 'MISSING'}`);
    console.log(`API Key: ${apiKey ? apiKey.substring(0, 5) + '...' : 'MISSING'}`);
    // --------------------------------

    // Handle Name Split
    const fullName = bookingData.customer.name.trim();
    const lastSpaceIndex = fullName.lastIndexOf(" ");
    const name = fullName.substring(0, lastSpaceIndex) || fullName;
    const surname = lastSpaceIndex > 0 ? fullName.substring(lastSpaceIndex + 1) : "Surname";

    // Date Calculation
    const arrivalDate = parseISO(bookingData.arrival_date);
    const departureDate = parseISO(bookingData.departure_date);
    const nightsCount = differenceInCalendarDays(departureDate, arrivalDate);
    const safeNightsCount = nightsCount > 0 ? nightsCount : 1;
    const dailyRate = (bookingData.total_price / safeNightsCount).toFixed(2);

    // Generate Days Object
    const daysInterval = eachDayOfInterval({
      start: arrivalDate,
      end: new Date(departureDate.getTime() - 86400000) // Subtract 1 day to exclude checkout date
    });

    const daysObject: Record<string, string> = {};
    daysInterval.forEach((day) => {
      daysObject[format(day, 'yyyy-MM-dd')] = dailyRate;
    });

    const guestsCount = Math.max(1, Math.floor(bookingData.guests_count || 1));

    const payload = {
      booking: {
        status: "new",
        ota_name: "Website",
        property_id: propertyId,
        ota_reservation_code: bookingData.unique_id,
        arrival_date: bookingData.arrival_date,
        departure_date: bookingData.departure_date,
        currency: bookingData.currency || "EUR",
        notes: bookingData.notes || "",
        customer: {
          name: name,
          surname: surname,
          email: bookingData.customer.email,
          phone: bookingData.customer.phone || "",
          country: bookingData.customer.country || "TR"
        },
        rooms: [
          {
            room_type_id: bookingData.room_type_id,
            rate_plan_id: bookingData.rate_plan_id,
            occupancy: {
              adults: guestsCount,
              children: 0,
              infants: 0
            },
            days: daysObject,
            guests: Array.from({ length: guestsCount }).map((_, i) => {
              // Use guest_names if provided, otherwise fallback to customer name for first guest
              if (bookingData.guest_names && bookingData.guest_names[i]) {
                const guestFullName = bookingData.guest_names[i].trim();
                const lastSpace = guestFullName.lastIndexOf(" ");
                return {
                  name: lastSpace > 0 ? guestFullName.substring(0, lastSpace) : guestFullName,
                  surname: lastSpace > 0 ? guestFullName.substring(lastSpace + 1) : "Guest"
                };
              }
              return {
                name: i === 0 ? name : `Guest`,
                surname: i === 0 ? surname : `${i + 1}`
              };
            })
          }
        ]
      }
    };

    console.log('--- CHANNEX PAYLOAD START ---');
    console.log(JSON.stringify(payload, null, 2));
    console.log('--- CHANNEX PAYLOAD END ---');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'user-api-key': apiKey,
        'apikey': apiKey,
        'User-Agent': 'SolisHotelWebsite/1.0 (Vercel; Node.js)'
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
      console.error('--- CHANNEX ERROR RESPONSE START ---');
      console.error('Status:', response.status);
      console.error('Body:', JSON.stringify(data, null, 2));

      let detailedError = data?.message || 'Channex Booking Creation Failed';

      // Try to extract specific validation errors if available
      if (data?.errors && Array.isArray(data.errors)) {
        const validationMessages = data.errors.map((e: any) =>
          typeof e === 'string' ? e : JSON.stringify(e)
        ).join(' | ');
        detailedError += ` (Details: ${validationMessages})`;
      }

      console.error('Detailed Error:', detailedError);
      console.error('--- CHANNEX ERROR RESPONSE END ---');

      throw new Error(detailedError);
    }

    console.log('Channex Booking Created Successfully:', data);
    return { success: true, data };

  } catch (error: any) {
    console.error('Channex Booking Error:', error);
    return { success: false, error: error.message };
  }
};

export const cancelChannexBooking = async (channexBookingId: string): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const apiKey = process.env.API_KEY_CHANNEX;
    if (!apiKey) {
      throw new Error('Channex API Configuration missing (API_KEY_CHANNEX)');
    }

    const url = `${BASE_URL}/bookings/${channexBookingId}`;
    console.log(`Channex Cancel Request: ${url}`);

    const payload = {
      booking: {
        status: "cancelled"
      }
    };

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'user-api-key': apiKey,
        'apikey': apiKey,
        'User-Agent': 'SolisHotelWebsite/1.0 (Vercel; Node.js)'
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
      console.error('Channex Cancel Booking Fail:', response.status, JSON.stringify(data, null, 2));
      throw new Error(data?.message || 'Channex Booking Cancellation Failed');
    }

    console.log('Channex Booking Cancelled Successfully:', data);
    return { success: true, data };

  } catch (error: any) {
    console.error('Channex Cancel Booking Error:', error);
    return { success: false, error: error.message };
  }
};