import React, { useState } from 'react';
import { PDFGenerator, InsurancePlan, UserInfo } from './PDFGenerator';
import { sendInsuranceConfirmationEmail, downloadInsurancePDF, initializeEmailJS } from '../../services/emailSegurosService';
import { sendTestEmail, initializeEmailJS as initTest } from '../../services/emailSegurosServiceTest';

interface CheckoutModalProps {
    plan: InsurancePlan;
    isOpen: boolean;
    onClose: () => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ plan, isOpen, onClose }) => {
    const [userInfo, setUserInfo] = useState<UserInfo>({
        name: '',
        email: '',
        phone: '',
        address: ''
    });

    const [isProcessing, setIsProcessing] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const handleInputChange = (field: keyof UserInfo, value: string) => {
        setUserInfo(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        setEmailSent(false);

        try {
            // Inicializar EmailJS
            initializeEmailJS();

            // Generar y descargar PDF localmente
            const pdfDownloaded = downloadInsurancePDF(plan, userInfo);
            
            if (!pdfDownloaded) {
                throw new Error('Error generando el PDF de la tarjeta de seguro');
            }

            // Enviar correo de confirmación completo
            console.log('[DEBUG] Enviando correo de confirmación...');
            const emailResult = await sendInsuranceConfirmationEmail(plan, userInfo);
            
            if (emailResult.success) {
                setEmailSent(true);
                console.log('[DEBUG] Correo enviado exitosamente:', emailResult);
                
                alert(`¡Seguro contratado exitosamente! 
                
✅ Se ha descargado tu tarjeta de seguro
✅ Se ha enviado confirmación a ${userInfo.email}
📧 Revisa tu correo para ver los detalles completos
📋 Número de póliza: ${emailResult.orderId}`);
            } else {
                // Si falla el correo, al menos se descargó el PDF
                alert('¡Seguro contratado exitosamente! Se ha descargado tu tarjeta de seguro. El correo de confirmación no pudo enviarse, pero tu seguro está activo.');
            }

            onClose();
        } catch (error) {
            console.error('Error processing checkout:', error);
            
            // Determinar el tipo de error para mostrar mensaje apropiado
            const errorMessage = error.message || 'Error desconocido';
            
            if (errorMessage.includes('correo') || errorMessage.includes('email')) {
                alert(`Seguro contratado, pero hubo un problema enviando el correo: ${errorMessage}. Tu seguro está activo y se descargó tu tarjeta.`);
            } else {
                alert(`Error al procesar el seguro: ${errorMessage}. Por favor intenta nuevamente.`);
            }
        } finally {
            setIsProcessing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: '#fff',
                borderRadius: '10px',
                padding: '30px',
                maxWidth: '500px',
                width: '90%',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                }}>
                    <h2 style={{ margin: 0, color: '#47472e' }}>Contratar Seguro</h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '24px',
                            cursor: 'pointer',
                            color: '#666'
                        }}
                    >
                        ×
                    </button>
                </div>

                <div style={{
                    backgroundColor: '#f8f9fa',
                    padding: '15px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    border: '1px solid #ffe0a6'
                }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#47472e' }}>{plan.name}</h3>
                    <p style={{ margin: '0 0 10px 0', fontSize: '1.2rem', fontWeight: 'bold', color: '#47472e' }}>
                        ${plan.price}/mes
                    </p>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
                        {plan.description}
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', color: '#47472e', fontWeight: 'bold' }}>
                            Nombre completo *
                        </label>
                        <input
                            type="text"
                            required
                            value={userInfo.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '5px',
                                fontSize: '16px'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', color: '#47472e', fontWeight: 'bold' }}>
                            Email *
                        </label>
                        <input
                            type="email"
                            required
                            value={userInfo.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '5px',
                                fontSize: '16px'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', color: '#47472e', fontWeight: 'bold' }}>
                            Teléfono *
                        </label>
                        <input
                            type="tel"
                            required
                            value={userInfo.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '5px',
                                fontSize: '16px'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', color: '#47472e', fontWeight: 'bold' }}>
                            Dirección *
                        </label>
                        <textarea
                            required
                            value={userInfo.address}
                            onChange={(e) => handleInputChange('address', e.target.value)}
                            rows={3}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '5px',
                                fontSize: '16px',
                                resize: 'vertical'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: '12px 24px',
                                border: '1px solid #ddd',
                                borderRadius: '5px',
                                backgroundColor: '#fff',
                                color: '#666',
                                cursor: 'pointer',
                                fontSize: '16px'
                            }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isProcessing}
                            style={{
                                padding: '12px 24px',
                                border: 'none',
                                borderRadius: '5px',
                                backgroundColor: isProcessing ? '#ccc' : '#47472e',
                                color: '#fff',
                                cursor: isProcessing ? 'not-allowed' : 'pointer',
                                fontSize: '16px',
                                boxShadow: '0 2px 4px rgba(255, 224, 166, 0.3)'
                            }}
                        >
                            {isProcessing ? 'Procesando...' : `Contratar por $${plan.price}/mes`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CheckoutModal;
