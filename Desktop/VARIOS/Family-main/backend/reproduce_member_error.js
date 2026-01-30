const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function reproduceError() {
    const form = new FormData();
    form.append('name', 'Test Member');
    form.append('email', 'test@test.com');
    // form.append('avatar', fs.createReadStream('some_image.png')); // Optional

    try {
        console.log('Sending request...');
        const response = await axios.post('http://127.0.0.1:3001/api/members', form, {
            headers: {
                ...form.getHeaders()
            }
        });
        console.log('Success:', response.data);
    } catch (error) {
        console.error('Error Status:', error.response?.status);
        console.error('Error Data:', error.response?.data);
    }
}

reproduceError();
