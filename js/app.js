window.App = {
    state: {
        currentScenarioIndex: 0,
        patientEngine: null,
        timelineEngine: null,
        userAnswers: []
    },

    init() {
        console.log("✅ Emergency Academy iniciada");
        
        if (typeof ScenariosDB === "undefined" || typeof PatientEngine === "undefined") {
            console.error("❌ Los módulos de escenarios o motores clínicos no se cargaron correctamente.");
            return;
        }

        // Atajo secreto de teclado corporativo para el Panel SaaS (Ctrl + Shift + S)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'S') {
                e.preventDefault();
                this.showSaaSPanel();
            }
        });
    },

    hideAllPages() {
        ["landingPage", "simulatorPage", "resultsPage", "campusPage", "saasAdminPanel"].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add("hidden");
        });
    },

    goBackToLanding() {
        if (this.state.timelineEngine) this.state.timelineEngine.stop();
        this.hideAllPages();
        document.getElementById("landingPage").classList.remove("hidden");
    },

    startSimulation() {
        console.log("🚑 Inicializando simulación interactiva");
        if (!window.ScenariosDB || ScenariosDB.length === 0) {
            alert("Base de datos de escenarios no encontrada globalmente.");
            return;
        }

        this.state.currentScenarioIndex = 0;
        window.EvaluationEngine.reset();
        this.hideAllPages();
        document.getElementById("simulatorPage").classList.remove("hidden");
        
        this.renderScenario();
    },

    renderScenario() {
        const scenario = ScenariosDB[this.state.currentScenarioIndex];
        const container = document.getElementById("scenarioContainer");
        if (!scenario || !container) return;

        // Inyección dinámica de datos del escenario al motor fisiológico
        this.state.patientEngine = new PatientEngine(scenario.patientTemplate || {});
        
        // Inicializar el bucle temporal en tiempo real
        this.state.timelineEngine = new TimelineEngine(
            (tick) => this.onPhysiologicTick(tick),
            (complication) => this.onDynamicComplication(complication)
        );

        document.getElementById("currentScenarioIndex").innerText = this.state.currentScenarioIndex + 1;
        document.getElementById("totalScenarios").innerText = ScenariosDB.length;

        this.updateUI(scenario);
        this.state.timelineEngine.start(scenario.timeLimit);
    },

    updateUI(scenario) {
        const container = document.getElementById("scenarioContainer");
        const patient = this.state.patientEngine.getState();

        container.innerHTML = `
            <div class="bg-slate-800 rounded-3xl p-8 border border-slate-700 text-white shadow-2xl relative">
                <div class="flex justify-between items-start mb-6">
                    <div>
                        <h2 class="text-3xl font-black">${scenario.title}</h2>
                        <p class="text-slate-400 mt-1 font-medium"><i class="fas fa-map-marker-alt mr-2"></i>${scenario.context}</p>
                    </div>
                    <div class="bg-slate-900 px-6 py-3 rounded-2xl border border-slate-700 text-center shadow-inner">
                        <div id="timerDisplay" class="text-3xl font-mono font-bold text-blue-500">${scenario.timeLimit - patient.elapsedTime}</div>
                        <div class="text-[9px] uppercase tracking-widest text-slate-500 font-bold mt-1">Segundos Restantes</div>
                    </div>
                </div>

                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div class="bg-slate-900/60 p-4 rounded-2xl border border-slate-700/50">
                        <div class="text-xs text-slate-400 font-bold uppercase"><i class="fas fa-heartbeat text-red-500 mr-2"></i>Frec. Cardíaca</div>
                        <div class="text-2xl font-black mt-1 ${patient.fc > 120 || patient.fc === 0 ? 'text-red-500 font-mono animate-pulse' : 'text-emerald-400'}">${Math.round(patient.fc)} <span class="text-xs text-slate-500 font-normal">LPM</span></div>
                    </div>
                    <div class="bg-slate-900/60 p-4 rounded-2xl border border-slate-700/50">
                        <div class="text-xs text-slate-400 font-bold uppercase"><i class="fas fa-compress-alt text-blue-400 mr-2"></i>Presión Art.</div>
                        <div class="text-2xl font-black mt-1 ${patient.paSistolica < 90 || patient.paSistolica === 0 ? 'text-red-500' : 'text-emerald-400'}">${Math.round(patient.paSistolica)}/${Math.round(patient.paDiastolica)} <span class="text-xs text-slate-500 font-normal">mmHg</span></div>
                    </div>
                    <div class="bg-slate-900/60 p-4 rounded-2xl border border-slate-700/50">
                        <div class="text-xs text-slate-400 font-bold uppercase"><i class="fas fa-lungs text-sky-400 mr-2"></i>Sat. Oxígeno</div>
                        <div class="text-2xl font-black mt-1 ${patient.spo2 < 90 || patient.spo2 === 0 ? 'text-red-500 font-mono' : 'text-emerald-400'}">${Math.round(patient.spo2)}<span class="text-xs text-slate-500 font-normal">%</span></div>
                    </div>
                    <div class="bg-slate-900/60 p-4 rounded-2xl border border-slate-700/50">
                        <div class="text-xs text-slate-400 font-bold uppercase"><i class="fas fa-brain text-purple-400 mr-2"></i>Glasgow (GCS)</div>
                        <div class="text-2xl font-black mt-1 ${patient.gcs < 8 ? 'text-red-500 font-bold' : 'text-emerald-400'}">${Math.round(patient.gcs)}/15</div>
                    </div>
                </div>

                <div class="bg-slate-900/40 border border-slate-700 rounded-2xl p-5 mb-8">
                    <p class="text-lg"><strong class="text-blue-400 font-bold">📋 Estado Clínico Actual:</strong> ${scenario.vitals}</p>
                    <p class="text-sm text-slate-400 mt-2 font-medium">Estado del sangrado: <span class="font-bold uppercase text-white">${patient.hemorragia}</span> | Nivel de Perfusión: <span class="font-bold text-white uppercase">${patient.perfusion}</span></p>
                </div>

                <div class="space-y-3">
                    ${scenario.options.map(opt => `
                        <button onclick="App.checkAnswer('${opt.action}')" class="w-full text-left p-5 bg-slate-700/40 hover:bg-blue-600/20 rounded-2xl transition border border-slate-600 hover:border-blue-500 text-lg font-medium flex items-center justify-between group">
                            <span>${opt.text}</span>
                            <i class="fas fa-chevron-right text-slate-500 group-hover:text-blue-400 transition transform group-hover:translate-x-1"></i>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    },

    onPhysiologicTick(seconds) {
        if (!this.state.patientEngine) return;
        
        // Avanzar el reloj interno del organismo vivo
        const patient = this.state.patientEngine.nextTick(seconds);
        const scenario = ScenariosDB[this.state.currentScenarioIndex];

        // Actualizar visualmente el temporizador y el monitor clínico
        const display = document.getElementById("timerDisplay");
        if (display) display.innerText = scenario.timeLimit - patient.elapsedTime;

        if (!patient.alive) {
            this.checkAnswer("patient_died");
            return;
        }

        // Re-renderizar la UI dinámicamente para actualizar los signos en pantalla
        this.updateUI(scenario);
    },

    onDynamicComplication(complication) {
        alert(`${complication.title}\n\n${complication.message}`);
    },

    checkAnswer(action) {
        if (this.state.timelineEngine) this.state.timelineEngine.stop();

        const patientState = this.state.patientEngine.getState();
        
        // Evaluar la decisión clínicamente si no es un fin de juego directo
        if (action !== "timeout" && action !== "patient_died") {
            const feedback = ClinicalRules.evaluateDecision(action, patientState);
            window.EvaluationEngine.logDecision(action, patientState, feedback);
            
            // Aplicar el procedimiento directamente a la fisiología del organismo
            this.state.patientEngine.applyProcedure(action);
        }

        this.state.currentScenarioIndex++;
        
        if (this.state.currentScenarioIndex < ScenariosDB.length && patientState.alive && action !== "timeout") {
            this.renderScenario();
        } else {
            this.showResults(action === "patient_died");
        }
    },

    showResults(died = false) {
        if (this.state.timelineEngine) this.state.timelineEngine.stop();
        this.hideAllPages();
        
        document.getElementById("resultsPage").classList.remove("hidden");
        const audit = window.EvaluationEngine.getFinalMetrics();
        
        const scoreDisplay = document.getElementById("resultScore");
        const levelDisplay = document.getElementById("resultLevel");

        if (died) {
            if (scoreDisplay) scoreDisplay.innerText = "0 pts (Óbito)";
            if (levelDisplay) levelDisplay.innerText = "💀 Óbito del Paciente";
        } else {
            if (scoreDisplay) scoreDisplay.innerText = `${audit.promedioGral} pts`;
            if (levelDisplay) levelDisplay.innerText = audit.promedioGral >= 80 ? "🏆 Alto Criterio Clínico" : "⚡ Operador en Desarrollo";
        }

        this.renderCompetencyChart(audit.competencias);
    },

    renderCompetencyChart(competencias) {
        const ctx = document.getElementById("radarChart");
        if (!ctx) return;

        if (this.state.radarInstance) this.state.radarInstance.destroy();
        this.state.radarInstance = new Chart(ctx.getContext('2d'), {
            type: 'radar',
            data: {
                labels: ['M - Hemorragias', 'A - Vía Aérea', 'R - Respiración', 'C/H - Soporte'],
                datasets: [{
                    label: 'Criterio Operativo',
                    data: [competencias.MARCH_M || 50, competencias.MARCH_A || 40, 60, competencias.General || 50],
                    backgroundColor: 'rgba(37, 99, 235, 0.3)',
                    borderColor: '#3b82f6',
                    pointBackgroundColor: '#fff'
                }]
            },
            options: { scales: { r: { beginAtZero: true, max: 100, ticks: { display: false } } }, plugins: { legend: { display: false } } }
        });
    },

    showCampus() {
        this.hideAllPages();
        document.getElementById("campusPage").classList.remove("hidden");
    },

    showSaaSPanel() {
        this.hideAllPages();
        const panel = document.getElementById("saasAdminPanel");
        if (panel) {
            panel.classList.remove("hidden");
            panel.classList.add("flex");
        }
    },

    hideSaaSPanel() {
        this.goBackToLanding();
    },

    downloadCertificate() {
        const name = prompt("Nombre completo del profesional:") || "Operador Clínico";
        const audit = window.EvaluationEngine.getFinalMetrics();
        if (window.CertificateGenerator) {
            CertificateGenerator.generate(name, audit.promedioGral);
        }
    }
};

document.addEventListener("DOMContentLoaded", () => {
    window.App.init();
});
