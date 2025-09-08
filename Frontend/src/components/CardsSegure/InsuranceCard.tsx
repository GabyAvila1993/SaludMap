import React from 'react';
import { InsurancePlan } from './PDFGenerator';

interface InsuranceCardProps {
    plan: InsurancePlan;
    onSelect: (plan: InsurancePlan) => void;
    isSelected?: boolean;
}

const InsuranceCard: React.FC<InsuranceCardProps> = ({ plan, onSelect, isSelected = false }) => {
    return (
        <div
            className={`insurance-card ${isSelected ? 'selected' : ''}`}
            onClick={() => onSelect(plan)}
        >
            <h3 className={`card-title ${isSelected ? 'selected' : ''}`}>
                {plan.name}
            </h3>

            <div className={`card-price ${isSelected ? 'selected' : ''}`}>
                ${plan.price}/mes
            </div>

            <p className="card-description">
                {plan.description}
            </p>

            <div className="card-coverage">
                <h4 className={`coverage-title ${isSelected ? 'selected' : ''}`}>
                    Cobertura incluida:
                </h4>
                <ul className="coverage-list">
                    {plan.coverage.map((item, index) => (
                        <li key={index} className={`coverage-item ${isSelected ? 'selected' : ''}`}>
                            {item}
                        </li>
                    ))}
                </ul>
            </div>

            <button className="card-button">
                {isSelected ? 'Seleccionado' : 'Seleccionar Plan'}
            </button>
        </div>
    );
};

export default InsuranceCard;
