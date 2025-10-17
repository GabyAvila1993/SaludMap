import { useState, useEffect } from 'react';
import { fetchMisTurnos, cancelAppointment, saveAppointment } from '../services/turnosService';
import { sendAppointmentEmail, initializeEmailJS } from '../services/emailService';

export const useTurnos = () => { // CAMBIO: Sin parámetro correo para evitar dependencia circular
    const [misTurnos, setMisTurnos] = useState([]);
    const [cancellingId, setCancellingId] = useState(null);

    useEffect(() => {
        initializeEmailJS();
    }, []);

    // CAMBIO: Ahora recibe correo como parámetro para evitar dependencias
    const cargarMisTurnos = async (correo) => {
        if (!correo) {
            setMisTurnos([]);
            return;
        }

        try {
            console.log('[DEBUG] Cargando turnos para correo:', correo);
            const arr = await fetchMisTurnos(correo);
            console.log('[DEBUG] Turnos recibidos:', arr);
            const sortDesc = (a = []) => [...a].sort((x, y) => {
                const tx = Date.parse(x.datetime || x.fecha || '') || 0;
                const ty = Date.parse(y.datetime || y.fecha || '') || 0;
                return ty - tx;
            });
            setMisTurnos(sortDesc(arr));
        } catch (e) {
            console.warn('Error cargando mis turnos', e);
            setMisTurnos([]);
        }
    };

    const cancelarTurno = async (id, correo) => { // CAMBIO: Ahora recibe correo como parámetro
        try {
            setCancellingId(id);
            console.log('[DEBUG] Cancelando turno ID:', id);

            const res = await cancelAppointment(id);
            console.log('[DEBUG] Respuesta cancelación:', res);

            // CORRECCIÓN: Filtrar correctamente por ID para evitar cancelar todos los turnos
            if (res?.data?.id || res?.status === 200) {
                setMisTurnos((prev) => {
                    const filteredTurnos = prev.filter((t) => {
                        const turnoId = t.id || t._id || t.professionalId;
                        const cancelledId = res.data?.id || id;
                        console.log('[DEBUG] Comparando turnoId:', turnoId, 'vs cancelledId:', cancelledId);
                        return turnoId !== cancelledId;
                    });
                    console.log('[DEBUG] Turnos después de filtrar:', filteredTurnos);
                    return filteredTurnos;
                });
            }

            await cargarMisTurnos(correo);

        } catch (err) {
            console.error('[Turnos] error cancelando turno', err);
            alert('Error cancelando turno: ' + (err?.response?.data?.message ?? err.message));
        } finally {
            setCancellingId(null);
        }
    };

    const solicitarTurno = async (selected, datetime, notes, correo, selectedType, prettyTypeFunc) => {
        try {
            try {
                const payload = {
                    professionalId: selected.id ?? selected.osm_id ?? null,
                    professionalName: selected.tags?.name ?? selected.properties?.name ?? 'Profesional',
                    datetime,
                    notes,
                    user: correo,
                    professionalType: selectedType,
                };
                await saveAppointment(payload);
                console.log('[DEBUG] Turno guardado en backend');
            } catch (backendError) {
                console.error('[DEBUG] ❌ Error en backend:', backendError);
            }

            const { emailResponse } = await sendAppointmentEmail(
                selected,
                datetime,
                notes,
                correo,
                selectedType,
                prettyTypeFunc
            );

            await cargarMisTurnos(correo); // CAMBIO: Pasar correo aquí

            return { success: true, emailResponse };
        } catch (error) {
            console.error('[DEBUG] ❌ Error completo:', error);
            throw error;
        }
    };

    return {
        misTurnos,
        cancellingId,
        cargarMisTurnos, // CAMBIO: Exportar función para llamar manualmente
        cancelarTurno,
        solicitarTurno
    };
};
