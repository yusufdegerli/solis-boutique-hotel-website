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

    const url = 'https://staging.channex.io/api/v1/availability';

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
  };
  guests_count: number;
  total_price: number;
  currency?: string;
  unique_id?: string; // Our internal UUID
}): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const apiKey = process.env.API_KEY_CHANNEX;
    const propertyId = process.env.HOTEL_BOUTIQUE_ID;

    if (!apiKey || !propertyId) {
      throw new Error('Channex API Configuration missing (API_KEY_CHANNEX or HOTEL_BOUTIQUE_ID)');
    }

    const url = 'https://staging.channex.io/api/v1/bookings';

    const payload = {
      booking: {
        status: "new",
        ota_name: "Website", // Required field
        property_id: propertyId,
        arrival_date: bookingData.arrival_date,
        departure_date: bookingData.departure_date,
        rooms: [
          {
            room_type_id: bookingData.room_type_id,
            rate_plan_id: bookingData.rate_plan_id,
            occupancy: Math.floor(bookingData.guests_count), // Keep strictly integer
            // days: [] // Removed empty days array to prevent 422 error
          }
        ],
        customer: {
          name: bookingData.customer.name,
          surname: "", // Channex might split name or require surname. We'll handle split below.
          email: bookingData.customer.email,
          phone: bookingData.customer.phone || "",
          country: bookingData.customer.country || "TR"
        },
        amount: bookingData.total_price, // Total booking amount
        currency: bookingData.currency || "EUR",
        unique_id: bookingData.unique_id // Our Supabase UUID reference
      }
    };

    // Handle Name Split
    const fullName = bookingData.customer.name.trim();
    const lastSpaceIndex = fullName.lastIndexOf(" ");
    if (lastSpaceIndex > 0) {
      payload.booking.customer.name = fullName.substring(0, lastSpaceIndex);
      payload.booking.customer.surname = fullName.substring(lastSpaceIndex + 1);
    } else {
      payload.booking.customer.name = fullName;
      payload.booking.customer.surname = "."; // Fallback
    }

    console.log(`Channex Create Booking Request: ${JSON.stringify(payload, null, 2)}`);

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
      console.error('Channex Create Booking Fail:', response.status, JSON.stringify(data, null, 2));
      throw new Error(data?.message || 'Channex Booking Creation Failed');
    }

    console.log('Channex Booking Created Successfully:', data);
    return { success: true, data };

  } catch (error: any) {
    console.error('Channex Booking Error:', error);
    return { success: false, error: error.message };
  }
};