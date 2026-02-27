// src/components/ChatbotWidget.jsx
import React, { useState, useRef, useEffect } from 'react';
import { sendMessageToAura } from '../api/chatbotService';
import './ChatbotWidget.css';
import chatIcon from '../assets/Icon_chat.png';

export const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (input.trim().length === 0 || isLoading) return;

    // Mensaje del usuario
    const userMessage = { text: input, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const auraResponseText = await sendMessageToAura(input);
      
      // Mensaje de Aura
      const auraMessage = { text: auraResponseText, sender: 'aura' };
      setMessages((prev) => [...prev, auraMessage]);
    } catch (error) {
      console.error("Error al obtener respuesta de Aura:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => setIsOpen(false);

  return (
    <>
      {/* Avatar — siempre visible en esquina */}
      {!isOpen && (
        <div className="chatbot-container">
          <div className="chatbot-avatar" onClick={() => setIsOpen(true)}>
            <img src={chatIcon} alt="Aura Assistant" />
          </div>
        </div>
      )}

      {/* Overlay + Modal de chat */}
      {isOpen && (
        <>
          {/* Overlay oscuro detrás del modal */}
          <div className="chat-overlay" onClick={handleClose} />

          {/* Ventana de chat — modal centrado grande */}
          <div className="chat-window">
            <div className="chat-header">
              <div className="header-content">
                <img src={chatIcon} alt="Aura" className="header-avatar" />
                <div className="envoltura-title">
                  <h3 className="title">Aura</h3>
                  <h6 className="title">Asistente Útil de Respuesta Automatizada</h6>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="close-btn"
                aria-label="Cerrar chat"
              >
                ×
              </button>
            </div>

            <div className="chat-messages">
              {messages.map((msg, index) => (
                <div key={index} className={`message ${msg.sender}`}>
                  <p>{msg.text}</p>
                </div>
              ))}
              {isLoading && (
                <div className="message aura"><p>Escribiendo...</p></div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="chat-input-form">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Habla con AURA..."
                disabled={isLoading}
                aria-label="Escribe tu mensaje"
              />
              <button type="submit" disabled={isLoading} aria-label="Enviar mensaje">
                <div className="send-icon"></div>
              </button>
            </form>
          </div>
        </>
      )}
    </>
  );
};

// también exponemos una exportación por defecto para simplificar algunas importaciones
export default ChatbotWidget;