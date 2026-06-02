// ==========================================
// simulation-config.js
// Configuración central de simulaciones
// ==========================================

window.SimulationConfig = {

    // ======================================
    // A — Hemorragia Femoral
    // ======================================
    hemorrhageFemoral: {

        id: "hemorrhage_femoral",

        name:
            "Hemorragia Femoral Crítica",

        description:
            "Paciente con hemorragia femoral masiva posterior a trauma penetrante.",

        duration: 600,

        patientTemplate: {

            airway: "patent",

            breathing: 24,

            spo2: 96,

            circulation: {
                heartRate: 118,
                systolicBP: 100,
                diastolicBP: 65,
                bleeding: "severe",
                bleedingControlled: false
            },

            neuro: {
                gcs: 15,
                pain: 8,
                conscious: true
            },

            shockLevel: 0,

            deteriorationStage:
                "unstable"
        },

        objectives: [
            "identify_massive_bleeding",
            "apply_tourniquet",
            "prevent_hemorrhagic_shock",
            "perform_reassessment"
        ],

        allowedActions: [
            "scene_safe",
            "tourniquet_correct",
            "tourniquet_incorrect",
            "direct_pressure",
            "oxygen",
            "iv_access",
            "rapid_transport"
        ]
    },

    // ======================================
    // B — PCR
    // ======================================
    cardiacArrest: {

        id: "cardiac_arrest",

        name:
            "Paro Cardiorrespiratorio",

        description:
            "Paciente inconsciente sin pulso.",

        duration: 900,

        patientTemplate: {

            airway: "compromised",

            breathing: 0,

            spo2: 70,

            circulation: {
                heartRate: 0,
                systolicBP: 0,
                diastolicBP: 0,
                bleeding: "none",
                bleedingControlled: true
            },

            neuro: {
                gcs: 3,
                pain: 0,
                conscious: false
            },

            rhythm: "VF",

            deteriorationStage:
                "cardiac_arrest"
        },

        objectives: [
            "recognize_arrest",
            "start_cpr",
            "defibrillate",
            "achieve_ROSC"
        ],

        allowedActions: [
            "check_pulse",
            "start_cpr",
            "apply_aed",
            "shock",
            "airway_management",
            "oxygen",
            "iv_access"
        ]
    },

    // ======================================
    // C — Politrauma Táctico
    // ======================================
    tacticalPolytrauma: {

        id: "tactical_polytrauma",

        name:
            "Politrauma Táctico",

        description:
            "Paciente politraumatizado en entorno hostil.",

        duration: 1200,

        patientTemplate: {

            airway: "patent",

            breathing: 30,

            spo2: 88,

            circulation: {
                heartRate: 132,
                systolicBP: 88,
                diastolicBP: 50,
                bleeding: "severe",
                bleedingControlled: false
            },

            neuro: {
                gcs: 13,
                pain: 9,
                conscious: true
            },

            environment: {
                threat: true,
                extractionTime: 15,
                lowResources: true
            },

            deteriorationStage:
                "critical"
        },

        objectives: [
            "threat_assessment",
            "control_massive_bleeding",
            "rapid_extraction",
            "prevent_decompensation"
        ],

        allowedActions: [
            "return_fire",
            "seek_cover",
            "tourniquet_correct",
            "direct_pressure",
            "oxygen",
            "rapid_transport",
            "request_backup"
        ]
    }
};