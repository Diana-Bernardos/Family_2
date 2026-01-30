import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import './Detail.css';

const EventDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadEvent();
    }, [id]);

    const loadEvent = async () => {
        try {
            setLoading(true);
            const response = await api.getEvent(id);
            setEvent(response.data);
            setError(null);
        } catch (err) {
            setError('Error al cargar evento');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('¿Estás seguro de eliminar este evento?')) return;

        try {
            await api.deleteEvent(id);
            navigate('/');
        } catch (err) {
            alert('Error al eliminar evento');
        }
    };

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="error">
                {error || 'Evento no encontrado'}
                <button onClick={() => navigate('/')} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                    Volver
                </button>
            </div>
        );
    }

    return (
        <div className="detail-page">
            <div className="page-header">
                <button onClick={() => navigate('/')} className="btn btn-secondary">
                    ← Volver
                </button>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => navigate(`/events/${id}/edit`)} className="btn btn-primary">
                        Editar
                    </button>
                    <button onClick={handleDelete} className="btn btn-danger">
                        Eliminar
                    </button>
                </div>
            </div>

            <div className="detail-content">
                <div className="detail-main card">
                    <div className="detail-header">
                        <div
                            className="event-color-badge"
                            style={{ backgroundColor: event.color || '#6366f1' }}
                        />
                        <div style={{ flex: 1 }}>
                            <h1>{event.name}</h1>
                            <p className="detail-meta">
                                📅 {new Date(event.event_date).toLocaleDateString('es-ES', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                            {event.event_type && (
                                <p className="detail-meta">🏷️ {event.event_type}</p>
                            )}
                        </div>
                    </div>

                    {event.image && (
                        <div className="detail-image">
                            <img
                                src={`data:${event.image.type};base64,${event.image.data}`}
                                alt={event.name}
                                style={{ width: '100%', borderRadius: '0.5rem' }}
                            />
                        </div>
                    )}

                    {event.description && (
                        <div className="detail-section">
                            <h2>Descripción</h2>
                            <p>{event.description}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventDetail;
