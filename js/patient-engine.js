// ==========================================
// patient-engine.js
// Motor del estado fisiológico del paciente
// ==========================================

class PatientEngine {
    constructor(patientTemplate = {}) {
        this.defaultState = {
            alive: true,

            // Tiempo
            elapsedTime: 0,

            // ABC fisiológico
            airway: "patent",
            breathing: 22,
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

            perfusion: "decreased",

            shockLevel: 0,

            interventions: [],

            deteriorationStage: "unstable"
        };

        this.state = this.mergeState(
            structuredClone(this.defaultState),
            patientTemplate
        );
    }

    mergeState(base, custom) {
        return {
            ...base,
            ...custom,
            circulation: {
                ...base.circulation,
                ...(custom.circulation || {})
            },
            neuro: {
                ...base.neuro,
                ...(custom.neuro || {})
            }
        };
    }

    getState() {
        return structuredClone(this.state);
    }

    updateTime(seconds = 1) {
        this.state.elapsedTime += seconds;
    }

    applyIntervention(intervention) {
        this.state.interventions.push({
            action: intervention,
            timestamp: this.state.elapsedTime
        });

        switch (intervention) {

            case "tourniquet_correct":
                this.state.circulation.bleedingControlled = true;
                this.state.circulation.bleeding = "controlled";

                this.state.shockLevel = Math.max(
                    0,
                    this.state.shockLevel - 1
                );
                break;

            case "tourniquet_incorrect":
                this.state.circulation.bleeding = "partial";
                break;

            case "direct_pressure":
                if (
                    this.state.circulation.bleeding === "severe"
                ) {
                    this.state.circulation.bleeding = "moderate";
                }
                break;

            case "oxygen":
                this.state.spo2 = Math.min(
                    100,
                    this.state.spo2 + 2
                );
                break;

            case "iv_access":
                // reservado para expansión futura
                break;
        }
    }

    deteriorate() {

        if (!this.state.alive) return;

        const circulation = this.state.circulation;

        // ============================
        // Hemorragia severa
        // ============================
        if (
            circulation.bleeding === "severe" &&
            !circulation.bleedingControlled
        ) {

            circulation.heartRate += 3;
            circulation.systolicBP -= 2;

            this.state.spo2 -= 0.2;

            if (this.state.elapsedTime > 60) {
                this.state.shockLevel += 1;
            }

            if (this.state.elapsedTime > 180) {
                this.state.neuro.gcs = Math.max(
                    10,
                    this.state.neuro.gcs - 1
                );
            }

            if (this.state.elapsedTime > 300) {
                this.state.neuro.conscious = false;
            }
        }

        // ============================
        // Hemorragia parcial
        // ============================
        if (
            circulation.bleeding === "partial"
        ) {
            circulation.heartRate += 1;
            circulation.systolicBP -= 1;
        }

        // ============================
        // Controlada
        // ============================
        if (
            circulation.bleeding === "controlled"
        ) {

            circulation.heartRate = Math.max(
                95,
                circulation.heartRate - 1
            );

            circulation.systolicBP = Math.min(
                105,
                circulation.systolicBP + 1
            );
        }

        // ============================
        // Shock severo
        // ============================
        if (
            circulation.systolicBP < 60
        ) {
            this.state.alive = false;
            this.state.deteriorationStage = "cardiac_arrest";
        }

        // ============================
        // Estados clínicos
        // ============================
        if (
            circulation.systolicBP < 90
        ) {
            this.state.deteriorationStage =
                "decompensated";
        }

        if (
            circulation.systolicBP < 75
        ) {
            this.state.deteriorationStage =
                "critical";
        }
    }

    tick(seconds = 1) {
        this.updateTime(seconds);
        this.deteriorate();

        return this.getState();
    }

    reset(patientTemplate = {}) {
        this.state = this.mergeState(
            structuredClone(this.defaultState),
            patientTemplate
        );
    }
}

// export global
window.PatientEngine = PatientEngine;