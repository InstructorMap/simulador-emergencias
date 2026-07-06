// ====================================================================
// app.js - ORQUESTADOR DEL SIMULADOR CLÍNICO V2 (FLIGHT-SIM MODE)
// ====================================================================

let CoursesDB = [
    { id: 1, title: "Trauma y Control de Hemorragias", desc: "Protocolos internacionales TCCC/TECC avanzados.", icon: "fa-tint", price: 45000, link: "#", purchased: false },
    { id: 2, title: "Soporte Vital Básico y DEA", desc: "Reanimación cardiopulmonar de alta calidad.", icon: "fa-heartbeat", price: 35000, link: "#", purchased: true }
];

window.App = {
    state: {
        currentScenarioIndex: 0,
        patientEngine: null,
        timelineEngine: null
    },

    init() {
        console.log("✅ Emergency Academy V2 Iniciada");
        this.loadCoursesData();

        if (typeof ScenariosDB === "undefined" || typeof PatientEngine === "undefined" || typeof EvaluationEngine === "undefined") {
            console.error("❌ Error de Arquitectura: Faltan cargar los motores modulares de Javascript.");
            return;
        }

        // Acceso Corporativo al Panel SaaS Administrativo (Ctrl + Shift + S)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'S') {
                e.preventDefault();
                this.showSaaSPanel();
            }
        });
    },

    loadCoursesData() {
        try {
            const saved = localStorage.getItem("saas_courses_db");
            if (saved) CoursesDB = JSON.parse(saved);
        } catch (err) {
            console.warn("Error cargando base de datos local de cursos:", err);
        }
    },

    saveCoursesData() {
        localStorage.setItem("saas_courses_db", JSON.stringify(CoursesDB));
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
        console.log("🚑 Inicializando entorno fisiológico vivo");
        this.state.currentScenarioIndex = 0;
        window.EvaluationEngine.reset();
        this.hideAllPages();
        document.getElementById("simulatorPage").classList.remove("hidden");
        
        this.initScenarioInstance();
    },

    initScenarioInstance() {
        const scenario = ScenariosDB[this.state.state?.currentScenarioIndex || this.state.currentScenarioIndex];
        if (!scenario) return;

        // Instanciar un organismo vivo con los parámetros del caso clínico actual
        this.state.patientEngine = new PatientEngine(scenario.patientTemplate || {});
        
        // Arrancar el reloj de simulación asíncrona por segundo
        this.state.timelineEngine = new TimelineEngine(
            (tick) => this.onPhysiologicTick(tick),
            (complication) => this.onDynamicComplication(complication)
        );

        document.getElementById("currentScenarioIndex").innerText = this.state.currentScenarioIndex + 1;
        document.getElementById("totalScenarios").innerText = ScenariosDB.length;

        this.renderActiveDashboard();
        this.state.timelineEngine.start(scenario.timeLimit);
    },

    renderActiveDashboard() {
        const scenario = ScenariosDB[this.state.currentScenarioIndex];
        const container = document.getElementById("scenarioContainer");
        if (!scenario || !container) return;

        const patient = this.state.patientEngine.getState();

        // Actualizar dinámicamente el panel clínico interactivo
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
                        <div class="text-3xl font-black mt-1 font-mono ${patient.fc > 120 || patient.fc === 0 ? 'text-red-500 animate-pulse' : 'text-emerald-400'}">${Math.round(patient.fc)} <span class="text-xs text-slate-500 font-normal">LPM</span></div>
                    </div>
                    <div class="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                        <div class="text-[11px] text-slate-500 font-bold uppercase tracking-wider"><i class="fas fa-compress-alt text-blue-400 mr-2"></i>Tensión Art.</div>
                        <div class="text-3xl font-black mt-1 font-mono ${patient.paSistolica < 90 || patient.paSistolica === 0 ? 'text-red-500 font-bold' : 'text-emerald-400'}">${Math.round(patient.paSistolica)}/${Math.round(patient.paDiastolica)} <span class="text-xs text-slate-500 font-normal">mmHg</span></div>
                    </div>
                    <div class="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                        <div class="text-[11px] text-slate-500 font-bold uppercase tracking-wider"><i class="fas fa-lungs text-sky-400 mr-2"></i>Saturación O₂</div>
                        <div class="text-3xl font-black mt-1 font-mono ${patient.spo2 < 90 || patient.spo2 === 0 ? 'text-red-500' : 'text-emerald-400'}">${Math.round(patient.spo2)}<span class="text-xs text-slate-500 font-normal">%</span></div>
                    </div>
                    <div class="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                        <div class="text-[11px] text-slate-500 font-bold uppercase tracking-wider"><i class="fas fa-brain text-purple-400 mr-2"></i>Escala Glasgow</div>
                        <div class="text-3xl font-black mt-1 font-mono ${patient.gcs <= 8 ? 'text-red-500 animate-bounce' : 'text-emerald-400'}">${Math.round(patient.gcs)}<span class="text-xs text-slate-500 font-normal">/15</span></div>
                    </div>
                </div>

                <div class="bg-slate-900/60 border border-slate-700 rounded-2xl p-5 mb-8">
                    <p class="text-base text-slate-200"><strong class="text-blue-400 font-black">📋 Presentación del Paciente:</strong> ${scenario.vitals}</p>
                    <div class="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-slate-700/50 text-xs text-slate-400 font-medium">
                        <div>Estado de Sangrado: <span class="text-white font-bold uppercase ml-1">${patient.hemorragia}</span></div>
                        <div>Perfusión Tisular: <span class="text-white font-bold uppercase ml-1">${patient.perfusion}</span></div>
                        <div>Nivel Volumétrico: <span class="text-white font-bold uppercase ml-1">${Math.round(patient.volSanguineo)}%</span></div>
                        <div>Estatus del Shock: <span class="text-white font-bold uppercase ml-1">Clase ${patient.shockLevel}</span></div>
                    </div>
                </div>

                <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Procedimientos y Acciones Clínicas Disponibles</h3>
                <div class="grid sm:grid-cols-2 gap-3">
                    ${scenario.allowedActions.map(opt => `
                        <button onclick="App.processClinicalAction('${opt.action}')" class="w-full text-left p-4 bg-slate-700/30 hover:bg-blue-600/20 rounded-xl transition border border-slate-600/70 hover:border-blue-500/80 text-sm font-semibold flex items-center justify-between group">
                            <span>${opt.text}</span>
                            <i class="fas fa-bolt text-slate-500 group-hover:text-blue-400 transition transform group-hover:scale-110"></i>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    },

    onPhysiologicTick(seconds) {
        if (!this.state.patientEngine) return;

        // Avanzar el reloj metabólico del paciente vivo
        const patient = this.state.patientEngine.nextTick(seconds);
        const scenario = ScenariosDB[this.state.currentScenarioIndex];

        const display = document.getElementById("timerDisplay");
        if (display) display.innerText = scenario.timeLimit - patient.elapsedTime;

        // Si las variables caen a umbrales incompatibles con la vida, colapsa
        if (!patient.alive) {
            this.terminateSimulationLoop("patient_died");
            return;
        }

        // Refrescar los monitores multiparamétricos en pantalla sin reiniciar la instancia
        this.renderActiveDashboard();
    },

    onDynamicComplication(complication) {
        // Alerta flotante ante eventos clínicos intempestivos
        const banner = document.createElement("div");
        banner.className = "fixed top-5 left-1/2 transform -translate-x-1/2 bg-red-600 text-white font-bold px-6 py-4 rounded-2xl shadow-2xl z-50 animate-bounce text-center max-w-md border border-red-400";
        banner.innerHTML = `<i class="fas fa-exclamation-triangle mr-2"></i><strong>${complication.title}</strong><br><span class="text-xs font-normal opacity-90">${complication.message}</span>`;
        document.body.appendChild(banner);
        setTimeout(() => banner.remove(), 4000);
    },

    processClinicalAction(action) {
        const patientState = this.state.patientEngine.getState();

        // 1. Si el usuario decide evacuar, termina el bucle clínico de este paciente con éxito
        if (action === "transport_patient") {
            this.terminateSimulationLoop("evacuated");
            return;
        }

        // 2. Si es una acción terapéutica ordinaria, auditar en el motor de reglas clínicas
        if (action !== "wait_tick") {
            const feedback = ClinicalRules.evaluateDecision(action, patientState);
            window.EvaluationEngine.logDecision(action, patientState, feedback);
            
            // 3. Impactar el procedimiento quirúrgico o clínico directamente en la fisiología viva
            this.state.patientEngine.applyProcedure(action);
        }

        // Forzar un salto temporal de 10 segundos para simular el tiempo que toma realizar el procedimiento
        this.state.patientEngine.nextTick(10);

        // Refrescar el monitor clínico
        this.renderActiveDashboard();
    },

    terminateSimulationLoop(endReason) {
        if (this.state.timelineEngine) this.state.timelineEngine.stop();

        if (endReason === "patient_died") {
            this.showResults(true);
            return;
        }

        // Si fue evacuado con éxito, avanzar el índice de casos para la próxima instancia
        this.state.currentScenarioIndex++;
        
        if (this.state.currentScenarioIndex < ScenariosDB.length) {
            this.initScenarioInstance();
        } else {
            this.showResults(false);
        }
    },

    showResults(died = false) {
        this.hideAllPages();
        document.getElementById("resultsPage").classList.remove("hidden");
        
        const audit = window.EvaluationEngine.getFinalMetrics();
        const scoreDisplay = document.getElementById("resultScore");
        const levelDisplay = document.getElementById("resultLevel");

        if (died) {
            if (scoreDisplay) scoreDisplay.innerText = "0 pts (Óbito)";
            if (levelDisplay) levelDisplay.innerText = "💀 Óbito en Operación";
            this.renderCompetencyChart({ MARCH_M: 0, MARCH_A: 0, General: 0 });
        } else {
            if (scoreDisplay) scoreDisplay.innerText = `${audit.promedioGral} pts`;
            if (levelDisplay) levelDisplay.innerText = audit.promedioGral >= 80 ? "🏆 Operador Clínico de Alto Criterio" : "⚡ Operador en Desarrollo";
            this.renderCompetencyChart(audit.competencias);
        }

        // Renderizar el desglose de debilidades y fortalezas detallado
        const strengthsList = document.getElementById("strengthsList");
        const weaknessesList = document.getElementById("weaknessesList");

        if (died) {
            strengthsList.innerHTML = "<li>❌ No se lograron mitigar las amenazas letales a tiempo.</li>";
            weaknessesList.innerHTML = "<li>⚠️ Falla crítica en la priorización del algoritmo MARCH.</li><li>⚠️ Demora en procedimientos de control de fluidos/sangrado.</li>";
        } else {
            strengthsList.innerHTML = "<li>✅ Control efectivo del shock hemodinámico.</li><li>✅ Estabilización procedimental correcta del entorno.</li>";
            weaknessesList.innerHTML = audit.promedioGral < 85 ? "<li>⚠️ Se detectaron demoras operativas o acciones secundarias fuera de secuencia.</li>" : "<li>✅ Excelente apego a las directrices TCCC internacionales.</li>";
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
                    label: 'Criterio Operativo',
                    data: [competencias.MARCH_M || 40, competencias.MARCH_A || 40, 50, competencias.General || 40],
                    backgroundColor: 'rgba(37, 99, 235, 0.3)',
                    borderColor: '#3b82f6',
                    pointBackgroundColor: '#fff'
                }]
            },
            options: { scales: { r: { beginAtZero: true, max: 100, ticks: { display: false }, grid: { color: 'rgba(255,255,255,0.1)' } } }, plugins: { legend: { display: false } } }
        });
    },

    showCampus() {
        this.hideAllPages();
        document.getElementById("campusPage").classList.remove("hidden");
        this.renderCampusCourses();
    },

    renderCampusCourses() {
        const grid = document.getElementById('coursesGrid');
        if (!grid) return;
        grid.innerHTML = CoursesDB.map(course => `
            <div class="bg-white rounded-2xl shadow-lg border border-slate-200 flex flex-col overflow-hidden">
                <div class="bg-blue-600 h-32 flex items-center justify-center text-white relative">
                    <i class="fas ${course.icon} text-5xl opacity-90"></i>
                    <div class="absolute top-3 right-3 bg-slate-900/80 text-white text-xs font-bold px-3 py-1 rounded-lg">$${course.price.toLocaleString('es-AR')}</div>
                </div>
                <div class="p-5 flex-1 flex flex-col">
                    <h3 class="text-base font-bold text-slate-800 mb-1">${course.title}</h3>
                    <p class="text-slate-500 text-xs mb-4 flex-1">${course.desc}</p>
                    ${course.purchased ? `
                        <button class="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-xl text-sm transition"><i class="fas fa-file-pdf mr-2"></i>Descargar Manual</button>
                    ` : `
                        <a href="${course.link}" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl text-center text-sm transition"><i class="fas fa-shopping-cart mr-2"></i>Adquirir Formación</a>
                    `}
                </div>
            </div>
        `).join('');
    },

    showSaaSPanel() {
        this.hideAllPages();
        const panel = document.getElementById("saasAdminPanel");
        if (panel) {
            panel.classList.remove("hidden");
            panel.classList.add("flex");
        }
    },

    downloadCertificate() {
        const name = prompt("Nombre completo para los avales académicos:") || "Operador Clínico";
        const audit = window.EvaluationEngine.getFinalMetrics();
        if (window.CertificateGenerator) {
            CertificateGenerator.generate(name, audit.promedioGral || 0);
        }
    }
};

document.addEventListener("DOMContentLoaded", () => {
    window.App.init();
});
