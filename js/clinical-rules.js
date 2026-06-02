// ==========================================
// clinical-rules.js
// Reglas clínicas reutilizables
// ==========================================

class ClinicalRules {

    static evaluate(patientState) {

        const events = [];

        const circulation =
            patientState.circulation;

        const neuro =
            patientState.neuro;

        // ==================================
        // Shock hemorrágico
        // ==================================
        if (
            circulation.bleeding === "severe" &&
            !circulation.bleedingControlled
        ) {

            if (
                patientState.elapsedTime > 60 &&
                patientState.elapsedTime < 180
            ) {
                events.push({
                    type: "warning",
                    message:
                        "Paciente muestra signos tempranos de shock hemorrágico."
                });
            }

            if (
                patientState.elapsedTime >= 180 &&
                neuro.gcs <= 14
            ) {
                events.push({
                    type: "critical",
                    message:
                        "Deterioro neurológico progresivo."
                });
            }

            if (
                patientState.elapsedTime >= 300 &&
                !neuro.conscious
            ) {
                events.push({
                    type: "critical",
                    message:
                        "Pérdida de conciencia por hipoperfusión."
                });
            }
        }

        // ==================================
        // Estado crítico
        // ==================================
        if (
            circulation.systolicBP < 75
        ) {
            events.push({
                type: "critical",
                message:
                    "Paciente en estado crítico."
            });
        }

        // ==================================
        // Colapso hemodinámico
        // ==================================
        if (
            circulation.systolicBP < 60
        ) {
            events.push({
                type: "fatal",
                message:
                    "Colapso hemodinámico inminente."
            });
        }

        // ==================================
        // Paciente estabilizado
        // ==================================
        if (
            circulation.bleedingControlled &&
            circulation.systolicBP >= 90 &&
            circulation.heartRate <= 110
        ) {

            events.push({
                type: "success",
                message:
                    "Paciente parcialmente estabilizado."
            });
        }

        return events;
    }

    // ======================================
    // Evaluación de decisiones clínicas
    // ======================================
    static evaluateDecision(
        action,
        patientState
    ) {

        const feedback = {
            correct: false,
            priority: "secondary",
            score: 0,
            reasoning: ""
        };

        switch (action) {

            case "tourniquet_correct":

                if (
                    patientState.circulation
                        .bleeding === "severe"
                ) {
                    feedback.correct = true;
                    feedback.priority =
                        "life-saving";

                    feedback.score = 100;

                    feedback.reasoning =
                        "La hemorragia masiva era la amenaza inmediata.";
                }

                break;

            case "tourniquet_incorrect":

                feedback.correct = false;

                feedback.score = 25;

                feedback.reasoning =
                    "El control hemorrágico fue inefectivo.";

                break;

            case "oxygen":

                feedback.correct = true;

                feedback.priority =
                    "secondary";

                feedback.score = 20;

                feedback.reasoning =
                    "El oxígeno puede ayudar, pero no resuelve la amenaza letal principal.";

                break;

            case "iv_access":

                feedback.correct = true;

                feedback.priority =
                    "secondary";

                feedback.score = 10;

                feedback.reasoning =
                    "La canalización es útil, pero secundaria frente al sangrado masivo.";

                break;

            default:
                feedback.reasoning =
                    "Intervención sin evaluación clínica definida.";
        }

        return feedback;
    }
}

window.ClinicalRules = ClinicalRules;