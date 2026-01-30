const express = require('express');
const multer = require('multer');
const router = express.Router();
const db = require('../config/database');

const upload = multer({ storage: multer.memoryStorage() });

// GET /api/members - Obtener todos los miembros
router.get('/', async (req, res) => {
    try {
        const members = await db.allAsync(`
            SELECT id, name, email, phone, birth_date, avatar_data, avatar_type
            FROM members
            ORDER BY name ASC
        `);

        const formatted = members.map(member => ({
            ...member,
            avatar: member.avatar_data ? {
                data: Buffer.from(member.avatar_data).toString('base64'),
                type: member.avatar_type
            } : null,
            avatar_data: undefined,
            avatar_type: undefined
        }));

        res.json({ success: true, data: formatted });
    } catch (error) {
        console.error('Error getting members:', error);
        res.status(500).json({ success: false, error: 'Error al obtener miembros' });
    }
});

// GET /api/members/:id - Obtener un miembro
router.get('/:id', async (req, res) => {
    try {
        const member = await db.getAsync(
            'SELECT * FROM members WHERE id = ?',
            [req.params.id]
        );

        if (!member) {
            return res.status(404).json({ success: false, error: 'Miembro no encontrado' });
        }

        // Obtener eventos del miembro
        const events = await db.allAsync(`
            SELECT e.id, e.name, e.event_date
            FROM events e
            INNER JOIN event_members em ON e.id = em.event_id
            WHERE em.member_id = ?
            ORDER BY e.event_date DESC
        `, [req.params.id]);

        const formatted = {
            ...member,
            avatar: member.avatar_data ? {
                data: Buffer.from(member.avatar_data).toString('base64'),
                type: member.avatar_type
            } : null,
            events: events,
            avatar_data: undefined,
            avatar_type: undefined
        };

        res.json({ success: true, data: formatted });
    } catch (error) {
        console.error('Error getting member:', error);
        res.status(500).json({ success: false, error: 'Error al obtener miembro' });
    }
});

// POST /api/members - Crear miembro
router.post('/', upload.single('avatar'), async (req, res) => {
    try {
        console.log('POST /api/members Content-Type:', req.headers['content-type']);
        console.log('POST /api/members Body keys:', Object.keys(req.body));
        console.log('POST /api/members File:', req.file ? 'Present' : 'None');

        const { name, email, phone, birth_date } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, error: 'El nombre es requerido' });
        }

        let avatarData = null;
        let avatarType = null;
        if (req.file) {
            console.log('Processing file upload...');
            avatarData = req.file.buffer;
            avatarType = req.file.mimetype;
        }

        const result = await db.runAsync(
            'INSERT INTO members (name, email, phone, birth_date, avatar_data, avatar_type) VALUES (?, ?, ?, ?, ?, ?)',
            [name, email || null, phone || null, birth_date || null, avatarData, avatarType]
        );

        const newMember = await db.getAsync('SELECT * FROM members WHERE id = ?', [result.lastID]);

        res.status(201).json({
            success: true,
            data: {
                ...newMember,
                avatar: newMember.avatar_data ? {
                    data: Buffer.from(newMember.avatar_data).toString('base64'),
                    type: newMember.avatar_type
                } : null
            }
        });
    } catch (error) {
        console.error('Error creating member:', error);
        res.status(500).json({ success: false, error: 'Error al crear miembro' });
    }
});

// PUT /api/members/:id - Actualizar miembro
router.put('/:id', upload.single('avatar'), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, birth_date } = req.body;

        const existing = await db.getAsync('SELECT id FROM members WHERE id = ?', [id]);
        if (!existing) {
            return res.status(404).json({ success: false, error: 'Miembro no encontrado' });
        }

        let updateSql = 'UPDATE members SET name = ?, email = ?, phone = ?, birth_date = ?';
        let params = [name, email || null, phone || null, birth_date || null];

        if (req.file) {
            updateSql += ', avatar_data = ?, avatar_type = ?';
            params.push(req.file.buffer, req.file.mimetype);
        }

        updateSql += ' WHERE id = ?';
        params.push(id);

        await db.runAsync(updateSql, params);

        res.json({ success: true, message: 'Miembro actualizado' });
    } catch (error) {
        console.error('Error updating member:', error);
        res.status(500).json({ success: false, error: 'Error al actualizar miembro' });
    }
});

// DELETE /api/members/:id - Eliminar miembro
router.delete('/:id', async (req, res) => {
    try {
        const result = await db.runAsync('DELETE FROM members WHERE id = ?', [req.params.id]);
        
        if (result.changes === 0) {
            return res.status(404).json({ success: false, error: 'Miembro no encontrado' });
        }

        res.json({ success: true, message: 'Miembro eliminado' });
    } catch (error) {
        console.error('Error deleting member:', error);
        res.status(500).json({ success: false, error: 'Error al eliminar miembro' });
    }
});

module.exports = router;
