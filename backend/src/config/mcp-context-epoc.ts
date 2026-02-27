
/**
 * CONTEXTO MCP: EPOC (ENFERMEDAD PULMONAR OBSTRUCTIVA CRÓNICA)
 */

import {MCPMedicalContext} from '../interfaces/mcp-medical-context.interface';

export const epocContext: MCPMedicalContext = {
    id: 'epoc',
    name: 'Enfermedad Pulmonar Obstructiva Crónica (EPOC)',
    keywords: [
        'epoc', 'enfermedad pulmonar', 'obstructiva crónica', 'bronquitis crónica',
        'enfisema', 'disnea', 'fumador', 'tabaco', 'espirometría', 'VEF1',
        'broncodilatador', 'exacerbación', 'tos crónica', 'expectoración', 'sibilancias'
    ],
    priority: 9,
    content: {
        description: 'Información sobre EPOC basada en la Guía de Práctica Clínica Nacional de Argentina. Enfermedad respiratoria crónica prevenible y tratable, causada principalmente por humo del tabaco.',
        mainTopics: [
            'Definición y epidemiología en Argentina',
            'Diagnóstico mediante espirometría',
            'Clasificación de severidad (GOLD)',
            'Tratamiento farmacológico inhalado',
            'Cesación tabáquica',
            'Manejo de exacerbaciones',
            'Rehabilitación respiratoria',
            'Vacunación y prevención'
        ],
        riskFactors: [
            'Tabaquismo activo (principal causa - 82.5% de casos)',
            'Carga tabáquica ≥40 paquetes/año',
            'Exposición a humo de tabaco ajeno (fumador pasivo >20h semanales)',
            'Uso de braseros o cocina a leña (combustión de biomasa)',
            'Exposición laboral crónica (minería, construcción, plásticos, textil)',
            'Déficit de alfa-1 antitripsina (~1% casos)',
            'Infecciones respiratorias severas en infancia',
            'Retardo crecimiento intrauterino',
            'Antecedentes familiares de EPOC severa'
        ],
        symptoms: [
            'Disnea progresiva (falta de aire)',
            'Tos crónica (mayoría días durante ≥3 meses)',
            'Expectoración crónica o producción de esputo',
            'Sibilancias (auscultadas o autoreportadas)',
            'Intolerancia al ejercicio',
            'IMPORTANTE: Síntomas pueden pasar inadvertidos por adaptación inconsciente'
        ],
        treatments: [
            'BRONCODILATADORES ACCIÓN CORTA: Salbutamol 100mcg, Ipratropio 20mcg (2 inhalaciones c/6h)',
            'LAMA (acción larga): Tiotropio 18mcg/día, Glicopirronio 50mcg/día',
            'LABA (acción larga): Salmeterol 50mcg c/12h, Formoterol 4.5-9mcg c/12h',
            'Ultra-LABA: Indacaterol 150-300mcg/día',
            'DOBLE BRONCODILATACIÓN: Indacaterol/Glicopirronio 110/50, Vilanterol/Umeclidinio 55/22',
            'TRIPLE TERAPIA: LAMA + LABA/CI (casos severos con exacerbaciones)',
            'CORTICOIDES INHALADOS: Reservar para coexistencia con asma o exacerbaciones frecuentes',
            'EXACERBACIONES: BD acción corta + Corticoides sistémicos (Metilprednisona 40mg×7días) + ATB si esputo purulento'
        ],
        recommendations: [
            'CESACIÓN TABÁQUICA obligatoria (reduce mortalidad)',
            'Actividad física aeróbica ≥30 min/día',
            'Vacunación antigripal anual',
            'Vacunación antineumocócica según edad y esquema',
            'Educación para automanejo de dispositivos inhalatorios',
            'NO fumar en espacios cerrados (hogar, auto, trabajo)',
            'Evitar exposición a gases, partículas laborales y humo de biomasa',
            'Rehabilitación respiratoria si VEF1 <50%',
            'Oximetría periódica si obstrucción severa',
            'Control de comorbilidades (HTA, diabetes, depresión)',
            'NO TRATAR si asintomático + VEF1 ≥50%'
        ],
        prevention: [
            'No fumar (principal medida preventiva)',
            'Evitar inicio de tabaquismo en jóvenes',
            'Ambientes 100% libres de humo',
            'Protección laboral ante exposición a polvos/gases',
            'Ventilación adecuada si uso de biomasa inevitable',
            'Tratamiento precoz de infecciones respiratorias',
            'Espirometría de tamizaje si carga tabáquica ≥40 paquetes/año',
            'Cuestionario CODE para priorizar espirometrías'
        ],
        guidelines: [
            {
                title: 'Criterios para solicitar espirometría',
                content: '1) Síntomas respiratorios crónicos (tos/expectoración ≥3 meses, disnea, sibilancias) en fumadores/exfumadores. 2) Carga tabáquica ≥40 paquetes/año (aún sin síntomas). 3) Exposición crónica a biomasa o laboral con síntomas. Fórmula: paquetes/año = (cigarrillos/día × años consumo) / 20.',
                severity: 'high'
            },
            {
                title: 'Diagnóstico de EPOC',
                content: 'REQUIERE espirometría pre y post-broncodilatador. EPOC confirmada si: Relación VEF1/CVF <70% POST-BD (obstrucción NO reversible). Si se normaliza en evolución, descartar EPOC. Diferencial con asma: EPOC >40 años, tabaquismo, síntomas crónicos progresivos; Asma <40 años, reversibilidad completa, síntomas variables.',
                severity: 'critical'
            },
            {
                title: 'Clasificación severidad (GOLD)',
                content: 'LEVE (GOLD 1): VEF1 ≥80%. MODERADA (GOLD 2): VEF1 50-79%. SEVERA (GOLD 3): VEF1 <50%. MUY SEVERA: VEF1 <30%. La severidad se mide con % VEF1 POST-broncodilatador respecto al teórico.',
                severity: 'high'
            },
            {
                title: 'Escala disnea mMRC (autoadministrada)',
                content: 'ASINTOMÁTICOS: 0=Solo ejercicio intenso, 1=Camino rápido/pendiente. SINTOMÁTICOS: 2=Camino más despacio que otros, me detengo en llano. 3=Me detengo cada 100m. 4=Disnea al vestirme/salir de casa. Usar para valorar inicio de tratamiento.',
                severity: 'medium'
            },
            {
                title: 'Cuestionario CODE (priorización)',
                content: '≥4 respuestas SI → realizar espirometría: 1)Hombre, 2)Edad ≥50 años, 3)≥30 paquetes/año, 4)Disnea al subir pendientes, 5)Tos mayoría días >2 años, 6)Flema mayoría días >2 años. Útil en atención primaria.',
                severity: 'medium'
            },
            {
                title: 'Cuándo NO tratar con inhaladores',
                content: 'NO iniciar tratamiento inhalado si: Asintomático (mMRC 0-1, sin tos/expectoración) + VEF1 ≥50% + sin exacerbaciones. No genera beneficios y expone a efectos adversos. Sí mantener cesación tabáquica, ejercicio y vacunas.',
                severity: 'high'
            },
            {
                title: 'Esquema inicio tratamiento inhalado',
                content: 'SÍNTOMAS + VEF1 ≥50%: BD acción corta. Si persisten → LAMA. EXACERBACIONES ≥2/año o VEF1 <50%: LAMA (preferencial) u opciones Ultra-LABA/LAMA o LABA/CI. INTENSIFICACIÓN: Doble BD (Ultra-LABA/LAMA) o Triple (LAMA+LABA/CI).',
                severity: 'critical'
            },
            {
                title: 'Cesación tabáquica',
                content: 'FARMACOLÓGICO (si >10 cig/día): 1)Parches nicotina 14-21mg/24h×8sem, 2)Chicles nicotina 2mg c/1-2h×6sem, 3)Bupropión 150-300mg/día×8sem, 4)Vareniclina 1-2mg/día. ALTA DEPENDENCIA (>20cig/día o <30min primer cigarrillo): combinar parches+chicles o parches+bupropión. Línea ayuda: 0800-999-3040.',
                severity: 'critical'
            },
            {
                title: 'Vacunación antineumocócica',
                content: 'ANTES 65 años: 1°)VCN13, 2°)VPN23 (12 meses después), Refuerzo)VPN23 a los 65 (mín 5 años anterior). DESDE 65 años: 1°)VCN13, 2°)VPN23 (12 meses después). Si ya recibió VPN23: esperar 12 meses para VCN13.',
                severity: 'medium'
            },
            {
                title: 'Exacerbación - Tratamiento ambulatorio',
                content: 'SIEMPRE BD acción corta (salbutamol ±ipratropio): 3 cursos/hora (2 pulsaciones c/20min). Si usa LAMA base → solo salbutamol. CORTICOIDES VO si: obstrucción severa o antecedente internación (Metilprednisona 40mg×7días). ANTIBIÓTICOS si: esputo purulento o ↑volumen (Amoxicilina/clavulánico 875/125 c/12h×5-7días). Control 24-48h.',
                severity: 'critical'
            },
            {
                title: 'Criterios derivación hospitalaria urgente',
                content: 'FR >25/min, FC >110/min, SaO2 <90%, cianosis nueva/empeoramiento, somnolencia/confusión, edema periférico nuevo, inestabilidad hemodinámica, disnea impide dormir/comer/caminar. Derivar CON oxígeno y médico. Iniciar: NBZ salbutamol+ipratropio, corticoides sistémicos, O2 2L/min.',
                severity: 'critical'
            },
            {
                title: 'Obstrucción severa (VEF1 <50%)',
                content: 'Requiere: 1)Rehabilitación respiratoria (mejora disnea, calidad vida, reduce internaciones), 2)Oximetría periódica (si SaO2 ≤92% → gases arteriales), 3)Screening depresión (PHQ-9), 4)Control neumología periódico, 5)Valorar oxigenoterapia crónica si hipoxemia confirmada.',
                severity: 'high'
            },
            {
                title: 'Interconsulta a neumología',
                content: 'DERIVAR si: Dudas diagnóstico, cor pulmonale/apnea sueño, exacerbaciones frecuentes/hospitalizaciones, VEF1 <50% (controles periódicos), descenso acelerado (>50ml VEF1/año), síntomas desproporcionados, candidato cirugía/trasplante, manejo oxigenoterapia crónica, déficit alfa-1 antitripsina.',
                severity: 'medium'
            },
            {
                title: 'Comorbilidades frecuentes',
                content: 'Cardiovasculares: HTA, cardiopatía isquémica, ICC derecha (cor pulmonale), arteriopatía periférica. Respiratorias: neumonía, TEP, cáncer pulmón. Metabólicas: diabetes, osteoporosis. Psiquiátricas: ansiedad, depresión (frecuente si obstrucción severa). Todas requieren manejo integral.',
                severity: 'medium'
            },
            {
                title: 'Epidemiología Argentina (EPOC.AR 2016)',
                content: 'Prevalencia 14.5% en ≥40 años. 94.4% tienen ≥50 años. Más hombres (18%) que mujeres (12%). 82.5% fumador/exfumador. 43.5% sigue fumando. SUBDIAGNÓSTICO 75% (mayoría obstrucción leve). 3° causa muerte (grupo enfermedades respiratorias). 11% egresos hospitalarios.',
                severity: 'high'
            }
        ],
        sources: [
            'Guía de Práctica Clínica Nacional de Diagnóstico y Tratamiento de la EPOC - Ministerio de Salud de la Nación Argentina (2017)',
            'GOLD - Global Initiative for Chronic Obstructive Lung Disease',
            'Estudio EPOC.AR (2016) - Argentina'
        ]
    }
};