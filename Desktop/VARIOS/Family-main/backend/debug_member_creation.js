const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testMemberCreation() {
    const API_URL = 'http://127.0.0.1:3001/api/members';

    console.log('--- TEST 1: Valid Multipart Request ---');
    try {
        const form = new FormData();
        form.append('name', 'Valid Member');
        form.append('email', 'valid@test.com');
        
        // Axios automatically sets Content-Type: multipart/form-data; boundary=...
        // when using FormData
        const res = await axios.post(API_URL, form, {
            headers: {
                ...form.getHeaders()
            }
        });
        console.log('✅ Success:', res.status, res.data.success);
    } catch (error) {
        console.log('❌ Failed:', error.response?.status, error.response?.data);
    }

    console.log('\n--- TEST 2: Invalid Header (Simulation) ---');
    try {
        const form2 = new FormData();
        form2.append('name', 'Invalid Member');
        
        // Force application/json to simulate the bug
        await axios.post(API_URL, form2, {
            headers: {
                'Content-Type': 'application/json' 
            }
        });
    } catch (error) {
        console.log('💥 Expected Failure:', error.response?.status, error.response?.data);
    }
}

testMemberCreation();
