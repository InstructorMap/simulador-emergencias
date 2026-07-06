// ====================================================================
// app.js - ORQUESTADOR COMPLETO DEL SIMULADOR CLÍNICO V2 (FLIGHT-SIM MODE)
// ====================================================================

let CoursesDB = [
    { 
        id: 1, 
        title: "Trauma y Control de Hemorragias", 
        desc: "Protocolos internacionales TCCC/TECC avanzados. Uso de agentes hemostáticos y torniquetes mecánicos.", 
        icon: "fa-tint", 
        price: 45000, 
        link: "https://mpago.la/ejemplo1", 
        purchased: false,
        videoId: "dQw4w9WgXcQ" 
    },
    { 
        id: 2, 
        title: "Soporte Vital Básico y DEA", 
        desc: "Reanimación cardiopulmonar de alta calidad según directrices de consenso prehospitalario.", 
        icon: "fa-heartbeat", 
        price: 35000, 
        link: "https://mpago.la/ejemplo2", 
        purchased: true, 
        videoId: "dQw4w9WgXcQ"
    }
];

window.App = {
    state: {
        currentScenarioIndex: 0,
        patientEngine: null,
        timelineEngine: null,
        radarInstance: null
    },

    init() {
        console.log("✅ Emergency Academy V2 - Terminal Libre Iniciada.");
        this.loadCoursesData();
        if (typeof window.ScenariosDB === "undefined") console.warn("⚠️ Esperando base de datos...");
        document.addEventListener('keydown', (e) => { if (e.ctrlKey && e.shiftKey && e.key === 'S') { e.preventDefault(); this.showSaaSPanel(); }});
    },

    loadCoursesData() {
        try { const saved = localStorage.getItem("saas_courses_db"); if (saved) CoursesDB = JSON.parse(saved); } catch (err) {}
    },
    saveCoursesData() { localStorage.setItem("saas_courses_db", JSON.stringify(CoursesDB)); },

    hideAllPages() { ["landingPage", "simulatorPage", "resultsPage", "campusPage", "saasAdminPanel"].forEach(id => { const el = document.getElementById(id); if (el) el.classList.add("hidden"); }); },
    goBackToLanding() { if (this.state.timelineEngine) this.state.timelineEngine.stop(); this.hideAllPages(); const landing = document.getElementById("landingPage"); if (landing) landing.classList.remove("hidden"); },

    startSimulation() {
        if (!window.ScenariosDB || window.ScenariosDB.length === 0) { alert("Sincronizando motores. F5 o limpiá caché."); return; }
        this.state.currentScenarioIndex = 0;
        if (window.EvaluationEngine && typeof window.EvaluationEngine.reset === 'function') window.EvaluationEngine.reset();
        this.hideAllPages();
        const simPage = document.getElementById("simulatorPage");
        if (simPage) simPage.classList.remove("hidden");
        this.initScenarioInstance();
    },

    initScenarioInstance() {
        const scenario = window.ScenariosDB[this.state.currentScenarioIndex];
        if (!scenario) return;

        if (window.PatientEngine) this.state.patientEngine = new window.PatientEngine(scenario.patientTemplate || {});
        else return;
        
        this.mountScenarioUI(scenario);

        if (window.TimelineEngine) {
            this.state.timelineEngine = new window.TimelineEngine(
                (tick) => this.onPhysiologicTick(tick),
                (complication) => this.onDynamicComplication(complication)
            );
        }

        const idxDisplay = document.getElementById("currentScenarioIndex");
        if (idxDisplay) idxDisplay.innerText = this.state.currentScenarioIndex + 1;
        const totDisplay = document.getElementById("totalScenarios");
        if (totDisplay) totDisplay.innerText = window.ScenariosDB.length;

        this.state.timelineEngine.start(scenario.timeLimit);
    },

    mountScenarioUI(scenario) {
        const container = document.getElementById("scenarioContainer");
        if (!container) return;

        container.innerHTML = `
            <div class="bg-slate-800 rounded-3xl p-6 border border-slate-700 text-white shadow-2xl relative flex flex-col md:flex-row gap-6">
                
                <div class="w-full md:w-5/12 flex flex-col gap-4">
                    
                    <div class="relative w-full h-48 bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden flex items-center justify-center shadow-inner">
                        <div id="visual-blood" class="absolute bottom-0 bg-red-600 rounded-full opacity-0 blur-md transition-all duration-1000 transform scale-y-50" style="width: 0px; height: 0px;"></div>
                        <i id="visual-body" class="fas fa-child text-[120px] text-slate-100 transition-colors duration-1000 relative z-10 drop-shadow-lg"></i>
                        <div id="visual-eyes" class="absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded-lg bg-slate-800/80 text-slate-300 backdrop-blur-sm border border-slate-600">
                            <i class='fas fa-eye text-emerald-400 mr-1'></i> Alerta
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <div class="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                            <div class="text-[10px] text-slate-500 font-bold uppercase"><i class="fas fa-heartbeat text-red-500 mr-1"></i>FC</div>
                            <div id="display-fc-box" class="text-2xl font-black mt-1 font-mono text-emerald-400">
                                <span id="display-fc">0</span>
                            </div>
                        </div>
                        <div class="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                            <div class="text-[10px] text-slate-500 font-bold uppercase"><i class="fas fa-compress-alt text-blue-400 mr-1"></i>PA</div>
                            <div id="display-pa-box" class="text-2xl font-black mt-1 font-mono text-emerald-400">
                                <span id="display-pa">0/0</span>
                            </div>
                        </div>
                        <div class="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                            <div class="text-[10px] text-slate-500 font-bold uppercase"><i class="fas fa-lungs text-sky-400 mr-1"></i>SpO₂</div>
                            <div id="display-spo2-box" class="text-2xl font-black mt-1 font-mono text-emerald-400">
                                <span id="display-spo2">0</span>%
                            </div>
                        </div>
                        <div class="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                            <div class="text-[10px] text-slate-500 font-bold uppercase"><i class="fas fa-tint text-red-400 mr-1"></i>Volemia</div>
                            <div id="display-volumen-box" class="text-2xl font-black mt-1 font-mono text-emerald-400">
                                <span id="display-volumen">0</span>%
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-slate-900 px-4 py-3 rounded-xl border border-slate-700 flex justify-between items-center">
                        <div class="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Cronómetro Clínico</div>
                        <div id="timerDisplay" class="text-2xl font-mono font-bold text-blue-500">0</div>
                    </div>
                </div>

                <div class="w-full md:w-7/12 flex flex-col gap-4">
                    <div>
                        <h2 class="text-2xl font-black tracking-tight text-white">${scenario.title}</h2>
                        <p class="text-slate-400 mt-1 font-medium text-sm"><i class="fas fa-crosshairs mr-1 text-red-500"></i> ${scenario.context}</p>
                    </div>

                    <div class="bg-slate-900/60 border border-slate-700 rounded-xl p-4">
                        <p class="text-sm text-slate-200 leading-relaxed"><strong class="text-blue-400 font-black">📋 Viñeta:</strong> <span id="display-vitals">${scenario.vitals}</span></p>
                    </div>

                    <div class="bg-slate-900/80 p-5 rounded-xl border border-slate-600 shadow-inner flex-1 flex flex-col">
                        <label class="text-xs font-bold text-blue-400 uppercase tracking-widest flex items-center mb-2">
                            <i class="fas fa-terminal mr-2"></i> Orden Médica
                        </label>
                        <textarea id="clinicalCommandInput" class="w-full flex-1 min-h-[100px] bg-slate-950 text-slate-200 text-base rounded-lg p-3 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none transition font-medium" placeholder="Describa su intervención y justificación..."></textarea>
                        
                        <div class="flex gap-3 mt-3">
                            <button onclick="App.submitClinicalCommand()" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition shadow text-sm">
                                Ejecutar Orden
                            </button>
                            <button onclick="App.processClinicalAction('transport_patient', 'Decisión de evacuación operativa.')" class="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition shadow text-sm">
                                Evacuar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        this.updateMonitorValues();
    },

    updateMonitorValues() {
        if (!this.state.patientEngine) return;
        const patient = this.state.patientEngine.getState();
        const scenario = window.ScenariosDB[this.state.currentScenarioIndex];

        // 1. Textos paramétricos
        const timerDisplay = document.getElementById("timerDisplay");
        if (timerDisplay) timerDisplay.innerText = scenario.timeLimit - patient.elapsedTime;

        document.getElementById("display-fc").innerText = Math.round(patient.fc);
        document.getElementById("display-fc-box").className = `text-2xl font-black mt-1 font-mono ${patient.fc > 120 || patient.fc === 0 ? 'text-red-500 animate-pulse' : 'text-emerald-400'}`;

        document.getElementById("display-pa").innerText = `${Math.round(patient.paSistolica)}/${Math.round(patient.paDiastolica)}`;
        document.getElementById("display-pa-box").className = `text-2xl font-black mt-1 font-mono ${patient.paSistolica < 90 || patient.paSistolica === 0 ? 'text-red-500 font-bold' : 'text-emerald-400'}`;

        document.getElementById("display-spo2").innerText = Math.round(patient.spo2);
        document.getElementById("display-spo2-box").className = `text-2xl font-black mt-1 font-mono ${patient.spo2 < 90 || patient.spo2 === 0 ? 'text-red-500' : 'text-emerald-400'}`;

        document.getElementById("display-volumen").innerText = Math.round(patient.volSanguineo);
        document.getElementById("display-volumen-box").className = `text-2xl font-black mt-1 font-mono ${patient.volSanguineo < 80 ? 'text-red-500' : 'text-emerald-400'}`;

        // 2. Lógica del MAPA ANATÓMICO (Efectos Visuales)
        const bloodPool = document.getElementById("visual-blood");
        const bodyIcon = document.getElementById("visual-body");
        const eyesStatus = document.getElementById("visual-eyes");

        if (bloodPool) {
            if (patient.hemorragia === "Severa") {
                const lostVol = 100 - patient.volSanguineo;
                const size = Math.min(250, lostVol * 7); // Crece hasta 250px según el desangrado
                bloodPool.style.width = `${size}px`;
                bloodPool.style.height = `${size/2}px`; // Forma ovalada
                bloodPool.style.opacity = "0.8";
            } else if (patient.hemorragia === "Controlada") {
                bloodPool.style.opacity = "0.3"; // Queda la mancha pero oscura
            }
        }

        if (bodyIcon) {
            if (patient.spo2 < 85 || patient.paSistolica < 60) {
                bodyIcon.className = "fas fa-child text-[120px] text-cyan-800 transition-colors duration-1000 relative z-10 drop-shadow-lg"; // Cianosis
            } else if (patient.paSistolica < 90) {
                bodyIcon.className = "fas fa-child text-[120px] text-slate-400 transition-colors duration-1000 relative z-10 drop-shadow-lg"; // Palidez
            } else {
                bodyIcon.className = "fas fa-child text-[120px] text-slate-100 transition-colors duration-1000 relative z-10 drop-shadow-lg"; // Normal
            }
        }

        if (eyesStatus) {
            if (patient.gcs === 15) eyesStatus.innerHTML = "<i class='fas fa-eye text-emerald-400 mr-1'></i> Alerta";
            else if (patient.gcs > 8) eyesStatus.innerHTML = "<i class='fas fa-eye-half text-yellow-400 mr-1'></i> Obnubilado";
            else eyesStatus.innerHTML = "<i class='fas fa-eye-slash text-red-500 mr-1'></i> Inconsciente";
        }
    },

    submitClinicalCommand() {
        const inputField = document.getElementById("clinicalCommandInput");
        if (!inputField) return;

        const rawText = inputField.value.trim().toLowerCase();
        if (!rawText) return;

        // LA TERMINAL CIEGA: Si no reconoce nada, ejecuta "ineffective_action" (Efecto Placebo)
        let action = "ineffective_action";

        if (rawText.includes("torniquete") || rawText.includes("tq") || rawText.includes("tourniquet") || rawText.includes("empaquetamiento") || rawText.includes("hemostatico")) {
            action = "tourniquet_correct";
        } else if (rawText.includes("presion directa") || rawText.includes("presión directa") || rawText.includes("comprimir")) {
            action = "direct_pressure";
        } else if (rawText.includes("oxigeno") || rawText.includes("oxígeno") || rawText.includes("o2") || rawText.includes("mascara")) {
            action = "oxygen";
        } else if (rawText.includes("rcp") || rawText.includes("compresiones") || rawText.includes("masaje") || rawText.includes("reanimacion")) {
            action = "start_cpr";
        } else if (rawText.includes("dea") || rawText.includes("desfibrilar") || rawText.includes("parches") || rawText.includes("choque")) {
            action = "apply_aed";
        } else if (rawText.includes("via aerea") || rawText.includes("vía aérea") || rawText.includes("canula") || rawText.includes("intubar")) {
            action = "airway_management";
        } else if (rawText.includes("via") || rawText.includes("vía") || rawText.includes("suero") || rawText.includes("fluidos") || rawText.includes("canalizar")) {
            action = "iv_access";
        }

        // Ejecutar acción sin alertas restrictivas. El paciente sufrirá las consecuencias.
        this.processClinicalAction(action, inputField.value.trim());
    },

    processClinicalAction(action, argumentText = "") {
        if (!this.state.patientEngine) return;
        const patientState = this.state.patientEngine.getState();

        if (action === "transport_patient") {
            this.terminateSimulationLoop("evacuated");
            return;
        }

        if (window.ClinicalRules && window.EvaluationEngine) {
            const feedback = window.ClinicalRules.evaluateDecision(action, patientState);
            window.EvaluationEngine.logDecision(action, patientState, feedback, argumentText);
        }
        
        // Si la acción es ineficaz, no impacta la salud, pero sí consume el tiempo.
        if (action !== "ineffective_action") {
            this.state.patientEngine.applyProcedure(action);
        }
        
        // Penalidad temporal: todo procedimiento (o intento fallido) quema 15 segundos
        this.state.patientEngine.nextTick(15);
        
        const inputField = document.getElementById("clinicalCommandInput");
        if (inputField) inputField.value = "";

        this.updateMonitorValues();
    },

    onPhysiologicTick(seconds) {
        if (!this.state.patientEngine) return;
        const patient = this.state.patientEngine.nextTick(seconds);
        if (!patient.alive) { this.terminateSimulationLoop("patient_died"); return; }
        this.updateMonitorValues(); 
    },

    onDynamicComplication(complication) {
        const banner = document.createElement("div");
        banner.className = "fixed top-6 left-1/2 transform -translate-x-1/2 bg-red-600 text-white font-bold px-6 py-4 rounded-2xl shadow-2xl z-50 text-center max-w-md border border-red-400 border-2 animate-bounce";
        banner.innerHTML = `<i class="fas fa-exclamation-triangle mr-2"></i><strong>${complication.title}</strong><br><span class="text-xs font-normal opacity-90">${complication.message}</span>`;
        document.body.appendChild(banner);
        setTimeout(() => banner.remove(), 4000);
    },

    terminateSimulationLoop(endReason) {
        if (this.state.timelineEngine) this.state.timelineEngine.stop();
        if (endReason === "patient_died") { this.showResults(true); return; }
        this.state.currentScenarioIndex++;
        if (this.state.currentScenarioIndex < window.ScenariosDB.length) { this.initScenarioInstance(); } else { this.showResults(false); }
    },

    // --- PANELES FINALES, CAMPUS Y MARCA BLANCA OMITIDOS POR BREVEDAD, SE MANTIENEN IGUALES ---
    // (Mismas funciones de showResults, renderCompetencyChart, showCampus, etc.)
    showResults(died = false) {
        this.hideAllPages();
        const resultsPage = document.getElementById("resultsPage");
        if (resultsPage) resultsPage.classList.remove("hidden");
        
        let audit = { promedioGral: 0, competencias: { MARCH_M: 0, MARCH_A: 0, General: 0 } };
        if (window.EvaluationEngine && typeof window.EvaluationEngine.getFinalMetrics === 'function') audit = window.EvaluationEngine.getFinalMetrics();

        const scoreDisplay = document.getElementById("resultScore");
        const levelDisplay = document.getElementById("resultLevel");

        if (died) {
            if (scoreDisplay) scoreDisplay.innerText = "0 pts (Óbito)";
            if (levelDisplay) levelDisplay.innerText = "💀 Óbito en Operación";
            this.renderCompetencyChart({ MARCH_M: 10, MARCH_A: 10, General: 10 });
        } else {
            if (scoreDisplay) scoreDisplay.innerText = `${audit.promedioGral} pts`;
            if (levelDisplay) levelDisplay.innerText = audit.promedioGral >= 80 ? "🏆 Alto Criterio Operativo" : "⚡ Operador en Desarrollo";
            this.renderCompetencyChart(audit.competencias);
        }

        const strengthsList = document.getElementById("strengthsList");
        const weaknessesList = document.getElementById("weaknessesList");
        if (strengthsList && weaknessesList) {
            if (died) {
                strengthsList.innerHTML = "<li>❌ Falla crítica en la estabilización de amenazas vitales primarias.</li>";
                weaknessesList.innerHTML = "<li>⚠️ Se detectaron tiempos muertos por comandos imprecisos u omisiones en el protocolo TCCC.</li>";
            } else {
                strengthsList.innerHTML = "<li>✅ Sobrevida lograda mediante intervenciones precisas.</li>";
                weaknessesList.innerHTML = audit.promedioGral < 85 ? "<li>⚠️ Se registraron órdenes inefectivas que consumieron tiempo valioso.</li>" : "<li>✅ Comando y control ejemplar bajo estrés dinámico.</li>";
            }
        }
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
                    label: 'Perfil de Competencias',
                    data: [competencias.MARCH_M || 40, competencias.MARCH_A || 45, 60, competencias.General || 50],
                    backgroundColor: 'rgba(37, 99, 235, 0.3)', borderColor: '#3b82f6', pointBackgroundColor: '#fff'
                }]
            },
            options: { scales: { r: { beginAtZero: true, max: 100, ticks: { display: false } } }, plugins: { legend: { display: false } } }
        });
    },

    showCampus() { this.hideAllPages(); const campus = document.getElementById("campusPage"); if (campus) campus.classList.remove("hidden"); this.renderCampusCourses(); },
    renderCampusCourses() { /* Mantiene igual */ },
    downloadCourseMaterial(courseTitle) { /* Mantiene igual */ },
    showSaaSPanel() { this.hideAllPages(); const panel = document.getElementById("saasAdminPanel"); if (panel) { panel.classList.remove("hidden"); panel.classList.add("flex"); this.switchAdminTab('branding'); } },
    hideSaaSPanel() { const panel = document.getElementById("saasAdminPanel"); if (panel) panel.classList.remove("flex"); this.goBackToLanding(); },
    switchAdminTab(tabName) { /* Mantiene igual */ },
    renderAdminCoursesList() { /* Mantiene igual */ },
    openCourseModal(id = null) { /* Mantiene igual */ },
    closeCourseModal() { /* Mantiene igual */ },
    saveCourseEdits() { /* Mantiene igual */ },
    deleteCourse(id) { /* Mantiene igual */ },
    downloadCertificate() { /* Mantiene igual */ }
};

document.addEventListener("DOMContentLoaded", () => { if (window.App) window.App.init(); });
