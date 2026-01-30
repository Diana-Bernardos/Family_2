const express = require('express');
const router = express.Router();
const db = require('../config/database');
const axios = require('axios');
const config = require('../config/config');

// GET /api/ai/context - Obtener contexto para el chat
router.get('/context', async (req, res) => {
    try {
        const [events, members, reminders] = await Promise.all([
            db.allAsync(`
                SELECT e.*, GROUP_CONCAT(m.name) as participants
                FROM events e
                LEFT JOIN event_members em ON e.id = em.event_id
                LEFT JOIN members m ON em.member_id = m.id
                WHERE date(e.event_date) >= date('now')
                GROUP BY e.id
                ORDER BY e.event_date ASC
            `),
            db.allAsync('SELECT id, name, email FROM members'),
            db.allAsync(`SELECT * FROM shopping_items WHERE completed = 0`)
        ]);

        res.json({
            success: true,
            data: {
                events: events || [],
                members: members || [],
                shopping: reminders || []
            }
        });
    } catch (error) {
        console.error('Error getting context:', error);
        res.status(500).json({ success: false, error: 'Error al obtener contexto' });
    }
});

// POST /api/ai/chat - Enviar mensaje al asistente
router.post('/chat', async (req, res) => {
    try {
        console.log('AI Chat Request received:', req.body);
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ success: false, error: 'Mensaje requerido' });
        }

        // INTENT PARSING (Basic Tool Calling)
        const lowerMsg = message.toLowerCase();
        let actionResponse = null;

        // 1. Shopping List Intent
        // "Añadir leche a la lista", "Comprar pan", "Agregar manzanas"
        const shoppingMatch = lowerMsg.match(/(?:añadir|agregar|comprar|pon)\s+(.+?)(?:\s+(?:a|en)\s+(?:la\s+)?lista)?$/i);
        if (shoppingMatch && !lowerMsg.includes('evento') && !lowerMsg.includes('recordatorio')) {
            const item = shoppingMatch[1].replace(/^(un|una|unos|unas|el|la|los|las)\s+/, '').trim();
            if (item) {
                await db.runAsync('INSERT INTO shopping_items (item) VALUES (?)', [item]);
                actionResponse = `He añadido "${item}" a tu lista de la compra. 📝`;
            }
        }

        // 2. Reminder Intent
        // "Recuérdame llamar a mamá mañana", "Recordatorio ir al dentista el viernes"
        const reminderMatch = lowerMsg.match(/(?:recuerdame|recordatorio|recodatorio)\s+(.+?)\s+(?:el|para|en)\s+(.+)/i);
        if (reminderMatch && !actionResponse) {
             const reminderText = reminderMatch[1].trim();
             const dateStr = reminderMatch[2].trim();
             
             let date = parseDate(dateStr);
             const isoDate = date.toISOString().split('T')[0];

             await db.runAsync(
                'INSERT INTO events (name, event_date, event_type, description) VALUES (?, ?, ?, ?)',
                [reminderText, isoDate, 'reminder', 'Recordatorio creado por asistente']
            );
            actionResponse = `He creado un recordatorio: "${reminderText}" para el ${isoDate}. ⏰`;
        }

        // 3. Create Event Intent
        // "Crear evento Cena el viernes", "Nuevo evento Cita el 2024-12-31"
        const eventMatch = lowerMsg.match(/(?:crear|nuevo|agendar)\s+(?:evento\s+)?(.+?)\s+(?:el|para|en)\s+(.+)/i);
        if (eventMatch && !actionResponse) {
            const eventName = eventMatch[1].trim();
            const dateStr = eventMatch[2].trim();
            
            let date = parseDate(dateStr);
            const isoDate = date.toISOString().split('T')[0];

            await db.runAsync(
                'INSERT INTO events (name, event_date, event_type, description) VALUES (?, ?, ?, ?)',
                [eventName, isoDate, 'generic', 'Creado por el asistente']
            );
            actionResponse = `He agendado el evento "${eventName}" para el ${isoDate}. 📅`;
        }

        // Helper para fechas
        function parseDate(dateStr) {
            let date = new Date(dateStr);
             if (isNaN(date.getTime())) {
                 if (dateStr.includes('mañana')) {
                     date = new Date();
                     date.setDate(date.getDate() + 1);
                 } else if (dateStr.includes('hoy')) {
                     date = new Date();
                 } else {
                     date = new Date(); // Fallback
                 }
            }
            return date;
        }

        // Si se realizó una acción, retornar inmediatamente
        if (actionResponse) {
             await db.runAsync(
                'INSERT INTO chat_interactions (message, response) VALUES (?, ?)',
                [message, actionResponse]
            );
            return res.json({
                success: true,
                data: {
                    response: actionResponse,
                    context: { events: [], members: [] }
                }
            });
        }

        // Obtener contexto enriquecido para consulta
        const [events, members, shopping] = await Promise.all([
            db.allAsync(`
                SELECT e.name, e.event_date, e.event_type, GROUP_CONCAT(m.name) as participants
                FROM events e
                LEFT JOIN event_members em ON e.id = em.event_id
                LEFT JOIN members m ON em.member_id = m.id
                WHERE date(e.event_date) >= date('now')
                GROUP BY e.id
                ORDER BY e.event_date ASC
                LIMIT 10
            `),
            db.allAsync('SELECT name, email FROM members LIMIT 10'),
            db.allAsync('SELECT item FROM shopping_items WHERE completed = 0 LIMIT 20')
        ]);

        // Crear prompt mejorado
        const prompt = `Eres un asistente familiar inteligente y proactivo (Ollama Phi3). Tu objetivo es ayudar a la familia a organizarse.

CONTEXTO ACTUAL:
📅 Eventos Próximos:
${events.map(e => `- [${e.event_type || 'Evento'}] ${e.name} el ${new Date(e.event_date).toLocaleDateString('es-ES')} (${e.participants || 'Todos'})`).join('\n') || 'No hay eventos próximos.'}

🛒 Lista de la Compra (Pendientes):
${shopping.map(s => `- ${s.item}`).join('\n') || 'La lista está vacía.'}

👥 Miembros:
${members.map(m => `- ${m.name}`).join('\n') || 'No hay miembros registrados.'}

INSTRUCCIONES:
1. Responde de forma concisa y natural en español.
2. Si te piden añadir algo a la lista o crear un evento, confirma qué debería decir el usuario exactamente si no puedes hacerlo tú mismo (aunque yo intento interceptar esos comandos antes).
3. Usa la información de contexto para dar respuestas precisas (ej. "Sí, tienes Cena el viernes").
4. Si te preguntan qué hay en la lista, enumera los items.

USUARIO DICE: "${message}"`;

        // Llamar a Ollama (si está disponible)
        let response = 'Lo siento, el servicio de IA no está disponible en este momento.';
        
        try {
            const aiResponse = await axios.post(`${config.OLLAMA_API_URL}/generate`, {
                model: config.MODEL_NAME,
                prompt: prompt,
                stream: false,
                options: {
                    temperature: 0.7,
                    top_k: 40,
                    top_p: 0.9,
                    num_predict: 200 // Limitar longitud
                }
            });
            response = aiResponse.data.response || response;
        } catch (aiError) {
            console.log('Ollama no disponible, usando respuesta por defecto');
            
            // Respuestas de fallback más inteligentes
            if (lowerMsg.includes('hola') || lowerMsg.includes('buenos')) {
                response = "¡Hola! Soy tu asistente familiar. Puedo ayudarte a gestionar eventos, recordatorios y la lista de la compra. ¿Qué necesitas?";
            } else if (lowerMsg.includes('evento') || lowerMsg.includes('agenda')) {
                 const nextEvent = events[0];
                 if (nextEvent) {
                     response = `El próximo evento es "${nextEvent.name}" el ${new Date(nextEvent.event_date).toLocaleDateString()}.`;
                 } else {
                     response = "No veo eventos próximos en el calendario.";
                 }
            } else if (lowerMsg.includes('lista') || lowerMsg.includes('compra')) {
                if (shopping.length > 0) {
                    response = `Tienes ${shopping.length} cosas en la lista, incluyendo: ${shopping.slice(0, 3).map(i => i.item).join(', ')}.`;
                } else {
                    response = "Tu lista de la compra está vacía.";
                }
            }
        }

        // Guardar interacción
        await db.runAsync(
            'INSERT INTO chat_interactions (message, response) VALUES (?, ?)',
            [message, response]
        );

        res.json({
            success: true,
            data: {
                response: response,
                context: { events, members }
            }
        });
    } catch (error) {
        console.error('Error in chat:', error);
        res.status(500).json({ success: false, error: 'Error al procesar mensaje' });
    }
});

// GET /api/ai/history - Obtener historial de chat
router.get('/history', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const history = await db.allAsync(
            'SELECT message, response, created_at FROM chat_interactions ORDER BY created_at DESC LIMIT ?',
            [limit]
        );

        res.json({
            success: true,
            data: history.reverse()
        });
    } catch (error) {
        console.error('Error getting history:', error);
        res.status(500).json({ success: false, error: 'Error al obtener historial' });
    }
});

module.exports = router;
