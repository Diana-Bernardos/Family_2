// frontend/src/services/chatbotService.js
import { api } from './api';

export const chatbotService = {
    sendMessage: async (message) => {
        try {
            const response = await api.sendChatMessage(message);
            if (!response.success) {
                throw new Error(response.error || 'Error al enviar mensaje');
            }
            return response;
        } catch (error) {
            console.error('Error in chatbot service:', error);
            throw error;
        }
    },

    getContext: async () => {
        try {
            const response = await api.getChatContext();
            return response.data;
        } catch (error) {
            console.error('Error getting context:', error);
            return null;
        }
    },

    getHistory: async (limit = 50) => {
        try {
            const response = await api.getChatHistory(limit);
            return response.data;
        } catch (error) {
            console.error('Error getting history:', error);
            return [];
        }
    }
};

export default chatbotService;