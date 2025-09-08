import React, { useState } from 'react';
import InsuranceCard from './InsuranceCard';
import CheckoutModal from './CheckoutModal';
import { insurancePlans } from './insurancePlans';
import './InsuranceSection.css';

const InsuranceSection = () => {
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
                        Planes de Seguro Médico
                    </h2>
                    <p className="insurance-subtitle">
                        Protege tu salud y la de tu familia con nuestros planes de seguro médico. 
                        Elige el plan que mejor se adapte a tus necesidades.
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
                            Plan seleccionado: {selectedPlan.name}
                        </h3>
                        <p className="selected-plan-description">
                            ${selectedPlan.price}/mes - {selectedPlan.description}
                        </p>
                        <button
                            onClick={handleContractPlan}
                            className="contract-button"
                        >
                            Contratar Plan
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
