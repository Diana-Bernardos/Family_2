const axios = require('axios');

async function testAIChat() {
    try {
        console.log('Sending AI Chat request...');
        const res = await axios.post('http://127.0.0.1:3001/api/ai/chat', {
            message: "Hola, ¿cómo estás?",
        }, {
            headers: { 'Content-Type': 'application/json' }
        });
        console.log('Success:', res.data);
    } catch (error) {
        console.error('Error:', error.response ? error.response.status : error.message);
        if (error.response) console.error('Data:', error.response.data);
    }
}

testAIChat();
