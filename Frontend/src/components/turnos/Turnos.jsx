import React, { useEffect, useState } from 'react';
import './Turnos.css';

import { useGeolocation } from '../../hooks/useGeolocalizacion.js';
import { useProfesionales } from '../../hooks/useLugaresCercanos.js';
import { useTurnos } from '../../hooks/useTurnos.js';
import { getTypeFromPlace, prettyType } from '../../utils/geoUtils.js';
import { ProfesionalesList } from './ProfesionalesList2.jsx';
import { MisTurnosList } from './MisTurnosList2.jsx';
import { TurnoModal } from './TurnoModal2.jsx';

export default function Turnos() {
    const [modalOpen, setModalOpen] = useState(false);
    const [selected, setSelected] = useState(null);
    const [datetime, setDatetime] = useState('');
    const [notes, setNotes] = useState('');
    const [correo, setCorreo] = useState('');
    const [selectedType, setSelectedType] = useState('default');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { pos, setPos } = useGeolocation();
    const { lugares, loading: loadingPlaces, error: errorPlaces, updatePrevPos } = useProfesionales(pos);
    const { misTurnos, cancellingId, cargarMisTurnos, cancelarTurno, solicitarTurno } = useTurnos(); // CAMBIO: Sin parámetro

    // NUEVO: useEffect para cargar turnos cuando cambie el correo
    useEffect(() => {
        if (correo) {
            console.log('[DEBUG] Correo cambió a:', correo, '- Cargando turnos...');
            cargarMisTurnos(correo);
        } else {
            console.log('[DEBUG] Correo vacío - Limpiando turnos');
        }
    }, [correo, cargarMisTurnos]);

    const openModal = (prof) => {
        setSelected(prof);
        setDatetime('');
        setNotes('');
        setSelectedType(getTypeFromPlace(prof));
        setModalOpen(true);
    };

    const handleSolicitarTurno = async () => {
        if (!selected || !datetime || !correo) {
            setError('Faltan datos: selecciona un profesional, fecha y correo.');
            return;
        }

        try {
            setLoading(true);
            setError('');

            await solicitarTurno(selected, datetime, notes, correo, selectedType, prettyType);

            setModalOpen(false);
            // CAMBIO: No limpiar el correo para mantener los turnos visibles
            setDatetime('');
            setNotes('');
            setError('');

            alert('¡Turno solicitado y confirmado por correo correctamente!');

        } catch (emailError) {
            console.error('[DEBUG] ❌ Error completo:', emailError);

            let errorMessage = 'Error desconocido';

            if (emailError.status) {
                errorMessage = `Error EmailJS (${emailError.status}): ${emailError.text || emailError.message}`;
            } else if (emailError.message) {
                errorMessage = `Error: ${emailError.message}`;
            } else if (emailError.response) {
                errorMessage = `Error del servidor: ${emailError.response.data?.message || emailError.response.status}`;
            }

            setError(errorMessage);
            alert(`Hubo un problema: ${errorMessage}\n\nRevisa la consola del navegador para más detalles.`);

        } finally {
            setLoading(false);
        }
    };

    // NUEVO: Función mejorada para cancelar turno con confirmación
    const handleCancelarTurno = async (id) => {
        if (!correo) {
            alert('Error: No se puede cancelar sin correo del usuario');
            return;
        }

        const confirmCancel = window.confirm('¿Estás seguro de que quieres cancelar este turno?');
        if (!confirmCancel) return;

        await cancelarTurno(id, correo);
    };

    useEffect(() => {
        const handler = (e) => {
            console.log('[Turnos] recibí saludmap:pos-changed ->', e?.detail);
            const d = e.detail;
            if (d?.lat && d?.lng) {
                if (d.source === 'manual' || d.source === 'calibrated' || d.source === 'reset') {
                    updatePrevPos(null);
                }
                setPos({ lat: d.lat, lng: d.lng });
            }
        };
        window.addEventListener('saludmap:pos-changed', handler);
        return () => {
            window.removeEventListener('saludmap:pos-changed', handler);
        };
    }, [setPos, updatePrevPos]);

    return (
        <div className="turnos-root">
            <div className="turnos-header">
                <div className="turnos-badge" style={{ background: '#47472eff' }}>Turnos</div>
                <h3>Solicitar Turnos</h3>
                {/* NUEVO: Campo de correo visible para cargar turnos */}
                <div style={{ marginTop: '10px' }}>
                    {/* <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>
                        Ver mis turnos (ingresa tu correo):
                    </label> */}
                    {/* <input
                        type="email"
                        placeholder="usuario@ejemplo.com"
                        value={correo}
                        onChange={(e) => setCorreo(e.target.value)}
                        style={{
                            padding: '8px',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                            fontSize: '14px',
                            width: '250px'
                        }}
                    /> */}
                </div>
            </div>

            <div className="turnos-body">
                <ProfesionalesList
                    lugares={lugares}
                    loading={loadingPlaces}
                    error={errorPlaces}
                    onOpenModal={openModal}
                    getTypeFromPlace={getTypeFromPlace}
                    prettyType={prettyType}
                />

                <MisTurnosList
                    misTurnos={misTurnos}
                    onCancelTurno={handleCancelarTurno} 
                    cancellingId={cancellingId}
                    prettyType={prettyType}
                />
            </div>

            <TurnoModal
                modalOpen={modalOpen}
                selected={selected}
                selectedType={selectedType}
                datetime={datetime}
                setDatetime={setDatetime}
                notes={notes}
                setNotes={setNotes}
                correo={correo}
                setCorreo={setCorreo}
                loading={loading}
                error={error}
                onClose={() => setModalOpen(false)}
                onConfirm={handleSolicitarTurno}
                prettyType={prettyType}
            />
        </div>
    );
}