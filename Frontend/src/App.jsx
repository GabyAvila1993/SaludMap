import React from 'react';
import './App.css';
import MapComponent from './components/Map.jsx';
import Turnos from './components/Turnos';

export default function App() {
    return (
        <div className="App">
            <MapComponent />
            <Turnos />
        </div>
    );
}
