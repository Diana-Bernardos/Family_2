const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'data/family.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    console.log("Checking and fixing schema...");

    // Check for description column
    db.all("PRAGMA table_info(events)", (err, rows) => {
        if (err) {
            console.error("Error checking schema:", err);
            return;
        }

        const hasDescription = rows.some(row => row.name === 'description');
        if (!hasDescription) {
            console.log("Adding missing column: description");
            db.run("ALTER TABLE events ADD COLUMN description TEXT", (err) => {
                if (err) console.error("Error adding description:", err);
                else console.log("Added description column.");
            });
        } else {
            console.log("Column 'description' already exists.");
        }

        const hasCreatedAt = rows.some(row => row.name === 'created_at');
        if (!hasCreatedAt) {
            console.log("Adding missing column: created_at");
            db.run("ALTER TABLE events ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP", (err) => {
                if (err) console.error("Error adding created_at:", err);
                else console.log("Added created_at column.");
            });
        } else {
            console.log("Column 'created_at' already exists.");
        }
    });

    // Check members table
    db.all("PRAGMA table_info(members)", (err, rows) => {
        if (err) {
            console.error("Error checking members schema:", err);
            return;
        }

        const columns = rows.map(r => r.name);
        if (!columns.includes('avatar_data')) {
            console.log("Adding missing column: avatar_data to members");
            db.run("ALTER TABLE members ADD COLUMN avatar_data BLOB");
        }
        if (!columns.includes('avatar_type')) {
            console.log("Adding missing column: avatar_type to members");
            db.run("ALTER TABLE members ADD COLUMN avatar_type TEXT");
        }
        if (!columns.includes('created_at')) {
            console.log("Adding missing column: created_at to members");
            db.run("ALTER TABLE members ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
        }
        if (!columns.includes('birth_date')) {
            console.log("Adding missing column: birth_date to members");
            db.run("ALTER TABLE members ADD COLUMN birth_date TEXT");
        }
        if (!columns.includes('phone')) {
            console.log("Adding missing column: phone to members");
            db.run("ALTER TABLE members ADD COLUMN phone TEXT");
        }
        if (!columns.includes('email')) {
            console.log("Adding missing column: email to members");
            db.run("ALTER TABLE members ADD COLUMN email TEXT");
        }
    });

    // Check chat_interactions table
    db.all("PRAGMA table_info(chat_interactions)", (err, rows) => {
        if (err) {
            console.error("Error checking chat_interactions schema:", err);
            return;
        }
        const columns = rows.map(r => r.name);
         if (!columns.includes('response')) { // Example check
            // unlikely to be missing but safe to check
         }
    });
});
