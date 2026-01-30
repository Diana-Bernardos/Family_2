const axios = require('axios');
const FormData = require('form-data');

async function trigger500() {
    const form = new FormData();
    form.append('name', 'Bad Request Member');
    
    // Simulate the error: sending FormData but forcing Content-Type to application/json
    // effectively confusing the body parser or multer
    try {
        console.log('Sending BAD request...');
        await axios.post('http://127.0.0.1:3001/api/members', form, {
            headers: {
                'Content-Type': 'application/json', // THE BUG
                // ...form.getHeaders() // Missing boundary
            }
        });
    } catch (error) {
        console.log('Caught expected error:', error.response?.status);
    }
}

trigger500();
