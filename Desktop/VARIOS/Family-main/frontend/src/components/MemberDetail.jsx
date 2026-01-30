import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import './Detail.css';

const MemberDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [member, setMember] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [memberRes, docsRes] = await Promise.all([
                api.getMember(id),
                api.getDocuments(id).catch(() => ({ data: [] }))
            ]);
            setMember(memberRes.data);
            setDocuments(docsRes.data || []);
            setError(null);
        } catch (err) {
            setError('Error al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploading(true);
            await api.uploadDocument(id, file);
            loadData();
            e.target.value = '';
        } catch (err) {
            alert('Error al subir documento');
        } finally {
            setUploading(false);
        }
    };

    const handleDownload = async (docId, docName) => {
        try {
            const blob = await api.downloadDocument(docId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = docName;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert('Error al descargar documento');
        }
    };

    const handleDeleteDoc = async (docId) => {
        if (!window.confirm('¿Eliminar este documento?')) return;
        try {
            await api.deleteDocument(docId);
            loadData();
        } catch (err) {
            alert('Error al eliminar documento');
        }
    };

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
            </div>
        );
    }

    if (error || !member) {
        return (
            <div className="error">
                {error || 'Miembro no encontrado'}
                <button onClick={() => navigate('/members')} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                    Volver
                </button>
            </div>
        );
    }

    return (
        <div className="detail-page">
            <div className="page-header">
                <button onClick={() => navigate('/members')} className="btn btn-secondary">
                    ← Volver
                </button>
                <button onClick={() => navigate(`/members/${id}/edit`)} className="btn btn-primary">
                    Editar
                </button>
            </div>

            <div className="detail-content">
                <div className="detail-main card">
                    <div className="detail-header">
                        {member.avatar ? (
                            <img
                                src={`data:${member.avatar.type};base64,${member.avatar.data}`}
                                alt={member.name}
                                className="detail-avatar"
                            />
                        ) : (
                            <div className="detail-avatar-placeholder">
                                {member.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div>
                            <h1>{member.name}</h1>
                            {member.email && <p className="detail-meta">📧 {member.email}</p>}
                            {member.phone && <p className="detail-meta">📞 {member.phone}</p>}
                            {member.birth_date && (
                                <p className="detail-meta">
                                    🎂 {new Date(member.birth_date).toLocaleDateString('es-ES')}
                                </p>
                            )}
                        </div>
                    </div>

                    {member.events && member.events.length > 0 && (
                        <div className="detail-section">
                            <h2>Eventos Asociados</h2>
                            <div className="events-list">
                                {member.events.map(event => (
                                    <div
                                        key={event.id}
                                        className="event-item"
                                        onClick={() => navigate(`/events/${event.id}`)}
                                    >
                                        <strong>{event.name}</strong>
                                        <span>{new Date(event.event_date).toLocaleDateString('es-ES')}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="detail-documents card">
                    <div className="documents-header">
                        <h2>Documentos</h2>
                        <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
                            {uploading ? 'Subiendo...' : '📎 Subir Documento'}
                            <input
                                type="file"
                                style={{ display: 'none' }}
                                onChange={handleFileUpload}
                                disabled={uploading}
                            />
                        </label>
                    </div>

                    {documents.length === 0 ? (
                        <p style={{ color: 'var(--text-light)', textAlign: 'center', padding: '2rem' }}>
                            No hay documentos
                        </p>
                    ) : (
                        <div className="documents-list">
                            {documents.map(doc => (
                                <div key={doc.id} className="document-item">
                                    <div>
                                        <strong>{doc.name}</strong>
                                        <span style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>
                                            {(doc.size / 1024).toFixed(2)} KB
                                        </span>
                                    </div>
                                    <div className="document-actions">
                                        <button
                                            onClick={() => handleDownload(doc.id, doc.name)}
                                            className="btn btn-secondary"
                                            style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                                        >
                                            Descargar
                                        </button>
                                        <button
                                            onClick={() => handleDeleteDoc(doc.id)}
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
            </div>
        </div>
    );
};

export default MemberDetail;
