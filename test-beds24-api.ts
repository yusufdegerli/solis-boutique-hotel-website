/**
 * Test script for Beds24 API Integration
 * Run this with: node --loader ts-node/esm test-beds24-api.ts
 */

const AVAILABILITY_URL = 'http://localhost:3000/api/availability';
const CREATE_BOOKING_URL = 'http://localhost:3000/api/create-booking';

// Test 1: Check Availability
async function testAvailability() {
    console.log('\n=== TEST 1: Check Availability ===');

    const payload = {
        checkIn: '20260601',
        checkOut: '20260605',
        adults: 2
    };

    try {
        const response = await fetch(AVAILABILITY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));

        if (data.success && data.rooms) {
            console.log('✅ Availability check successful!');
            console.log(`Found ${data.rooms.length} rooms`);
            return data.rooms[0]; // Return first room for booking test
        } else {
            console.log('❌ Availability check failed:', data.error);
            return null;
        }
    } catch (error: any) {
        console.error('❌ Error:', error.message);
        return null;
    }
}

// Test 2: Create Booking (Mock)
async function testCreateBooking(roomId: string) {
    console.log('\n=== TEST 2: Create Booking (Mock) ===');

    const payload = {
        roomId: roomId,
        guestName: 'Test User',
        guestEmail: 'test@example.com',
        guestPhone: '+905551234567',
        checkIn: '2026-06-01',
        checkOut: '2026-06-05',
        price: 500,
        adults: 2,
        notes: 'Test booking - DO NOT CONFIRM'
    };

    try {
        const response = await fetch(CREATE_BOOKING_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));

        if (data.success) {
            console.log('✅ Booking creation successful!');
            console.log('Booking ID:', data.bookingId);
        } else {
            console.log('❌ Booking creation failed:', data.error);
        }
    } catch (error: any) {
        console.error('❌ Error:', error.message);
    }
}

// Run tests
async function runTests() {
    console.log('🚀 Starting Beds24 API Tests...');
    console.log('Make sure your dev server is running on http://localhost:3000\n');

    // Test 1: Availability
    const room = await testAvailability();

    // Test 2: Create Booking (only if we got a room)
    if (room && room.roomId) {
        await testCreateBooking(room.roomId);
    } else {
        console.log('\n⚠️  Skipping booking test - no available rooms found');
    }

    console.log('\n✨ Tests completed!');
}

runTests();
