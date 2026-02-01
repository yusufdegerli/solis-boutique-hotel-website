/**
 * Test Beds24 API Connection
 * Run this to verify your API keys are working
 */

async function testBeds24Connection() {
    const BEDS24_API_KEY = process.env.BEDS24_API_KEY;
    const BEDS24_PROP_KEY = process.env.BEDS24_PROP_KEY;

    console.log('Testing Beds24 API Connection...');
    console.log('API Key:', BEDS24_API_KEY ? `${BEDS24_API_KEY.substring(0, 5)}...` : 'MISSING');
    console.log('Prop Key:', BEDS24_PROP_KEY ? `${BEDS24_PROP_KEY.substring(0, 5)}...` : 'MISSING');

    if (!BEDS24_API_KEY || !BEDS24_PROP_KEY) {
        console.error('❌ API keys are missing! Check your .env.local file');
        return;
    }

    // Test 1: Get Property Info
    console.log('\n--- Test 1: Get Property Info ---');
    try {
        const response = await fetch('https://api.beds24.com/json/getProperties', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                authentication: {
                    apiKey: BEDS24_API_KEY,
                    propKey: BEDS24_PROP_KEY
                }
            })
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));

        if (response.ok) {
            console.log('✅ API connection successful!');
        } else {
            console.log('❌ API connection failed!');
        }
    } catch (error: any) {
        console.error('❌ Error:', error.message);
    }

    // Test 2: Get Rooms
    console.log('\n--- Test 2: Get Rooms ---');
    try {
        const response = await fetch('https://api.beds24.com/json/getRooms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                authentication: {
                    apiKey: BEDS24_API_KEY,
                    propKey: BEDS24_PROP_KEY
                }
            })
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));

        if (response.ok && Array.isArray(data)) {
            console.log('✅ Found', data.length, 'rooms');
            data.forEach((room: any) => {
                console.log(`  - Room ID: ${room.roomId}, Name: ${room.name}`);
            });
        } else {
            console.log('❌ Failed to get rooms');
        }
    } catch (error: any) {
        console.error('❌ Error:', error.message);
    }
}

testBeds24Connection();
