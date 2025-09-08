// INICIO CAMBIO - Archivo: src/components/Turnos.jsx - Integrado con nuevos servicios
import React, { useEffect, useState } from 'react';
import './Turnos.css';

// Importar nuevos servicios
import locationService from '../../services/locationService.js';
import turnosService, { saveAppointment } from '../../services/turnosService.js';
import { initializeEmailJS } from '../../services/emailService.js';

// Importar componentes
import { ProfesionalesList } from './ProfesionalesList2.jsx';
import { MisTurnosList } from './MisTurnosList2.jsx';
import { TurnoModal } from './TurnoModal2.jsx';

// Utilidades (mantener compatibilidad)
const getTypeFromPlace = (place) => {
    return place.type || 'default';
};

const prettyType = (type) => {
    const types = {
        hospital: 'Hospital',
        clinic: 'Clínica',
        doctors: 'Médico',
        veterinary: 'Veterinaria',
        default: 'Servicio de salud'
    };
    return types[type] || types.default;
};

export default function Turnos() {
    // Estados del modal
    const [modalOpen, setModalOpen] = useState(false);
    const [selected, setSelected] = useState(null);
    const [datetime, setDatetime] = useState('');
    const [notes, setNotes] = useState('');
    const [correo, setCorreo] = useState('');
    const [selectedType, setSelectedType] = useState('default');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Estados de lugares y turnos
    const [lugares, setLugares] = useState([]);
    const [loadingPlaces, setLoadingPlaces] = useState(false);
    const [errorPlaces, setErrorPlaces] = useState('');
    const [misTurnos, setMisTurnos] = useState([]);
    const [cancellingId, setCancellingId] = useState(null);

    // Suscribirse a cambios de profesionales
    useEffect(() => {
        // Inicializar EmailJS
        initializeEmailJS();
        
        const unsubscribe = turnosService.subscribe(({ lugares, loading, error }) => {
            setLugares(lugares || []);
            setLoadingPlaces(loading || false);
            setErrorPlaces(error || '');
        });

        // Inicializar servicio
        turnosService.initialize();

        return unsubscribe;
    }, []);

    // Suscribirse a eventos de ubicación del mapa
    useEffect(() => {
        const handleLocationChange = (e) => {
            console.log('[Turnos] Recibido evento de ubicación:', e.detail);
            const { lat, lng, source } = e.detail;

            if (lat && lng) {
                if (source === 'manual') {
                    // Establecer ubicación manual en el servicio
                    locationService.setManualLocation(lat, lng);
                }
                // El servicio automáticamente notificará a los suscriptores
            }
        };

        window.addEventListener('saludmap:pos-changed', handleLocationChange);
        return () => {
            window.removeEventListener('saludmap:pos-changed', handleLocationChange);
        };
    }, []);

    // Cargar turnos cuando cambie el correo
    useEffect(() => {
        if (correo) {
            console.log('[Turnos] Cargando turnos para correo:', correo);
            cargarMisTurnos(correo);
        } else {
            console.log('[Turnos] Limpiando turnos');
            setMisTurnos([]);
        }
    }, [correo]);

    // Funciones de turnos (mock - reemplazar con tu lógica real)
    const cargarMisTurnos = async (emailUsuario) => {
        try {
            // Aquí deberías llamar a tu API real de turnos
            console.log('[Turnos] Simulando carga de turnos para:', emailUsuario);

            // Simulación de turnos
            const turnosSimulados = [
                {
                    id: 1,
                    professionalName: 'Dr. Juan Pérez',
                    professionalType: 'doctors',
                    datetime: new Date(Date.now() + 86400000).toISOString(), // Mañana
                    notes: 'Consulta general'
                }
            ];

            setMisTurnos(turnosSimulados);
        } catch (error) {
            console.error('[Turnos] Error cargando turnos:', error);
            setMisTurnos([]);
        }
    };

    const solicitarTurno = async (profesional, fechaHora, observaciones, correo, tipo) => {
        try {
            setLoading(true);
            console.log('[Turnos] Solicitando turno:', {
                profesional: profesional.name,
                fechaHora,
                correo
            });

            // Importar dinámicamente el emailService
            const { sendAppointmentEmail } = await import('../../services/emailService.js');
            
            // Enviar email de confirmación
            const { emailResponse, payload } = await sendAppointmentEmail(
                profesional,
                fechaHora,
                observaciones,
                correo,
                tipo,
                prettyType
            );

            // Crear turno en el backend
            console.log('[DEBUG] Llamando saveAppointment con payload:', payload);
            const response = await saveAppointment(payload);
            console.log('[Turnos] Turno guardado:', response);
            
            setLoading(false);

            // Agregar a la lista local
            const nuevoTurno = {
                id: response.id || Date.now(),
                professionalName: profesional.name || 'Profesional',
                professionalType: tipo,
                datetime: fechaHora,
                notes: observaciones,
                email: correo
            };

            setMisTurnos(prev => [...prev, nuevoTurno]);

        } catch (error) {
            console.error('[Turnos] Error solicitando turno:', error);
            console.error('[Turnos] Error completo:', error);
            setLoading(false);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const cancelarTurno = async (turnoId, correo) => {
        try {
            setCancellingId(turnoId);
            console.log('[Turnos] Cancelando turno:', turnoId);

            // Aquí deberías llamar a tu API real para cancelar el turno
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Remover de la lista local
            setMisTurnos(prev => prev.filter(t => t.id !== turnoId));

        } catch (error) {
            console.error('[Turnos] Error cancelando turno:', error);
            alert('Error cancelando turno: ' + error.message);
        } finally {
            setCancellingId(null);
        }
    };

    // Funciones del modal
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

            await solicitarTurno(selected, datetime, notes, correo, selectedType);

            setModalOpen(false);
            setDatetime('');
            setNotes('');
            setError('');

            alert('¡Turno solicitado correctamente!');

        } catch (emailError) {
            console.error('[Turnos] Error completo:', emailError);

            const errorMessage = emailError.message || 'Error desconocido';
            setError(errorMessage);
            alert(`Hubo un problema: ${errorMessage}`);

        } finally {
            setLoading(false);
        }
    };

    const handleCancelarTurno = async (id) => {
        if (!correo) {
            alert('Error: No se puede cancelar sin correo del usuario');
            return;
        }

        const confirmCancel = window.confirm('¿Estás seguro de que quieres cancelar este turno?');
        if (!confirmCancel) return;

        await cancelarTurno(id, correo);
    };

    return (
        <div className="turnos-section">
            <div className="turnos-root">
                <div className="turnos-header">
                    <div className="turnos-badge" style={{ background: '#47472eff' }}>Turnos</div>
                <h3>Solicitar Turnos</h3>

                {/* Campo de correo para ver turnos */}
                <div style={{ marginTop: '10px' }}>
                    {/* <label style={{
                        display: 'block',
                        fontSize: '12px',
                        marginBottom: '5px',
                        color: 'var(--color-primary)'
                    }}>
                        Ver mis turnos (ingresa tu correo):
                    </label>
                    <input
                        type="email"
                        placeholder="usuario@ejemplo.com"
                        value={correo}
                        onChange={(e) => setCorreo(e.target.value)}
                        style={{
                            padding: '8px',
                            borderRadius: '4px',
                            border: '1px solid rgba(255, 224, 166, 0.3)',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            color: 'var(--color-text)',
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
        </div>
    );
}
// FIN CAMBIO - Archivo: src/components/Turnos.jsx