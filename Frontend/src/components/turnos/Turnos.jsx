import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './Turnos.css';
import locationService from '../../services/locationService.js';
import turnosService, { saveAppointment, guardarTurno, fetchMisTurnos, cancelAppointment } from '../../services/turnosService.js';
import { initializeEmailJS, sendAppointmentEmail } from '../../services/emailService.js';
import { useAuth } from '../Auth/AuthContext.jsx';
import ModalAuth from '../Auth/ModalAuth.jsx';
import { ProfesionalesList } from './ProfesionalesList2.jsx';
import { MisTurnosList } from './MisTurnosList2.jsx';
import { TurnoModal } from './TurnoModal2.jsx';
import CostComparator from './CostComparator.jsx';
import establecimientosService from '../../services/establecimientosService';

const getTypeFromPlace = (place) => place.type || 'default';

export default function Turnos() {
	const { t } = useTranslation();
	const { user } = useAuth();
	const [showAuthModal, setShowAuthModal] = useState(false);
	const [showRegister, setShowRegister] = useState(false);

	const prettyType = (type) =>
		t(`appointments.types.${type}`, { defaultValue: t('appointments.types.default') });

	const [modalOpen, setModalOpen] = useState(false);
	const [selected, setSelected] = useState(null);
	const [datetime, setDatetime] = useState('');
	const [notes, setNotes] = useState('');
	const [selectedType, setSelectedType] = useState('default');
	const [loading, setLoading] = useState(false);
	const [error, _setError] = useState('');
	const [lugares, setLugares] = useState([]);
	const [loadingPlaces, setLoadingPlaces] = useState(false);
	const [errorPlaces, setErrorPlaces] = useState('');
	const [misTurnos, setMisTurnos] = useState([]);
	const [cancellingId, setCancellingId] = useState(null);
	const [preSelectedEstablecimiento, setPreSelectedEstablecimiento] = useState(null);
	const [preSelectedPlace, setPreSelectedPlace] = useState(null);
	const [showCostComparator, setShowCostComparator] = useState(false);

	const sortTurnosDesc = (arr = []) => {
		try {
			return [...arr].sort((a, b) => {
				const ta = Date.parse(a.datetime || a.fecha || '') || 0;
				const tb = Date.parse(b.datetime || b.fecha || '') || 0;
				return tb - ta;
			});
		} catch {
			return [...arr];
		}
	};

	const openModal = async (prof, establecimientoOverride = null) => {
		const tags = prof.tags || prof.properties || {};
		let est = establecimientoOverride || preSelectedEstablecimiento;

		if (!est) {
			try {
				const placeForCreate = {
					...prof,
					lat: prof.lat ?? prof.center?.lat ?? prof.geometry?.coordinates?.[1] ?? prof.latitude ?? prof.y ?? prof.properties?.lat,
					lng: prof.lng ?? prof.lon ?? prof.center?.lon ?? prof.geometry?.coordinates?.[0] ?? prof.longitude ?? prof.x ?? prof.properties?.lng,
				};
				const estResult = await establecimientosService.findOrCreate(placeForCreate);
				est = estResult;
				setPreSelectedEstablecimiento(estResult);
				setPreSelectedPlace(placeForCreate);
			} catch {
				alert('Error al preparar el establecimiento. Por favor intenta desde el mapa o reintenta.');
				return;
			}
		}

		setSelected({
			...prof,
			name: prof.name || tags.name || prof.properties?.name || tags.amenity || 'Establecimiento de salud',
			address: prof.direccion || prof.address || tags.addr_full || tags['addr:full'] || tags.address || prof.properties?.address || '',
			establecimientoId: est?.id,
			establecimientoNombre: est?.nombre || tags.name || 'Establecimiento'
		});
		setDatetime('');
		setNotes('');
		setSelectedType(getTypeFromPlace(prof));
		setModalOpen(true);
	};

	// Suscripción a profesionales
	useEffect(() => {
		initializeEmailJS();
		const unsubscribe = turnosService.subscribe(({ lugares, loading, error }) => {
			setLugares((lugares || []).map(lugar => {
				const tags = lugar.tags || lugar.properties || {};
				return {
					...lugar,
					name: lugar.name || tags.name || lugar.properties?.name || tags.amenity || 'Establecimiento de salud',
					address: lugar.address || lugar.direccion || tags.addr_full || tags['addr:full'] || tags.address || lugar.properties?.address || ''
				};
			}));
			setLoadingPlaces(loading || false);
			setErrorPlaces(error || '');
		});
		turnosService.initialize();
		return unsubscribe;
	}, []);

	// Eventos de ubicación del mapa
	useEffect(() => {
		const handleLocationChange = (e) => {
			const { lat, lng, source } = e.detail;
			if (lat && lng && source === 'manual') {
				locationService.setManualLocation(lat, lng);
			}
		};
		window.addEventListener('saludmap:pos-changed', handleLocationChange);
		return () => window.removeEventListener('saludmap:pos-changed', handleLocationChange);
	}, []);

	// Eventos del mapa para turno
	useEffect(() => {
		const handleChangeTab = (e) => {
			if (e.detail?.tab !== 'turnos') return;
			const { establecimiento, place } = e.detail;
			if (!establecimiento?.id || !place) {
				alert('Error: No se recibió información completa del establecimiento.');
				return;
			}
			setPreSelectedEstablecimiento(establecimiento);
			setPreSelectedPlace(place);
			setTimeout(() => openModal(place, establecimiento), 100);
		};
		const handleRefreshTurnos = () => {
			if (user?.mail) cargarMisTurnos(user.mail);
		};
		window.addEventListener('saludmap:change-tab', handleChangeTab);
		window.addEventListener('saludmap:refresh-turnos', handleRefreshTurnos);
		return () => {
			window.removeEventListener('saludmap:change-tab', handleChangeTab);
			window.removeEventListener('saludmap:refresh-turnos', handleRefreshTurnos);
		};
	}, []);

	// sessionStorage al montar
	useEffect(() => {
		const storedEst = sessionStorage.getItem('selectedEstablecimiento');
		const storedPlace = sessionStorage.getItem('selectedPlace');
		if (storedEst && storedPlace) {
			try {
				const establecimiento = JSON.parse(storedEst);
				const place = JSON.parse(storedPlace);
				sessionStorage.removeItem('selectedEstablecimiento');
				sessionStorage.removeItem('selectedPlace');
				if (!establecimiento.id) return;
				setPreSelectedEstablecimiento(establecimiento);
				setPreSelectedPlace(place);
				setTimeout(() => openModal(place, establecimiento), 100);
			} catch {
				sessionStorage.removeItem('selectedEstablecimiento');
				sessionStorage.removeItem('selectedPlace');
			}
		}
	}, []);

	// Cargar turnos cuando cambie el usuario
	useEffect(() => {
		if (user?.mail) {
			cargarMisTurnos(user.mail);
		} else {
			setMisTurnos([]);
		}
	}, [user]);

	const cargarMisTurnos = async (emailUsuario) => {
		try {
			const turnos = await fetchMisTurnos(emailUsuario);
			setMisTurnos(sortTurnosDesc(
				(turnos || []).map(t => ({
					id: t.id,
					professionalName: t.establecimiento?.nombre || t.professionalName || 'Profesional',
					professionalType: t.establecimiento?.tipo || t.professionalType || 'default',
					especialidad: t.especialidad?.nombre || '',  // NUEVO
					datetime: (() => {
						if (t.fecha) {
							try {
								const base = new Date(t.fecha);
								let hh = 0, mm = 0, ss = 0;
								if (t.hora) {
									const parts = String(t.hora).split(':').map(p => parseInt(p, 10));
									hh = isNaN(parts[0]) ? 0 : parts[0];
									mm = isNaN(parts[1]) ? 0 : parts[1];
									ss = isNaN(parts[2]) ? 0 : (parts[2] || 0);
								}
								const y = base.getUTCFullYear();
								const m = base.getUTCMonth();
								const d = base.getUTCDate();
								const combined = new Date(y, m, d, hh, mm, ss, 0);
								return combined.toISOString();
							} catch {
								return new Date(t.fecha).toISOString();
							}
						}
						return t.datetime || '';
					})(),
					notes: t.observaciones || t.notes || '',
					email: t.usuario?.mail || t.email || emailUsuario,
					establecimientoId: t.establecimientoId || t.establecimiento?.id,
					estado: t.estado || 'pendiente'
				}))
			));
		} catch {
			setMisTurnos([]);
		}
	};

	const cancelarTurno = async (turnoId) => {
		try {
			setCancellingId(turnoId);
			const res = await cancelAppointment(turnoId);
			if (res && (res.status === 200 || res.status === 204)) {
				setMisTurnos(prev => prev.filter(t => t.id !== turnoId));
			} else {
				throw new Error('No se pudo cancelar el turno en el servidor');
			}
		} catch (err) {
			alert('Error cancelando turno: ' + (err.message || 'Error desconocido'));
		} finally {
			setCancellingId(null);
		}
	};

	const handleSolicitarTurno = async (datos) => {
		try {
			// Completar establecimientoId si falta
			if (!datos.establecimientoId && preSelectedEstablecimiento?.id) {
				datos.establecimientoId = preSelectedEstablecimiento.id;
			}
			if (!datos.establecimientoId && selected) {
				try {
					const placeForCreate = {
						...selected,
						lat: selected.lat ?? selected.center?.lat ?? selected.geometry?.coordinates?.[1] ?? selected.latitude ?? selected.y ?? selected.properties?.lat,
						lng: selected.lng ?? selected.lon ?? selected.center?.lon ?? selected.geometry?.coordinates?.[0] ?? selected.longitude ?? selected.x ?? selected.properties?.lng,
					};
					const estResult = await establecimientosService.findOrCreate(placeForCreate);
					if (estResult?.id) {
						datos.establecimientoId = estResult.id;
						setPreSelectedEstablecimiento(estResult);
					}
				} catch { /* falla silenciosa */ }
			}

			if (!datos.establecimientoId) {
				alert('Error: No hay establecimiento seleccionado. Por favor intenta nuevamente.');
				return;
			}

			// MODIFICADO: ahora incluye especialidadId
			const turnoGuardado = await guardarTurno({
				usuarioId: user.id,
				establecimientoId: datos.establecimientoId,
				especialidadId: datos.especialidadId, // NUEVO
				fecha: datos.fecha,
				hora: datos.hora
			});

			// Enviar email de confirmación
			try {
				await sendAppointmentEmail(
					selected,
					`${datos.fecha.split('T')[0]}T${datos.hora}`,
					datos.observaciones || '',
					user.mail,
					`${user.nombre} ${user.apellido}`,
					selectedType,
					prettyType
				);
			} catch (emailError) {
				console.error('[Turnos] ⚠️ Turno guardado pero error al enviar email:', emailError);
			}

			// Agregar a lista local
			try {
				const fechaStr = turnoGuardado?.fecha ? String(turnoGuardado.fecha) : datos.fecha;
				const horaStr = turnoGuardado?.hora ?? datos.hora;
				const nuevoTurno = {
					id: turnoGuardado?.id || Date.now(),
					professionalName: datos.professionalName || selected?.name || 'Profesional',
					professionalType: datos.professionalType || selectedType,
					especialidad: datos.especialidadNombre || '', // NUEVO
					datetime: `${fechaStr.split('T')[0]}T${horaStr}`,
					notes: datos.observaciones || '',
					email: datos.correo || user.mail,
					establecimientoId: datos.establecimientoId,
					estado: turnoGuardado?.estado || 'pendiente'
				};
				setMisTurnos(prev => sortTurnosDesc([...prev, nuevoTurno]));
			} catch { /* error al agregar localmente, no crítico */ }

			setModalOpen(false);
			setPreSelectedEstablecimiento(null);
			setPreSelectedPlace(null);
			alert('Turno solicitado exitosamente');
		} catch (err) {
			alert('Error al solicitar turno: ' + (err.message || 'Error desconocido'));
		}
	};

	const handleCancelarTurno = async (id) => {
		if (!user?.mail) {
			alert(t('appointments.errorCancelNoEmail'));
			return;
		}
		if (!window.confirm(t('appointments.confirmCancel'))) return;
		await cancelarTurno(id);
	};

	// ── Vista no autenticada ────────────────────────────────────
	if (!user) {
		return (
			<div className="turnos-section">
				<div className="turnos-root">
					<header className="turnos-header">
						<span className="turnos-badge">{t('appointments.badge')}</span>
						<h3>{t('appointments.requestAppointments')}</h3>
					</header>
					<div className="turnos-auth-required">
						<div className="auth-required-card">
							<span className="auth-lock-emoji">🔒</span>
							<h3 className="auth-title">Autenticación Requerida</h3>
							<p className="auth-desc">
								Debés iniciar sesión para ver y solicitar turnos médicos.
							</p>
							<button
								className="auth-btn"
								onClick={() => { setShowRegister(false); setShowAuthModal(true); }}
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

	// ── Vista autenticada ───────────────────────────────────────
	return (
		<div className="turnos-section">
			<div className="turnos-root">
				<header className="turnos-header">
					<span className="turnos-badge turnos-badge--dark">{t('appointments.badge')}</span>
					<h3>{t('appointments.requestAppointments')}</h3>
					<button className="button--primary compare-btn" onClick={() => setShowCostComparator(true)}>
						Comparar costos
					</button>
					<div className="user-info">
						<strong>{user.nombre} {user.apellido}</strong> · {user.mail}
					</div>
				</header>
				<div className="turnos-body">
					{/* Panel izquierdo */}
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
							<div className="selected-est-card">
								<span className="selected-est-emoji">📍</span>
								<h4 className="selected-est-title">Establecimiento Seleccionado</h4>
								<p className="selected-est-name">{preSelectedEstablecimiento.nombre}</p>
								<p className="selected-est-addr">
									{preSelectedEstablecimiento.direccion || 'Sin dirección disponible'}
								</p>
								<button
									className="selected-est-button"
									onClick={() => openModal(preSelectedPlace, preSelectedEstablecimiento)}
								>
									📅 Solicitar Turno
								</button>
							</div>
						</div>
					)}

					{/* Panel derecho — Mis Turnos */}
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

				{showCostComparator && (
					<CostComparator places={lugares} onClose={() => setShowCostComparator(false)} />
				)}
			</div>
		</div>
	);
}