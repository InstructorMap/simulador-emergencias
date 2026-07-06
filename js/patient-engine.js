class PatientEngine {
    constructor(template = {}) {
        this.initialState = {
            alive: true,
            elapsedTime: 0,
            volSanguineo: 100, // Porcentaje (100% = 5 Litros)
            fc: 80,            // Latidos por minuto
            paSistolica: 120,  // mmHg
            paDiastolica: 80,  // mmHg
            fr: 16,            // Respiraciones por minuto
            spo2: 98,          // Porcentaje
            temp: 36.5,        // Celsius
            gcs: 15,           // Escala de Glasgow
            perfusion: "Normal", // Normal, Disminuida, Crítica
            dolor: 0,          // Escala 0-10
            acidosis: 7.4,     // pH sanguíneo
            hemorragia: "Ninguna", // Ninguna, Moderada, Severa, Controlada
            shockLevel: 0,     // 0 a 4 (Clases de Shock)
            hipoxia: false
        };
        this.state = this.mergeState(structuredClone(this.initialState), template);
    }

    mergeState(base, custom) {
        return { ...base, ...custom };
    }

    getState() {
        return structuredClone(this.state);
    }

    applyProcedure(action) {
        switch (action) {
            case "tourniquet_correct":
                if (this.state.hemorragia === "Severa") {
                    this.state.hemorragia = "Controlada";
                    this.state.dolor = Math.min(10, this.state.dolor + 2); // El torniquete duele
                }
                break;
            case "direct_pressure":
                if (this.state.hemorragia === "Severa") {
                    this.state.hemorragia = "Moderada";
                }
                break;
            case "oxygen":
                if (this.state.fr > 0) {
                    this.state.spo2 = Math.min(100, this.state.spo2 + 5);
                    this.state.hipoxia = this.state.spo2 < 90;
                }
                break;
            case "iv_access":
                // Habilita la administración de fluidos posterior
                break;
            case "start_cpr":
                if (!this.state.alive) {
                    // Mantiene perfusión artificial elemental
                    this.state.spo2 = Math.max(this.state.spo2, 85);
                }
                break;
        }
    }

    nextTick(seconds = 1) {
        if (!this.state.alive) return this.getState();

        this.state.elapsedTime += seconds;

        // --- Cascada Fisiológica: Hemorragia Severa no controlada ---
        if (this.state.hemorragia === "Severa") {
            this.state.volSanguineo -= 0.15 * seconds; // Pierde volumen rápidamente
            this.state.fc += 0.8 * seconds;            // Taquicardia compensatoria
            this.state.paSistolica -= 0.6 * seconds;   // Hipotensión progresiva
            this.state.paDiastolica -= 0.4 * seconds;
        } else if (this.state.hemorragia === "Moderada") {
            this.state.volSanguineo -= 0.05 * seconds;
            this.state.fc += 0.2 * seconds;
            this.state.paSistolica -= 0.2 * seconds;
        }

        // --- Determinación de Clases de Shock ---
        if (this.state.volSanguineo < 70) this.state.shockLevel = 4;
        else if (this.state.volSanguineo < 85) this.state.shockLevel = 3;
        else if (this.state.volSanguineo < 95) this.state.shockLevel = 2;
        else this.state.shockLevel = 1;

        // --- Consecuencias en Órganos Diana (Cerebro / Glasgow) ---
        if (this.state.paSistolica < 80) {
            this.state.perfusion = "Crítica";
            this.state.gcs = Math.max(3, this.state.gcs - 1 * seconds);
        } else if (this.state.paSistolica < 90) {
            this.state.perfusion = "Disminuida";
            this.state.gcs = Math.max(3, this.state.gcs - 0.2 * seconds);
        }

        // --- Paro Cardiorrespiratorio por Exanguinación o Hipoxia ---
        if (this.state.paSistolica < 50 || this.state.volSanguineo < 60 || this.state.gcs <= 3) {
            this.state.alive = false;
            this.state.fc = 0;
            this.state.paSistolica = 0;
            this.state.paDiastolica = 0;
            this.state.fr = 0;
            this.state.spo2 = 0;
        }

        return this.getState();
    }
}

window.PatientEngine = PatientEngine;
