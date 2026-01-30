import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import './Form.css';

const EventForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        name: '',
        event_date: '',
        event_type: '',
        icon: '',
        color: '#6366f1',
        description: '',
        image: null,
        members: []
    });
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadMembers();
        if (isEdit) {
            loadEvent();
        }
    }, [id]);

    const loadMembers = async () => {
        try {
            const response = await api.getMembers();
            setMembers(response.data);
        } catch (err) {
            console.error('Error loading members:', err);
        }
    };

    const loadEvent = async () => {
        try {
            const response = await api.getEvent(id);
            const event = response.data;
            setFormData({
                name: event.name || '',
                event_date: event.event_date ? event.event_date.split('T')[0] : '',
                event_type: event.event_type || '',
                icon: event.icon || '',
                color: event.color || '#6366f1',
                description: event.description || '',
                image: null,
                members: []
            });
        } catch (err) {
            setError('Error al cargar evento');
        }
    };

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'image') {
            setFormData({ ...formData, image: files[0] || null });
        } else if (name === 'members') {
            const selected = Array.from(e.target.selectedOptions, option => parseInt(option.value));
            setFormData({ ...formData, members: selected });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.event_date) {
            setError('Nombre y fecha son requeridos');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            if (isEdit) {
                await api.updateEvent(id, formData);
            } else {
                await api.createEvent(formData);
            }

            navigate('/');
        } catch (err) {
            setError(err.message || 'Error al guardar evento');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-page">
            <div className="page-header">
                <h1>{isEdit ? 'Editar Evento' : 'Nuevo Evento'}</h1>
                <button onClick={() => navigate('/')} className="btn btn-secondary">
                    Cancelar
                </button>
            </div>

            <form onSubmit={handleSubmit} className="form card">
                {error && <div className="error">{error}</div>}

                <div className="form-group">
                    <label>Nombre del Evento *</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="form-control"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Fecha *</label>
                    <input
                        type="date"
                        name="event_date"
                        value={formData.event_date}
                        onChange={handleChange}
                        className="form-control"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Tipo de Evento</label>
                    <select
                        name="event_type"
                        value={formData.event_type}
                        onChange={handleChange}
                        className="form-control"
                    >
                        <option value="">Seleccionar...</option>
                        <option value="cumpleaños">Cumpleaños</option>
                        <option value="reunión">Reunión</option>
                        <option value="vacaciones">Vacaciones</option>
                        <option value="médico">Médico</option>
                        <option value="escolar">Escolar</option>
                        <option value="otro">Otro</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Color</label>
                    <input
                        type="color"
                        name="color"
                        value={formData.color}
                        onChange={handleChange}
                        className="form-control"
                        style={{ height: '50px' }}
                    />
                </div>

                <div className="form-group">
                    <label>Descripción</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="form-control"
                        rows="4"
                    />
                </div>

                <div className="form-group">
                    <label>Imagen</label>
                    <input
                        type="file"
                        name="image"
                        accept="image/*"
                        onChange={handleChange}
                        className="form-control"
                    />
                </div>

                <div className="form-group">
                    <label>Miembros</label>
                    <select
                        name="members"
                        multiple
                        value={formData.members.map(String)}
                        onChange={handleChange}
                        className="form-control"
                        style={{ height: '120px' }}
                    >
                        {members.map(member => (
                            <option key={member.id} value={member.id}>
                                {member.name}
                            </option>
                        ))}
                    </select>
                    <small style={{ color: 'var(--text-light)', marginTop: '0.5rem', display: 'block' }}>
                        Mantén presionado Ctrl (Cmd en Mac) para seleccionar múltiples miembros
                    </small>
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EventForm;
