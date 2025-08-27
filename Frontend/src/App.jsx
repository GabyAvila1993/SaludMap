import React from 'react';
import './App.css';
import MapComponent from './components/Map.jsx';
import Turnos from './components/turnos/Turnos.jsx';
import Background from './components/Background.jsx';

function App() {
  return (
  <div className="min-h-screen w-full relative overflow-hidden">
      <Background />
      <div className="relative z-10 p-4 text-white">
        <h1 className="text-3xl font-bold mb-4">SaludMap</h1>
        <MapComponent />
        <Turnos />
      </div>
    </div>
  );
}

export default App;
