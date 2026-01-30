// backend/routes/assistant.js
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const config = require('../config/config');

// Obtener contexto general
router.get('/context', async (req, res) => {
    try {
        // Obtener datos en paralelo
        const [eventsResult, membersResult] = await Promise.all([
            pool.query(
                `SELECT e.*, GROUP_CONCAT(m.name) as participants 
                 FROM events e 
                 LEFT JOIN event_members em ON e.id = em.event_id 
                 LEFT JOIN members m ON em.member_id = m.id 
                 WHERE date(e.event_date) >= date('now') 
                 GROUP BY e.id 
                 ORDER BY e.event_date ASC`
            ),
            pool.query('SELECT id, name, email, phone, birth_date FROM members')
        ]);

        res.json({
            success: true,
            data: {
                events: eventsResult[0] || [],
                members: membersResult[0] || []
            }
        });
    } catch (error) {
        console.error('Error getting context:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error al obtener el contexto'
        });
    }
});

// Procesar consulta
router.post('/query', async (req, res) => {
    try {
        const { query, type = 'general', memberId } = req.body;

        if (!query) {
            return res.status(400).json({
                success: false,
                error: 'La consulta es requerida'
            });
        }

        let response;
        switch (type) {
            case 'calendar':
                response = await processCalendarQuery(query, memberId);
                break;
            case 'members':
                response = await processMemberQuery(query, memberId);
                break;
            case 'documents':
                response = await processDocumentQuery(query, memberId);
                break;
            default:
                response = await processGeneralQuery(query);
        }

        res.json({
            success: true,
            data: response
        });
    } catch (error) {
        console.error('Error processing query:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error al procesar la consulta' 
        });
    }
});

async function processCalendarQuery(query, memberId) {
    let sql = `SELECT e.*, GROUP_CONCAT(m.name) as participants
         FROM events e
         LEFT JOIN event_members em ON e.id = em.event_id
         LEFT JOIN members m ON em.member_id = m.id
         WHERE date(e.event_date) >= date('now')`;
    
    const params = [];
    if (memberId) {
        sql += ' AND em.member_id = ?';
        params.push(memberId);
    }
    
    sql += ' GROUP BY e.id ORDER BY e.event_date ASC';
    
    const [eventsResult] = await pool.query(sql, params);
    const events = eventsResult || [];

    return {
        type: 'calendar',
        events: events,
        summary: `Encontré ${events.length} eventos próximos.`
    };
}

async function processMemberQuery(query, memberId) {
    let sql = `SELECT m.*, 
         (SELECT COUNT(*) FROM event_members em 
          JOIN events e ON em.event_id = e.id 
          WHERE em.member_id = m.id AND date(e.event_date) >= date('now')) as upcoming_events
         FROM members m`;
    
    const params = [];
    if (memberId) {
        sql += ' WHERE m.id = ?';
        params.push(memberId);
    }
    
    const [membersResult] = await pool.query(sql, params);
    const members = membersResult || [];

    return {
        type: 'members',
        members: members,
        summary: `Información sobre ${members.length} miembro(s).`
    };
}

async function processDocumentQuery(query, memberId) {
    let sql = `SELECT md.*, m.name as member_name 
         FROM member_documents md
         JOIN members m ON md.member_id = m.id`;
    
    const params = [];
    if (memberId) {
        sql += ' WHERE md.member_id = ?';
        params.push(memberId);
    }
    
    sql += ' ORDER BY md.upload_date DESC';
    
    const [documentsResult] = await pool.query(sql, params);
    const documents = documentsResult || [];

    return {
        type: 'documents',
        documents: documents,
        summary: `Encontré ${documents.length} documentos.`
    };
}

async function processGeneralQuery(query) {
    // Recopilar información general
    const [eventCountResult] = await pool.query(
        'SELECT COUNT(*) as count FROM events WHERE date(event_date) >= date(\'now\')'
    );
    const [memberCountResult] = await pool.query('SELECT COUNT(*) as count FROM members');

    const eventCount = eventCountResult[0]?.count || 0;
    const memberCount = memberCountResult[0]?.count || 0;

    return {
        type: 'general',
        summary: `Tu familia tiene ${memberCount} miembros y ${eventCount} eventos próximos.`,
        query: query
    };
}

module.exports = router;