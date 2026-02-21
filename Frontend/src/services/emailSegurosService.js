import emailjs from '@emailjs/browser';
import { PDFGenerator } from '../components/CardsSegure/PDFGenerator';

// Inicializar EmailJS (usa la misma configuración que el servicio existente)
export const initializeEmailJS = () => {
    // console.log('[DEBUG] Inicializando EmailJS para seguros...');
    emailjs.init('jBIfJ7kR2vFO0xd0e'); // tu public key existente
    // console.log('[DEBUG] EmailJS inicializado para seguros');
};

// Generar PDF como base64 para adjuntar al correo
const _generatePDFBase64 = async (plan, userInfo) => {
    try {
        // Crear un nuevo documento PDF
        const { jsPDF } = await import('jspdf');
        const doc = new jsPDF();
        
        // Header
        doc.setFontSize(20);
        doc.text('Tarjeta de Seguro Médico', 20, 30);
        
        // Plan information
        doc.setFontSize(16);
        doc.text(`Plan: ${plan.name}`, 20, 50);
        doc.setFontSize(12);
        doc.text(`Precio: $${plan.price}/mes`, 20, 65);
        
        // User information
        doc.setFontSize(14);
        doc.text('Información del Asegurado:', 20, 85);
        doc.setFontSize(12);
        doc.text(`Nombre: ${userInfo.name}`, 20, 100);
        doc.text(`Email: ${userInfo.email}`, 20, 115);
        doc.text(`Teléfono: ${userInfo.phone}`, 20, 130);
        doc.text(`Dirección: ${userInfo.address}`, 20, 145);
        
        // Coverage
        doc.setFontSize(14);
        doc.text('Cobertura:', 20, 165);
        doc.setFontSize(12);
        plan.coverage.forEach((item, index) => {
            doc.text(`• ${item}`, 25, 180 + (index * 15));
        });
        
        // Convertir a base64
        const pdfBase64 = doc.output('datauristring').split(',')[1];
        return pdfBase64;
    } catch (error) {
        console.error('Error generando PDF base64:', error);
        return null;
    }
};

// Plantilla HTML para el correo de confirmación de seguro
const _createInsuranceEmailTemplate = (plan, userInfo, orderId) => {
    return `
    <div style="font-family: system-ui, sans-serif, Arial; font-size: 14px; color: #333; padding: 14px 8px; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: auto; background-color: #fff">
            <div style="border-top: 6px solid #47472e; padding: 16px">
                <span style="font-size: 18px; vertical-align: middle; color: #47472e;">
                    <strong>🛡️ Confirmación de Seguro Médico - SaludMap</strong>
                </span>
            </div>
            <div style="padding: 0 16px">
                <p style="font-size: 16px; color: #47472e;">
                    <strong>¡Felicitaciones ${userInfo.name}!</strong>
                </p>
                <p>Tu seguro médico ha sido contratado exitosamente. Te enviamos los detalles de tu póliza y tu tarjeta de seguro como archivo adjunto.</p>
                
                <div style="text-align: left; font-size: 14px; padding-bottom: 4px; border-bottom: 2px solid #47472e;">
                    <strong>Póliza # ${orderId}</strong>
                </div>
                
                <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                    <tr style="vertical-align: top">
                        <td style="padding: 24px 8px 0 4px; display: inline-block; width: max-content">
                            <div style="width: 64px; height: 64px; background-color: #47472e; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #ffe0a6; font-size: 24px; font-weight: bold;">
                                🛡️
                            </div>
                        </td>
                        <td style="padding: 24px 8px 0 8px; width: 100%">
                            <div style="font-size: 18px; font-weight: bold; color: #47472e;">${plan.name}</div>
                            <div style="font-size: 14px; color: #666; padding-top: 4px; line-height: 1.4;">
                                ${plan.description}
                            </div>
                            <div style="font-size: 12px; color: #888; padding-top: 8px;">
                                Vigencia: Mensual renovable
                            </div>
                        </td>
                        <td style="padding: 24px 4px 0 0; white-space: nowrap">
                            <strong style="font-size: 18px; color: #47472e;">$${plan.price}/mes</strong>
                        </td>
                    </tr>
                </table>
                
                <div style="padding: 24px 0">
                    <div style="border-top: 2px solid #47472e"></div>
                </div>
                
                <div style="background-color: #f8f9fa; padding: 16px; border-radius: 8px; border-left: 4px solid #ffe0a6; margin: 20px 0;">
                    <h3 style="margin: 0 0 12px 0; color: #47472e; font-size: 16px;">Información del Asegurado:</h3>
                    <p style="margin: 4px 0; font-size: 14px;"><strong>Nombre:</strong> ${userInfo.name}</p>
                    <p style="margin: 4px 0; font-size: 14px;"><strong>Email:</strong> ${userInfo.email}</p>
                    <p style="margin: 4px 0; font-size: 14px;"><strong>Teléfono:</strong> ${userInfo.phone}</p>
                    <p style="margin: 4px 0; font-size: 14px;"><strong>Dirección:</strong> ${userInfo.address}</p>
                </div>
                
                <div style="background-color: #f0f8f0; padding: 16px; border-radius: 8px; border-left: 4px solid #47472e; margin: 20px 0;">
                    <h3 style="margin: 0 0 12px 0; color: #47472e; font-size: 16px;">Cobertura Incluida:</h3>
                    <ul style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6;">
                        ${plan.coverage.map(item => `<li style="margin: 4px 0;">${item}</li>`).join('')}
                    </ul>
                </div>
                
                <table style="border-collapse: collapse; width: 100%; text-align: right; margin-top: 20px;">
                    <tr>
                        <td style="width: 60%"></td>
                        <td>Prima Mensual</td>
                        <td style="padding: 8px; white-space: nowrap">$${plan.price}</td>
                    </tr>
                    <tr>
                        <td style="width: 60%"></td>
                        <td>Impuestos</td>
                        <td style="padding: 8px; white-space: nowrap">$0</td>
                    </tr>
                    <tr>
                        <td style="width: 60%"></td>
                        <td style="border-top: 2px solid #47472e">
                            <strong style="white-space: nowrap">Total Mensual</strong>
                        </td>
                        <td style="padding: 16px 8px; border-top: 2px solid #47472e; white-space: nowrap">
                            <strong style="color: #47472e;">$${plan.price}</strong>
                        </td>
                    </tr>
                </table>
                
                <div style="background-color: #fffbf0; padding: 16px; border-radius: 8px; border: 1px solid #ffe0a6; margin: 20px 0;">
                    <p style="margin: 0; font-size: 14px; color: #47472e;">
                        <strong>📎 Archivo Adjunto:</strong> Tu tarjeta de seguro médico está adjunta a este correo en formato PDF. 
                        Guárdala en tu dispositivo y preséntala cuando necesites atención médica.
                    </p>
                </div>
                
                <div style="text-align: center; padding: 20px 0;">
                    <p style="font-size: 16px; color: #47472e; margin: 0;">
                        <strong>¡Bienvenido a SaludMap!</strong>
                    </p>
                    <p style="font-size: 14px; color: #666; margin: 8px 0 0 0;">
                        Tu salud está protegida con nosotros
                    </p>
                </div>
            </div>
        </div>
        <div style="max-width: 600px; margin: auto">
            <p style="color: #999; font-size: 12px; text-align: center; padding: 20px;">
                Este correo fue enviado a ${userInfo.email}<br />
                Recibiste este email porque contrataste un seguro médico con SaludMap<br />
                <strong>SaludMap</strong> - Encuentra servicios de salud cercanos
            </p>
        </div>
    </div>`;
};

