const path = require('path');
const fs = require('fs');
require('dotenv').config();

let db;
let pool;
let isPostgres = false;

if (process.env.DATABASE_URL) {
    // PostgreSQL Configuration
    const { Pool } = require('pg');
    isPostgres = true;
    
    // Configuración para producción (Vercel/Render/etc)
    const connectionString = process.env.DATABASE_URL;
    
    db = new Pool({
        connectionString,
        ssl: {
            rejectUnauthorized: false // Necesario para muchas conexiones cloud SSL
        }
    });

    console.log('✅ Configurado para usar PostgreSQL');

    // Wrappers para compatibilidad con la API existente
    pool = {
        runAsync: async function(sql, params = []) {
            // Convertir sintaxis de parámetros: SQLite usa ? -> Postgres usa $1, $2, etc.
            let paramCount = 1;
            const pgSql = sql.replace(/\?/g, () => `$${paramCount++}`);
            
            // Convertir 'lastID' y 'changes' de SQLite a retorno de Postgres
            // Postgres retorna 'rowCount' para cambios. 
            // Para lastID, necesitamos RETURNING id en los INSERTs (lo manejaremos abajo o asumiremos diseño)
            
            try {
                // Modificación automática para obtener ID en inserts si no está explícito
                let finalSql = pgSql;
                if (pgSql.trim().toUpperCase().startsWith('INSERT') && !pgSql.toUpperCase().includes('RETURNING')) {
                    finalSql += ' RETURNING id';
                }

                console.log('SQL RUN (PG):', finalSql, params);
                const result = await db.query(finalSql, params);
                
                return {
                    lastID: result.rows[0]?.id || 0, // Solo si hubo RETURNING id
                    changes: result.rowCount
                };
            } catch (err) {
                console.error('Error in runAsync (PG):', err);
                throw err;
            }
        },

        getAsync: async function(sql, params = []) {
            let paramCount = 1;
            const pgSql = sql.replace(/\?/g, () => `$${paramCount++}`);
            
            try {
                const result = await db.query(pgSql, params);
                return result.rows[0];
            } catch (err) {
                console.error('Error in getAsync (PG):', err);
                throw err;
            }
        },

        allAsync: async function(sql, params = []) {
            let paramCount = 1;
            const pgSql = sql.replace(/\?/g, () => `$${paramCount++}`);
            
            try {
                const result = await db.query(pgSql, params);
                return result.rows;
            } catch (err) {
                console.error('Error in allAsync (PG):', err);
                throw err;
            }
        }
    };

} else {
    // SQLite Configuration (Original)
    const sqlite3 = require('sqlite3').verbose();
    const dbPath = path.resolve(__dirname, '../data/family.db');
    const dataDir = path.dirname(dbPath);

    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('Error connecting to database:', err);
        } else {
            console.log('✅ Conectado a SQLite:', dbPath);
        }
    });

    pool = {
        runAsync: function(sql, params = []) {
            console.log('SQL RUN (SQLite):', sql, params);
            return new Promise((resolve, reject) => {
                db.run(sql, params, function(err) {
                    if (err) {
                        console.error('Error in runAsync:', err);
                        reject(err);
                    } else {
                        resolve({ lastID: this.lastID, changes: this.changes });
                    }
                });
            });
        },

        getAsync: function(sql, params = []) {
            return new Promise((resolve, reject) => {
                db.get(sql, params, (err, row) => {
                    if (err) {
                        console.error('Error in getAsync:', err);
                        reject(err);
                    } else {
                        resolve(row);
                    }
                });
            });
        },

        allAsync: function(sql, params = []) {
            return new Promise((resolve, reject) => {
                db.all(sql, params, (err, rows) => {
                    if (err) {
                        console.error('Error in allAsync:', err);
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });
            });
        }
    };
}

// Inicializar base de datos (tablas)
async function initDatabase() {
    try {
        console.log('Inicializando tablas...');
        
        // Ajustes de sintaxis SQL según motor
        const AUTO_INCREMENT = isPostgres ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT';
        const TEXT_TYPE = 'TEXT';
        const BLOB_TYPE = isPostgres ? 'BYTEA' : 'BLOB';
        const TIMESTAMP_DEFAULT = 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP';

        // Tabla de miembros
        await pool.runAsync(`
            CREATE TABLE IF NOT EXISTS members (
                id ${AUTO_INCREMENT},
                name ${TEXT_TYPE} NOT NULL,
                email ${TEXT_TYPE},
                phone ${TEXT_TYPE},
                birth_date ${TEXT_TYPE}, 
                avatar_data ${BLOB_TYPE},
                avatar_type ${TEXT_TYPE},
                created_at ${TIMESTAMP_DEFAULT}
            )
        `);

        // Tabla de eventos
        await pool.runAsync(`
            CREATE TABLE IF NOT EXISTS events (
                id ${AUTO_INCREMENT},
                name ${TEXT_TYPE} NOT NULL,
                event_date ${TEXT_TYPE} NOT NULL,
                event_type ${TEXT_TYPE},
                icon ${TEXT_TYPE},
                color ${TEXT_TYPE},
                image_data ${BLOB_TYPE},
                image_type ${TEXT_TYPE},
                description ${TEXT_TYPE},
                created_at ${TIMESTAMP_DEFAULT}
            )
        `);

        // Tabla de relación eventos-miembros
        await pool.runAsync(`
            CREATE TABLE IF NOT EXISTS event_members (
                event_id INTEGER NOT NULL,
                member_id INTEGER NOT NULL,
                PRIMARY KEY (event_id, member_id),
                FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
                FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
            )
        `);

        // Tabla de documentos
        await pool.runAsync(`
            CREATE TABLE IF NOT EXISTS documents (
                id ${AUTO_INCREMENT},
                member_id INTEGER NOT NULL,
                name ${TEXT_TYPE} NOT NULL,
                type ${TEXT_TYPE},
                data ${BLOB_TYPE},
                size INTEGER,
                created_at ${TIMESTAMP_DEFAULT},
                FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
            )
        `);

        // Tabla de interacciones de chat
        await pool.runAsync(`
            CREATE TABLE IF NOT EXISTS chat_interactions (
                id ${AUTO_INCREMENT},
                message ${TEXT_TYPE} NOT NULL,
                response ${TEXT_TYPE} NOT NULL,
                created_at ${TIMESTAMP_DEFAULT}
            )
        `);

        // Tabla de items de compra (shopping_items) - Agregada para funcionalidad existente
        await pool.runAsync(`
            CREATE TABLE IF NOT EXISTS shopping_items (
                id ${AUTO_INCREMENT},
                item ${TEXT_TYPE} NOT NULL,
                completed INTEGER DEFAULT 0,
                created_at ${TIMESTAMP_DEFAULT}
            )
        `);

        console.log('✅ Base de datos inicializada');

    } catch (error) {
        console.error('❌ Error inicializando base de datos:', error);
    }
}

// Iniciar
initDatabase();

module.exports = pool;
