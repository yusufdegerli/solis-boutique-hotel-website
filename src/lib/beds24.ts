import { eachDayOfInterval, format, parseISO, differenceInCalendarDays } from 'date-fns';

const BEDS24_API_URL = 'https://beds24.com/api/v2';
const BEDS24_JSON_API_URL = 'https://api.beds24.com/json';

// Room ID Mapping
const ROOM_ID_MAP: Record<string, string> = {
  "646866": "Twin Bed Room",
  "646874": "Single Room",
  "646875": "Family Room",
  "646877": "Double Room"
};

// TypeScript Types
export interface Beds24Room {
  roomId: string;
  roomName: string;
  available: number;
}

export interface Beds24AvailabilityResponse {
  [key: string]: any;
}

/**
 * Parse Beds24 API Response
 * Beds24 returns data as an Object keyed by room ID, not an Array.
 * This function transforms it into a clean TypeScript array.
 */
export const parseBeds24Response = (response: Beds24AvailabilityResponse): Beds24Room[] => {
  const rooms: Beds24Room[] = [];

  // Filter out non-numeric keys (like "checkIn", "propId", etc.)
  Object.keys(response).forEach(key => {
    // Check if key is a number (room ID)
    if (!isNaN(Number(key))) {
      const roomData = response[key];
      rooms.push({
        roomId: key,
        roomName: ROOM_ID_MAP[key] || `Room ${key}`,
        available: roomData.roomsavail || 0
      });
    }
  });

  return rooms;
};

/**
 * Get room availability from Beds24
 * @param checkIn - Check-in date in YYYYMMDD format
 * @param checkOut - Check-out date in YYYYMMDD format
 * @param adults - Number of adults
 */
