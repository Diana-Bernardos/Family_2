const db = require('./config/database');

async function testCreateMember() {
    try {
        console.log('Testing create member...');
        const name = "Test Member";
        const email = "test@example.com";
        const phone = "1234567890";
        const birth_date = "2000-01-01";
        const avatarData = null;
        const avatarType = null;

        const result = await db.runAsync(
            'INSERT INTO members (name, email, phone, birth_date, avatar_data, avatar_type) VALUES (?, ?, ?, ?, ?, ?)',
            [name, email, phone, birth_date, avatarData, avatarType]
        );
        
        console.log('Insert result:', result);

        const newMember = await db.getAsync('SELECT * FROM members WHERE id = ?', [result.lastID]);
        console.log('New Member:', newMember);

    } catch (error) {
        console.error('❌ Failed to create member:', error);
    }
}

testCreateMember();
