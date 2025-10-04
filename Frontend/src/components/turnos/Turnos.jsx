// INICIO CAMBIO - Archivo: src/components/Turnos.jsx - Integrado con nuevos servicios
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './Turnos.css';

// Importar nuevos servicios
import locationService from '../../services/locationService.js';
import turnosService, { saveAppointment } from '../../services/turnosService.js';
import { initializeEmailJS } from '../../services/emailService.js';
import { useAuth } from '../Auth/AuthContext.jsx';
import ModalAuth from '../Auth/ModalAuth.jsx';

// Importar componentes
import { ProfesionalesList } from './ProfesionalesList2.jsx';
import { MisTurnosList } from './MisTurnosList2.jsx';
import { TurnoModal } from './TurnoModal2.jsx';

// Utilidades (mantener compatibilidad)
const getTypeFromPlace = (place) => {
    return place.type || 'default';
};

export default function Turnos() {
	const { t } = useTranslation();
	const { user } = useAuth();
	
	// Estados para modal de autenticación
	const [showAuthModal, setShowAuthModal] = useState(false);
	const [showRegister, setShowRegister] = useState(false);
	
	// Función para traducir tipos de profesionales
	const prettyType = (type) => {
		return t(`appointments.types.${type}`, { defaultValue: t('appointments.types.default') });
	};
	
	// Estados del modal
	const [modalOpen, setModalOpen] = useState(false);
	const [selected, setSelected] = useState(null);
	const [datetime, setDatetime] = useState('');
	const [notes, setNotes] = useState('');
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

	// Cargar turnos cuando cambie el usuario autenticado
	useEffect(() => {
		if (user?.mail) {
			console.log('[Turnos] Cargando turnos para usuario:', user.mail);
			cargarMisTurnos(user.mail);
		} else {
			console.log('[Turnos] Limpiando turnos');
			setMisTurnos([]);
		}
	}, [user]);

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
		if (!user) {
			setError('Debes iniciar sesión para solicitar un turno');
			return;
		}

		if (!selected || !datetime) {
			setError(t('appointments.missingData'));
			return;
		}

		try {
			setLoading(true);
			setError('');

			await solicitarTurno(selected, datetime, notes, user.mail, selectedType);

			setModalOpen(false);
			setDatetime('');
			setNotes('');
			setError('');

			alert(t('appointments.successMessage'));

		} catch (emailError) {
			console.error('[Turnos] Error completo:', emailError);

			const errorMessage = emailError.message || t('common.error');
			setError(errorMessage);
			alert(`${t('appointments.errorMessage')}: ${errorMessage}`);

		} finally {
			setLoading(false);
		}
	};

	const handleCancelarTurno = async (id) => {
		if (!user?.mail) {
			alert(t('appointments.errorCancelNoEmail'));
			return;
		}

		const confirmCancel = window.confirm(t('appointments.confirmCancel'));
		if (!confirmCancel) return;

		await cancelarTurno(id, user.mail);
	};

	// Si no está autenticado, mostrar mensaje para iniciar sesión
	if (!user) {
		return (
			<div className="turnos-section">
				<div className="turnos-root">
					<div className="turnos-header">
						<div className="turnos-badge" style={{ background: '#47472eff' }}>{t('appointments.badge')}</div>
						<h3>{t('appointments.requestAppointments')}</h3>
					</div>
					<div className="turnos-auth-required">
						<div style={{
							textAlign: 'center',
							padding: '3rem 2rem',
							backgroundColor: 'rgba(255, 224, 166, 0.1)',
							borderRadius: '12px',
							border: '2px solid var(--color-primary)',
							maxWidth: '500px',
							margin: '2rem auto'
						}}>
							<div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
							<h3 style={{ color: 'var(--color-primary)', marginBottom: '1rem' }}>
								Autenticación Requerida
							</h3>
							<p style={{ color: 'var(--color-text)', marginBottom: '2rem' }}>
								Debes iniciar sesión para ver y solicitar turnos médicos
							</p>
							<button
								onClick={() => {
									setShowRegister(false);
									setShowAuthModal(true);
								}}
								style={{
									padding: '12px 32px',
									fontSize: '1.1rem',
									backgroundColor: 'var(--color-bg-dark)',
									color: 'var(--color-text)',
									border: 'none',
									borderRadius: 'var(--radius)',
									cursor: 'pointer',
									fontWeight: 'bold',
									transition: 'var(--transition)',
									boxShadow: '0 4px 15px rgba(255, 224, 166, 0.3)'
								}}
							>
								Iniciar Sesión
							</button>
						</div>
					</div>
					
					{/* Modal de Autenticación */}
					<ModalAuth
						open={showAuthModal}
						onClose={() => setShowAuthModal(false)}
						showRegister={showRegister}
						setShowRegister={setShowRegister}
					/>
				</div>
			</div>
		);
	}

	return (
		<div className="turnos-section">
			<div className="turnos-root">
				<div className="turnos-header">
					<div className="turnos-badge" style={{ background: '#47472eff' }}>{t('appointments.badge')}</div>
					<h3>{t('appointments.requestAppointments')}</h3>
					<div style={{ marginTop: '10px', color: 'var(--color-primary)' }}>
						Usuario: <strong>{user.nombre} {user.apellido}</strong> ({user.mail})
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
					correo={user.mail}
					setCorreo={() => {}} // No permitir cambiar el correo
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
