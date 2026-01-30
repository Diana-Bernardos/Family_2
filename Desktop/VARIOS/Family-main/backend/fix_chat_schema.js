const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'data/family.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    console.log('Dropping chat_interactions table...');
    db.run('DROP TABLE IF EXISTS chat_interactions');

    console.log('Recreating chat_interactions table...');
    db.run(`
        CREATE TABLE chat_interactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            message TEXT NOT NULL,
            response TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error recreating table:', err);
        } else {
            console.log('✅ Table recreated successfully');
        }
    });
});

db.close();
