const express = require('express');
const multer = require('multer');
const router = express.Router();
const db = require('../config/database');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 15 * 1024 * 1024 } // 15MB
});

// GET /api/documents/:memberId - Obtener documentos de un miembro
router.get('/:memberId', async (req, res) => {
    try {
        const documents = await db.allAsync(
            'SELECT id, name, type, size, created_at FROM documents WHERE member_id = ? ORDER BY created_at DESC',
            [req.params.memberId]
        );

        res.json({ success: true, data: documents });
    } catch (error) {
        console.error('Error getting documents:', error);
        res.status(500).json({ success: false, error: 'Error al obtener documentos' });
    }
});

// POST /api/documents/:memberId - Subir documento
router.post('/:memberId', upload.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No se proporcionó archivo' });
        }

        const result = await db.runAsync(
            'INSERT INTO documents (member_id, name, type, data, size) VALUES (?, ?, ?, ?, ?)',
            [req.params.memberId, req.file.originalname, req.file.mimetype, req.file.buffer, req.file.size]
        );

        res.status(201).json({
            success: true,
            data: {
                id: result.lastID,
                name: req.file.originalname,
                type: req.file.mimetype,
                size: req.file.size
            }
        });
    } catch (error) {
        console.error('Error uploading document:', error);
        res.status(500).json({ success: false, error: 'Error al subir documento' });
    }
});

// GET /api/documents/download/:id - Descargar documento
router.get('/download/:id', async (req, res) => {
    try {
        const doc = await db.getAsync(
            'SELECT name, type, data FROM documents WHERE id = ?',
            [req.params.id]
        );

        if (!doc) {
            return res.status(404).json({ success: false, error: 'Documento no encontrado' });
        }

        res.setHeader('Content-Type', doc.type);
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(doc.name)}"`);
        res.send(doc.data);
    } catch (error) {
        console.error('Error downloading document:', error);
        res.status(500).json({ success: false, error: 'Error al descargar documento' });
    }
});

// DELETE /api/documents/:id - Eliminar documento
router.delete('/:id', async (req, res) => {
    try {
        const result = await db.runAsync('DELETE FROM documents WHERE id = ?', [req.params.id]);
        
        if (result.changes === 0) {
            return res.status(404).json({ success: false, error: 'Documento no encontrado' });
        }

        res.json({ success: true, message: 'Documento eliminado' });
    } catch (error) {
        console.error('Error deleting document:', error);
        res.status(500).json({ success: false, error: 'Error al eliminar documento' });
    }
});

module.exports = router;
