const ClinicalRules = {
    evaluateDecision(action, patientState) {
        const report = {
            correct: false,
            score: 0,
            priorityApplied: "Ninguna",
            reasoning: ""
        };

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

class EvaluationEngine {
    constructor() {
        this.historyLog = [];
    }

    logDecision(action, patientBefore, outcome) {
        this.historyLog.push({
            timestamp: patientBefore.elapsedTime,
            action: action,
            fisiologia: patientBefore,
            evaluacion: outcome
        });
    }

    getFinalMetrics() {
        let totalScore = 0;
        let erroresCriticos = 0;
        let categorias = { MARCH_M: 0, MARCH_A: 0, MARCH_R: 0, General: 0 };

        this.historyLog.forEach(log => {
            totalScore += log.evaluacion.score;
            if (log.evaluacion.score <= 10) erroresCriticos++;
            
            if (log.evaluacion.priorityApplied.includes("Hemorragia")) categorias.MARCH_M += log.evaluacion.score;
            else if (log.evaluacion.priorityApplied.includes("Vía Aérea")) categorias.MARCH_A += log.evaluacion.score;
            else categorias.General += log.evaluacion.score;
        });

        const totalActions = this.historyLog.length || 1;
        return {
            promedioGral: Math.round(totalScore / totalActions),
            erroresCriticos,
            logCompleto: this.historyLog,
            competencias: categorias
        };
    }

    reset() {
        this.historyLog = [];
    }
}

window.ClinicalRules = ClinicalRules;
window.EvaluationEngine = new EvaluationEngine();
