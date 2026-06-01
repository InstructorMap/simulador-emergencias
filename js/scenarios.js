const ScenariosDB = [
    { 
        id: 1, 
        title: "PCR en Centro Comercial", 
        context: "Varón 58 años, colapso súbito.", 
        vitals: "Inconsciente, apnea, sin pulso", 
        timeLimit: 30,
        options: [
            { text: "Iniciar RCP 30:2 y solicitar DEA", correct: true, feedback: "Correcto: Prioridad compresiones y desfibrilador." },
            { text: "Administrar adrenalina IM", correct: false, feedback: "Error: Adrenalina IM es para anafilaxia." },
            { text: "Trasladar inmediatamente", correct: false, feedback: "Error: RCP in situ antes del traslado." },
            { text: "Verificar pulso 30 segundos", correct: false, feedback: "Error: No demorar RCP." }
        ] 
    },
    { 
        id: 2, 
        title: "Shock Hemorrágico Táctico", 
        context: "Herida por arma blanca en muslo. Sangrado profuso.", 
        vitals: "FC 130, PA 80/50, palidez", 
        timeLimit: 30,
        options: [
            { text: "Aplicar torniquete inmediato", correct: true, feedback: "Correcto: Torniquete salva vidas." },
            { text: "Presión directa y esperar", correct: false, feedback: "Error: No suficiente para hemorragia arterial." },
            { text: "Elevar miembro", correct: false, feedback: "Error: Pérdida de tiempo." },
            { text: "Ácido tranexámico IM", correct: false, feedback: "Error: No detiene sangrado activo." }
        ] 
    },
    { 
        id: 3, 
        title: "Triage Múltiples Víctimas", 
        context: "Accidente autobús. 15 víctimas.", 
        vitals: "Mujer 30 años, respira, FC 120, obedece órdenes", 
        timeLimit: 30,
        options: [
            { text: "Amarillo (retrasado)", correct: true, feedback: "Correcto: Taquicardia pero estable y obedece." },
            { text: "Rojo (inmediato)", correct: false, feedback: "Error: No cumple criterios ROJO." },
            { text: "Verde (leve)", correct: false, feedback: "Error: Taquicardia sugiere amarillo." },
            { text: "Negro (fallecido)", correct: false, feedback: "Error: Respira." }
        ] 
    }
    // Podés pegar el resto de tus escenarios aquí siguiendo esta misma estructura
];
