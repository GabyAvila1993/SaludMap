/**
 * CONTEXTO MCP: DIABETES MELLITUS
 * 
 * Basado en el Manual de Educación Diabetológica para el Automanejo 
 * de Personas con Diabetes Mellitus (Argentina, 2024) y la Guía de 
 * Práctica Clínica Nacional 2019
 * 
 * Este contexto contiene información verificada sobre:
 * - Educación diabetológica para el automanejo (EDAM)
 * - Tipos de diabetes y su manejo
 * - Control glucémico y complicaciones
 * - Autocuidado y hábitos saludables
 * - Herramientas educativas (Entrevista Motivacional, Intervención Breve)
 */

import {MCPMedicalContext} from '../interfaces/mcp-medical-context.interface';

export const diabetesContext: MCPMedicalContext = {
    id: 'diabetes',
    name: 'Diabetes Mellitus - Educación para el Automanejo',
    keywords: [
        'diabetes', 'diabético', 'diabética', 'glucosa', 'azúcar en sangre',
        'glucemia', 'hiperglucemia', 'hipoglucemia', 'insulina',
        'hemoglobina glicosilada', 'HbA1c', 'A1c', 'glucómetro',
        'automonitoreo', 'tipo 1', 'tipo 2', 'diabetes gestacional',
        'prediabetes', 'resistencia a la insulina', 'páncreas',
        'metformina', 'antidiabéticos', 'inyección de insulina',
        'bomba de insulina', 'infusor', 'pinchar dedo', 'medirse azúcar',
        'control de diabetes', 'descontrol glucémico', 'descompensación',
        'complicaciones diabéticas', 'retinopatía', 'nefropatía', 'neuropatía',
        'pie diabético', 'cetoacidosis', 'coma diabético',
        'dieta para diabéticos', 'conteo de carbohidratos', 'hidratos de carbono',
        'índice glucémico', 'alimentación y diabetes', 'ejercicio y diabetes'
    ],
    priority: 9,
    content: {
        description: 'Información basada en evidencia sobre diabetes mellitus, enfocada en la educación para el automanejo (EDAM), control glucémico, prevención de complicaciones y empoderamiento de personas con diabetes según las guías nacionales argentinas.',
        
        mainTopics: [
            'Educación Diabetológica para el Automanejo (EDAM)',
            'Tipos de diabetes: tipo 1, tipo 2 y gestacional',
            'Control glucémico y objetivos terapéuticos',
            'Prevención y manejo de hipoglucemia e hiperglucemia',
            'Siete hábitos saludables para el autocuidado',
            'Tratamiento farmacológico: insulina y antidiabéticos orales',
            'Automonitoreo glucémico',
            'Complicaciones agudas y crónicas',
            'Cuidado de los pies en personas con diabetes',
            'Herramientas educativas: Entrevista Motivacional e Intervención Breve (5A)',
            'Empoderamiento y automanejo de la enfermedad',
            'Alimentación saludable y conteo de carbohidratos',
            'Actividad física y ejercicio en diabetes'
        ],

        guidelines: [
            {
                title: 'Prevalencia y Situación en Argentina',
                content: '1 de cada 10 personas de 18 años o más tiene glucemia elevada o diabetes (aumento del 51% desde 2005). Anualmente se registran ~9.000 muertes vinculadas a diabetes, 27% en menores de 65 años. 4 de cada 10 personas con diabetes desconocen su situación.',
                severity: 'critical'
            },
            {
                title: 'Niveles Normales de Glucosa en Sangre',
                content: 'Valores normales: 70-140 mg/dL. Glucosa en ayunas: 70-100 mg/dL. HbA1c objetivo: generalmente <7% para adultos (puede variar según características individuales). Glucosa 2 horas después de comer: <180 mg/dL.',
                severity: 'high'
            },
            {
                title: 'Hipoglucemia - Reconocimiento y Tratamiento URGENTE',
                content: 'Glucosa <70 mg/dL. SÍNTOMAS: sudoración fría, temblores, hambre, debilidad, mareos, palpitaciones, confusión. TRATAMIENTO INMEDIATO: consumir 15g de carbohidratos de acción rápida (3-4 tabletas de glucosa, 1 vaso de jugo, 1 cucharada de miel o azúcar). Esperar 15 min, medir nuevamente. Si persiste <70 mg/dL, repetir. Si hay pérdida de conciencia: LLAMAR EMERGENCIAS.',
                severity: 'critical'
            },
            {
                title: 'Hiperglucemia - Reconocimiento',
                content: 'Glucosa elevada en sangre. SÍNTOMAS: aumento de sed, orinar con frecuencia, pérdida de peso, visión borrosa, fatiga, pérdida de apetito, azúcar en orina. CAUSAS: demasiada comida, poca insulina/medicación, falta de ejercicio, estrés, enfermedad. Requiere ajuste del tratamiento por profesional.',
                severity: 'high'
            },
            {
                title: 'Educación Diabetológica para el Automanejo (EDAM)',
                content: 'Provisión sistemática de educación e intervenciones de apoyo para aumentar habilidades y confianza en la gestión de la salud. Incluye: evaluación periódica de progresos, establecimiento de metas consensuadas, resolución de problemas. DURACIÓN INICIAL: 10 horas (5-6 sesiones). REFUERZO: 2 horas/año.',
                severity: 'high'
            },
            {
                title: 'Empoderamiento en Diabetes',
                content: 'Proceso mediante el cual las personas con diabetes descubren y desarrollan la capacidad de ser responsables de su propia vida, adquiriendo habilidades para resolver problemas de salud y tomar decisiones acertadas. Ejemplo: persona empoderada reconoce hipoglucemia, sabe tratarla y prevenirla.',
                severity: 'medium'
            },
            {
                title: 'Siete Hábitos Saludables para el Autocuidado',
                content: '1) Comer saludablemente con plan personalizado. 2) Mantenerse activo: 30 min/día, 6 días/semana. 3) Medir glucosa según indicación. 4) Seguir tratamiento médico. 5) Aprender a enfrentar retos cotidianos mediante educación. 6) Actitud positiva y adaptación al nuevo estilo de vida. 7) Reducir riesgos: controles periódicos de ojos, pies, riñón, boca.',
                severity: 'high'
            },
            {
                title: 'Alimentación en Diabetes',
                content: 'Se recomienda: 5 comidas al día (desayuno, almuerzo, comida, merienda, cena). NUNCA consumir: refrescos azucarados y bollería. NO ABUSAR: legumbres y pastas (carbohidratos complejos). LIBREMENTE: carnes magras y verduras. Dieta alta en fibra vegetal ayuda a regular glucosa. Método del plato: 1/2 vegetales, 1/4 proteínas, 1/4 carbohidratos.',
                severity: 'high'
            },
            {
                title: 'Ejercicio Físico en Diabetes',
                content: 'BENEFICIOSO y NECESARIO. El ejercicio BAJA la glucosa en sangre. Realizar TODOS LOS DÍAS de forma regular, preferentemente tras una comida. 30 minutos diarios, 6 veces/semana. Beneficios: fortalece musculatura, ayuda a quemar calorías, mantiene peso ideal, mejora control glucémico.',
                severity: 'high'
            },
            {
                title: 'Peso Corporal y Diabetes',
                content: 'Mantener peso adecuado (IMC 18.5-24.9) FACILITA enormemente el control de la diabetes. En diabetes tipo 2, la pérdida de peso puede mejorar significativamente el control glucémico e incluso revertir la enfermedad en algunos casos.',
                severity: 'medium'
            },
            {
                title: 'Tratamiento con Insulina - Desmitificar',
                content: 'MITO: "La insulina es el último recurso y significa que fracasé". REALIDAD: La insulina es una sustancia natural que el páncreas produce para regular glucosa. En diabetes tipo 1 es OBLIGATORIA desde el diagnóstico. En tipo 2, su incorporación OPORTUNA ayuda a prevenir complicaciones. NO es un castigo, es una herramienta terapéutica efectiva.',
                severity: 'high'
            },
            {
                title: 'Cuidado de los Pies - FUNDAMENTAL',
                content: 'Las personas con diabetes pueden desarrollar mala circulación y pérdida de sensibilidad en pies (neuropatía). IMPORTANTE: Lavarse los pies 1 vez/día. Revisarse TODOS LOS DÍAS mirando planta y entre dedos. Si aparece callo o lesión: CONSULTAR CON MÉDICO/ENFERMERA (nunca automedicarse). Usar calzado cómodo, sin costuras. Secar bien entre los dedos.',
                severity: 'critical'
            },
            {
                title: 'Salud Bucal en Diabetes',
                content: 'Tener la boca en buen estado y revisiones periódicas con dentista es FUNDAMENTAL para evitar infecciones que pueden causar mal control de glucosa. Las infecciones bucales pueden elevar la glucemia y dificultar el control diabético.',
                severity: 'medium'
            },
            {
                title: 'Automonitoreo Glucémico',
                content: 'Medir glucosa en sangre (pinchándose un dedo) permite saber el nivel EXACTO en ese momento. Esto ayuda a: tomar decisiones sobre comidas, ajustar medicación (con indicación médica), detectar hipoglucemias/hiperglucemias, evaluar efecto del ejercicio. No todas las personas necesitan automonitoreo; lo indica el profesional.',
                severity: 'medium'
            },
            {
                title: 'Complicaciones Crónicas de Diabetes',
                content: 'Buen control glucémico PREVIENE complicaciones. Principales: 1) Retinopatía diabética (daño en ojos, puede causar ceguera). 2) Nefropatía diabética (daño renal). 3) Neuropatía (daño en nervios, especialmente pies). 4) Enfermedad cardiovascular (infarto, ACV). 5) Pie diabético (úlceras, infecciones). ESENCIAL: controles periódicos preventivos.',
                severity: 'critical'
            },
            {
                title: 'Diabetes y Salud Mental',
                content: 'Las personas con diabetes tienen MAYOR RIESGO de presentar depresión y ansiedad. Al recibir diagnóstico pueden atravesar: shock, negación, enojo, miedo, frustración. Es NORMAL. Proceso hasta aceptación requiere tiempo. Comunicar diagnóstico adecuadamente reduce impacto emocional. Índice de Bienestar OMS-5 puede evaluar estado emocional.',
                severity: 'high'
            },
            {
                title: 'Cómo Dar el Diagnóstico de Diabetes',
                content: 'Hacer en ámbito adecuado (no pasillos), con persona acompañada si es posible. Mantener actitud empática. Usar preguntas abiertas. Dosificar información con pausas. Lenguaje simple, frases cortas. Dejar que pregunte y exprese emociones. EXPLICAR: aunque diabetes es crónica (no se cura), hay tratamientos efectivos para controlarla y prevenir complicaciones.',
                severity: 'high'
            },
            {
                title: 'Lenguaje No Estigmatizante',
                content: 'EVITAR términos como: "diabético" (preferir "persona con diabetes"), "no controlado", "no cumplidor", "mal paciente". USAR lenguaje: neutral, respetuoso, centrado en la persona, que no genere vergüenza ni ansiedad. DESTACAR: capacidad de autogestión, logros, esfuerzos. El lenguaje influye en percepción y comportamiento.',
                severity: 'medium'
            },
            {
                title: 'Etapas del Cambio de Comportamiento',
                content: 'Modelo de Prochaska: 1) Precontemplación (no reconoce problema). 2) Contemplación (considera cambio pero hay ambivalencia, planea cambiar en 6 meses). 3) Preparación (dispuesto a cambiar en 30 días, toma acciones). 4) Acción (pone en práctica el cambio). 5) Mantenimiento (ha mantenido cambio >6 meses). Pueden ocurrir RECAÍDAS (es normal, no es fracaso).',
                severity: 'medium'
            },
            {
                title: 'Intervención Breve de las 5A',
                content: 'Herramienta efectiva de 3-20 minutos: 1) AVERIGUAR (preguntas abiertas, sin juzgar). 2) ACONSEJAR (mensajes claros, personalizados, beneficios). 3) ACORDAR (metas consensuadas, por dónde empezar). 4) AYUDAR (aumentar motivación y confianza). 5) ACOMPAÑAR (seguimiento, chequear logros, revisar plan, nuevas metas). Las intervenciones deben REPETIRSE para tener efecto.',
                severity: 'medium'
            }
        ],

        symptoms: [
            // Síntomas de HIPERGLUCEMIA (glucosa alta)
            'Sed excesiva (polidipsia)',
            'Orinar con mucha frecuencia (poliuria)',
            'Hambre constante (polifagia)',
            'Pérdida de peso inexplicable',
            'Fatiga y cansancio extremo',
            'Visión borrosa',
            'Heridas que cicatrizan lentamente',
            'Infecciones frecuentes (piel, encías, vejiga)',
            'Pérdida de apetito en casos severos',
            'Azúcar en la orina',
            // Síntomas de HIPOGLUCEMIA (glucosa baja) - EMERGENCIA
            'Sudoración fría',
            'Temblores',
            'Hambre súbita',
            'Debilidad',
            'Mareos',
            'Palpitaciones',
            'Confusión o dificultad para concentrarse',
            'Irritabilidad',
            'Palidez',
            'Hormigueo en labios o lengua'
        ],

        riskFactors: [
            'Sobrepeso y obesidad (especialmente grasa abdominal)',
            'Sedentarismo / inactividad física',
            'Antecedentes familiares de diabetes',
            'Edad superior a 45 años',
            'Diabetes gestacional previa',
            'Hipertensión arterial (≥140/90 mmHg)',
            'Colesterol HDL bajo (<35 mg/dL) y/o triglicéridos altos (>250 mg/dL)',
            'Síndrome de ovario poliquístico',
            'Prediabetes (glucosa alterada en ayunas o intolerancia a la glucosa)',
            'Enfermedad cardiovascular previa',
            'Alimentación no saludable (alta en azúcares refinados y grasas saturadas)',
            'Tabaquismo',
            'Consumo excesivo de alcohol',
            'Estrés crónico',
            'Apnea del sueño',
            'Uso prolongado de ciertos medicamentos (corticoides, algunos antipsicóticos)'
        ],

        treatments: [
            // DIABETES TIPO 1
            'Diabetes Tipo 1: INSULINA OBLIGATORIA desde el diagnóstico (múltiples inyecciones diarias o bomba de insulina)',
            // DIABETES TIPO 2
            'Diabetes Tipo 2: Cambios en estilo de vida (alimentación + ejercicio) como primera línea',
            'Metformina: medicamento oral de primera elección en tipo 2 (si no hay contraindicaciones)',
            'Otros antidiabéticos orales: sulfonilureas, inhibidores DPP-4, inhibidores SGLT2, análogos GLP-1',
            'Insulina en tipo 2: cuando medicamentos orales no son suficientes o en descompensaciones',
            'Combinaciones de medicamentos según necesidades individuales',
            // GENERAL
            'Automonitoreo glucémico (cuando está indicado por el profesional)',
            'Educación diabetológica estructurada (EDAM): 10 horas iniciales + 2 horas/año de refuerzo',
            'Control de presión arterial (<140/90 mmHg, o <130/80 si hay daño renal)',
            'Control de colesterol y triglicéridos',
            'Aspirina en prevención cardiovascular (cuando está indicado)',
            'Vacunación: gripe anual, neumococo, hepatitis B, COVID-19',
            'Tecnologías: monitores continuos de glucosa, bombas de insulina (según indicación)',
            'Abordaje interdisciplinario: médico, nutricionista, educador en diabetes, salud mental',
            'Controles periódicos: HbA1c cada 3-6 meses, fondo de ojo anual, función renal anual, examen de pies en cada consulta'
        ],

        recommendations: [
            // ALIMENTACIÓN
            'Realizar 5 comidas al día: desayuno, almuerzo, comida, merienda, cena (evita hipoglucemias y picos de glucosa)',
            'Método del plato: 1/2 vegetales no almidonados, 1/4 proteínas magras, 1/4 carbohidratos complejos',
            'Aumentar consumo de fibra (verduras, legumbres, cereales integrales): ayuda a regular glucosa',
            'NUNCA consumir: refrescos azucarados, jugos industriales, bollería, golosinas, azúcar refinada',
            'Moderar consumo de carbohidratos: pastas, arroz, pan, legumbres (NO eliminar, sino controlar porciones)',
            'Preferir carbohidratos de bajo índice glucémico: legumbres, cereales integrales, vegetales',
            'Incluir proteínas magras: pollo sin piel, pescado, carnes rojas magras, huevo',
            'Evitar grasas saturadas y trans; preferir aceites vegetales, frutos secos, palta',
            'Hidratarse con agua (evitar bebidas azucaradas)',
            'Leer etiquetas nutricionales: identificar azúcares ocultos',
            'Conteo de carbohidratos (para quienes usan insulina y según indicación profesional)',
            // ACTIVIDAD FÍSICA
            'Realizar 30 minutos de ejercicio aeróbico moderado, 6 días a la semana (mínimo 150 min/semana)',
            'Ejercicio TODOS LOS DÍAS de forma regular, preferentemente tras una comida',
            'Combinar ejercicio aeróbico (caminar, nadar, bicicleta) con ejercicios de fuerza 2-3 veces/semana',
            'El ejercicio BAJA la glucosa: llevar siempre carbohidratos de acción rápida por si hay hipoglucemia',
            'Medir glucosa antes y después del ejercicio (si se automonitorea)',
            'Aumentar actividad gradualmente: empezar con 10 minutos e ir incrementando',
            // PESO
            'Mantener peso corporal saludable (IMC 18.5-24.9 kg/m²)',
            'Pérdida del 5-10% del peso corporal mejora significativamente el control glucémico',
            'Establecer metas realistas de descenso: 0.5-1 kg por semana',
            // MONITOREO
            'Conocer los objetivos glucémicos individuales (acordados con el profesional)',
            'HbA1c generalmente <7% (puede variar según edad, comorbilidades, riesgo de hipoglucemia)',
            'Automonitoreo glucémico según indicación: pre-comidas, 2h post-comidas, o según esquema personalizado',
            'Llevar registro de glucemias (libreta o app): ayuda a identificar patrones',
            // MEDICACIÓN
            'Tomar medicamentos EXACTAMENTE como fueron indicados (horarios, dosis, con o sin comidas)',
            'NUNCA suspender ni modificar dosis sin consultar al profesional',
            'Almacenar insulina correctamente: en heladera (no congelar), lapicera en uso a temperatura ambiente',
            'Rotar sitios de inyección de insulina (abdomen, muslos, glúteos, brazos): previene lipodistrofia',
            'Técnica de inyección: pellizco de piel, ángulo 90°, jeringa perpendicular',
            'Desechar agujas en recipiente rígido (NO en bolsa común)',
            // AUTOCUIDADO
            'Revisar PIES TODOS LOS DÍAS: mirar planta, entre dedos, buscar heridas, ampollas, cambios de color',
            'Lavar pies diariamente con agua tibia (NO caliente) y jabón neutro, secar bien entre dedos',
            'Usar calzado cómodo, sin costuras internas, evitar caminar descalzo',
            'Cortar uñas rectas (NO redondear esquinas), limar bordes',
            'Si aparece CUALQUIER lesión en pies: CONSULTAR INMEDIATAMENTE (no automedicarse)',
            'NO usar callicidas ni elementos cortantes para remover callosidades',
            'Visita al dentista cada 6 meses: prevenir infecciones bucales que descontrolan glucosa',
            'Cepillado dental 3 veces/día, uso de hilo dental',
            // CONTROLES MÉDICOS
            'Control oftalmológico (fondo de ojo) al menos 1 vez/año: detectar retinopatía precozmente',
            'Control de función renal (creatinina, microalbuminuria) al menos 1 vez/año',
            'Control de presión arterial en cada consulta',
            'Control de perfil lipídico (colesterol, triglicéridos) al menos 1 vez/año',
            'Examen de pies en CADA consulta médica',
            'HbA1c cada 3-6 meses (según control glucémico)',
            // PREVENCIÓN DE COMPLICACIONES
            'NO fumar: el tabaco multiplica el riesgo cardiovascular y de complicaciones',
            'Controlar presión arterial: objetivo <140/90 mmHg (<130/80 si hay daño renal)',
            'Controlar colesterol: LDL generalmente <100 mg/dL (puede ser más bajo según riesgo)',
            'Vacunarse: gripe (anual), neumococo, hepatitis B, COVID-19, tétanos (cada 10 años)',
            'Limitar consumo de alcohol: máximo 1 bebida/día mujeres, 2/día hombres',
            'Evitar ayunos prolongados: pueden causar hipoglucemia',
            // EDUCACIÓN Y APOYO
            'Participar en programa de educación diabetológica (EDAM): mejora control y calidad de vida',
            'Informar a familia y entorno sobre diabetes: apoyo favorece el cambio',
            'Unirse a grupos de apoyo de personas con diabetes: compartir experiencias ayuda',
            'Aprender a reconocer y tratar hipoglucemias: llevar SIEMPRE carbohidratos de acción rápida',
            'Llevar identificación de diabetes (pulsera, tarjeta): crucial en emergencias',
            'Conocer los síntomas de alarma: cuándo consultar urgente',
            // SITUACIONES ESPECIALES
            'Días de enfermedad: NUNCA suspender medicación, controlar glucosa con más frecuencia, hidratarse',
            'Viajes: llevar medicación de más, plan de comidas, carbohidratos de emergencia',
            'Embarazo: planificar con anticipación, control glucémico estricto (previene malformaciones)',
            'Alcohol: si se consume, hacerlo con comida (riesgo de hipoglucemia)',
            // EMPODERAMIENTO
            'Tomar decisiones informadas: la persona con diabetes es la PROTAGONISTA de su cuidado',
            'Establecer metas PROPIAS, no impuestas: aumenta probabilidad de lograrlas',
            'Celebrar logros (aunque sean pequeños): aumenta motivación y autoestima',
            'Ante dificultades: NO culpabilizar, identificar obstáculos y buscar soluciones en conjunto',
            'Aceptar que habrá días buenos y malos: diabetes es para toda la vida, no es perfección'
        ],

        prevention: [
            'Mantener peso corporal saludable (IMC 18.5-24.9 kg/m²) previene diabetes tipo 2',
            'Actividad física regular: mínimo 150 min/semana de ejercicio aeróbico moderado',
            'Alimentación saludable: alta en fibra (vegetales, frutas, cereales integrales), baja en azúcares refinados y grasas saturadas',
            'Evitar bebidas azucaradas (refrescos, jugos industriales): principal fuente de azúcar en la dieta',
            'NO fumar: el tabaco aumenta resistencia a la insulina',
            'Limitar consumo de alcohol',
            'Controlar presión arterial: mantener <140/90 mmHg',
            'Controlar colesterol y triglicéridos',
            'Dormir adecuadamente: 7-8 horas/noche (falta de sueño aumenta riesgo)',
            'Manejo del estrés: el estrés crónico eleva glucosa y aumenta resistencia a insulina',
            'Detección temprana: screening en personas con factores de riesgo (>45 años, sobrepeso + 1 factor adicional)',
            'En prediabetes: intervención intensiva en estilo de vida puede prevenir o retrasar diabetes tipo 2',
            'Control médico regular: detección y tratamiento precoz',
            'Educación poblacional: desmitificar diabetes, promover hábitos saludables desde la infancia',
            'Políticas públicas: etiquetado frontal de alimentos, impuestos a bebidas azucaradas, promoción de actividad física',
            'Ambiente saludable: acceso a alimentos saludables, espacios para actividad física'
        ],

        sources: [
            'Ministerio de Salud de la Nación Argentina - Manual de Educación Diabetológica para el Automanejo de Personas con Diabetes Mellitus (2024)',
            'Ministerio de Salud de la Nación Argentina - Guía de Práctica Clínica Nacional sobre Prevención, Diagnóstico y Tratamiento de la Diabetes Mellitus tipo 2 (2019)',
            'Organización Panamericana de la Salud (OPS/OMS)',
            'Federación Internacional de Diabetes (IDF) - Región SACA',
            'Sociedad Argentina de Diabetes (SAD)',
            'American Diabetes Association (ADA)',
            'Asociación Latinoamericana de Diabetes (ALAD)',
            'Global Burden of Disease Study 2021',
            '4ta Encuesta Nacional de Factores de Riesgo Argentina (2018)',
            'Resolución 2820/2022 Ministerio de Salud Argentina',
            'Cuestionario ECODI (Escala de Conocimientos sobre Diabetes)',
            'Índice de Bienestar OMS-5',
            'Miller & Rollnick - Entrevista Motivacional (2013)',
            'Modelo de Etapas del Cambio de Prochaska y DiClemente'
        ]
    }
};