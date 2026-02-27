import { MCPMedicalContext } from '../interfaces/mcp-medical-context.interface';

export const alcoholContext: MCPMedicalContext = {
    id: 'alcohol',
    name: 'Consumo de Alcohol - Intervención Breve',
    keywords: [
        'alcohol', 'alcoholismo', 'bebidas alcohólicas', 'cerveza', 
        'vino', 'licor', 'fernet', 'tragos', 'consumo de riesgo',
        'consumo perjudicial', 'dependencia', 'binge drinking',
        'consumo episódico excesivo', 'CEEA', 'ebriedad', 'borrachera',
        'abstemio', 'moderación', 'AUDIT', 'intervención breve',
        'reducir consumo', 'dejar de tomar', 'embarazo y alcohol',
        'adolescentes y alcohol', 'UBE', 'unidad de bebida estándar'
    ],
    priority: 9,
    content: {
        description: 'Información basada en evidencia sobre el consumo de alcohol, su detección temprana mediante Intervención Breve (IB), tipos de consumo, herramientas de evaluación y recomendaciones para diferentes poblaciones según la Guía Nacional Argentina 2023.',
        
        mainTopics: [
            'Unidad de Bebida Estándar (UBE) y equivalencias',
            'Tipos de consumo: riesgo, perjudicial, episódico excesivo y dependencia',
            'Intervención Breve (IB): metodología de las 5A',
            'Herramientas de detección: AUDIT-C y AUDIT completo',
            'Efectos del alcohol en diferentes poblaciones',
            'Recomendaciones para embarazo, adolescentes, adultos y adultos mayores',
            'Alcohol y conducción de vehículos',
            'Mitos sobre el consumo de alcohol'
        ],

        guidelines: [
            {
                title: 'Unidad de Bebida Estándar (UBE)',
                content: 'Una UBE contiene aproximadamente 13g de alcohol puro y equivale a: 1 porrón o lata de cerveza (300-350cc), 1 vaso de vino (150cc), o 1 trago de licor solo o combinado (45cc) como whisky, vodka, fernet, ron, pisco u otros destilados.',
                severity: 'medium'
            },
            {
                title: 'Consumo de Riesgo',
                content: 'Patrón que aumenta el riesgo de consecuencias adversas si persiste. Se define como consumo regular de 20-40g diarios (2-3 UBE) en mujeres y 40-60g diarios (3-4 UBE) en hombres.',
                severity: 'high'
            },
            {
                title: 'Consumo Perjudicial',
                content: 'Conlleva consecuencias para la salud física y mental. Generalmente asociado con consumo regular promedio de más de 40g/día (más de 3 UBE) en mujeres y más de 60g/día (más de 4 UBE) en hombres.',
                severity: 'high'
            },
            {
                title: 'Consumo Episódico Excesivo (Binge Drinking)',
                content: 'Consumo de por lo menos 60g de alcohol (aproximadamente 5 UBE) en una misma ocasión en adultos. En adolescentes se considera a partir de 2 o más UBE en una ocasión. Particularmente dañino para ciertos problemas de salud.',
                severity: 'critical'
            },
            {
                title: 'Dependencia de Alcohol',
                content: 'Conjunto de fenómenos conductuales, cognitivos y fisiológicos donde el uso del alcohol se vuelve prioritario para el individuo, por encima de otras actividades y obligaciones que antes tenían mayor valor.',
                severity: 'critical'
            },
            {
                title: 'Intervención Breve (IB) - Metodología de las 5A',
                content: 'Herramienta efectiva de 5-20 minutos que incluye: 1) AVERIGUAR sobre consumo, 2) EVALUAR nivel de riesgo con herramientas como AUDIT, 3) ACONSEJAR de forma clara y personalizada, 4) AYUDAR con estrategias para reducir consumo, 5) ACOMPAÑAR con seguimiento. Evidencia moderada de efectividad.',
                severity: 'high'
            },
            {
                title: 'AUDIT-C: Herramienta de Rastreo Inicial',
                content: 'Cuestionario breve de 3 preguntas para detección inicial. Puntos de corte: ≥4 para mujeres, ≥5 para hombres. Si es positivo, completar con AUDIT de 10 preguntas. Toma menos de 5 minutos aplicar.',
                severity: 'medium'
            },
            {
                title: 'AUDIT Completo: Evaluación Diagnóstica',
                content: 'Cuestionario de 10 preguntas (puntaje 0-40) para discriminar patrón de consumo. Puntajes: 8-15 consumo de riesgo, 16-19 consumo perjudicial, 20-40 posible dependencia. Validado en español.',
                severity: 'medium'
            },
            {
                title: 'Alcohol y Embarazo - NIVEL CERO',
                content: 'NO existe nivel seguro de consumo de alcohol durante el embarazo. Cualquier cantidad puede causar Trastornos del Espectro Alcohólico Fetal (TEAF) y Síndrome Alcohólico Fetal (SAF), principal causa prevenible de retraso mental. La IB en embarazadas muy probablemente reduce el consumo.',
                severity: 'critical'
            },
            {
                title: 'Alcohol y Lactancia',
                content: 'Se debe evitar completamente el consumo de alcohol durante la lactancia. El alcohol pasa a la leche materna y puede afectar el desarrollo del bebé.',
                severity: 'critical'
            },
            {
                title: 'Adolescentes y Alcohol',
                content: 'En Argentina, 77% de adolescentes 13-17 años consumió alcohol antes de los 14 años. El cerebro en desarrollo es más vulnerable al daño inducido por alcohol. Iniciar antes de los 15 años aumenta 4 veces el riesgo de dependencia. CEEA en adolescentes: 2 o más UBE en una ocasión.',
                severity: 'critical'
            },
            {
                title: 'Alcohol y Conducción - CERO TOLERANCIA',
                content: 'El alcohol es depresor del sistema nervioso central. Reduce atención, enlentece reflejos y disminuye percepción sensorial. NUNCA conducir vehículos (auto, moto, bicicleta), operar maquinarias o realizar trabajos de riesgo bajo efectos del alcohol. Principal causa de siniestros viales.',
                severity: 'critical'
            },
            {
                title: 'Mito: Mezclar bebidas o "mala calidad" causa más daño',
                content: 'FALSO. El daño se mide por gramos de alcohol consumido, no depende de la mezcla ni de la "calidad". Una UBE es una UBE, sin importar el tipo de bebida.',
                severity: 'medium'
            },
            {
                title: 'Mito: El alcohol ayuda a dormir mejor',
                content: 'FALSO. El alcohol NO mejora el sueño. Tras consumo crónico, el efecto depresor disminuye e interfiere tanto para conciliar el sueño como con su arquitectura y continuidad, causando alteraciones del estado de ánimo y cognitivas.',
                severity: 'medium'
            },
            {
                title: 'Mito: El alcohol tiene efecto protector cardiovascular',
                content: 'FALSO/DESACTUALIZADO. No se ha podido confirmar el supuesto "efecto protector". Los beneficios cardiovasculares se logran con actividad física, reducción de sodio, no fumar y peso adecuado. El alcohol agrega riesgo de dependencia, siniestros, violencia y cáncer.',
                severity: 'medium'
            }
        ],

        symptoms: [
            'Necesidad de beber para sentirse bien',
            'Pérdida de control sobre la cantidad consumida',
            'Síndrome de abstinencia al dejar de beber (temblores, sudoración, ansiedad)',
            'Tolerancia aumentada (necesitar más cantidad para el mismo efecto)',
            'Descuido de responsabilidades personales, familiares y laborales',
            'Problemas de memoria o "lagunas" mentales',
            'Cambios en el estado de ánimo',
            'Conflictos familiares o sociales relacionados con el consumo',
            'Problemas legales (ej. conducir bajo efectos del alcohol)',
            'Continuar bebiendo a pesar de consecuencias negativas evidentes'
        ],

        riskFactors: [
            'Consumo frecuente y en grandes cantidades',
            'Antecedentes familiares de alcoholismo',
            'Inicio temprano del consumo (antes de los 15 años)',
            'Estrés crónico o problemas emocionales no tratados',
            'Entorno social que normaliza o promueve el consumo',
            'Disponibilidad y accesibilidad de bebidas alcohólicas',
            'Exposición a publicidad, promoción y patrocinio de alcohol',
            'Presión de grupo, especialmente en adolescentes',
            'Falta de información sobre riesgos reales del alcohol',
            'Problemas de salud mental (depresión, ansiedad)',
            'Ser varón (mayor prevalencia en hombres)',
            'Edad entre 18-35 años (mayor consumo en jóvenes)'
        ],

        treatments: [
            'Intervención Breve (IB) para consumo de riesgo o perjudicial',
            'Entrevista Motivacional para fomentar el cambio',
            'Consejo claro y personalizado del equipo de salud',
            'Modelo de Cambio de Prochaska y DiClemente',
            'Estrategias de reducción gradual con objetivos consensuados',
            'Evitar el alcohol algunos días cada semana',
            'Beber con las comidas (nunca en ayunas)',
            'Alternar bebidas alcohólicas con agua',
            'Grupos de apoyo (ej. Alcohólicos Anónimos)',
            'Tratamiento especializado para dependencia (fuera del alcance de IB)',
            'Tratamiento farmacológico supervisado (casos de dependencia)',
            'Abordaje interdisciplinario: psicología, medicina, trabajo social',
            'Tratamiento de comorbilidades (ansiedad, depresión)',
            'Apoyo familiar y del entorno cercano'
        ],

        recommendations: [
            'Para quienes NO consumen: desalentar el inicio, no existen beneficios que justifiquen comenzar a beber',
            'Limitar consumo a menos de 2 UBE/día en mujeres y menos de 3 UBE/día en hombres',
            'Evitar consumo episódico excesivo (binge drinking)',
            'NUNCA consumir alcohol durante embarazo o lactancia',
            'NO consumir alcohol antes de los 18 años (cerebro en desarrollo)',
            'CERO alcohol al conducir, operar máquinas o realizar trabajos de riesgo',
            'No ofrecer ni inducir consumo a niños, niñas y adolescentes',
            'Buscar ayuda profesional si existe pérdida de control sobre el consumo',
            'No mezclar alcohol con medicamentos sin consultar al médico',
            'Establecer días sin consumo de alcohol cada semana',
            'Conocer las equivalencias de UBE para medir el consumo real',
            'Atención a señales de alerta: temblores, "necesidad" de beber, problemas familiares/laborales',
            'Consultar al equipo de salud: la detección temprana es clave',
            'Evitar situaciones de riesgo: ofrecer alternativas sin alcohol en eventos sociales'
        ],

        prevention: [
            'Educación sobre riesgos desde temprana edad (sin estigmatizar)',
            'Promover alternativas de ocio y recreación sin alcohol',
            'Establecer límites claros y consensuados de consumo',
            'Fortalecer factores protectores: familia, escuela, comunidad',
            'Políticas públicas: prohibición de publicidad, promoción y patrocinio (PPP)',
            'Regular disponibilidad y accesibilidad de bebidas alcohólicas',
            'Controles de alcoholemia en rutas y espacios públicos',
            'Capacitación del equipo de salud en Intervención Breve',
            'Implementar IB en primer nivel de atención (consultas de rutina)',
            'Desnaturalizar el consumo: cuestionar la normalización social del alcohol',
            'Apoyo a familias: trabajar con padres, madres y cuidadores',
            'Detección temprana mediante AUDIT-C en todas las consultas',
            'Campañas de concientización basadas en evidencia (no moralizantes)',
            'Articulación intersectorial: salud, educación, seguridad, justicia'
        ],

        sources: [
            'Ministerio de Salud de la Nación Argentina - Guía de Práctica Clínica Nacional sobre Intervención Breve para Reducir el Consumo de Alcohol (2023)',
            'Organización Mundial de la Salud (OMS)',
            'Organización Panamericana de la Salud (OPS)',
            'Encuesta Nacional de Factores de Riesgo (ENFR) Argentina 2018',
            'Encuesta Mundial de Salud Escolar (EMSE) Argentina 2018',
            'Sistema GRADE (Grading of Recommendations Assessment, Development and Evaluation)',
            'Revisiones sistemáticas Cochrane sobre intervenciones breves',
            'Agencia Nacional de Seguridad Vial (ANSV) Argentina'
        ]
    }
};