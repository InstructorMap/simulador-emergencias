class TimelineEngine {
    constructor(onTickCallback, onComplicationCallback) {
        this.intervalId = null;
        this.elapsedSeconds = 0;
        this.onTick = onTickCallback;
        this.onComplication = onComplicationCallback;
        this.complicationsTriggered = {};
    }

    start(timeLimit) {
        this.stop();
        this.elapsedSeconds = 0;
        this.complicationsTriggered = {};

        this.intervalId = setInterval(() => {
            this.elapsedSeconds++;
            
            // Notificar al sistema para actualizar el organismo del paciente
            if (this.onTick) this.onTick(1);

            // Verificar si ocurren complicaciones dinámicas basadas en el tiempo o estado
            this.checkDynamicEvents();

            if (this.elapsedSeconds >= timeLimit) {
                this.stop();
                window.App.checkAnswer("timeout");
            }
        }, 1000);
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    checkDynamicEvents() {
        if (!window.App.state.patientEngine) return;
        const currentPatient = window.App.state.patientEngine.getState();

        // Evento Dinámico: Si el paciente pasa más de 45 segundos en Shock Clase 3, entra en Paro
        if (currentPatient.shockLevel >= 3 && !this.complicationsTriggered["cardiac_arrest_shock"]) {
            if (currentPatient.elapsedTime > 45) {
                this.complicationsTriggered["cardiac_arrest_shock"] = true;
                if (this.onComplication) {
                    this.onComplication({
                        type: "critical_event",
                        title: "🛑 Paro Cardiorrespiratorio Secundario",
                        message: "El paciente ha colapsado hemodinámicamente debido a la hipoperfusión celular severa."
                    });
                }
            }
        }
    }
}

window.TimelineEngine = TimelineEngine;
