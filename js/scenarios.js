// ====================================================================
// scenarios.js - CATÁLOGO DE CASOS CLÍNICOS MAESTROS V2
// ====================================================================

const ScenariosDB = [
    {
        id: 1,
        scenarioKey: "hemorrhageFemoral",
        title: "Caso 1: Trauma Penetración con Shock Exanguinante",
        context: "Zona de Incidente Táctico Urbano",
        vitals: "Paciente masculino con herida desgarrante por fragmento en muslo derecho. Sangrado rutilante, pulsátil y masivo empapando el uniforme.",
        timeLimit: 300, // 5 minutos críticos
        patientTemplate: {
            volSanguineo: 95,
            fc: 115,
            paSistolica: 100,
            paDiastolica: 65,
            fr: 24,
            spo2: 95,
            gcs: 14,
            hemorragia: "Severa",
            perfusion: "Disminuida",
            dolor: 8
        },
        // Procedimientos habilitados para este entorno operativo
        allowedActions: [
            { text: "🚑 Colocar Torniquete Táctico (Rígido)", action: "tourniquet_correct" },
            { text: "✋ Aplicar Presión Directa sobre la Herida", action: "direct_pressure" },
            { text: "🫁 Administrar Oxígeno Suplementario (Máscara)", action: "oxygen" },
            { text: "🧠 Realizar Manejo Avanzado de Vía Aérea", action: "airway_management" },
            { text: "🩸 Canalizar Vía Periférica e Iniciar Fluidoterapia", action: "iv_fluid" },
            { text: "⏱️ Reevaluar Paciente (Esperar evolución)", action: "wait_tick" },
            { text: "🚀 EVACUAR PACIENTE / FINALIZAR ATENCIÓN", action: "transport_patient" }
        ]
    },
    {
        id: 2,
        scenarioKey: "cardiacArrest",
        title: "Caso 2: Colapso Cardiogénico Prehospitalario",
        context: "Entorno Civil / Vía Pública",
        vitals: "Paciente adulto mayor colapsado súbitamente sobre la acera posterior a manifestar dolor opresivo en el pecho.",
        timeLimit: 400,
        patientTemplate: {
            alive: false, // Inicia en PCR
            volSanguineo: 100,
            fc: 0,
            paSistolica: 0,
            paDiastolica: 0,
            fr: 0,
            spo2: 0,
            gcs: 3,
            hemorragia: "Ninguna",
            perfusion: "Crítica",
            dolor: 0
        },
        allowedActions: [
            { text: "⚡ Iniciar Maniobras de RCP (30:2 Calidad)", action: "start_cpr" },
            { text: "📟 Conectar y Encender el DEA", action: "apply_aed" },
            { text: "🫁 Colocar Cánula Mayo y Ventilar con AMBU", action: "airway_management" },
            { text: "🩸 Canalizar Acceso Venoso Periférico", action: "iv_access" },
            { text: "⏱️ Monitorizar Ritmo (Esperar ciclo)", action: "wait_tick" },
            { text: "🚀 EVACUAR PACIENTE / FINALIZAR ATENCIÓN", action: "transport_patient" }
        ]
    }
];

// Publicar la base de datos de forma global para los engranajes del sistema
window.ScenariosDB = ScenariosDB;
