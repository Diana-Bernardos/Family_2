const jwt = require('jsonwebtoken');
const config = require('../config/config');

const authMiddleware = (req, res, next) => {
    try {
        // Obtener el token del header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'Acceso denegado' });
        }

        // Verificar token usando JWT_SECRET de env o config
        const jwtSecret = process.env.JWT_SECRET || config.JWT_SECRET;
        const verified = jwt.verify(token, jwtSecret);
        req.user = verified;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Token inválido' });
    }
};

const validateEvent = (req, res, next) => {
    const { name, event_date } = req.body;
    if (!name || !event_date) {
        return res.status(400).json({ error: 'Nombre y fecha son requeridos' });
    }
    next();
};

const validateMember = (req, res, next) => {
    const { name, email } = req.body;
    if (!name || !email) {
        return res.status(400).json({ error: 'Nombre y email son requeridos' });
    }
    next();
};

module.exports = { authMiddleware, validateEvent, validateMember };