import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import './Form.css';

const MemberForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        birth_date: '',
        avatar: null
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isEdit) {
            loadMember();
        }
    }, [id]);

    const loadMember = async () => {
        try {
            const response = await api.getMember(id);
            const member = response.data;
            setFormData({
                name: member.name || '',
                email: member.email || '',
                phone: member.phone || '',
                birth_date: member.birth_date || '',
                avatar: null
            });
        } catch (err) {
            setError('Error al cargar miembro');
        }
    };

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'avatar') {
            setFormData({ ...formData, avatar: files[0] || null });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            setError('El nombre es requerido');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            if (isEdit) {
                await api.updateMember(id, formData);
            } else {
                await api.createMember(formData);
            }

            navigate('/members');
        } catch (err) {
            setError(err.message || 'Error al guardar miembro');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-page">
            <div className="page-header">
                <h1>{isEdit ? 'Editar Miembro' : 'Nuevo Miembro'}</h1>
                <button onClick={() => navigate('/members')} className="btn btn-secondary">
                    Cancelar
                </button>
            </div>

            <form onSubmit={handleSubmit} className="form card">
                {error && <div className="error">{error}</div>}

                <div className="form-group">
                    <label htmlFor="name">Nombre *</label>
                    <input
                        id="name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="form-control"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="form-control"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="phone">Teléfono</label>
                    <input
                        id="phone"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="form-control"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="birth_date">Fecha de Nacimiento</label>
                    <input
                        id="birth_date"
                        type="date"
                        name="birth_date"
                        value={formData.birth_date}
                        onChange={handleChange}
                        className="form-control"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="avatar">Avatar</label>
                    <input
                        id="avatar"
                        type="file"
                        name="avatar"
                        accept="image/*"
                        onChange={handleChange}
                        className="form-control"
                    />
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

export default MemberForm;
