import React from 'react';
import './ChatBot.css';

const CHAT_SRC = 'https://chat-bot-frontend-2opd.onrender.com';

const ChatBot = () => {
  return (
    <div className="chatbot-container">
      <iframe
        src={CHAT_SRC}
        title="Chat Bot Full"
        className="chatbot-iframe-full"
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
      />
    </div>
  );
};

export default ChatBot;
