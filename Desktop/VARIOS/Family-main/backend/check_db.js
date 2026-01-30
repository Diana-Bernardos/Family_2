const db = require('./config/database');

async function testConnection() {
    try {
        console.log('Testing connection...');
        const [rows] = await db.query('SELECT 1');
        console.log('Connection successful:', rows);

        console.log('Checking tables...');
        const [tables] = await db.query('SHOW TABLES');
        console.log('Tables:', tables);

        process.exit(0);
    } catch (error) {
        console.error('Connection failed:', error);
        process.exit(1);
    }
}

testConnection();