// Función principal para enviar correo de confirmación de seguro
export const sendInsuranceConfirmationEmail = async (plan, userInfo) => {
    try {
        // console.log('[DEBUG] Iniciando envío de correo de seguro...');
        
        // Generar ID único para la póliza
        const orderId = `POL-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        
        // Preparar datos básicos para EmailJS
        const emailData = {
            to_email: userInfo.email,  // Campo TO requerido por EmailJS
            to_name: userInfo.name,    // Nombre del destinatario
            customer_name: userInfo.name || 'Cliente',
            customer_email: userInfo.email || '',
            customer_phone: userInfo.phone || 'No especificado',
            customer_address: userInfo.address || 'No especificada',
            order_id: orderId,
            plan_name: plan.name || 'Plan de Seguro',
            plan_price: String(plan.price || '0'),
            plan_description: plan.description || 'Seguro médico completo',
            coverage_list: Array.isArray(plan.coverage) ? plan.coverage.join(', ') : 'Cobertura completa'
        };
        
        // console.log('[DEBUG] Datos preparados para EmailJS:', emailData);
        
        // Enviar correo usando EmailJS
        const emailResponse = await emailjs.send(
            'service_fr86hqi', 
            'template_if7eh5b',
            emailData,
            'jBIfJ7kR2vFO0xd0e' 
        );
        
        // console.log('[DEBUG] ✅ Correo de seguro enviado:', emailResponse);
        
        return {
            success: true,
            emailResponse,
            orderId,
            pdfGenerated: true
        };
        
    } catch (error) {
        console.error('[ERROR] Error enviando correo de seguro:', error);
        
        // Mejorar el manejo de errores de EmailJS
        let errorMessage = 'Error desconocido';
        
        if (error.status) {
            switch (error.status) {
                case 422:
                    errorMessage = 'Error en los datos del template. Verifica que todas las variables estén configuradas correctamente en EmailJS.';
                    break;
                case 400:
                    errorMessage = 'Datos de solicitud inválidos.';
                    break;
                case 401:
                    errorMessage = 'Error de autenticación con EmailJS.';
                    break;
                case 403:
                    errorMessage = 'Acceso denegado al servicio de EmailJS.';
                    break;
                case 429:
                    errorMessage = 'Límite de correos alcanzado. Intenta más tarde.';
                    break;
                default:
                    errorMessage = `Error del servidor EmailJS: ${error.status}`;
            }
        } else if (error.text) {
            errorMessage = error.text;
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        throw new Error(`Error enviando confirmación: ${errorMessage}`);
    }
};

// Función auxiliar para descargar el PDF localmente (mantener funcionalidad existente)
export const downloadInsurancePDF = (plan, userInfo) => {
    try {
        PDFGenerator.generateInsuranceCard(plan, userInfo);
        return true;
    } catch (error) {
        console.error('Error descargando PDF:', error);
        return false;
    }
};

export default {
    initializeEmailJS,
    sendInsuranceConfirmationEmail,
    downloadInsurancePDF
};
