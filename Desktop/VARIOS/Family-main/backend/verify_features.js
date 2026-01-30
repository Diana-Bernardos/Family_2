const axios = require('axios');
const db = require('./config/database');

const API_URL = 'http://127.0.0.1:3001/api';

async function verifyFeatures() {
    console.log('🚀 Starting Feature Verification...');

    try {
        // 1. Test Shopping List API
        console.log('\n📦 Testing Shopping List API...');
        const itemRes = await axios.post(`${API_URL}/shopping`, { item: 'Test Item 123' });
        console.log('✅ Add Item:', itemRes.data.success ? 'PASS' : 'FAIL');
        
        const listRes = await axios.get(`${API_URL}/shopping`);
        const found = listRes.data.data.find(i => i.item === 'Test Item 123');
        console.log('✅ Get List:', found ? 'PASS' : 'FAIL');

        // 2. Test AI Tool: Add to Shopping List
        console.log('\n🤖 Testing AI Shopping Tool...');
        const aiShopRes = await axios.post(`${API_URL}/ai/chat`, { message: 'Añadir Plátanos a la lista' });
        console.log('AI Response:', aiShopRes.data.data.response);
        
        const listRes2 = await axios.get(`${API_URL}/shopping`);
        const foundBanana = listRes2.data.data.find(i => i.item.toLowerCase().includes('plátanos'));
        console.log('✅ AI Added Item:', foundBanana ? 'PASS' : 'FAIL');

        // 3. Test AI Tool: Create Event
        console.log('\n📅 Testing AI Event Tool...');
        const aiEventRes = await axios.post(`${API_URL}/ai/chat`, { message: 'Crear evento Fiesta Sorpresa el 2025-12-25' });
        console.log('AI Response:', aiEventRes.data.data.response);

        // Verify in DB directly or API
        const eventsRes = await axios.get(`${API_URL}/events`);
        const foundEvent = eventsRes.data.data.find(e => e.name === 'Fiesta Sorpresa');
        console.log('✅ AI Created Event:', foundEvent ? 'PASS' : 'FAIL');

        console.log('\n🎉 Verification Complete!');

    } catch (error) {
        console.error('❌ Verification Failed:', error.response ? error.response.data : error.message);
    }
}

verifyFeatures();