export const getAvailabilities = async (
  checkIn: string,
  checkOut: string,
  adults: number = 2
): Promise<{ success: boolean; rooms?: Beds24Room[]; error?: string }> => {
  try {
    const apiKey = process.env.BEDS24_API_KEY;
    const propKey = process.env.BEDS24_PROP_KEY;

    if (!apiKey || !propKey) {
      throw new Error('Beds24 API Configuration missing (BEDS24_API_KEY or BEDS24_PROP_KEY)');
    }

    const url = `${BEDS24_JSON_API_URL}/getAvailabilities`;

    console.log(`Beds24 Availability Query: ${checkIn} to ${checkOut}, Adults: ${adults}`);

    // Check if propKey is numeric (Property ID) or alphanumeric (Property Key)
    const isNumeric = /^\d+$/.test(propKey);

    const payload: any = {
      authentication: {
        apiKey: apiKey
      },
      checkIn: checkIn,
      checkOut: checkOut,
      numAdult: String(adults)
    };

    // Add both propKey and propId for compatibility
    if (isNumeric) {
      payload.authentication.propId = propKey;
      payload.propId = propKey;
    } else {
      payload.authentication.propKey = propKey;
      payload.propId = propKey;
    }

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
      throw new Error(`Unexpected response format: ${text}`);
    }

    if (!response.ok) {
      console.error('Beds24 Availability API Error:', response.status, data);
      throw new Error(data?.message || 'Failed to fetch availability');
    }

    // Parse the response
    const rooms = parseBeds24Response(data);

    console.log('Beds24 Availability Success:', rooms);
    return { success: true, rooms };

  } catch (error: any) {
    console.error('Beds24 Availability Error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get or refresh the Beds24 API v2 token
 * Token expires after 24 hours, so we need to refresh it periodically
 */
export const refreshBeds24Token = async (): Promise<{ success: boolean; token?: string; error?: string }> => {
  try {
    const refreshToken = process.env.BEDS24_REFRESH_TOKEN;

    if (!refreshToken) {
      throw new Error('BEDS24_REFRESH_TOKEN is missing');
    }

    const url = `${BEDS24_API_URL}/authentication/token`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'refreshToken': refreshToken
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error || 'Failed to refresh token');
    }

    console.log('Beds24 Token Refreshed Successfully');
    return { success: true, token: data.token };

  } catch (error: any) {
    console.error('Beds24 Token Refresh Error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update room availability in Beds24 using API v2
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
    let token = process.env.BEDS24_TOKEN;

    if (!token) {
      // Try to get a new token using refresh token
      const refreshResult = await refreshBeds24Token();
      if (refreshResult.success && refreshResult.token) {
        token = refreshResult.token;
      } else {
        throw new Error('Beds24 API Configuration missing (BEDS24_TOKEN)');
      }
    }

    const url = `${BEDS24_API_URL}/inventory/rooms/calendar`;

    console.log(`Beds24 Availability Update: Room ${roomId}, Date ${date}, Count ${count}`);

    // API v2 inventory/rooms/calendar format
    const payload = [{
      roomId: roomId,
      calendar: [{
        date: date,
        numAvail: count
      }]
    }];

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
        'token': token
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

      // If token expired, try refreshing
      if (response.status === 401) {
        console.log('Token expired, attempting refresh...');
        const refreshResult = await refreshBeds24Token();
        if (refreshResult.success && refreshResult.token) {
          // Retry with new token
          const retryResponse = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'accept': 'application/json',
              'token': refreshResult.token
            },
            body: JSON.stringify(payload)
          });

          const retryData = await retryResponse.json();
          if (retryResponse.ok) {
            return { success: true, data: retryData };
          }
        }
      }

      throw new Error(data?.error || data?.message || JSON.stringify(data) || 'Beds24 API request failed');
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
 * Create a new booking in Beds24 using API v2
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
  num_adults: number;
  num_children: number;
  guest_names?: string[];
  total_price: number;
  currency?: string;
  unique_id?: string;
  notes?: string;
}): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    let token = process.env.BEDS24_TOKEN;

    if (!token) {
      const refreshResult = await refreshBeds24Token();
      if (refreshResult.success && refreshResult.token) {
        token = refreshResult.token;
      } else {
        throw new Error('Beds24 API Configuration missing (BEDS24_TOKEN)');
      }
    }

    // Use API v2 bookings endpoint
    const url = `${BEDS24_API_URL}/bookings`;

    console.log('--- BEDS24 BOOKING CREATE START ---');
    console.log(`Room ID: ${bookingData.room_id}`);

    // Format dates for Beds24 API v2 (YYYY-MM-DD)
    const arrivalDate = parseISO(bookingData.arrival_date);
    const departureDate = parseISO(bookingData.departure_date);
    const arrival = format(arrivalDate, 'yyyy-MM-dd');
    const departure = format(departureDate, 'yyyy-MM-dd');

    // Split name into first and last name
    const nameParts = bookingData.customer.name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // API v2 uses array format for booking creation
    // Status codes: 0=Cancelled, 1=Confirmed, 2=New, 3=Request
    // Field names per API v2 schema: firstName, lastName, phone, mobile, address, city, country, comments, notes
    const payload = [{
      roomId: bookingData.room_id,
      arrival: arrival,
      departure: departure,
      numAdult: bookingData.num_adults,
      numChild: bookingData.num_children,
      // Guest name fields (API v2 uses firstName/lastName, NOT guestFirstName/guestName)
      firstName: firstName,
      lastName: lastName,
      // Contact info (API v2 uses phone/mobile, NOT guestPhone/guestMobile)
      email: bookingData.customer.email,
      phone: bookingData.customer.phone || '',
      mobile: bookingData.customer.phone || '',
      // Address info (API v2 uses address/city/country, NOT guestAddress/guestCity/guestCountry)
      address: bookingData.customer.address || '',
      city: bookingData.customer.city || '',
      country: bookingData.customer.country || 'Turkey',
      country2: 'TR',  // 2-letter country code
      // Booking info
      price: bookingData.total_price,
      comments: bookingData.notes || '',
      notes: bookingData.notes || '',
      referer: 'Website',
      status: 2  // 2 = New (Yeni) - Admin onaylayana kadar "New" durumunda kalacak
    }];

    console.log('--- BEDS24 PAYLOAD START ---');
    console.log(JSON.stringify(payload, null, 2));
    console.log('--- BEDS24 PAYLOAD END ---');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
        'token': token
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

      // If token expired, try refreshing and retry
      if (response.status === 401) {
        console.log('Token expired, attempting refresh...');
        const refreshResult = await refreshBeds24Token();
        if (refreshResult.success && refreshResult.token) {
          const retryResponse = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'accept': 'application/json',
              'token': refreshResult.token
            },
            body: JSON.stringify(payload)
          });

          const retryData = await retryResponse.json();
          if (retryResponse.ok) {
            console.log('Beds24 Booking Created Successfully (after token refresh):', retryData);
            const bookId = Array.isArray(retryData) && retryData[0]?.id
              ? retryData[0].id
              : bookingData.unique_id;
            return { success: true, data: { bookId, ...retryData } };
          }
        }
      }

      let detailedError = data?.error || data?.message || 'Beds24 Booking Creation Failed';

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

    // API v2 returns array with booking info
    // The actual Beds24 booking ID is in data[0].new.id
    let bookId = null;
    if (Array.isArray(data) && data[0]) {
      // New booking ID is in the 'new' object
      if (data[0].new?.id) {
        bookId = data[0].new.id;
      } else if (data[0].id) {
        bookId = data[0].id;
      }
    }

    // Fallback to unique_id only if no Beds24 ID found
    if (!bookId) {
      console.warn('Could not extract Beds24 booking ID from response');
      bookId = bookingData.unique_id;
    }

    console.log('Extracted Beds24 Booking ID:', bookId);

    // Note: Status update removed - Beds24 rejects custom status values for this property
    // The booking will use Beds24's default status setting

    return { success: true, data: { bookId, ...data } };

  } catch (error: any) {
    console.error('Beds24 Booking Error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Cancel a booking in Beds24 using API v2
 */
export const cancelBeds24Booking = async (beds24BookingId: string): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    let token = process.env.BEDS24_TOKEN;

    if (!token) {
      const refreshResult = await refreshBeds24Token();
      if (refreshResult.success && refreshResult.token) {
        token = refreshResult.token;
      } else {
        throw new Error('Beds24 API Configuration missing (BEDS24_TOKEN)');
      }
    }

    const url = `${BEDS24_API_URL}/bookings`;
    console.log(`Beds24 Cancel Request: Booking ID ${beds24BookingId}`);

    // API v2 uses array format for booking updates
    // Status codes: 0=Cancelled, 1=Confirmed, 2=New, 3=Request
    const payload = [{
      id: beds24BookingId,
      status: 0  // 0 = Cancelled
    }];

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
        'token': token
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

      // If token expired, try refreshing
      if (response.status === 401) {
        const refreshResult = await refreshBeds24Token();
        if (refreshResult.success && refreshResult.token) {
          const retryResponse = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'accept': 'application/json',
              'token': refreshResult.token
            },
            body: JSON.stringify(payload)
          });

          const retryData = await retryResponse.json();
          if (retryResponse.ok) {
            return { success: true, data: retryData };
          }
        }
      }

      throw new Error(data?.error || data?.message || 'Beds24 Booking Cancellation Failed');
    }

    console.log('Beds24 Booking Cancelled Response:', JSON.stringify(data, null, 2));

    // Check if Beds24 actually accepted the cancellation
    if (Array.isArray(data) && data[0]) {
      if (data[0].success === false) {
        console.warn('Beds24 cancellation was NOT accepted!');
        if (data[0].warnings) {
          console.warn('Beds24 Warnings:', JSON.stringify(data[0].warnings, null, 2));
        }
        if (data[0].info) {
          console.warn('Beds24 Info:', JSON.stringify(data[0].info, null, 2));
        }
      }
    }

    return { success: true, data };

  } catch (error: any) {
    console.error('Beds24 Cancel Booking Error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Cancel a booking in Beds24 using JSON API v1 (setBooking endpoint)
 * This uses the apiKey/propKey authentication format
 */
export const cancelBeds24BookingV1 = async (beds24BookingId: string): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const apiKey = process.env.BEDS24_API_KEY;
    const propKey = process.env.BEDS24_PROP_KEY;

    if (!apiKey || !propKey) {
      throw new Error('Beds24 API Configuration missing (BEDS24_API_KEY or BEDS24_PROP_KEY)');
    }

    const url = `${BEDS24_JSON_API_URL}/setBooking`;
    console.log(`Beds24 Cancel Request (V1): Booking ID ${beds24BookingId}`);

    // JSON API v1 format with authentication in body
    const payload = {
      authentication: {
        apiKey: apiKey,
        propKey: propKey
      },
      bookId: beds24BookingId,
      status: "0"  // "0" = Cancelled (string format for v1)
    };

    console.log('Beds24 Cancel Payload:', JSON.stringify(payload, null, 2));

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

    console.log('Beds24 Cancel Response:', JSON.stringify(data, null, 2));

    // Check for error in response
    if (data?.error) {
      console.error('Beds24 Cancel Error:', data.error);
      throw new Error(data.error);
    }

    // V1 API returns booking info on success
    if (data?.bookId || data?.status !== undefined) {
      console.log('Beds24 Booking Cancelled Successfully (V1)');
      return { success: true, data };
    }

    // If no clear success indicator, assume it worked if no error
    return { success: true, data };

  } catch (error: any) {
    console.error('Beds24 Cancel Booking Error (V1):', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update booking status in Beds24 using API v2
 * Status codes: 0=Cancelled, 1=Confirmed, 2=New, 3=Request
 */
export const updateBeds24BookingStatus = async (
  beds24BookingId: string,
  status: number
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    let token = process.env.BEDS24_TOKEN;

    if (!token) {
      const refreshResult = await refreshBeds24Token();
      if (refreshResult.success && refreshResult.token) {
        token = refreshResult.token;
      } else {
        throw new Error('Beds24 API Configuration missing (BEDS24_TOKEN)');
      }
    }

    const url = `${BEDS24_API_URL}/bookings`;
    console.log(`Beds24 Update Status: Booking ID ${beds24BookingId}, Status ${status}`);

    const payload = [{
      id: beds24BookingId,
      status: status
    }];

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
        'token': token
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Beds24 Update Status Fail:', response.status, JSON.stringify(data, null, 2));

      if (response.status === 401) {
        const refreshResult = await refreshBeds24Token();
        if (refreshResult.success && refreshResult.token) {
          const retryResponse = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'accept': 'application/json',
              'token': refreshResult.token
            },
            body: JSON.stringify(payload)
          });

          const retryData = await retryResponse.json();
          if (retryResponse.ok) {
            console.log('Beds24 Status Updated Successfully (after refresh):', retryData);
            return { success: true, data: retryData };
          }
        }
      }

      throw new Error(data?.error || data?.message || 'Beds24 Status Update Failed');
    }

    console.log('Beds24 Status Update Response:', JSON.stringify(data, null, 2));

    // Check if Beds24 actually accepted the status update
    if (Array.isArray(data) && data[0]) {
      if (data[0].success === false) {
        console.warn('Beds24 status update was NOT accepted!');
        if (data[0].warnings) {
          console.warn('Beds24 Warnings:', JSON.stringify(data[0].warnings, null, 2));
        }
        if (data[0].info) {
          console.warn('Beds24 Info:', JSON.stringify(data[0].info, null, 2));
        }
      }
    }

    return { success: true, data };

  } catch (error: any) {
    console.error('Beds24 Update Status Error:', error);
    return { success: false, error: error.message };
  }
};
