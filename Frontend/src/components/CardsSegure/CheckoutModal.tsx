import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PDFGenerator, InsurancePlan, UserInfo } from './PDFGenerator';
import { sendInsuranceConfirmationEmail, downloadInsurancePDF, initializeEmailJS } from '../../services/emailSegurosService';
import { sendTestEmail, initializeEmailJS as initTest } from '../../services/emailSegurosServiceTest';

interface CheckoutModalProps {
    plan: InsurancePlan;
    isOpen: boolean;
    onClose: () => void;
}

import './CheckoutModal.css';

const CheckoutModal: React.FC<CheckoutModalProps> = ({ plan, isOpen, onClose }) => {
    const { t } = useTranslation();
    
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
            const errorMessage = (error instanceof Error ? error.message : String(error)) || 'Error desconocido';

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
        <div className="checkout-overlay">
            <div className="checkout-modal">
                <div className="checkout-header">
                    <h2 className="checkout-title">{t('insurance.contractInsurance')}</h2>
                    <button className="checkout-close" onClick={onClose}>×</button>
                </div>

                <div className="plan-info">
                    <h3 className="plan-name">{t(`insurance.plans.${plan.id}.name`)}</h3>
                    <p className="plan-price">${plan.price}{t('insurance.perMonth')}</p>
                    <p className="plan-desc">{t(`insurance.plans.${plan.id}.description`)}</p>
                </div>

                <form className="checkout-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>{t('insurance.fullName')} *</label>
                        <input type="text" required value={userInfo.name} onChange={(e) => handleInputChange('name', e.target.value)} />
                    </div>

                    <div className="form-group">
                        <label>{t('appointments.email')} *</label>
                        <input type="email" required value={userInfo.email} onChange={(e) => handleInputChange('email', e.target.value)} />
                    </div>

                    <div className="form-group">
                        <label>{t('insurance.phone')} *</label>
                        <input type="tel" required value={userInfo.phone} onChange={(e) => handleInputChange('phone', e.target.value)} />
                    </div>

                    <div className="form-group">
                        <label>{t('insurance.address')} *</label>
                        <textarea required value={userInfo.address} onChange={(e) => handleInputChange('address', e.target.value)} rows={3} />
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>{t('map.cancel')}</button>
                        <button type="submit" className="btn-primary" disabled={isProcessing}>{isProcessing ? t('common.processing') : `${t('insurance.contractFor')} $${plan.price}${t('insurance.perMonth')}`}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CheckoutModal;
