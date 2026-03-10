// Archivo: src/components/turnos/BuscadorEspecialidades.jsx
import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { getEspecialidades } from '../../services/especialidadesService.js';
import axios from 'axios';

export default function BuscadorEspecialidades({ onSeleccionarEstablecimiento }) {
    const [query, setQuery]                                           = useState('');
    const [todasEspecialidades, setTodasEspecialidades]               = useState([]);
    const [sugerencias, setSugerencias]                               = useState([]);
    const [especialidadSeleccionada, setEspecialidadSeleccionada]     = useState(null);
    const [establecimientos, setEstablecimientos]                     = useState([]);
    const [loadingEst, setLoadingEst]                                 = useState(false);
    const [errorEst, setErrorEst]                                     = useState('');
    const [dropdownVisible, setDropdownVisible]                       = useState(false);
    const [itemFocusado, setItemFocusado]                             = useState(-1);
    const inputRef   = useRef(null);
    const wrapperRef = useRef(null);
    const listRef    = useRef(null);

    // Cargar todas las especialidades al montar
    useEffect(() => {
        getEspecialidades()
            .then(data => setTodasEspecialidades(Array.isArray(data) ? data : []))
            .catch(() => {
                setTodasEspecialidades([]);
                toast.error('No se pudieron cargar las especialidades');
            });
    }, []);

    // Filtrar sugerencias al escribir
    useEffect(() => {
        if (!query.trim()) {
            setSugerencias([]);
            setDropdownVisible(false);
            setItemFocusado(-1);
            return;
        }
        const q = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const filtradas = todasEspecialidades.filter(e =>
            e.nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(q)
        );
        setSugerencias(filtradas);
        setDropdownVisible(filtradas.length > 0);
        setItemFocusado(-1);
    }, [query, todasEspecialidades]);

    // Cerrar dropdown al hacer click fuera
    useEffect(() => {
        const handleClick = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setDropdownVisible(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const buscarEstablecimientos = async (especialidad) => {
        setEspecialidadSeleccionada(especialidad);
        setQuery(especialidad.nombre);
        setDropdownVisible(false);
        setSugerencias([]);
        setEstablecimientos([]);
        setErrorEst('');
        setLoadingEst(true);
        try {
            const res = await axios.get(`/api/establecimientos/especialidad/${especialidad.id}`);
            setEstablecimientos(Array.isArray(res.data) ? res.data : []);
        } catch {
            setErrorEst('No se pudieron cargar los establecimientos');
            toast.error('No se pudieron cargar los establecimientos para esta especialidad');
        } finally {
            setLoadingEst(false);
        }
    };

    const handleLimpiar = () => {
        setQuery('');
        setEspecialidadSeleccionada(null);
        setEstablecimientos([]);
        setErrorEst('');
        setSugerencias([]);
        setDropdownVisible(false);
        setItemFocusado(-1);
        inputRef.current?.focus();
    };

    // Navegación con teclado en el dropdown
    const handleKeyDown = (e) => {
        if (!dropdownVisible || !sugerencias.length) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setItemFocusado(prev => Math.min(prev + 1, sugerencias.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setItemFocusado(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter' && itemFocusado >= 0) {
            e.preventDefault();
            buscarEstablecimientos(sugerencias[itemFocusado]);
        } else if (e.key === 'Escape') {
            setDropdownVisible(false);
        }
    };

    const tipoIcono = (tipo) => {
        if (!tipo) return '🏥';
        const t = tipo.toLowerCase();
        if (t.includes('hospital'))   return '🏥';
        if (t.includes('clinic'))     return '🏨';
        if (t.includes('doctor'))     return '👨‍⚕️';
        if (t.includes('veterinary') || t.includes('veterinaria')) return '🐾';
        return '🏥';
    };

    const renderEstrellas = (promedio, total) => {
        if (!promedio) return null;
        const llenas = Math.floor(promedio);
        const media  = promedio - llenas >= 0.5;
        const vacias = 5 - llenas - (media ? 1 : 0);
        return (
            <div className="buscador__rating">
                <span className="buscador__estrellas" aria-label={`${promedio} de 5 estrellas`}>
                    {'★'.repeat(llenas)}
                    {media ? '½' : ''}
                    {'☆'.repeat(vacias < 0 ? 0 : vacias)}
                </span>
                <span className="buscador__rating-num">{promedio} ({total} reseña{total !== 1 ? 's' : ''})</span>
            </div>
        );
    };

    return (
        <div className="buscador-especialidades">
            {/* Cabecera */}
            <div className="buscador__header">
                <span className="buscador__header-icono">🔍</span>
                <h4 className="buscador__header-titulo">Buscar por especialidad</h4>
                {especialidadSeleccionada && (
                    <button type="button" className="buscador__nueva-busqueda" onClick={handleLimpiar}>
                        Nueva búsqueda
                    </button>
                )}
            </div>
            {/* Input + dropdown */}
            <div className="buscador__input-wrap" ref={wrapperRef}>
                <div className="buscador__input-row">
                    <span className="buscador__input-icono" aria-hidden="true">🔍</span>
                    <input
                        ref={inputRef}
                        type="text"
                        className="buscador__input"
                        placeholder="Ej: Cardiología, Pediatría, Psicología..."
                        value={query}
                        autoComplete="off"
                        onChange={(e) => {
                            setQuery(e.target.value);
                            if (especialidadSeleccionada) {
                                setEspecialidadSeleccionada(null);
                                setEstablecimientos([]);
                            }
                        }}
                        onFocus={() => sugerencias.length > 0 && setDropdownVisible(true)}
                        onKeyDown={handleKeyDown}
                        aria-autocomplete="list"
                        aria-expanded={dropdownVisible}
                    />
                    {query && (
                        <button
                            type="button"
                            className="buscador__limpiar"
                            onClick={handleLimpiar}
                            aria-label="Limpiar búsqueda"
                        >×</button>
                    )}
                </div>
                {/* Dropdown */}
                {dropdownVisible && sugerencias.length > 0 && (
                    <ul className="buscador__dropdown" ref={listRef} role="listbox">
                        {sugerencias.map((esp, idx) => (
                            <li
                                key={esp.id}
                                role="option"
                                aria-selected={idx === itemFocusado}
                                className={`buscador__dropdown-item${idx === itemFocusado ? ' buscador__dropdown-item--focus' : ''}`}
                                onMouseDown={() => buscarEstablecimientos(esp)}
                                onMouseEnter={() => setItemFocusado(idx)}
                            >
                                <span className="buscador__dropdown-nombre">{esp.nombre}</span>
                                {esp.descripcion && (
                                    <span className="buscador__dropdown-desc">{esp.descripcion}</span>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            {/* Resultados */}
            {especialidadSeleccionada && (
                <div className="buscador__resultados">
                    {loadingEst && (
                        <div className="buscador__loading">
                            <span className="buscador__spinner" aria-hidden="true" />
                            Buscando establecimientos...
                        </div>
                    )}
                    {errorEst && <div className="turnos-error">{errorEst}</div>}
                    {!loadingEst && !errorEst && establecimientos.length === 0 && (
                        <div className="buscador__vacio">
                            <span className="buscador__vacio-icono">🏥</span>
                            <p>No hay establecimientos con <strong>{especialidadSeleccionada.nombre}</strong> disponible.</p>
                        </div>
                    )}
                    {!loadingEst && establecimientos.length > 0 && (
                        <>
                            <p className="buscador__subtitulo">
                                <strong>{establecimientos.length}</strong> establecimiento{establecimientos.length !== 1 ? 's' : ''} con&nbsp;
                                <strong>{especialidadSeleccionada.nombre}</strong>
                            </p>
                            <ul className="buscador__lista">
                                {establecimientos.map(est => (
                                    <li key={est.id} className="buscador__card">
                                        <div className="buscador__card-body">
                                            <div className="buscador__card-top">
                                                <span className="buscador__card-icono">{tipoIcono(est.tipo)}</span>
                                                <div className="buscador__card-info">
                                                    <span className="buscador__card-nombre">{est.nombre}</span>
                                                    {est.tipo && (
                                                        <span className="buscador__card-tipo">{est.tipo}</span>
                                                    )}
                                                </div>
                                            </div>
                                            {est.direccion && (
                                                <span className="buscador__card-dir">📍 {est.direccion}</span>
                                            )}
                                            {est.horariosDisponibles && (
                                                <span className="buscador__card-horario">🕐 {est.horariosDisponibles}</span>
                                            )}
                                            {est.promedioEstrellas && renderEstrellas(est.promedioEstrellas, est.totalResenias)}
                                        </div>
                                        <button
                                            type="button"
                                            className="button--primary buscador__card-btn"
                                            onClick={() => onSeleccionarEstablecimiento(est, especialidadSeleccionada)}
                                        >
                                            📅 Solicitar turno
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}