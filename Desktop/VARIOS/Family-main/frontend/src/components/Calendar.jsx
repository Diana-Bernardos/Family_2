import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { api } from '../services/api';
import './Calendar.css';

const Calendar = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            setLoading(true);
            const response = await api.getEvents();
            const formatted = response.data.map(event => ({
                id: event.id,
                title: event.name,
                date: event.event_date.split('T')[0],
                backgroundColor: event.color || '#6366f1',
                borderColor: event.color || '#6366f1',
                extendedProps: {
                    type: event.event_type,
                    icon: event.icon,
                }
            }));
            setEvents(formatted);
            setError(null);
        } catch (err) {
            setError('Error al cargar eventos');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleEventClick = (info) => {
        navigate(`/events/${info.event.id}`);
    };

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error">
                {error}
                <button onClick={loadEvents} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <div className="calendar-page">
            <div className="page-header">
                <h1>Calendario de Eventos</h1>
                <button onClick={() => navigate('/events/new')} className="btn btn-primary">
                    ➕ Nuevo Evento
                </button>
            </div>

            <div className="calendar-container card">
                <FullCalendar
                    plugins={[dayGridPlugin]}
                    initialView="dayGridMonth"
                    events={events}
                    eventClick={handleEventClick}
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth'
                    }}
                    locale="es"
                    height="auto"
                />
            </div>
        </div>
    );
};

export default Calendar;
