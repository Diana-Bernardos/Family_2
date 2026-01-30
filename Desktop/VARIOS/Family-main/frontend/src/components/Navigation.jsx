import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
    const location = useLocation();

    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

    return (
        <nav className="navigation">
            <div className="nav-container">
                <Link to="/" className="nav-logo">
                    <span className="logo-icon">📅</span>
                    <span className="logo-text">Family Calendar</span>
                </Link>
                <div className="nav-links">
                    <Link to="/" className={isActive('/') ? 'active' : ''}>
                        Calendario
                    </Link>
                    <Link to="/members" className={isActive('/members') ? 'active' : ''}>
                        Miembros
                    </Link>
                    <Link to="/chat" className={isActive('/chat') ? 'active' : ''}>
                        Asistente
                    </Link>
                    <Link to="/shopping" className={isActive('/shopping') ? 'active' : ''}>
                        Lista de Compra
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navigation;
