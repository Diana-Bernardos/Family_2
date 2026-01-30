import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import './Members.css';

const Members = () => {
    const navigate = useNavigate();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadMembers();
    }, []);

    const loadMembers = async () => {
        try {
            setLoading(true);
            const response = await api.getMembers();
            setMembers(response.data);
            setError(null);
        } catch (err) {
            setError('Error al cargar miembros');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm('¿Estás seguro de eliminar este miembro?')) return;

        try {
            await api.deleteMember(id);
            loadMembers();
        } catch (err) {
            alert('Error al eliminar miembro');
        }
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
                <button onClick={loadMembers} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <div className="members-page">
            <div className="page-header">
                <h1>Miembros de la Familia</h1>
                <button onClick={() => navigate('/members/new')} className="btn btn-primary">
                    ➕ Nuevo Miembro
                </button>
            </div>

            {members.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                        No hay miembros registrados
                    </p>
                    <button onClick={() => navigate('/members/new')} className="btn btn-primary">
                        Agregar Primer Miembro
                    </button>
                </div>
            ) : (
                <div className="members-grid">
                    {members.map(member => (
                        <div
                            key={member.id}
                            className="member-card card"
                            onClick={() => navigate(`/members/${member.id}`)}
                        >
                            {member.avatar ? (
                                <img
                                    src={`data:${member.avatar.type};base64,${member.avatar.data}`}
                                    alt={member.name}
                                    className="member-avatar"
                                />
                            ) : (
                                <div className="member-avatar-placeholder">
                                    {member.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="member-info">
                                <h3>{member.name}</h3>
                                {member.email && <p className="member-email">{member.email}</p>}
                                {member.phone && <p className="member-phone">{member.phone}</p>}
                            </div>
                            <div className="member-actions">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/members/${member.id}/edit`);
                                    }}
                                    className="btn btn-secondary"
                                    style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                                >
                                    Editar
                                </button>
                                <button
                                    onClick={(e) => handleDelete(member.id, e)}
                                    className="btn btn-danger"
                                    style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Members;
