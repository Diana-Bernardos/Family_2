const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'data/family.db');
const db = new sqlite3.Database(dbPath);

console.log('Migrating Shopping List Schema...');

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS shopping_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            item TEXT NOT NULL,
            completed INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating shopping_items table:', err);
        } else {
            console.log('✅ Table shopping_items created or already exists.');
        }
    });
});

db.close();
