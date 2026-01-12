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
    const url = 'https://app.channex.io/api/v1/availability';

    console.log(`Channex Request: ${url} for Room: ${roomTypeId} Date: ${date} Count: ${count}`);

    const payload = {
      values: [
        {
          property_id: propertyId,
          room_type_id: roomTypeId,
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
        'apikey': apiKey
      },
      body: JSON.stringify(payload)
    });

    // Yanıtın JSON olup olmadığını kontrol et
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
    // Detaylı hata analizi
    let errorMsg = error.message;
    if (error.cause) {
        errorMsg += ` | Cause: ${JSON.stringify(error.cause)}`;
    }
    console.error('Channex Sync Error Full:', error);
    return { success: false, error: errorMsg };
  }
};