// ====================================================================
// clinical-rules.js - MOTOR DE EVALUACIÓN Y CRITERIO TCCC
// ====================================================================

const ClinicalRules = {
    evaluateDecision(action, patientState) {
        const report = {
            correct: false,
            score: 0,
            priorityApplied: "Ninguna",
            reasoning: "",
            logMessage: "" // Feedback para el Instructor Silencioso
        };

        // 1. Comando Inefectivo o No Reconocido (Efecto Placebo)
        if (action === "ineffective_action") {
            report.correct = false;
            report.score = 0;
            report.priorityApplied = "Error / Inacción";
            report.reasoning = "Acción ineficaz o procedimiento no reconocido. Consumo de tiempo operativo crítico sin beneficio hemodinámico.";
            report.logMessage = "⚠️ Intervención sin efecto clínico registrado. Los signos vitales continúan su curso natural.";
            return report;
        }

        // 2. Regla de Oro MARCH: M (Hemorragia Masiva Exanguinante)
        if (patientState.hemorragia === "Severa") {
            if (action === "tourniquet_correct") {
                report.correct = true;
                report.score = 100;
                report.priorityApplied = "M - Hemorragia Masiva";
                report.reasoning = "Control inmediato de hemorragia exanguinante mediante presión circunferencial.";
                report.logMessage = "✅ Torniquete aplicado. Cese de la hemorragia exanguinante confirmado. Monitorizando shock.";
            } else if (action === "direct_pressure") {
                report.correct = true;
                report.score = 60;
                report.priorityApplied = "M - Control Parcial";
                report.reasoning = "Presión directa aplicada. Efectividad parcial en sangrado arterial masivo.";
                report.logMessage = "⚠️ Presión directa en curso. Flujo reducido, pero requiere control definitivo mecánico.";
            } else if (action === "oxygen" || action === "airway_management") {
                report.correct = false;
                report.score = 10;
                report.priorityApplied = "A/B - Error Crítico";
                report.reasoning = "Fallo en algoritmo MARCH. Abordaje de vía aérea ignorando sangrado exanguinante activo.";
                report.logMessage = "❌ Paciente en exanguinación activa. El abordaje de la vía aérea no detiene la pérdida de volumen.";
            } else {
                report.correct = false;
                report.score = 15;
                report.priorityApplied = "Secundaria";
                report.reasoning = "Acción secundaria ejecutada durante amenaza vital primaria activa.";
                report.logMessage = "❌ Procedimiento de baja prioridad. Amenaza letal primaria no mitigada.";
            }
        } 
        
        // 3. Regla para Paro Cardiorrespiratorio
        else if (!patientState.alive) {
            if (action === "start_cpr" || action === "apply_aed") {
                report.correct = true;
                report.score = 90;
                report.priorityApplied = "C - Reanimación Avanzada";
                report.reasoning = "Inicio temprano de soporte vital básico y desfibrilación ante colapso.";
                report.logMessage = "⚡ Protocolo de reanimación iniciado. Maniobras de compresión activas.";
            } else {
                report.correct = false;
                report.score = 0;
                report.priorityApplied = "Error Crítico";
                report.reasoning = "Ausencia de maniobras de reanimación en paciente con colapso de ritmos.";
                report.logMessage = "❌ Pérdida de tiempo crítico en colapso cardiogénico.";
            }
        }

        // 4. Procedimientos Generales en Paciente Estable
        else {
            if (action === "oxygen") {
                report.correct = true;
                report.score = 80;
                report.priorityApplied = "R - Respiración";
                report.reasoning = "Soporte ventilatorio suplementario administrado correctamente.";
                report.logMessage = "✅ Oxígeno suplementario conectado. Evaluando curva de saturación (SpO2).";
            } else if (action === "iv_access") {
                report.correct = true;
                report.score = 85;
                report.priorityApplied = "C - Fluidoterapia";
                report.reasoning = "Acceso vascular periférico asegurado. Expansión volumétrica habilitada.";
                report.logMessage = "✅ Acceso venoso periférico permeable. Iniciando reposición de fluidos restrictiva.";
            } else {
                report.correct = true;
                report.score = 50;
                report.logMessage = "✅ Procedimiento estándar ejecutado con éxito.";
            }
        }

        return report;
    }
};

window.ClinicalRules = ClinicalRules;
