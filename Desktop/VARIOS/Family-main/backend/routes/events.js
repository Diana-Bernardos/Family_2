const express = require('express');
const multer = require('multer');
const router = express.Router();
const db = require('../config/database');

const upload = multer({ storage: multer.memoryStorage() });

// GET /api/events - Obtener todos los eventos
router.get('/', async (req, res) => {
    try {
        const events = await db.allAsync(`
            SELECT id, name, event_date, event_type, icon, color, image_data, image_type, description
            FROM events
            ORDER BY event_date ASC
        `);

        const formattedEvents = events.map(event => ({
            ...event,
            image: event.image_data ? {
                data: Buffer.from(event.image_data).toString('base64'),
                type: event.image_type
            } : null,
            image_data: undefined,
            image_type: undefined
        }));

        res.json({ success: true, data: formattedEvents });
    } catch (error) {
        console.error('Error getting events:', error);
        res.status(500).json({ success: false, error: 'Error al obtener eventos' });
    }
});

// GET /api/events/:id - Obtener un evento
router.get('/:id', async (req, res) => {
    try {
        const event = await db.getAsync(
            'SELECT * FROM events WHERE id = ?',
            [req.params.id]
        );

        if (!event) {
            return res.status(404).json({ success: false, error: 'Evento no encontrado' });
        }

        const formatted = {
            ...event,
            image: event.image_data ? {
                data: Buffer.from(event.image_data).toString('base64'),
                type: event.image_type
            } : null,
            image_data: undefined,
            image_type: undefined
        };

        res.json({ success: true, data: formatted });
    } catch (error) {
        console.error('Error getting event:', error);
        res.status(500).json({ success: false, error: 'Error al obtener evento' });
    }
});

// POST /api/events - Crear evento
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const { name, event_date, event_type, icon, color, description, members } = req.body;

        if (!name || !event_date) {
            return res.status(400).json({ success: false, error: 'Nombre y fecha son requeridos' });
        }

        let imageData = null;
        let imageType = null;
        if (req.file) {
            imageData = req.file.buffer;
            imageType = req.file.mimetype;
        }

        const result = await db.runAsync(
            `INSERT INTO events (name, event_date, event_type, icon, color, image_data, image_type, description)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, event_date, event_type || null, icon || null, color || null, imageData, imageType, description || null]
        );

        const eventId = result.lastID;

        // Asociar miembros si se proporcionan
        if (members) {
            const memberIds = Array.isArray(members) ? members : JSON.parse(members);
            for (const memberId of memberIds) {
                await db.runAsync(
                    'INSERT INTO event_members (event_id, member_id) VALUES (?, ?)',
                    [eventId, memberId]
                );
            }
        }

        const newEvent = await db.getAsync('SELECT * FROM events WHERE id = ?', [eventId]);

        res.status(201).json({
            success: true,
            data: {
                ...newEvent,
                image: newEvent.image_data ? {
                    data: Buffer.from(newEvent.image_data).toString('base64'),
                    type: newEvent.image_type
                } : null
            }
        });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ success: false, error: 'Error al crear evento' });
    }
});

// PUT /api/events/:id - Actualizar evento
router.put('/:id', upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, event_date, event_type, icon, color, description, members } = req.body;

        const existing = await db.getAsync('SELECT id FROM events WHERE id = ?', [id]);
        if (!existing) {
            return res.status(404).json({ success: false, error: 'Evento no encontrado' });
        }

        let updateSql = 'UPDATE events SET name = ?, event_date = ?, event_type = ?, icon = ?, color = ?, description = ?';
        let params = [name, event_date, event_type || null, icon || null, color || null, description || null];

        if (req.file) {
            updateSql += ', image_data = ?, image_type = ?';
            params.push(req.file.buffer, req.file.mimetype);
        }

        updateSql += ' WHERE id = ?';
        params.push(id);

        await db.runAsync(updateSql, params);

        // Actualizar miembros si se proporcionan
        if (members !== undefined) {
            await db.runAsync('DELETE FROM event_members WHERE event_id = ?', [id]);
            const memberIds = Array.isArray(members) ? members : JSON.parse(members || '[]');
            for (const memberId of memberIds) {
                await db.runAsync(
                    'INSERT INTO event_members (event_id, member_id) VALUES (?, ?)',
                    [id, memberId]
                );
            }
        }

        res.json({ success: true, message: 'Evento actualizado' });
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ success: false, error: 'Error al actualizar evento' });
    }
});

// DELETE /api/events/:id - Eliminar evento
router.delete('/:id', async (req, res) => {
    try {
        const result = await db.runAsync('DELETE FROM events WHERE id = ?', [req.params.id]);
        
        if (result.changes === 0) {
            return res.status(404).json({ success: false, error: 'Evento no encontrado' });
        }

        res.json({ success: true, message: 'Evento eliminado' });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ success: false, error: 'Error al eliminar evento' });
    }
});

module.exports = router;
