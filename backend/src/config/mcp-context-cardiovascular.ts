/**
 * CONTEXTO MCP: PREVENCIÓN CARDIOVASCULAR
 */

import {MCPMedicalContext} from '../interfaces/mcp-medical-context.interface';

export const cardiovascularContext: MCPMedicalContext = {
    id: 'prevencion-cardiovascular',
    name: 'Prevención Cardiovascular',
    keywords: [
        'cardiovascular', 'prevención cardiovascular', 'estatinas', 'colesterol',
        'LDL', 'HDL', 'triglicéridos', 'dislipemia', 'hipercolesterolemia',
        'aspirina', 'AAS', 'riesgo cardiovascular', 'infarto', 'IAM',
        'ACV', 'accidente cerebrovascular', 'enfermedad coronaria',
        'atorvastatina', 'rosuvastatina', 'simvastatina', 'ezetimibe',
        'fibratos', 'omega 3', 'perfil lipídico', 'prevención primaria',
        'prevención secundaria'
    ],
    priority: 10,
    content: {
        description: 'Guía de Práctica Clínica Nacional sobre Prevención Cardiovascular del Ministerio de Salud Argentina 2021. Aborda valoración del riesgo cardiovascular global, uso de estatinas, aspirina y otros hipolipemiantes en prevención primaria y secundaria.',
        mainTopics: [
            'Valoración del riesgo cardiovascular global (RCVG)',
            'Rastreo de dislipemias (perfil lipídico)',
            'Estatinas en prevención primaria y secundaria',
            'Aspirina (AAS) en prevención cardiovascular',
            'Ezetimibe, fibratos y omega-3',
            'Manejo de lípidos en diabetes y enfermedad renal crónica',
            'Prevención cardiovascular en adultos mayores (≥70 años)',
            'Seguimiento y monitoreo del tratamiento'
        ],
        riskFactors: [
            'Hipercolesterolemia (LDL elevado)',
            'Hipertensión arterial',
            'Diabetes mellitus',
            'Tabaquismo activo',
            'Obesidad/sobrepeso (IMC ≥25)',
            'Sexo masculino',
            'Edad avanzada',
            'Antecedentes familiares ECV prematura (<50 años hombres, <60 mujeres)',
            'Enfermedad renal crónica',
            'Menopausia precoz (<40 años)',
            'Sedentarismo',
            'Consumo excesivo de alcohol',
            'Estrés crónico, depresión, ansiedad'
        ],
        symptoms: [
            'PREVENCIÓN PRIMARIA: Asintomático (sin eventos cardiovasculares previos)',
            'PREVENCIÓN SECUNDARIA: Antecedente de IAM, ACV isquémico, angina, revascularización',
            'Dolor torácico (angina de pecho)',
            'Disnea de esfuerzo',
            'Palpitaciones',
            'Fatiga fácil',
            'NOTA: La dislipemia es habitualmente asintomática (detección por laboratorio)'
        ],
        treatments: [
            'ESTATINAS MODERADA INTENSIDAD: Atorvastatina 10-20mg/día, Simvastatina 20-40mg/día, Rosuvastatina 5-10mg/día',
            'ESTATINAS ALTA INTENSIDAD: Atorvastatina 40-80mg/día, Rosuvastatina 20-40mg/día',
            'ASPIRINA: 100mg/día (solo prevención secundaria)',
            'EZETIMIBE: 10mg/día (asociado a estatinas en casos específicos)',
            'FIBRATOS: Fenofibrato, gemfibrozil (casos seleccionados con hipertrigliceridemia)',
            'OMEGA-3: NO recomendado rutinariamente',
            'MODIFICACIÓN ESTILO DE VIDA: Dieta saludable reducida en sodio, actividad física ≥150min/semana, cesación tabáquica'
        ],
        recommendations: [
            'RASTREO: Perfil lipídico cada 5 años desde los 40 años (o antes si FRCV)',
            'CESACIÓN TABÁQUICA obligatoria (reduce mortalidad)',
            'Actividad física aeróbica ≥150 min/semana (mínimo 30 min, 5 días/semana)',
            'Dieta saludable baja en sodio (<2g/día)',
            'Limitar alcohol: máx 1 UBE/día mujeres, 2 UBE/día hombres',
            'Mantener peso saludable (IMC <25)',
            'Control de HTA, diabetes, obesidad',
            'Vacunación antigripal anual',
            'Manejo estrés, depresión, ansiedad',
            'NO automedicarse con estatinas ni aspirina',
            'Adherencia >80% al tratamiento con estatinas',
            'NO suspender estatinas si se alcanzan metas de LDL',
            'Monitoreo periódico solo si ajuste de dosis necesario'
        ],
        prevention: [
            'Control periódico FRCV desde los 40 años',
            'Perfil lipídico cada 5 años (o según FRCV)',
            'Promover estilos de vida saludables desde infancia',
            'Cesación tabáquica y ambientes libres de humo',
            'Ejercicio físico regular',
            'Alimentación saludable (tipo mediterránea/DASH)',
            'Control de peso corporal',
            'Reducción consumo de sal',
            'Evitar sedentarismo',
            'Screening de HTA, diabetes, obesidad',
            'Identificación temprana hipercolesterolemia familiar'
        ],
        guidelines: [
            {
                title: 'Rastreo dislipemias - Cuándo solicitar perfil lipídico',
                content: 'SOLICITAR cada 5 años desde 40 años. ADELANTAR si: 1)Antecedente familiar ECV prematura (<50 hombres/<60 mujeres), 2)Hipercolesterolemia familiar, 3)Signos clínicos (xantelasmas, xantomas, arco corneal), 4)Diabetes, HTA, obesidad, 5)Tabaquismo, 6)Menopausia precoz. PERFIL: CT, LDL, HDL, TG. NO requiere ayuno (salvo TG >350mg/dl). Intervalo óptimo incierto, consenso expertos sugiere 5 años.',
                severity: 'medium'
            },
            {
                title: 'Estatinas PREVENCIÓN PRIMARIA - Población 40-69 años',
                content: 'INDICAR estatinas moderada intensidad si: 1)≥3 FRCV entre: sexo masculino, LDL 160-189mg/dl o CT 240-299mg/dl, HTA, sobrepeso/obesidad IMC≥25, tabaquismo, antecedente familiar ECV prematura, menopausia <40años. O BIEN 2)RCVG ≥10% a 10 años. NNT=142 por 5 años prevenir 1 muerte. PRECAUCIÓN: advertir mujeres edad fértil sobre teratogenicidad, suspender 3 meses antes embarazo planificado.',
                severity: 'critical'
            },
            {
                title: 'Estatinas - Hipercolesterolemia severa (cualquier edad)',
                content: 'Si LDL ≥190mg/dl o CT ≥300mg/dl: INICIAR estatinas moderada-alta intensidad INDEPENDIENTE edad y otros FRCV. INTERCONSULTA neumología para descartar hipercolesterolemia familiar (HF). HF prevalencia 1:500, RR muerte 3-4 veces mayor si no tratada. Criterios Simon Broome: ≥2 determinaciones CT>300 o LDL>190 + xantomas tendinosos y/o antecedente familiar cardiopatía prematura.',
                severity: 'critical'
            },
            {
                title: 'Estatinas en DIABETES (≥40 años sin ECV)',
                content: 'RECOMENDAR estatinas moderada intensidad en diabetes ≥40 años SIN ECV previa. NNT=26 por 5 años prevenir 1 ECVM o muerte. Beneficios: reduce mortalidad total RR 0.78, ECVM RR 0.76, IAM+ACV RR 0.70. NO aumenta riesgo diabetes (ya la tienen). Ej: Atorvastatina 10-20mg, Simvastatina 20-40mg, Rosuvastatina 10mg.',
                severity: 'critical'
            },
            {
                title: 'Estatinas en ENFERMEDAD RENAL CRÓNICA',
                content: 'ERC G3a-G5 SIN diálisis: RECOMENDAR estatinas moderada intensidad (reduce mortalidad, IAM, ECVM). ERC EN DIÁLISIS: NO INICIAR estatinas (no reduce eventos aunque baja LDL). Si ya recibe estatinas e inicia diálisis: continuar. ERC definición: albuminuria ≥30mg/g y/o IFGe ≤59ml/min/1.73m² por ≥3 meses. RACo: orina matinal, confirmar 2/3 muestras en 3 meses.',
                severity: 'high'
            },
            {
                title: 'Estatinas en ADULTOS MAYORES ≥70 años',
                content: 'MAYORES 70 años SIN ECV ni diabetes, expectativa vida ≥3 años: RECOMENDAR estatinas moderada intensidad si ≥2 FRCV entre: LDL 160-189 o CT 240-299, HTA, sobrepeso/obesidad, tabaquismo. Reduce IAM RR 0.61, ACV RR 0.76. ENFERMEDAD TERMINAL expectativa <1 año: CONSIDERAR suspensión (mejora calidad vida sin aumentar eventos).',
                severity: 'high'
            },
            {
                title: 'Estatinas PREVENCIÓN SECUNDARIA (con ECV establecida)',
                content: 'ECV establecida (IAM, ACV isquémico, arteriopatía periférica): RECOMENDAR estatinas ALTA intensidad (Atorvastatina 40-80mg o Rosuvastatina 20-40mg) INDEPENDIENTE del valor LDL. Si intolerancia: máxima dosis tolerada (preferible moderada). NO INICIAR Simvastatina ≥80mg (riesgo rabdomiólisis). Reduce mortalidad RR 0.87, ECVM RR 0.78, IAM RR 0.71, ACV RR 0.85.',
                severity: 'critical'
            },
            {
                title: 'Dosis y potencias de estatinas',
                content: 'ALTA INTENSIDAD (reduce LDL ≥50%): Atorvastatina 40-80mg, Rosuvastatina 20-40mg. MODERADA (reduce LDL 30-50%): Atorvastatina 10-20mg, Simvastatina 20-40mg, Rosuvastatina 5-10mg, Pravastatina 40-80mg, Lovastatina 40mg. BAJA (<30%): Simvastatina 10mg, Pravastatina 10-20mg, Lovastatina 20mg, Fluvastatina 20-40mg. Preferir atorvastatina o rosuvastatina.',
                severity: 'high'
            },
            {
                title: 'Efectos adversos estatinas',
                content: 'FRECUENTES: Mialgias (poco frecuente, NND≈2000), incidencia diabetes NND=333 (dependiente dosis), elevación transaminasas (duplica vs placebo pero frecuencia baja). RAROS: Rabdomiólisis (muy raro, evitar Simvastatina ≥80mg), hepatopatía activa (contraindicación). NO aumenta: cáncer, mortalidad no vascular. Verdadera intolerancia muy infrecuente. Reexposición exitosa mayoría casos.',
                severity: 'medium'
            },
            {
                title: 'EZETIMIBE - Uso apropiado',
                content: 'NO primera línea prevención primaria ni secundaria. CONSIDERAR 10mg/día asociado a estatinas si: 1)Alto RCV + intolerancia estatinas moderada (no toleran dosis mayores), 2)Prevención secundaria + estatinas moderada + no toleran alta intensidad (beneficio marginal: NNT=1000 por 5 años evitar 1 IAM). Mecanismo: inhibe absorción intestinal colesterol. Seguro: no aumenta rabdomiólisis ni hepatopatía.',
                severity: 'medium'
            },
            {
                title: 'FIBRATOS - Indicaciones limitadas',
                content: 'NO primera línea. CONSIDERAR si: hipertrigliceridemia + requiere estatinas + NO LAS TOLERA. Reduce principalmente TG (36%), aumenta HDL (8%). Beneficio modesto: reduce IAM sin impacto mortalidad. Opciones: bezafibrato, ciprofibrato, fenofibrato. NUNCA gemfibrozil + estatinas (riesgo interacción). Preferir estatinas siempre que sea posible.',
                severity: 'medium'
            },
            {
                title: 'OMEGA-3 - NO recomendado',
                content: 'NO USAR suplementos omega-3 (EPA/DHA) prevención primaria ni secundaria. Reduce TG 25-35% pero POCO/NINGÚN efecto: mortalidad RR 0.97, ECVM RR 0.96, ACV RR 1.02. Beneficio marginal IAM RR 0.91. NNT=500 por 5 años evitar 1 evento. Beneficios alcanzables con alimentación: pescado graso ≥2 veces/semana. Suplementos NO justificados.',
                severity: 'medium'
            },
            {
                title: 'ASPIRINA (AAS) prevención PRIMARIA - NO usar',
                content: 'NO USAR aspirina sistemáticamente prevención primaria. Pequeña reducción eventos isquémicos SE CONTRARRESTA con aumento equivalente sangrados mayores. Beneficio clínico neto muy pequeño. RR eventos CV 0.89 vs RR sangrado mayor 1.43. NNT=265 prevenir ECVM vs NND=210 causar sangrado. Incertidumbre si beneficio persiste en quienes usan estatinas.',
                severity: 'critical'
            },
            {
                title: 'ASPIRINA (AAS) prevención SECUNDARIA - Recomendada',
                content: 'RECOMENDAR aspirina 100mg/día en prevención secundaria (antecedente IAM, ACV isquémico, AIT, arteriopatía periférica). Reduce: mortalidad CV RR 0.87 (NNT=117), IAM no fatal RR 0.69 (NNT=39), ACV isquémico RR 0.81 (NNT=36). Rango terapéutico probado 81-325mg, dosis 100mg buen balance eficacia/sangrado. Antecedente ACV hemorrágico NO contraindica uso si indicado.',
                severity: 'critical'
            },
            {
                title: 'Calculadores de RCVG - Herramientas y limitaciones',
                content: 'Calculadores OMS Américas, Framingham, Globorisk, Pooled Cohort, QRISK2: estiman RCVG pero pueden sobre/infraestimar riesgo individual. Variables principales: diabetes, edad, sexo, tabaquismo, PA, colesterol. Limitación: NO contemplan todos FRCV (ej: antecedentes familiares). Útiles para decisiones compartidas y comunicación riesgo. Considerar preferencias paciente. Estimar riesgo NO significa obligación tratar.',
                severity: 'medium'
            },
            {
                title: 'Seguimiento - Perfil lipídico durante tratamiento',
                content: 'PREVENCIÓN PRIMARIA: NO realizar perfil lipídico sistemático durante seguimiento (resultados no modifican tratamiento). ECA usaron dosis fijas, no metas LDL. Estatinas seguras/eficaces independiente valor basal. Alcanzar meta LDL NO motivo suspender/reducir estatinas. PREVENCIÓN SECUNDARIA: determinaciones periódicas SÍ útiles (ajustar dosis, valorar tratamientos adicionales). Seguimiento conjunto cardiología.',
                severity: 'high'
            },
            {
                title: 'Modificaciones estilo de vida - Base tratamiento',
                content: 'APLICAR A TODOS: 1)Cesación tabáquica (línea 0800-999-3040), 2)Actividad física ≥150min/semana aeróbica intensidad moderada, 3)Dieta saludable: DASH (frutas, verduras, granos enteros, lácteos bajos grasa, limitar sodio <2g/día), 4)Peso saludable IMC 18.5-24.9, 5)Alcohol: máx 1-2 UBE/día, 6)Control estrés (técnicas relajación 30-90min/semana), 7)Dormir adecuadamente.',
                severity: 'high'
            },
            {
                title: 'Cuándo NO iniciar estatinas',
                content: 'NO TRATAR con estatinas si: 1)Asintomático + VEF1 ≥50% + sin exacerbaciones (contexto EPOC), 2)Embarazo o planificación (suspender 3 meses antes), 3)Enfermedad hepática activa, 4)Alergia/hipersensibilidad conocida. PRECAUCIÓN: mujeres edad fértil (teratogénico), interacciones medicamentosas (gemfibrozil, ciertos antirretrovirales), miopatía previa severa.',
                severity: 'high'
            },
            {
                title: 'Valores objetivo e interpretación perfil lipídico',
                content: 'VALORES NORMALES: CT <200mg/dl, LDL <130mg/dl (óptimo <100), HDL >40mg/dl hombres/>50 mujeres, TG <150mg/dl. ELEVADOS: LDL 130-159 limítrofe, 160-189 alto, ≥190 muy alto. TRATAMIENTO: No basado en alcanzar metas específicas LDL sino en dosis fijas estatinas según RCV. Reducción LDL cada 40mg/dl: disminuye ECVM 21%, mortalidad CV 13%.',
                severity: 'medium'
            },
            {
                title: 'Adherencia al tratamiento - Clave del éxito',
                content: 'Adherencia ≥80% días crucial para beneficios. PREDICTORES BAJA ADHERENCIA: <50 años o ≥70 años, sexo femenino, bajos ingresos, prevención primaria. MEJOR ADHERENCIA: antecedente ECV, diabetes/HTA, edad 50-69 años, determinaciones frecuentes colesterol, bajo costo. Educación paciente fundamental. Explicar beneficios/riesgos. Decisiones compartidas. Alcanzar meta LDL NO significa suspender.',
                severity: 'high'
            },
            {
                title: 'Epidemiología ECV en Argentina',
                content: 'ECV: principal causa morbimortalidad Argentina. Diabetes/glucemia elevada: prevalencia 10.9% en ≥18 años (≈3.5 millones personas), 16.9% en ≥40 años (≈2.9 millones). HTA, tabaquismo, sedentarismo, obesidad: FRCV modificables prevalentes. SUBDIAGNÓSTICO dislipemia muy frecuente. Prevención primaria subutilizada. Oportunidad mejora calidad atención.',
                severity: 'medium'
            },
            {
                title: 'Comorbilidades frecuentes ECV',
                content: 'Evaluar/tratar: HTA (principal FRCV modificable), diabetes (RCV muy aumentado), obesidad/sobrepeso, tabaquismo, ERC, EPOC, enfermedad arterial periférica, insuficiencia cardíaca, fibrilación auricular, apnea sueño, osteoporosis, depresión/ansiedad (frecuente), cáncer. Abordaje integral multifactorial. Tratamiento combinado FRCV reduce eventos 50% vs convencional.',
                severity: 'medium'
            },
            {
                title: 'Hipercolesterolemia familiar (HF) - Detección',
                content: 'Prevalencia 1:500 (forma heterocigota). Sospechar si: LDL ≥190 o CT ≥300 (≥2 determinaciones) + xantomas tendinosos y/o antecedente familiar ECV prematura. Screening familiar: opción más costo-efectiva (50% familiares afectados). RR muerte 3-4 veces mayor si no tratada. Estatinas reducen riesgo drásticamente (RR 0.24). DERIVAR especialista confirmar diagnóstico, tratamiento, screening familiar.',
                severity: 'high'
            },
            {
                title: 'Vacunación en prevención cardiovascular',
                content: 'VACUNA ANTIGRIPAL: anual, todas personas con FRCV o ECV (reduce eventos CV). VACUNA ANTINEUMOCÓCICA: según esquema nacional para FRCV (diabetes, ERC, EPOC, cardiopatías). Vacunación parte integral prevención CV. Infecciones respiratorias: desencadenante eventos agudos CV. Protección adicional población alto riesgo.',
                severity: 'medium'
            }
        ],
        sources: [
            'Guía de Práctica Clínica Nacional sobre Prevención Cardiovascular - Ministerio de Salud Argentina 2021',
            'American College of Cardiology/American Heart Association (ACC/AHA) 2019',
            'European Society of Cardiology (ESC) 2016-2019',
            'Cholesterol Treatment Trialists (CTT) Collaboration',
            'NICE - National Institute for Health and Care Excellence UK 2014',
            'Organización Mundial de la Salud (OMS)'
        ]
    }
};