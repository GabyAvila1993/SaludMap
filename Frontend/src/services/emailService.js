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
    prettyTypeFunc
) => {
    const payload = {
        professionalId: selected.id ?? selected.osm_id ?? null,
        professionalName: selected.tags?.name ?? selected.properties?.name ?? 'Profesional',
        datetime,
        notes,
        userEmail: correo,
        userName,
        professionalType: selectedType,
    };

    console.log('[DEBUG] Payload para backend:', payload);

    // Preparar datos para EmailJS (coincide con los placeholders del template)
    const datosCorreo = {
        // {{name}} — nombre del usuario que pide el turno
        name: payload.userName,

        // {{correo}} — correo del usuario (aparece en el cuerpo y en Reply-To)
        correo,

        // {{email}} — destinatario de la notificación (To Email en el template)
        email: 'saludmap4@gmail.com',

        // {{fechaHora}} — fecha y hora seleccionadas por el usuario
        fechaHora: new Date(datetime).toLocaleString('es-AR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }),

        // {{tipo}} — nombre del lugar del turno
        tipo: payload.professionalName,

        // {{observaciones}} — observaciones del usuario o mensaje por defecto
        observaciones: notes || 'NO HAY OBSERVACIONES',

        // {{direccion}} — tipo de establecimiento (hospital, clínica, etc.)
        direccion: prettyTypeFunc(payload.professionalType),

        // reply_to — para que al responder el mail llegue al usuario
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