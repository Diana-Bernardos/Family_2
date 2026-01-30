const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET /api/shopping - Obtener lista
router.get('/', async (req, res) => {
    try {
        const items = await db.allAsync('SELECT * FROM shopping_items ORDER BY completed ASC, created_at DESC');
        res.json({ success: true, data: items });
    } catch (error) {
        console.error('Error getting shopping list:', error);
        res.status(500).json({ success: false, error: 'Error al obtener lista de compras' });
    }
});

// POST /api/shopping - Agregar item
router.post('/', async (req, res) => {
    try {
        const { item } = req.body;
        if (!item) {
            return res.status(400).json({ success: false, error: 'Item es requerido' });
        }

        const result = await db.runAsync(
            'INSERT INTO shopping_items (item) VALUES (?)',
            [item]
        );

        const newItem = await db.getAsync('SELECT * FROM shopping_items WHERE id = ?', [result.lastID]);
        res.status(201).json({ success: true, data: newItem });
    } catch (error) {
        console.error('Error adding item:', error);
        res.status(500).json({ success: false, error: 'Error al agregar item' });
    }
});

// PUT /api/shopping/:id - Actualizar estado
router.put('/:id', async (req, res) => {
    try {
        const { completed } = req.body;
        await db.runAsync(
            'UPDATE shopping_items SET completed = ? WHERE id = ?',
            [completed ? 1 : 0, req.params.id]
        );
        res.json({ success: true, message: 'Item actualizado' });
    } catch (error) {
        console.error('Error updating item:', error);
        res.status(500).json({ success: false, error: 'Error al actualizar item' });
    }
});

// DELETE /api/shopping/:id - Eliminar item
router.delete('/:id', async (req, res) => {
    try {
        await db.runAsync('DELETE FROM shopping_items WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Item eliminado' });
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).json({ success: false, error: 'Error al eliminar item' });
    }
});

module.exports = router;
