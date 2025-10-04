import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import InsuranceCard from './InsuranceCard';
import CheckoutModal from './CheckoutModal';
import { insurancePlans } from './insurancePlans';
import './InsuranceSection.css';

const InsuranceSection = () => {
    const { t } = useTranslation();
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

    const handleSelectPlan = (plan) => {
        setSelectedPlan(plan);
    };

    const handleContractPlan = () => {
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
            </div>
        </div>
    );
};

export default InsuranceSection;
