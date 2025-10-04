import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import InsuranceCard from './InsuranceCard';
import CheckoutModal from './CheckoutModal';
import { insurancePlans } from './insurancePlans';
import { useAuth } from '../Auth/AuthContext.jsx';
import ModalAuth from '../Auth/ModalAuth.jsx';
import './InsuranceSection.css';

const InsuranceSection = () => {
	const { t } = useTranslation();
	const { user } = useAuth();
	const [selectedPlan, setSelectedPlan] = useState(null);
	const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
	const [showAuthModal, setShowAuthModal] = useState(false);
	const [showRegister, setShowRegister] = useState(false);

	const handleSelectPlan = (plan) => {
		setSelectedPlan(plan);
	};

	/**
	 * Maneja la contratación del plan
	 * Verifica si el usuario está autenticado antes de proceder
	 */
	const handleContractPlan = () => {
		if (!user) {
			// Si no está autenticado, mostrar modal de login
			setShowRegister(false);
			setShowAuthModal(true);
			return;
		}

		// Si está autenticado, proceder con la contratación
		if (selectedPlan) {
			setIsCheckoutOpen(true);
		}
	};

	const handleCloseCheckout = () => {
		setIsCheckoutOpen(false);
		setSelectedPlan(null);
	};

	return (
        <div className="insurance-section">
            <div className="insurance-container">
                <div className="insurance-header">
                    <h2 className="insurance-title">
                        {t('insurance.insurancePlans')}
                    </h2>
                    <p className="insurance-subtitle">
                        {t('insurance.subtitle')}
                    </p>
                </div>

                <div className="insurance-cards-grid">
                    {insurancePlans.map((plan) => (
                        <div key={plan.id} className="insurance-card-wrapper">
                            <InsuranceCard
                                plan={plan}
                                onSelect={handleSelectPlan}
                                isSelected={selectedPlan?.id === plan.id}
                            />
                        </div>
                    ))}
                </div>

                {selectedPlan && (
                    <div className="selected-plan-section">
                        <h3 className="selected-plan-title">
                            {t('insurance.selectedPlan')}: {t(`insurance.plans.${selectedPlan.id}.name`)}
                        </h3>
                        <p className="selected-plan-description">
                            ${selectedPlan.price}{t('insurance.perMonth')} - {t(`insurance.plans.${selectedPlan.id}.description`)}
                        </p>
                        <button
                            onClick={handleContractPlan}
                            className="contract-button"
                        >
                            {t('insurance.contractPlan')}
                        </button>
                    </div>
                )}

				<CheckoutModal
					plan={selectedPlan}
					isOpen={isCheckoutOpen}
					onClose={handleCloseCheckout}
				/>

				{/* Modal de Autenticación */}
				<ModalAuth
					open={showAuthModal}
					onClose={() => {
						setShowAuthModal(false);
						// Después de cerrar, si el usuario se autenticó, proceder con la contratación
						if (user && selectedPlan) {
							setIsCheckoutOpen(true);
						}
					}}
					showRegister={showRegister}
					setShowRegister={setShowRegister}
				/>
			</div>
		</div>
	);
};

export default InsuranceSection;
