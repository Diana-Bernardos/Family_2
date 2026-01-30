const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

async function request(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    const headers = {
        ...options.headers,
    };

    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    console.log('Sending Request:', { endpoint, method: options.method, headers });

    const config = {
        headers,
        ...options,
    };

    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
        config.body = JSON.stringify(config.body);
    }

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error en la solicitud');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

export const api = {
    // Eventos
    getEvents: () => request('/events'),
    getEvent: (id) => request(`/events/${id}`),
    createEvent: (data) => {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (key === 'image' && data[key]) {
                formData.append('image', data[key]);
            } else if (key !== 'image') {
                formData.append(key, typeof data[key] === 'object' ? JSON.stringify(data[key]) : data[key]);
            }
        });
        return request('/events', {
            method: 'POST',
            headers: {},
            body: formData,
        });
    },
    updateEvent: (id, data) => {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (key === 'image' && data[key]) {
                formData.append('image', data[key]);
            } else if (key !== 'image') {
                formData.append(key, typeof data[key] === 'object' ? JSON.stringify(data[key]) : data[key]);
            }
        });
        return request(`/events/${id}`, {
            method: 'PUT',
            headers: {},
            body: formData,
        });
    },
    deleteEvent: (id) => request(`/events/${id}`, { method: 'DELETE' }),

    // Miembros
    getMembers: () => request('/members'),
    getMember: (id) => request(`/members/${id}`),
    createMember: (data) => {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (key === 'avatar' && data[key]) {
                formData.append('avatar', data[key]);
            } else if (key !== 'avatar') {
                formData.append(key, data[key] || '');
            }
        });
        return request('/members', {
            method: 'POST',
            headers: {},
            body: formData,
        });
    },
    updateMember: (id, data) => {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (key === 'avatar' && data[key]) {
                formData.append('avatar', data[key]);
            } else if (key !== 'avatar') {
                formData.append(key, data[key] || '');
            }
        });
        return request(`/members/${id}`, {
            method: 'PUT',
            headers: {},
            body: formData,
        });
    },
    deleteMember: (id) => request(`/members/${id}`, { method: 'DELETE' }),

    // Documentos
    getDocuments: (memberId) => request(`/documents/${memberId}`),
    uploadDocument: (memberId, file) => {
        const formData = new FormData();
        formData.append('document', file);
        return request(`/documents/${memberId}`, {
            method: 'POST',
            headers: {},
            body: formData,
        });
    },
    downloadDocument: (id) => {
        return fetch(`${API_URL}/documents/download/${id}`)
            .then(res => res.blob());
    },
    deleteDocument: (id) => request(`/documents/${id}`, { method: 'DELETE' }),

    // AI Chat
    getContext: () => request('/ai/context'),
    sendChatMessage: (message) => request('/ai/chat', {
        method: 'POST',
        body: { message },
    }),
    getChatHistory: (limit = 50) => request(`/ai/history?limit=${limit}`),

    // Shopping List
    getShoppingList: () => request('/shopping'),
    addShoppingItem: (item) => request('/shopping', {
        method: 'POST',
        body: { item }
    }),
    updateShoppingItem: (id, completed) => request(`/shopping/${id}`, {
        method: 'PUT',
        body: { completed }
    }),
    deleteShoppingItem: (id) => request(`/shopping/${id}`, { method: 'DELETE' }),
};
