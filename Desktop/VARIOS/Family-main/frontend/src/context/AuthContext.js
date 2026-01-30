import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // Usuario por defecto sin necesidad de autenticación
    const [user] = useState({ id: 1, name: 'Usuario' });
    const loading = false;

    const login = async () => {
        // No hace nada, siempre está "logueado"
        return { token: 'no-auth' };
    };

    const logout = () => {
        // No hace nada
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};