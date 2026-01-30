const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const config = require('./config/config');
const db = require('./config/database');

const app = express();

// CORS
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
}));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Crear directorios necesarios
const dirs = ['uploads', 'uploads/avatars', 'uploads/documents'];
dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/events', require('./routes/events'));
app.use('/api/members', require('./routes/members'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/shopping', require('./routes/shopping'));

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    try {
        const fs = require('fs');
        const path = require('path');
        const logError = `[${new Date().toISOString()}] Error: ${err.message}\nStack: ${err.stack}\nHeaders: ${JSON.stringify(req.headers)}\n\n`;
        fs.appendFileSync(path.join(__dirname, 'server_final_errors.log'), logError);
    } catch (e) {
        console.error('Error writing log:', e);
    }
    
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Error interno del servidor'
    });
});

// Start server
// Start server only if not running in lambda/serverless environment
if (require.main === module) {
    const PORT = process.env.PORT || config.PORT || 3001;
    app.listen(PORT, () => {
        console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
        console.log(`📊 Base de datos: ${process.env.DATABASE_URL ? 'PostgreSQL' : 'SQLite (family.db)'}`);
    });
}

module.exports = app;
