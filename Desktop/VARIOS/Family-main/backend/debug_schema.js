const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'data/family.db');
const db = new sqlite3.Database(dbPath);

db.all("PRAGMA table_info(events)", (err, rows) => {
    if (err) {
        console.error("Error getting schema:", err);
    } else {
        console.log("Events Table Schema:", rows);
    }
    db.close();
});
