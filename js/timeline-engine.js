// ==========================================
// timeline-engine.js
// Registro cronológico de simulación
// ==========================================

class TimelineEngine {

    constructor() {
        this.timeline = [];
    }

    // ===============================
    // Registrar evento
    // ===============================
    addEvent(
        type,
        action,
        details = {},
        patientState = null
    ) {

        const timestamp =
            patientState?.elapsedTime || 0;

        this.timeline.push({
            timestamp,
            type,
            action,
            details,

            patientSnapshot: patientState
                ? structuredClone(patientState)
                : null
        });
    }

    // ===============================
    // Obtener timeline completo
    // ===============================
    getTimeline() {
        return structuredClone(
            this.timeline
        );
    }

    // ===============================
    // Obtener eventos críticos
    // ===============================
    getCriticalEvents() {

        return this.timeline.filter(
            event =>
                event.type === "critical"
        );
    }

    // ===============================
    // Acciones del estudiante
    // ===============================
    getStudentActions() {

        return this.timeline.filter(
            event =>
                event.type === "student_action"
        );
    }

    // ===============================
    // Resumen rápido
    // ===============================
    getSummary() {

        const actions =
            this.getStudentActions();

        const critical =
            this.getCriticalEvents();

        const lastEvent =
            this.timeline[
                this.timeline.length - 1
            ];

        return {

            totalActions:
                actions.length,

            criticalEvents:
                critical.length,

            duration:
                lastEvent?.timestamp || 0,

            patientOutcome:
                lastEvent?.patientSnapshot
                    ?.alive
                    ? "alive"
                    : "dead"
        };
    }

    // ===============================
    // Reset
    // ===============================
    reset() {
        this.timeline = [];
    }
}

window.TimelineEngine =
    TimelineEngine;