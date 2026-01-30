import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import './ChatBot.css';

const ChatBot = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        loadHistory();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadHistory = async () => {
        try {
            const response = await api.getChatHistory(20);
            const history = response.data.map(item => ({
                type: 'assistant',
                content: item.response,
                timestamp: item.created_at
            }));
            setMessages(history);
        } catch (err) {
            console.error('Error loading history:', err);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
        setLoading(true);

        try {
            const response = await api.sendChatMessage(userMessage);
            setMessages(prev => [...prev, {
                type: 'assistant',
                content: response.data.response
            }]);
        } catch (err) {
            setMessages(prev => [...prev, {
                type: 'error',
                content: 'Error al procesar el mensaje. Por favor, intenta de nuevo.'
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="chatbot-page">
            <div className="page-header">
                <h1>Asistente Familiar</h1>
            </div>

            <div className="chatbot-container card">
                <div className="chat-messages">
                    {messages.length === 0 && (
                        <div className="chat-welcome">
                            <p>👋 ¡Hola! Soy tu asistente familiar.</p>
                            <p>Puedo ayudarte con:</p>
                            <ul>
                                <li>Información sobre eventos próximos</li>
                                <li>Datos de los miembros de la familia</li>
                                <li>Organización del calendario</li>
                            </ul>
                            <p>¿En qué puedo ayudarte?</p>
                        </div>
                    )}

                    {messages.map((msg, idx) => (
                        <div key={idx} className={`chat-message ${msg.type}`}>
                            <div className="message-content">
                                {msg.content}
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="chat-message assistant">
                            <div className="message-content">
                                <div className="typing-indicator">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSend} className="chat-input-form">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Escribe tu mensaje..."
                        className="chat-input"
                        disabled={loading}
                    />
                    <button type="submit" className="btn btn-primary" disabled={loading || !input.trim()}>
                        Enviar
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatBot;
