import emailjs from '@emailjs/browser';

export const initializeEmailJS = () => {
    console.log('[DEBUG] Inicializando EmailJS...');
    emailjs.init('jBIfJ7kR2vFO0xd0e');
    console.log('[DEBUG] EmailJS inicializado con public key');
};

export const sendAppointmentEmail = async (
    selected,
    datetime,
    notes,
    correo,
    userName,
    selectedType,
    prettyTypeFunc,
    especialidadNombre   // NUEVO parámetro
) => {
    const payload = {
        professionalId:   selected.id ?? selected.osm_id ?? null,
        professionalName: selected.tags?.name ?? selected.properties?.name ?? selected.name ?? 'Profesional',
        datetime,
        notes,
        userEmail:        correo,
        userName,
        professionalType: selectedType,
    };

    console.log('[DEBUG] Payload para backend:', payload);

    const datosCorreo = {
        // {{name}} — nombre del usuario que pide el turno
        name: payload.userName,
        // {{correo}} — correo del usuario
        correo,
        // {{email}} — destinatario de la notificación
        email: 'saludmap4@gmail.com',
        // {{fechaHora}} — fecha y hora seleccionadas
        fechaHora: new Date(datetime).toLocaleString('es-AR', {
            year:   'numeric',
            month:  'long',
            day:    'numeric',
            hour:   '2-digit',
            minute: '2-digit'
        }),
        // {{tipo}} — nombre del lugar del turno
        tipo: payload.professionalName,
        // {{observaciones}} — observaciones o mensaje por defecto
        observaciones: notes || 'NO HAY OBSERVACIONES',
        // {{direccion}} — MODIFICADO: ahora muestra la especialidad
        direccion: especialidadNombre || prettyTypeFunc(payload.professionalType),
        // reply_to — para que al responder llegue al usuario
        reply_to: correo,
    };

    console.log('[DEBUG] Datos para EmailJS:', datosCorreo);

    const emailResponse = await emailjs.send(
        'service_fr86hqi',
        'template_j524jbg',
        datosCorreo,
        'jBIfJ7kR2vFO0xd0e'
    );

    console.log('[DEBUG] ✅ Respuesta EmailJS:', emailResponse);
    console.log('[DEBUG] Status:', emailResponse.status);
    console.log('[DEBUG] Text:', emailResponse.text);

    return { emailResponse, payload };
};