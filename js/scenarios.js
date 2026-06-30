// ==========================================
// scenarios.js
// Escenarios clínicos conectados al motor
// ==========================================

const ScenariosDB = [
    // ======================================
    // 1 — Hemorragia Femoral
    // ======================================
    {
        id: 1,
        scenarioKey: "hemorrhageFemoral",
        title: "Shock Hemorrágico Táctico",
        context: "Herida por arma blanca en muslo con sangrado profuso.",
        vitals: "FC 130, PA 80/50, palidez marcada.",
        timeLimit: 600,
        dynamic: true,
        options: [
            {
                text: "Aplicar torniquete inmediato",
                action: "tourniquet_correct",
                priority: "life-saving"
            },
            {
                text: "Presión directa y esperar",
                action: "direct_pressure",
                priority: "secondary"
            },
            {
                text: "Administrar oxígeno",
                action: "oxygen",
                priority: "secondary"
            },
            {
                text: "Canalizar vía periférica",
                action: "iv_access",
                priority: "secondary"
            }
        ]
    },

    // ======================================
    // 2 — PCR
    // ======================================
    {
        id: 2,
        scenarioKey: "cardiacArrest",
        title: "PCR en Centro Comercial",
        context: "Varón de 58 años, colapso súbito.",
        vitals: "Inconsciente, apnea, sin pulso.",
        timeLimit: 900,
        dynamic: true,
        options: [
            {
                text: "Iniciar RCP 30:2",
                action: "start_cpr",
                priority: "life-saving"
            },
            {
                text: "Aplicar DEA",
                action: "apply_aed",
                priority: "life-saving"
            },
            {
                text: "Desfibrilar",
                action: "shock",
                priority: "life-saving"
            },
            {
                text: "Manejo de vía aérea",
                action: "airway_management",
                priority: "secondary"
            }
        ]
    }
];
