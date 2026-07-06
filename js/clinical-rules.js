const ClinicalRules = {
    evaluateDecision(action, patientState) {
        const report = {
            correct: false,
            score: 0,
            priorityApplied: "Ninguna",
            reasoning: ""
        };

        // Regla para acciones no reconocidas o inútiles (El alumno escribió algo incorrecto)
        if (action === "ineffective_action") {
            report.correct = false;
            report.score = 0;
            report.priorityApplied = "Error / Inacción";
            report.reasoning = "Acción ineficaz o procedimiento no reconocido. Se consumió tiempo operativo crítico sin generar beneficio fisiológico en el paciente.";
            return report;
        }

        // Regla de Oro MARCH: M (Hemorragia Masiva) precede a todo.
        if (patientState.hemorragia === "Severa") {
            if (action === "tourniquet_correct") {
                report.correct = true;
                report.score = 100;
                report.priorityApplied = "M - Hemorragia Masiva";
                report.reasoning = "Excelente. El control inmediato de hemorragias exanguinantes en extremidades mediante torniquete es la prioridad número uno del protocolo TCCC.";
            } else if (action === "oxygen" || action === "airway_management") {
                report.correct = false;
                report.score = 10;
                report.priorityApplied = "A/B - Vía Aérea e Hipoxia";
                report.reasoning = "Error Crítico de Priorización. Intentar resolver la vía aérea u oxigenar a un paciente que se está desangrando de forma masiva causa la muerte por shock hipovolémico irreversible.";
            } else {
                report.correct = false;
                report.score = 20;
                report.reasoning = "Acción secundaria no prioritaria mientras exista un sangrado masivo activo.";
            }
        } 
        
        // Regla para Paro Cardiorrespiratorio
        else if (!patientState.alive) {
            if (action === "start_cpr" || action === "apply_aed") {
                report.correct = true;
                report.score = 90;
                report.priorityApplied = "C - Circulación Avanzada";
                report.reasoning = "Correcto. El inicio temprano de maniobras de reanimación cardiopulmonar e integración del DEA es mandatorio ante el colapso de ritmos.";
            } else {
                report.correct = false;
                report.score = 0;
                report.reasoning = "Pérdida de tiempo crítico. El paciente se encuentra en paro cardiorrespiratorio, requiere soporte vital básico inmediato.";
            }
        }

        return report;
    }
};

window.ClinicalRules = ClinicalRules;
