import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { toast } from 'sonner';
import opening_hours from "opening_hours";
import './EstablishmentInfo.css';
import { useAuth } from './Auth/AuthContext.jsx';
import ModalAuth from './Auth/ModalAuth.jsx';
import Resenias from './Resenias/Resenias.jsx';
import CrearResenia from './Resenias/CrearResenia.jsx';
import { useResenias } from '../hooks/useResenias';
import establecimientosService from '../services/establecimientosService';
import Analytics from './Analytics/Analytics';

export default function EstablishmentInfo({ place, onClose }) {
	const { user } = useAuth();
	const [showAuthModal, setShowAuthModal] = useState(false);
	const [showRegister, setShowRegister] = useState(false);
	const [showCrearResenia, setShowCrearResenia] = useState(false);
	const [showReseniasModal, setShowReseniasModal] = useState(false);
	const [establecimiento, setEstablecimiento] = useState(null);
	const [loadingEstablecimiento, setLoadingEstablecimiento] = useState(true);
	const [error, setError] = useState('');
	const [processingTurno, setProcessingTurno] = useState(false);
	// Añade un nuevo estado
	const [showStats, setShowStats] = useState(false);

	// Hook de reseñas (solo si tenemos establecimiento)
	const { resenias, loading: loadingResenias, promedioEstrellas, totalResenias, refrescar, agregarReseniaLocal: _agregarReseniaLocal } =
		useResenias(establecimiento?.id);

	// Cargar o crear establecimiento cuando se abre el modal
	useEffect(() => {
		const initEstablecimiento = async () => {
			if (!place) {
				// console.log('[EstablishmentInfo] No hay place, cancelando inicialización');
				return;
			}
			// console.log('[EstablishmentInfo] Inicializando establecimiento con place:', place);
			setLoadingEstablecimiento(true);
			setError('');
			try {
				const est = await establecimientosService.findOrCreate(place);
				if (!est || !est.id) {
					throw new Error('El establecimiento no tiene un ID válido');
				}
				// console.log('[EstablishmentInfo] Establecimiento inicializado correctamente:', est);
				setEstablecimiento(est);
			} catch (error) {
				toast.error('Error al cargar la información del establecimiento');
				setError('No se pudo cargar la información del establecimiento. Por favor intenta nuevamente.');
			} finally {
				setLoadingEstablecimiento(false);
			}
		};
		initEstablecimiento();
	}, [place]);

	if (!place) return null;

	const nombre = place.tags?.name ?? place.properties?.name ?? place.tags?.amenity ?? 'Servicio de salud';
	const coords = [
		place.lat ?? place.center?.lat ?? place.geometry?.coordinates?.[1],
		place.lng ?? place.center?.lon ?? place.geometry?.coordinates?.[0],
	];
	const props = place.properties ?? {};

	const buildAddress = () => {
		const t = place.tags ?? props ?? {};
		const fullCandidates = [t.addr_full, t['addr:full'], t.address, props.address];
		for (const c of fullCandidates) if (c) return String(c);
		const street = t['addr:street'] ?? t.street ?? t['street:name'];
		const number = t['addr:housenumber'] ?? t.housenumber ?? t['street:number'];
		const city = t['addr:city'] ?? t.city ?? props.city ?? t.town ?? t.village;
		const parts = [];
		if (street) parts.push(street);
		if (number) parts.push(number);
		if (city && !parts.includes(city)) parts.push(city);
		if (parts.length) return parts.join(' ');
		const fallback = t['addr:suburb'] ?? t.suburb ?? t.neighbourhood ?? t['addr:postcode'] ?? t.postcode;
		if (fallback) return String(fallback);
		if (coords[0] && coords[1]) return `${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}`;
		return '—';
	};

	const direccion = buildAddress();
	const initial = nombre ? nombre.trim().charAt(0).toUpperCase() : 'E';

	const collectValues = (obj, keys) => {
		const vals = [];
		for (const k of keys) {
			const raw = obj?.[k];
			if (!raw) continue;
			if (Array.isArray(raw)) vals.push(...raw.map(String));
			else if (typeof raw === 'object') {
				for (const v of Object.values(raw)) if (v) vals.push(String(v));
			} else vals.push(String(raw));
		}
		return [...new Set(vals)];
	};

	const tags = place.tags ?? place.properties ?? {};
	// posible imagen del establecimiento (tags comunes)
	const imageUrl = tags.image ?? tags.logo ?? tags.photo ?? place.properties?.image ?? null;
	const phones   = collectValues(tags, ['phone', 'telephone', 'contact:phone', 'contact_phone', 'tel', 'contact']);
	const emails   = collectValues(tags, ['email', 'contact:email', 'contact_email']);
	const websites = collectValues(tags, ['website', 'url', 'contact:website']);
	const socials  = collectValues(tags, ['facebook', 'twitter', 'instagram', 'contact:facebook', 'contact:twitter', 'contact:instagram']);
	const opening  = tags.opening_hours ?? tags['opening_hours:covid'] ?? '';
	const owner    = tags.operator ?? tags.owner ?? tags['contact:owner'] ?? '';
	const extraNotes = tags.notes ?? tags.description ?? place.properties?.description ?? '';

	const AMENITY_ES = {
		hospital: 'Hospital',
		clinic: 'Clínica',
		pharmacy: 'Farmacia',
		doctors: 'Médico',
		doctor: 'Médico',
		dentist: 'Dentista',
		veterinary: 'Veterinaria',
		social_facility: 'Centro social',
		nursing_home: 'Residencia',
		optician: 'Óptico',
		blood_donation: 'Donación de sangre',
		health_post: 'Puesto de salud',
		rehabilitation: 'Rehabilitación',
		ambulance: 'Ambulancia',
	};

	const getFriendlyType = () => {
		const rawType = tags.amenity ?? tags.healthcare ?? tags.shop ?? place.type ?? '';
		if (!rawType) return '';
		const key = String(rawType).toLowerCase();
		if (AMENITY_ES[key]) return AMENITY_ES[key];
		return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
	};

	const friendlyType = getFriendlyType();

	const formatOpeningHours = (opening) => {
		if (!opening) return [];
		try {
			const oh = new opening_hours(opening, {}, { locale: "es" });
			const dias = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];
			return dias.map((dia, i) => {
				const today    = new Date(2023, 0, 2 + i);
				const tomorrow = new Date(2023, 0, 3 + i);
				const intervals = oh.getOpenIntervals(today, tomorrow);
				if (intervals.length === 0) return `${dia}: Cerrado`;
				const formatted = intervals.map(iv =>
					`${iv[0].toTimeString().slice(0, 5)}–${iv[1].toTimeString().slice(0, 5)}`
				).join(", ");
				return `${dia}: ${formatted}`;
			});
		} catch {
			return [opening];
		}
	};

	const openingFormatted = formatOpeningHours(opening);

	const copyToClipboard = async (text) => {
		try {
			await navigator.clipboard.writeText(text);
			toast.success('Coordenadas copiadas al portapapeles');
		} catch (e) {
			toast.error('No se pudo copiar al portapapeles');
		}
	};

	const _osmLink = (lat, lon) => `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=18/${lat}/${lon}`;

	const handleSolicitarTurno = async () => {
		// Verificar autenticación
		if (!user) {
			setShowRegister(false);
			setShowAuthModal(true);
			return;
		}
		// console.log('[EstablishmentInfo] Iniciando solicitud de turno...');
		// console.log('[EstablishmentInfo] Establecimiento actual:', establecimiento);
		// console.log('[EstablishmentInfo] Cargando:', loadingEstablecimiento);

		// Prevenir clicks múltiples
		if (processingTurno) {
			// console.log('[EstablishmentInfo] Ya se está procesando una solicitud');
			return;
		}
		// Esperar si aún está cargando
		if (loadingEstablecimiento) {
			// console.log('[EstablishmentInfo] Esperando a que termine de cargar...');
			setError('Cargando información del establecimiento...');
			return;
		}
		setProcessingTurno(true);
		setError('');
		try {
			// Obtener o crear establecimiento
			let est = establecimiento;
			if (!est || !est.id) {
				// console.log('[EstablishmentInfo] Establecimiento no disponible, creando...');
				setError('Preparando información del establecimiento...');
				est = await establecimientosService.findOrCreate(place);
				if (!est || !est.id) {
					throw new Error('No se pudo crear el establecimiento con un ID válido');
				}
				setEstablecimiento(est);
				// console.log('[EstablishmentInfo] Establecimiento creado exitosamente:', est);
			}
			// Validación final
			if (!est.id) {
				throw new Error('El establecimiento no tiene un ID válido');
			}
			// console.log('[EstablishmentInfo] Establecimiento válido, procediendo...');
			// console.log('[EstablishmentInfo] - ID:', est.id);
			// console.log('[EstablishmentInfo] - Nombre:', est.nombre);
			// console.log('[EstablishmentInfo] - Coordenadas:', est.lat, est.lng);

			// Limpiar error
			setError('');
			// Guardar en sessionStorage como respaldo
			try {
				sessionStorage.setItem('selectedEstablecimiento', JSON.stringify(est));
				sessionStorage.setItem('selectedPlace', JSON.stringify(place));
				// console.log('[EstablishmentInfo] Datos guardados en sessionStorage');
			} catch (storageError) {
				toast.info('No se pudo guardar el establecimiento en caché local');
				// No es crítico, continuar
			}
			// Preparar datos del evento
			const eventDetail = {
				tab: 'turnos',
				establecimiento: est,
				place: place
			};
			const event = new CustomEvent('saludmap:change-tab', {
				detail: eventDetail,
				bubbles: true
			});
			window.dispatchEvent(event);
			// console.log('[EstablishmentInfo] Evento disparado exitosamente');

			// Cerrar modal después de un pequeño delay para asegurar que el evento se procese
			setTimeout(() => {
				onClose();
			}, 100);
		} catch (error) {
			toast.error('Error al procesar la solicitud de turno');
			setError(error.message || 'Error al procesar la solicitud. Por favor intenta nuevamente.');
		} finally {
			setProcessingTurno(false);
		}
	};

	const handleLlamar = (telefono) => {
		window.location.href = `tel:${telefono}`;
	};

	const handleDejarResenia = () => {
		if (!user) {
			setShowRegister(false);
			setShowAuthModal(true);
		} else {
			setShowCrearResenia(true);
		}
	};

	const handleReseniaCreada = () => {
		setShowCrearResenia(false);
		// Actualizar automáticamente el estado local de reseñas
		refrescar();
		// Informar al resto de la app que las reseñas/turnos pueden haber cambiado
		try {
			const ev = new CustomEvent('saludmap:refresh-turnos');
			window.dispatchEvent(ev);
		} catch {
			// no crítico
			toast.info('No se pudo notificar sobre cambios en reseñas');
		}
	};

	const scrollToReseniasSection = () => {
		const reseniasSection = document.getElementById('resenias-section');
		if (reseniasSection) {
			reseniasSection.scrollIntoView({
				behavior: 'smooth',
				block: 'start'
			});
		}
	};

	// Determinar el texto del botón de turno
	const getTurnoButtonText = () => {
		if (processingTurno) return 'Procesando...';
		if (loadingEstablecimiento) return 'Cargando...';
		if (!user) return 'Iniciar Sesión';
		return 'Solicitar Turno';
	};

	const isTurnoButtonDisabled = loadingEstablecimiento || processingTurno;

	return (
		<div className="establishment-overlay" onClick={() => onClose()} role="presentation">
			<div className="establishment-info" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
				<div className="establishment-card">
					{/* Header */}
					<div className="card-header modal-section header-section">
						<div className="card-header-top">
							<button className="card-close" onClick={onClose} aria-label="Cerrar">×</button>
						</div>
						<div className="card-header-main">
							<div>
								<div className="card-title header-title">{nombre}</div>
								<div className="card-type">{friendlyType || (place.type ?? '')}</div>
							</div>
							{imageUrl ? (
								<img className="establishment-photo" src={imageUrl} alt={nombre} />
							) : null}
						</div>
					</div>
					{/* Información principal (grid 2 columnas) */}
					<div className="info-grid modal-section">
						<div className="card-left">
							<div className="avatar">{initial}</div>
							<div className="avatar-label">Establecimiento</div>
						</div>
						<div className="info-content">
							<div className="info-row">
								<div className="info-label">DIRECCIÓN</div>
								<div className="info-value">{direccion || '—'}</div>
							</div>
							{phones.map((p, i) => (
								<div className="info-row" key={`phone-${i}`}>
									<div className="info-label">TELÉFONO</div>
									<div className="info-value"><a href={`tel:${p}`}>{p}</a></div>
								</div>
							))}
							{emails.map((e, i) => (
								<div className="info-row" key={`email-${i}`}>
									<div className="info-label">EMAIL</div>
									<div className="info-value"><a href={`mailto:${e}`}>{e}</a></div>
								</div>
							))}
							{websites.map((w, i) => (
								<div className="info-row" key={`web-${i}`}>
									<div className="info-label">WEB</div>
									<div className="info-value"><a href={w} target="_blank" rel="noreferrer">{w}</a></div>
								</div>
							))}
							{socials.map((s, i) => (
								<div className="info-row" key={`soc-${i}`}>
									<div className="info-label">RED</div>
									<div className="info-value"><a href={s} target="_blank" rel="noreferrer">{s}</a></div>
								</div>
							))}
							{opening && (
								<div className="info-row">
									<div className="info-label">HORARIO</div>
									<div className="info-value">
										{openingFormatted.map((line, i) => <div key={i}>{line}</div>)}
									</div>
								</div>
							)}
							{owner && (
								<div className="info-row">
									<div className="info-label">OPERADOR</div>
									<div className="info-value">{owner}</div>
								</div>
							)}
							{extraNotes && (
								<div className="info-row">
									<div className="info-label">NOTAS</div>
									<div className="info-value">{extraNotes}</div>
								</div>
							)}
							<div className="info-row coordinates-row">
								<div className="info-label">COORDENADAS</div>
								<div className="info-value coords-with-copy">
									<span>{coords[0]?.toFixed(6) ?? '—'}, {coords[1]?.toFixed(6) ?? '—'}</span>
									<button className="copy-btn" onClick={() => copyToClipboard(`${coords[0]},${coords[1]}`)}>Copiar</button>
								</div>
							</div>
							{error && (
								<div className="establishment-error">⚠️ {error}</div>
							)}
						</div>
					</div>
					{/* Botones de acción en grid 2x2 */}
					<div className="action-buttons modal-section">
						{phones.length > 0 && (
							<button onClick={() => handleLlamar(phones[0])} className="action-btn">
								Llamar
							</button>
						)}
						<button
							onClick={handleSolicitarTurno}
							className="action-btn primary"
							disabled={isTurnoButtonDisabled}
						>
							{getTurnoButtonText()}
						</button>
						{establecimiento && (
							<button onClick={handleDejarResenia} className="action-btn">
								Dejar Reseña
							</button>
						)}
						{establecimiento && (
							<button onClick={() => setShowReseniasModal(true)} className="action-btn">
								Ver Reseñas
							</button>
						)}
						{establecimiento && (
							<button
								onClick={() => setShowStats(!showStats)}
								className="action-btn"
							>
								📊 Estadísticas
							</button>
						)}
					</div>
					{/* Reseñas */}
					<div className="resenias-wrapper modal-section">
						<div className="resenia-promedio">
							<div className="promedio-left">
								<div className="promedio-number">{typeof promedioEstrellas === 'number' ? promedioEstrellas.toFixed(1) : (promedioEstrellas || 0)}</div>
								<div className="promedio-label">{`${typeof promedioEstrellas === 'number' ? promedioEstrellas.toFixed(1) : (promedioEstrellas || 0)} - ${totalResenias || 0} ${totalResenias === 1 ? 'reseña' : 'reseñas'}`}</div>
							</div>
						</div>
						{showStats && establecimiento && (typeof document !== 'undefined' ? ReactDOM.createPortal(
							<div className="analytics-overlay" onClick={() => setShowStats(false)}>
								<div className="analytics-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
									<button className="analytics-close" onClick={() => setShowStats(false)} aria-label="Cerrar">×</button>
									<Analytics establecimientoId={establecimiento.id} place={place} />
								</div>
							</div>, document.body) : null)}
						{establecimiento && !showCrearResenia && (
							<div className="establishment-resenias-section">
								{/* Resumen reducido: ya se muestra en .resenia-promedio arriba */}
							</div>
						)}
						{/* Modal independiente para reseñas */}
						{showReseniasModal && (typeof document !== 'undefined' ? ReactDOM.createPortal(
							<div className="resenias-overlay" onClick={() => setShowReseniasModal(false)}>
								<div className="resenias-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
									<button className="resenias-close" onClick={() => setShowReseniasModal(false)} aria-label="Cerrar">×</button>
									<h3 className="resenias-modal__titulo">Reseñas ({totalResenias || 0})</h3> {/* AQUI TIENES ESTILOS [Tipo: Inline] — style={{ marginTop: 0, color: 'var(--text-color)' }} movido a clase CSS */}
									<Resenias
										resenias={resenias}
										promedioEstrellas={promedioEstrellas}
										totalResenias={totalResenias}
										loading={loadingResenias}
									/>
								</div>
							</div>, document.body) : null)}
						{showCrearResenia && establecimiento && (typeof document !== 'undefined' ? ReactDOM.createPortal(
							<div className="resenias-overlay" onClick={() => setShowCrearResenia(false)}>
								<div className="resenias-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
									<button className="resenias-close" onClick={() => setShowCrearResenia(false)} aria-label="Cerrar">×</button>
									<h3 className="resenias-modal__titulo">Dejar Reseña</h3> {/* AQUI TIENES ESTILOS [Tipo: Inline] — style={{ marginTop: 0, color: 'var(--text-color)' }} movido a clase CSS */}
									<CrearResenia
										establecimientoId={establecimiento.id}
										onSuccess={handleReseniaCreada}
										onCancel={() => setShowCrearResenia(false)}
									/>
								</div>
							</div>, document.body) : null)}
					</div>
				</div>
			</div>
			<ModalAuth
				open={showAuthModal}
				onClose={() => setShowAuthModal(false)}
				showRegister={showRegister}
				setShowRegister={setShowRegister}
			/>
		</div>
	);
}