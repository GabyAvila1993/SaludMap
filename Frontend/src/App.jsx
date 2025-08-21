import React from 'react';
import './App.css';
import MapComponent from './components/Map.jsx';
import Turnos from './components/Turnos';

function App() {
  return (
    <div className="App">
      <h1>SaludMap</h1>
      <MapComponent />
      <Turnos />
    </div>
  );
}

export default App;
