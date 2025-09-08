import emailjs from '@emailjs/browser';

// Configuración de EmailJS
const PUBLIC_KEY = 'jBIfJ7kR2vFO0xd0e';
const SERVICE_ID = 'service_fr86hqi';
const TEMPLATE_ID = 'template_if7eh5b';

// Inicializar EmailJS
export const initializeEmailJS = () => {
    emailjs.init(PUBLIC_KEY);
    console.log('[DEBUG] EmailJS inicializado con clave:', PUBLIC_KEY);
};

// Función de prueba simplificada
export const sendTestEmail = async (userInfo, plan) => {
    try {
        console.log('[DEBUG] Enviando email de prueba...');
        
        // Datos mínimos para probar (incluyendo campo TO para EmailJS)
        const testData = {
            to_email: userInfo.email,  // Campo TO requerido por EmailJS
            to_name: userInfo.name,    // Nombre del destinatario
            customer_name: userInfo.name,
            customer_email: userInfo.email,
            order_id: 'TEST-' + Date.now(),
            plan_name: plan.name,
            plan_price: plan.price
        };
        
        console.log('[DEBUG] Datos de prueba:', testData);
        
        const response = await emailjs.send(
            SERVICE_ID,
            TEMPLATE_ID,
            testData,
            PUBLIC_KEY
        );
        
        console.log('[DEBUG] ✅ Email de prueba enviado:', response);
        return { success: true, response };
        
    } catch (error) {
        console.error('[ERROR] Error en email de prueba:', error);
        
        // Información detallada del error
        console.error('Error status:', error.status);
        console.error('Error text:', error.text);
        console.error('Error message:', error.message);
        
        return { 
            success: false, 
            error: error,
            status: error.status,
            text: error.text,
            message: error.message
        };
    }
};
