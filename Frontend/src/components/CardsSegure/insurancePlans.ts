// Insurance plans data
import { InsurancePlan } from './PDFGenerator';

export const insurancePlans: InsurancePlan[] = [
  {
    id: 'basic',
    name: 'Plan Básico',
    price: 150,
    description: 'Cobertura médica esencial para consultas y emergencias básicas',
    coverage: [
      'Consultas médicas generales',
      'Emergencias básicas',
      'Medicamentos básicos',
      'Análisis de laboratorio básicos'
    ]
  },
  {
    id: 'premium',
    name: 'Plan Premium',
    price: 300,
    description: 'Cobertura médica completa con especialistas y procedimientos avanzados',
    coverage: [
      'Consultas médicas generales y especialistas',
      'Emergencias y hospitalización',
      'Medicamentos y tratamientos especializados',
      'Análisis de laboratorio completos',
      'Cirugías menores y mayores',
      'Rehabilitación y fisioterapia'
    ]
  },
  {
    id: 'family',
    name: 'Plan Familiar',
    price: 500,
    description: 'Cobertura médica completa para toda la familia',
    coverage: [
      'Cobertura para hasta 4 miembros de la familia',
      'Consultas médicas generales y especialistas',
      'Emergencias y hospitalización',
      'Medicamentos y tratamientos especializados',
      'Análisis de laboratorio completos',
      'Cirugías menores y mayores',
      'Rehabilitación y fisioterapia',
      'Atención pediátrica especializada',
      'Atención geriátrica'
    ]
  }
];

export default insurancePlans;
