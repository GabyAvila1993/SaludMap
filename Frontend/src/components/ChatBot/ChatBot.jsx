import React, { useState } from 'react';
import './ChatBot.css';

const CHAT_SRC = 'https://chat-bot-ten-lime.vercel.app/';

const ChatBot = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="chatbot-container" aria-hidden={open ? 'false' : 'true'}>
      {/* Miniatura (mostramos un iframe recortado para mostrar solo la imagen/avatar)
          El iframe interior se escala y se vuelve no interactivo; los clicks los gestiona el wrapper */}
      {!open && (
        <button className="chatbot-avatar" onClick={() => setOpen(true)} aria-label="Abrir chat">
          <img
            src="https://chat-bot-ten-lime.vercel.app/assets/logo-b44c1bd5.png"
            alt="Chat Bot"
          />
        </button>
      )}

      {/* Panel expandido */}
      {open && (
        <div className="chatbot-panel">
          <button className="chatbot-close" onClick={() => setOpen(false)} aria-label="Cerrar chat">×</button>
          <iframe
            src={CHAT_SRC}
            title="Chat Bot Full"
            className="chatbot-iframe-full"
            sandbox="allow-same-origin allow-scripts allow-popups"
          />
        </div>
      )}
    </div>
  );
};

export default ChatBot;