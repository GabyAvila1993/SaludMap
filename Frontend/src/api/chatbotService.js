// src/api/chatbotService.js
import axios from 'axios';
import { API_URL } from '../config';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Envía un mensaje al chatbot y recibe una respuesta.
 * @param message El mensaje del usuario.
 * @returns La respuesta del asistente AURA.
 */
export const sendMessageToAura = async (message) => {
  try {
    const response = await apiClient.post('/api/chatbot/message', { message });
    
    // Mantenemos la estructura de acceso a datos que tenías
    return response.data.data.botResponse;
  } catch (error) {
    console.error("Error al comunicarse con el chatbot:", error);
    return "Lo siento, estoy teniendo problemas para conectarme. Por favor, inténtalo de nuevo más tarde.";
  }
};