import React from 'react';
import { AuthProvider } from './components/Auth/AuthContext';
import { ChatProvider } from './context/ChatContext';
import App from './App.jsx';
const AppWrapper = () => {
  return (
    <AuthProvider>
      <ChatProvider>
        <App />
      </ChatProvider>
    </AuthProvider>
  );
};

export default AppWrapper;