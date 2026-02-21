import emailjs from '@emailjs/browser';

export const initializeEmailJS = () => {
    // console.log('[DEBUG] Inicializando EmailJS...');
    emailjs.init('jBIfJ7kR2vFO0xd0e'); // tu public key
    // console.log('[DEBUG] EmailJS inicializado con public key');
};

export const sendAppointmentEmail = async (selected, datetime, notes, correo, selectedType, prettyTypeFunc) => {
    const payload = {
        professionalId: selected.id ?? selected.osm_id ?? null,
        professionalName: selected.tags?.name ?? selected.properties?.name ?? 'Profesional',
        datetime,
        notes,
        user: correo,
        professionalType: selectedType,
    };

    // console.log('[DEBUG] Payload para backend:', payload);

    // Preparar datos para EmailJS
    const datosCorreo = {
        to_email: correo,
        correo: correo,
        user_email: correo,
        email: correo,
        to: correo,
        profesional: payload.professionalName,
        direccion: selected.tags?.addr_full ?? selected.tags?.address ?? 'Dirección no disponible',
        tipo: prettyTypeFunc(payload.professionalType),
        fechaHora: new Date(datetime).toLocaleString('es-AR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }),
        observaciones: notes || 'Sin observaciones',
        message: `Turno solicitado para ${payload.professionalName} el ${new Date(datetime).toLocaleString()}`
    };

    

    const emailResponse = await emailjs.send(
        'service_fr86hqi',
        'template_j524jbg',
        datosCorreo,
        'jBIfJ7kR2vFO0xd0e'
    );

    // console.log('[DEBUG] ✅ Respuesta EmailJS:', emailResponse);
    // console.log('[DEBUG] Status:', emailResponse.status);
    // console.log('[DEBUG] Text:', emailResponse.text);

    return { emailResponse, payload };
};
