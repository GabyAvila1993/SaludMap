import React from 'react';
import { useTranslation } from 'react-i18next';
import { InsurancePlan } from './PDFGenerator';

interface InsuranceCardProps {
    plan: InsurancePlan;
    onSelect: (plan: InsurancePlan) => void;
    isSelected?: boolean;
}

const InsuranceCard: React.FC<InsuranceCardProps> = ({ plan, onSelect, isSelected = false }) => {
    const { t } = useTranslation();
    
    return (
        <div
            className={`insurance-card ${isSelected ? 'selected' : ''}`}
            onClick={() => onSelect(plan)}
        >
            <h3 className={`card-title ${isSelected ? 'selected' : ''}`}>
                {t(`insurance.plans.${plan.id}.name`)}
            </h3>

            <div className={`card-price ${isSelected ? 'selected' : ''}`}>
                ${plan.price}{t('insurance.perMonth')}
            </div>

            <p className="card-description">
                {t(`insurance.plans.${plan.id}.description`)}
            </p>

            <div className="card-coverage">
                <h4 className={`coverage-title ${isSelected ? 'selected' : ''}`}>
                    {t('insurance.coverageIncluded')}
                </h4>
                <ul className="coverage-list">
                    {plan.coverage.map((item, index) => (
                        <li key={index} className={`coverage-item ${isSelected ? 'selected' : ''}`}>
                            {t(`insurance.plans.${plan.id}.coverage.${index}`)}
                        </li>
                    ))}
                </ul>
            </div>

            <button className="card-button">
                {isSelected ? t('insurance.selected') : t('insurance.selectPlan')}
            </button>
        </div>
    );
};

export default InsuranceCard;
