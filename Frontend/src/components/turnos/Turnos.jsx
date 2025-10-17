import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './Turnos.css';

// Importar servicios
import locationService from '../../services/locationService.js';
import turnosService, { saveAppointment, guardarTurno, fetchMisTurnos, cancelAppointment } from '../../services/turnosService.js';
import { initializeEmailJS } from '../../services/emailService.js';
import { useAuth } from '../Auth/AuthContext.jsx';
import ModalAuth from '../Auth/ModalAuth.jsx';

// Importar componentes
import { ProfesionalesList } from './ProfesionalesList2.jsx';
import { MisTurnosList } from './MisTurnosList2.jsx';
import { TurnoModal } from './TurnoModal2.jsx';
import establecimientosService from '../../services/establecimientosService';

// Utilidades
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

	// Helper: ordenar por datetime descendente (más reciente primero)
	const sortTurnosDesc = (arr = []) => {
		try {
			return [...arr].sort((a, b) => {
				const ta = Date.parse(a.datetime || a.fecha || '') || 0;
				const tb = Date.parse(b.datetime || b.fecha || '') || 0;
				return tb - ta;
			});
		} catch (e) {
			return [...arr];
		}
	};

	// Estado para establecimiento pre-seleccionado desde el mapa
	const [preSelectedEstablecimiento, setPreSelectedEstablecimiento] = useState(null);
	const [preSelectedPlace, setPreSelectedPlace] = useState(null);

	// Función para abrir modal - DEFINIR ANTES DE LOS useEffect
	// Acepta establecimientoOverride para pasar el establecimiento directamente
	const openModal = async (prof, establecimientoOverride = null) => {
		const tags = prof.tags || prof.properties || {};

		// Usar el establecimiento pasado o el del estado
		let est = establecimientoOverride || preSelectedEstablecimiento;

		// Si no existe establecimiento, intentar crear/obtener uno desde el servicio
		if (!est) {
			try {
				console.log('[Turnos] No hay establecimiento preseleccionado, intentando findOrCreate para place:', prof);

				// Normalizar coordenadas en el objeto antes de enviarlo al servicio
				const placeForCreate = {
					...prof,
					lat: prof.lat ?? prof.center?.lat ?? prof.geometry?.coordinates?.[1] ?? prof.latitude ?? prof.y ?? prof.properties?.lat,
					lng: prof.lng ?? prof.lon ?? prof.center?.lon ?? prof.geometry?.coordinates?.[0] ?? prof.longitude ?? prof.x ?? prof.properties?.lng,
				};

				const estResult = await establecimientosService.findOrCreate(placeForCreate);
				est = estResult;
				setPreSelectedEstablecimiento(estResult);
				setPreSelectedPlace(placeForCreate);
				console.log('[Turnos] Establecimiento obtenido/creado:', estResult?.id);
			} catch (error) {
				console.error('[Turnos] Error obteniendo/creando establecimiento al abrir modal:', error);
				alert('Error al preparar el establecimiento para solicitar turno. Por favor intenta desde el mapa o reintenta.');
				return;
			}
		}

		const normalizedProf = {
			...prof,
			name: prof.name || tags.name || prof.properties?.name || tags.amenity || 'Establecimiento de salud',
			address: prof.direccion || prof.address || tags.addr_full || tags['addr:full'] || tags.address || prof.properties?.address || '',
			establecimientoId: est?.id,
			establecimientoNombre: est?.nombre || tags.name || 'Establecimiento'
		};

		console.log('[Turnos] Abriendo modal con:', normalizedProf);
		console.log('[Turnos] - establecimientoId:', normalizedProf.establecimientoId);

		setSelected(normalizedProf);
		setDatetime('');
		setNotes('');
		setSelectedType(getTypeFromPlace(prof));
		setModalOpen(true);
	};

	// Suscribirse a cambios de profesionales
	useEffect(() => {
		initializeEmailJS();

		const unsubscribe = turnosService.subscribe(({ lugares, loading, error }) => {
			const lugaresNormalizados = (lugares || []).map(lugar => {
				const tags = lugar.tags || lugar.properties || {};
				return {
					...lugar,
					name: lugar.name || tags.name || lugar.properties?.name || tags.amenity || 'Establecimiento de salud',
					address: lugar.address || lugar.direccion || tags.addr_full || tags['addr:full'] || tags.address || lugar.properties?.address || ''
				};
			});

			setLugares(lugaresNormalizados);
			setLoadingPlaces(loading || false);
			setErrorPlaces(error || '');
		});

		turnosService.initialize();

		return unsubscribe;
	}, []);

	// Suscribirse a eventos de ubicación del mapa
	useEffect(() => {
		const handleLocationChange = (e) => {
			console.log('[Turnos] Evento de ubicación recibido:', e.detail);
			const { lat, lng, source } = e.detail;

			if (lat && lng) {
				if (source === 'manual') {
					locationService.setManualLocation(lat, lng);
				}
			}
		};

		window.addEventListener('saludmap:pos-changed', handleLocationChange);
		return () => {
			window.removeEventListener('saludmap:pos-changed', handleLocationChange);
		};
	}, []);

	// Escuchar eventos del mapa para solicitud de turno
	useEffect(() => {
		console.log('[Turnos] Registrando listener para eventos del mapa');

		const handleChangeTab = (e) => {
			console.log('[Turnos] Evento recibido:', e.detail);

			if (e.detail?.tab !== 'turnos') {
				console.log('[Turnos] Tab no es "turnos", ignorando');
				return;
			}

			const { establecimiento, place } = e.detail;

			console.log('[Turnos] Verificando datos recibidos:');
			console.log('[Turnos] - Establecimiento:', establecimiento);
			console.log('[Turnos] - Place:', place);

			// Validar que el establecimiento tenga datos completos
			if (!establecimiento) {
				console.error('[Turnos] No se recibió establecimiento');
				alert('Error: No se recibió información del establecimiento. Por favor intenta nuevamente.');
				return;
			}

			if (!establecimiento.id) {
				console.error('[Turnos] Establecimiento sin ID:', establecimiento);
				alert('Error: El establecimiento no tiene un ID válido. Por favor intenta nuevamente.');
				return;
			}

			if (!place) {
				console.error('[Turnos] No se recibió place');
				alert('Error: No se recibió información del lugar. Por favor intenta nuevamente.');
				return;
			}

			console.log('[Turnos] Datos válidos, estableciendo pre-selección');
			console.log('[Turnos] - Establecimiento ID:', establecimiento.id);
			console.log('[Turnos] - Establecimiento Nombre:', establecimiento.nombre);

			// Establecer pre-selección
			setPreSelectedEstablecimiento(establecimiento);
			setPreSelectedPlace(place);

			// Abrir modal automáticamente, pasando el establecimiento directamente
			console.log('[Turnos] Programando apertura de modal en 100ms');
			setTimeout(() => {
				console.log('[Turnos] Ejecutando openModal con establecimiento:', establecimiento.id);
				openModal(place, establecimiento);
			}, 100);
		};

		window.addEventListener('saludmap:change-tab', handleChangeTab);
		// Listener para forzar recarga de turnos (por ejemplo tras publicar una reseña)
		const handleRefreshTurnos = () => {
			console.log('[Turnos] Evento saludmap:refresh-turnos recibido, recargando turnos');
			if (user && user.mail) cargarMisTurnos(user.mail);
		};
		window.addEventListener('saludmap:refresh-turnos', handleRefreshTurnos);
		console.log('[Turnos] Listener registrado exitosamente');

		return () => {
			console.log('[Turnos] Removiendo listener');
			window.removeEventListener('saludmap:change-tab', handleChangeTab);
			window.removeEventListener('saludmap:refresh-turnos', handleRefreshTurnos);
		};
	}, []); // Sin dependencias para evitar re-creación del listener

	// Verificar sessionStorage al montar (respaldo)
	useEffect(() => {
		console.log('[Turnos] Verificando sessionStorage al montar');

		const storedEstablecimiento = sessionStorage.getItem('selectedEstablecimiento');
		const storedPlace = sessionStorage.getItem('selectedPlace');

		if (storedEstablecimiento && storedPlace) {
			console.log('[Turnos] Datos encontrados en sessionStorage');

			try {
				const establecimiento = JSON.parse(storedEstablecimiento);
				const place = JSON.parse(storedPlace);

				console.log('[Turnos] Datos parseados:');
				console.log('[Turnos] - Establecimiento:', establecimiento);
				console.log('[Turnos] - Place:', place);

				// Validar datos
				if (!establecimiento.id) {
					console.error('[Turnos] Establecimiento en storage sin ID');
					sessionStorage.removeItem('selectedEstablecimiento');
					sessionStorage.removeItem('selectedPlace');
					return;
				}

				setPreSelectedEstablecimiento(establecimiento);
				setPreSelectedPlace(place);

				// Limpiar sessionStorage
				sessionStorage.removeItem('selectedEstablecimiento');
				sessionStorage.removeItem('selectedPlace');
				console.log('[Turnos] sessionStorage limpiado');

				// Abrir modal automáticamente, pasando el establecimiento directamente
				setTimeout(() => {
					console.log('[Turnos] Abriendo modal desde sessionStorage con establecimiento:', establecimiento.id);
					openModal(place, establecimiento);
				}, 100);
			} catch (error) {
				console.error('[Turnos] Error parseando sessionStorage:', error);
				sessionStorage.removeItem('selectedEstablecimiento');
				sessionStorage.removeItem('selectedPlace');
			}
		} else {
			console.log('[Turnos] No hay datos en sessionStorage');
		}
	}, []);

	// Cargar turnos cuando cambie el usuario
	useEffect(() => {
		if (user?.mail) {
			console.log('[Turnos] Cargando turnos para usuario:', user.mail);
			cargarMisTurnos(user.mail);
		} else {
			console.log('[Turnos] Sin usuario, limpiando turnos');
			setMisTurnos([]);
		}
	}, [user]);

	// Funciones de turnos
	const cargarMisTurnos = async (emailUsuario) => {
		try {
			console.log('[Turnos] Cargando turnos para:', emailUsuario);
			// Llamar al servicio que obtiene los turnos del backend
			const turnos = await fetchMisTurnos(emailUsuario);
			// Normalizar a la forma usada por la UI si es necesario
			const lista = (turnos || []).map(t => ({
				id: t.id,
				professionalName: t.establecimiento?.nombre || t.professionalName || 'Profesional',
				professionalType: t.establecimiento?.tipo || t.professionalType || 'default',
				datetime: t.fecha ? new Date(t.fecha).toISOString() : (t.datetime || ''),
				notes: t.observaciones || t.notes || '',
				email: t.usuario?.mail || t.email || emailUsuario,
				establecimientoId: t.establecimientoId || t.establecimiento?.id,
				estado: t.estado || 'pendiente'
			}));
			setMisTurnos(sortTurnosDesc(lista));
		} catch (error) {
			console.error('[Turnos] Error cargando turnos:', error);
			setMisTurnos([]);
		}
	};

	const solicitarTurno = async (profesional, fechaHora, observaciones, correo, tipo) => {
		try {
			setLoading(true);
			console.log('[Turnos] Solicitando turno con datos:');
			console.log('[Turnos] - Profesional:', profesional.name);
			console.log('[Turnos] - Fecha/Hora:', fechaHora);
			console.log('[Turnos] - Correo:', correo);
			console.log('[Turnos] - Establecimiento ID:', preSelectedEstablecimiento?.id);

			const { sendAppointmentEmail } = await import('../../services/emailService.js');

			const { emailResponse, payload } = await sendAppointmentEmail(
				profesional,
				fechaHora,
				observaciones,
				correo,
				tipo,
				prettyType
			);

			// Agregar establecimientoId si está disponible
			if (preSelectedEstablecimiento?.id) {
				payload.establecimientoId = preSelectedEstablecimiento.id;
				console.log('[Turnos] Turno vinculado al establecimiento ID:', preSelectedEstablecimiento.id);
			}

			console.log('[Turnos] Guardando turno con payload:', payload);
			const response = await saveAppointment(payload);
			console.log('[Turnos] Turno guardado exitosamente:', response);

			setLoading(false);

			// Agregar a lista local
			const nuevoTurno = {
				id: response.id || Date.now(),
				professionalName: profesional.name || 'Profesional',
				professionalType: tipo,
				datetime: fechaHora,
				notes: observaciones,
				email: correo,
				establecimientoId: preSelectedEstablecimiento?.id
			};

			setMisTurnos(prev => sortTurnosDesc([...prev, nuevoTurno]));

			// Limpiar pre-selección después de crear el turno
			setPreSelectedEstablecimiento(null);
			setPreSelectedPlace(null);

		} catch (error) {
			console.error('[Turnos] Error solicitando turno:', error);
			setLoading(false);
			throw error;
		} finally {
			setLoading(false);
		}
	};

	const cancelarTurno = async (turnoId, correo) => {
		try {
			setCancellingId(turnoId);
			console.log('[Turnos] Cancelando turno (API):', turnoId);

			// Llamar al servicio para cancelar de forma persistente
		const res = await cancelAppointment(turnoId);

			// Axios devuelve un objeto con status
			if (res && (res.status === 200 || res.status === 204)) {
				console.log('[Turnos] Cancelación confirmada por servidor:', res.status);
				setMisTurnos(prev => prev.filter(t => t.id !== turnoId));
			} else {
				console.warn('[Turnos] Respuesta inesperada al cancelar:', res);
				throw new Error('No se pudo cancelar el turno en el servidor');
			}

		} catch (error) {
			console.error('[Turnos] Error cancelando turno:', error);
			alert('Error cancelando turno: ' + (error.message || 'Error desconocido'));
		} finally {
			setCancellingId(null);
		}
	};

	const handleSolicitarTurno = async (datos) => {
		try {
			console.log('[Turnos] Datos recibidos del modal:', datos);
			console.log('[Turnos] Preparando datos para guardar:', {
				usuarioId: user.id,
				establecimientoId: datos.establecimientoId,
				fecha: datos.fecha,
				hora: datos.hora
			});

			// Si el modal no incluyó establecimientoId (race condition o apertura desde lista),
			// intentar usar la pre-selección almacenada en el estado padre.
			if (!datos.establecimientoId && preSelectedEstablecimiento?.id) {
				console.log('[Turnos] establecimientoId faltante en datos del modal, usando preSelectedEstablecimiento:', preSelectedEstablecimiento.id);
				datos.establecimientoId = preSelectedEstablecimiento.id;
			}

			// Si aún no tenemos establecimientoId intentar crear/obtener uno basado en el selected (último recurso)
			if (!datos.establecimientoId && !preSelectedEstablecimiento?.id && selected) {
				try {
					console.log('[Turnos] No hay establecimiento disponible; intentando findOrCreate a último recurso con selected:', selected);
					const placeForCreate = {
						...selected,
						lat: selected.lat ?? selected.center?.lat ?? selected.geometry?.coordinates?.[1] ?? selected.latitude ?? selected.y ?? selected.properties?.lat,
						lng: selected.lng ?? selected.lon ?? selected.center?.lon ?? selected.geometry?.coordinates?.[0] ?? selected.longitude ?? selected.x ?? selected.properties?.lng,
					};
					const estResult = await establecimientosService.findOrCreate(placeForCreate);
					if (estResult?.id) {
						datos.establecimientoId = estResult.id;
						setPreSelectedEstablecimiento(estResult);
						console.log('[Turnos] Establecimiento creado/obtenido en último recurso:', estResult.id);
					}
				} catch (err) {
					console.error('[Turnos] Error en último recurso findOrCreate:', err);
				}
			}

			if (!datos.establecimientoId) {
				alert('Error: No hay establecimiento seleccionado. Por favor intenta nuevamente.');
				return;
			}

			const turnoGuardado = await guardarTurno({
				usuarioId: user.id,
				establecimientoId: datos.establecimientoId,
				fecha: datos.fecha,
				hora: datos.hora
			});

			console.log('[Turnos] Turno guardado exitosamente:', turnoGuardado);
			
			// Cerrar modal y limpiar estados
			// Agregar el turno guardado a la lista local de turnos para mostrarlo en "Mis Turnos"
			try {
				const fechaServidor = turnoGuardado?.fecha ? String(turnoGuardado.fecha) : `${datos.fecha}`;
				const horaServidor = turnoGuardado?.hora ?? datos.hora;
				const datetimeIso = `${fechaServidor.split('T')[0]}T${horaServidor}`;

				const nuevoTurno = {
					id: turnoGuardado?.id || Date.now(),
					professionalName: datos.professionalName || selected?.name || 'Profesional',
					professionalType: datos.professionalType || selectedType,
					datetime: datetimeIso,
					notes: datos.observaciones || datos.observaciones || '',
					email: datos.correo || user.mail,
					establecimientoId: datos.establecimientoId,
					estado: turnoGuardado?.estado || 'pendiente'
				};

				setMisTurnos(prev => sortTurnosDesc([...prev, nuevoTurno]));
			} catch (err) {
				console.warn('[Turnos] No se pudo agregar turno a la lista local:', err);
			}

			setModalOpen(false);
			setPreSelectedEstablecimiento(null);
			setPreSelectedPlace(null);
			alert('Turno solicitado exitosamente');

		} catch (error) {
			console.error('[Turnos] Error al guardar turno:', error);
			alert('Error al solicitar turno: ' + (error.message || 'Error desconocido'));
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

	// Si no está autenticado
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
					{!preSelectedEstablecimiento ? (
						<ProfesionalesList
							lugares={lugares}
							loading={loadingPlaces}
							error={errorPlaces}
							onOpenModal={openModal}
							getTypeFromPlace={getTypeFromPlace}
							prettyType={prettyType}
						/>
					) : (
						<div className="turnos-left">
							<div style={{
								padding: '2rem',
								textAlign: 'center',
								background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
								borderRadius: '12px',
								border: '2px solid #2196f3'
							}}>
								<div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📍</div>
								<h4 style={{ color: '#1976d2', marginBottom: '0.5rem' }}>
									Establecimiento Seleccionado
								</h4>
								<p style={{ color: '#0d47a1', fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem' }}>
									{preSelectedEstablecimiento.nombre}
								</p>
								<p style={{ color: '#1565c0', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
									{preSelectedEstablecimiento.direccion || 'Sin dirección disponible'}
								</p>
								<button
									onClick={() => openModal(preSelectedPlace, preSelectedEstablecimiento)}
									style={{
										padding: '12px 24px',
										fontSize: '1rem',
										backgroundColor: '#2196f3',
										color: 'white',
										border: 'none',
										borderRadius: '8px',
										cursor: 'pointer',
										fontWeight: '600',
										transition: 'all 0.3s ease',
										boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)'
									}}
									onMouseOver={(e) => {
										e.target.style.backgroundColor = '#1976d2';
										e.target.style.transform = 'translateY(-2px)';
										e.target.style.boxShadow = '0 6px 16px rgba(33, 150, 243, 0.4)';
									}}
									onMouseOut={(e) => {
										e.target.style.backgroundColor = '#2196f3';
										e.target.style.transform = 'translateY(0)';
										e.target.style.boxShadow = '0 4px 12px rgba(33, 150, 243, 0.3)';
									}}
								>
									📅 Solicitar Turno
								</button>
							</div>
						</div>
					)}

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
					setCorreo={() => { }}
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