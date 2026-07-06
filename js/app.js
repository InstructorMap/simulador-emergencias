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
        console.log("✅ Emergency Academy V2 - Terminal de Órdenes Iniciada.");
        this.loadCoursesData();

        if (typeof window.ScenariosDB === "undefined") {
            console.warn("⚠️ Esperando sincronización de base de datos clínica...");
        }

        // Atajo de comandos de administración (Ctrl + Shift + S)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'S') {
                e.preventDefault();
                this.showSaaSPanel();
            }
        });
    },

    // --- MANEJO DE CACHÉ Y PERSISTENCIA ---
    loadCoursesData() {
        try {
            const saved = localStorage.getItem("saas_courses_db");
            if (saved) CoursesDB = JSON.parse(saved);
        } catch (err) {
            console.warn("Advertencia al sincronizar cursos:", err);
        }
    },

    saveCoursesData() {
        localStorage.setItem("saas_courses_db", JSON.stringify(CoursesDB));
    },

    // --- SISTEMA DE NAVEGACIÓN ---
    hideAllPages() {
        ["landingPage", "simulatorPage", "resultsPage", "campusPage", "saasAdminPanel"].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add("hidden");
        });
    },

    goBackToLanding() {
        if (this.state.timelineEngine) this.state.timelineEngine.stop();
        this.hideAllPages();
        const landing = document.getElementById("landingPage");
        if (landing) landing.classList.remove("hidden");
    },

    // --- CONTROLADOR CENTRAL DE LA SIMULACIÓN ---
    startSimulation() {
        console.log("🚑 Inicializando entorno operativo vivo...");
        
        // Blindaje contra fallos de carga
        if (!window.ScenariosDB || window.ScenariosDB.length === 0) {
            alert("Sincronizando motores clínicos. Por favor, actualizá la página (F5) o limpiá la caché del navegador.");
            return;
        }

        this.state.currentScenarioIndex = 0;
        
        // Limpieza segura del motor de evaluación
        if (window.EvaluationEngine && typeof window.EvaluationEngine.reset === 'function') {
            window.EvaluationEngine.reset();
        }

        this.hideAllPages();
        const simPage = document.getElementById("simulatorPage");
        if (simPage) simPage.classList.remove("hidden");
        
        this.initScenarioInstance();
    },

    initScenarioInstance() {
        const scenario = window.ScenariosDB[this.state.currentScenarioIndex];
        if (!scenario) return;

        // Inyección segura del motor fisiológico
        if (window.PatientEngine) {
            this.state.patientEngine = new window.PatientEngine(scenario.patientTemplate || {});
        } else {
            console.error("Falta cargar patient-engine.js");
            return;
        }
        
        // Inyección segura del motor de tiempo
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

        // Renderizamos la estructura completa la primera vez
        this.renderActiveDashboard(true); 
        this.state.timelineEngine.start(scenario.timeLimit);
    },

    renderActiveDashboard(forceFullRender = false) {
        const scenario = window.ScenariosDB[this.state.currentScenarioIndex];
        const container = document.getElementById("scenarioContainer");
        if (!scenario || !container) return;

        const patient = this.state.patientEngine.getState();
        const alreadyRendered = container.querySelector("#clinicalCommandInput") !== null;

        // Actualización quirúrgica del DOM para no cerrar el teclado del celular
        if (alreadyRendered && !forceFullRender) {
            this.updateMonitorValues();
            return;
        }

        container.innerHTML = `
            <div class="bg-slate-800 rounded-3xl p-8 border border-slate-700 text-white shadow-2xl relative">
                <div class="flex justify-between items-start mb-6">
                    <div>
                        <h2 class="text-3xl font-black tracking-tight text-white">${scenario.title}</h2>
                        <p class="text-slate-400 mt-1 font-medium text-sm"><i class="fas fa-crosshairs mr-2 text-red-500"></i>Entorno: ${scenario.context}</p>
                    </div>
                    <div class="bg-slate-900 px-5 py-3 rounded-2xl border border-slate-700 text-center">
                        <div id="timerDisplay" class="text-3xl font-mono font-bold text-blue-500">${scenario.timeLimit - patient.elapsedTime}</div>
                        <div class="text-[9px] uppercase tracking-widest text-slate-500 font-bold mt-1">Tiempo Restante</div>
                    </div>
                </div>

                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div class="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                        <div class="text-[11px] text-slate-500 font-bold uppercase tracking-wider"><i class="fas fa-heartbeat text-red-500 mr-2"></i>Frec. Cardíaca</div>
                        <div id="display-fc-box" class="text-3xl font-black mt-1 font-mono text-emerald-400">
                            <span id="display-fc">0</span> <span class="text-xs text-slate-500 font-normal">LPM</span>
                        </div>
                    </div>
                    <div class="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                        <div class="text-[11px] text-slate-500 font-bold uppercase tracking-wider"><i class="fas fa-compress-alt text-blue-400 mr-2"></i>Tensión Art.</div>
                        <div id="display-pa-box" class="text-3xl font-black mt-1 font-mono text-emerald-400">
                            <span id="display-pa">0/0</span> <span class="text-xs text-slate-500 font-normal">mmHg</span>
                        </div>
                    </div>
                    <div class="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                        <div class="text-[11px] text-slate-500 font-bold uppercase tracking-wider"><i class="fas fa-lungs text-sky-400 mr-2"></i>Saturación O₂</div>
                        <div id="display-spo2-box" class="text-3xl font-black mt-1 font-mono text-emerald-400">
                            <span id="display-spo2">0</span><span class="text-xs text-slate-500 font-normal">%</span>
                        </div>
                    </div>
                    <div class="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                        <div class="text-[11px] text-slate-500 font-bold uppercase tracking-wider"><i class="fas fa-brain text-purple-400 mr-2"></i>Escala Glasgow</div>
                        <div id="display-gcs-box" class="text-3xl font-black mt-1 font-mono text-emerald-400">
                            <span id="display-gcs">0</span><span class="text-xs text-slate-500 font-normal">/15</span>
                        </div>
                    </div>
                </div>

                <div class="bg-slate-900/60 border border-slate-700 rounded-2xl p-5 mb-8">
                    <p class="text-base text-slate-200"><strong class="text-blue-400 font-black">📋 Presentación del Paciente:</strong> ${scenario.vitals}</p>
                    <div class="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-slate-700/50 text-xs text-slate-400 font-medium">
                        <div>Estado de Sangrado: <span id="display-hemorragia" class="text-white font-bold uppercase"></span></div>
                        <div>Perfusión Tisular: <span id="display-perfusion" class="text-white font-bold uppercase"></span></div>
                        <div>Nivel Volumétrico Sanguíneo: <span id="display-volumen" class="text-white font-bold uppercase"></span></div>
                        <div>Estatus Clínico del Shock: <span id="display-shock" class="text-white font-bold uppercase"></span></div>
                    </div>
                </div>

                
