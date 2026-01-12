export const updateAvailability = async (
  roomTypeId: string, 
  date: string, 
  count: number
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const apiKey = process.env.API_KEY_CHANNEX;
    const propertyId = process.env.HOTEL_BOUTIQUE_ID;

    if (!apiKey || !propertyId) {
      throw new Error('Channex API Configuration missing (API_KEY_CHANNEX or HOTEL_BOUTIQUE_ID)');
    }

    // Channex API v1 standard endpoint for updating availability is /availability
    const url = 'https://api.channex.io/api/v1/availability';

    const payload = {
      values: [
        {
          property_id: propertyId,
          room_type_id: roomTypeId,
          date_from: date,
          date_to: date, // Update for a single day
          availability: count // This is the REMAINING availability (not the booked amount)
        }
      ]
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'user-api-key': apiKey
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || data?.error || 'Channex API request failed');
    }

    return { success: true, data };

  } catch (error: any) {
    console.error('Channex Sync Error:', error.message);
    return { success: false, error: error.message };
  }
};
