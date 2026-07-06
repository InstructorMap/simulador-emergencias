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
            console.warn("Advertencia al sincronizar cursos:", err);
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
        const landing = document.getElementById("landingPage");
        if (landing) landing.classList.remove("hidden");
    },

    startSimulation() {
        console.log("🚑 Inicializando entorno operativo vivo...");
        
        if (!window.ScenariosDB || window.ScenariosDB.length === 0) {
            alert("Sincronizando motores clínicos. Por favor, actualizá la página (F5) o limpiá la caché del navegador.");
            return;
        }

        this.state.currentScenarioIndex = 0;
        
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

        if (window.PatientEngine) {
            this.state.patientEngine = new window.PatientEngine(scenario.patientTemplate || {});
        } else {
            console.error("Falta cargar patient-engine.js");
            return;
        }
        
        // 1. MONTAJE ESTRUCTURAL INICIAL (SOLO SE EJECUTA UNA VEZ)
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

    // NUEVO: Montaje estático del DOM. No se vuelve a llamar en todo el escenario.
    mountScenarioUI(scenario) {
        const container = document.getElementById("scenarioContainer");
        if (!container) return;

        container.innerHTML = `
            <div class="bg-slate-800 rounded-3xl p-8 border border-slate-700 text-white shadow-2xl relative">
                <div class="flex justify-between items-start mb-6">
                    <div>
                        <h2 class="text-3xl font-black tracking-tight text-white">${scenario.title}</h2>
                        <p class="text-slate-400 mt-1 font-medium text-sm"><i class="fas fa-crosshairs mr-2 text-red-500"></i>Entorno: ${scenario.context}</p>
                    </div>
                    <div class="bg-slate-900 px-5 py-3 rounded-2xl border border-slate-700 text-center">
                        <div id="timerDisplay" class="text-3xl font-mono font-bold text-blue-500">0</div>
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
                    <p class="text-base text-slate-200"><strong class="text-blue-400 font-black">📋 Presentación del Paciente:</strong> <span id="display-vitals">${scenario.vitals}</span></p>
                    <div class="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-slate-700/50 text-xs text-slate-400 font-medium">
                        <div>Estado de Sangrado: <span id="display-hemorragia" class="text-white font-bold uppercase"></span></div>
                        <div>Perfusión Tisular: <span id="display-perfusion" class="text-white font-bold uppercase"></span></div>
                        <div>Nivel Volumétrico Sanguíneo: <span id="display-volumen" class="text-white font-bold uppercase"></span></div>
                        <div>Estatus Clínico del Shock: <span id="display-shock" class="text-white font-bold uppercase"></span></div>
                    </div>
                </div>

                <div class="bg-slate-900/80 p-6 rounded-2xl border border-slate-600 shadow-inner">
                    <label class="text-sm font-bold text-blue-400 uppercase tracking-widest flex items-center mb-3">
                        <i class="fas fa-terminal mr-2"></i> Terminal de Órdenes Abiertas y Criterio
                    </label>
                    <textarea id="clinicalCommandInput" rows="3" class="w-full bg-slate-950 text-slate-200 text-lg rounded-xl p-4 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none transition font-medium" placeholder="Escribí tu orden clínica y la justificación. (Ej: Coloco un torniquete proximal porque priorizo el control de la hemorragia exanguinante)"></textarea>
                    
                    <div class="flex flex-col sm:flex-row gap-4 mt-4">
                        <button onclick="App.submitClinicalCommand()" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition shadow-lg text-lg flex items-center justify-center">
                            <i class="fas fa-play mr-2"></i> Prescribir Orden
                        </button>
                        <button onclick="App.processClinicalAction('transport_patient', 'Evacuación por decisión del operador profesional.')" class="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-xl transition shadow-lg flex items-center justify-center">
                            <i class="fas fa-ambulance mr-2"></i> Evacuar Destino
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Sincronización inicial de valores paramétricos.
        this.updateMonitorValues();
    },

    // NUEVO: Actualización incremental aislada. Utiliza nodos hoja y propiedades textContent/className.
    updateMonitorValues() {
        if (!this.state.patientEngine) return;
        const patient = this.state.patientEngine.getState();
        const scenario = window.ScenariosDB[this.state.currentScenarioIndex];

        const timerDisplay = document.getElementById("timerDisplay");
        if (timerDisplay) timerDisplay.innerText = scenario.timeLimit - patient.elapsedTime;

        const elFc = document.getElementById("display-fc");
        if (elFc) elFc.innerText = Math.round(patient.fc);
        const boxFc = document.getElementById("display-fc-box");
        if (boxFc) boxFc.className = `text-3xl font-black mt-1 font-mono ${patient.fc > 120 || patient.fc === 0 ? 'text-red-500 animate-pulse' : 'text-emerald-400'}`;

        const elPa = document.getElementById("display-pa");
        if (elPa) elPa.innerText = `${Math.round(patient.paSistolica)}/${Math.round(patient.paDiastolica)}`;
        const boxPa = document.getElementById("display-pa-box");
        if (boxPa) boxPa.className = `text-3xl font-black mt-1 font-mono ${patient.paSistolica < 90 || patient.paSistolica === 0 ? 'text-red-500 font-bold' : 'text-emerald-400'}`;

        const elSpo2 = document.getElementById("display-spo2");
        if (elSpo2) elSpo2.innerText = Math.round(patient.spo2);
        const boxSpo2 = document.getElementById("display-spo2-box");
        if (boxSpo2) boxSpo2.className = `text-3xl font-black mt-1 font-mono ${patient.spo2 < 90 || patient.spo2 === 0 ? 'text-red-500' : 'text-emerald-400'}`;

        const elGcs = document.getElementById("display-gcs");
        if (elGcs) elGcs.innerText = Math.round(patient.gcs);
        const boxGcs = document.getElementById("display-gcs-box");
        if (boxGcs) boxGcs.className = `text-3xl font-black mt-1 font-mono ${patient.gcs <= 8 ? 'text-red-500 animate-bounce' : 'text-emerald-400'}`;

        const elHem = document.getElementById("display-hemorragia");
        if (elHem) elHem.innerText = patient.hemorragia || "N/A";

        const elPerf = document.getElementById("display-perfusion");
        if (elPerf) elPerf.innerText = patient.perfusion || "N/A";

        const elVol = document.getElementById("display-volumen");
        if (elVol) elVol.innerText = `${Math.round(patient.volSanguineo || 0)}%`;

        const elShock = document.getElementById("display-shock");
        if (elShock) elShock.innerText = `Clase ${patient.shockLevel || 0}`;
    },

    submitClinicalCommand() {
        const inputField = document.getElementById("clinicalCommandInput");
        if (!inputField) return;

        const rawText = inputField.value.trim().toLowerCase();
        if (!rawText || rawText.length < 5) {
            alert("Debes escribir una orden clínica clara y argumentada antes de ejecutar.");
            return;
        }

        let action = "unrecognized";

        if (rawText.includes("torniquete") || rawText.includes("tq") || rawText.includes("tourniquet") || rawText.includes("empaquetamiento") || rawText.includes("hemostatico")) {
            action = "tourniquet_correct";
        } else if (rawText.includes("presion directa") || rawText.includes("presión directa") || rawText.includes("comprimir")) {
            action = "direct_pressure";
        } else if (rawText.includes("oxigeno") || rawText.includes("oxígeno") || rawText.includes("o2") || rawText.includes("mascara") || rawText.includes("mascarilla")) {
            action = "oxygen";
        } else if (rawText.includes("rcp") || rawText.includes("compresiones") || rawText.includes("masaje") || rawText.includes("reanimacion")) {
            action = "start_cpr";
        } else if (rawText.includes("dea") || rawText.includes("desfibrilar") || rawText.includes("parches") || rawText.includes("choque")) {
            action = "apply_aed";
        } else if (rawText.includes("via aerea") || rawText.includes("vía aérea") || rawText.includes("canula") || rawText.includes("mayo") || rawText.includes("intubar") || rawText.includes("tubo")) {
            action = "airway_management";
        } else if (rawText.includes("via") || rawText.includes("vía") || rawText.includes("suero") || rawText.includes("fluidos") || rawText.includes("canalizar") || rawText.includes("periferica")) {
            action = "iv_access";
        }

        if (action === "unrecognized") {
            alert("⚠️ Acción no reconocida. Detallá el procedimiento primario (ej: torniquete, rcp, oxigeno, canalizar).");
            return;
        }

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
        
        this.state.patientEngine.applyProcedure(action);
        this.state.patientEngine.nextTick(15);
        
        const inputField = document.getElementById("clinicalCommandInput");
        if (inputField) inputField.value = "";

        this.updateMonitorValues();
    },

    onPhysiologicTick(seconds) {
        if (!this.state.patientEngine) return;

        const patient = this.state.patientEngine.nextTick(seconds);
        
        if (!patient.alive) {
            this.terminateSimulationLoop("patient_died");
            return;
        }

        // Llamada ligera que actualiza datos sin bloquear hilos.
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

        if (endReason === "patient_died") {
            this.showResults(true);
            return;
        }

        this.state.currentScenarioIndex++;
        if (this.state.currentScenarioIndex < window.ScenariosDB.length) {
            this.initScenarioInstance();
        } else {
            this.showResults(false);
        }
    },

    showResults(died = false) {
        this.hideAllPages();
        const resultsPage = document.getElementById("resultsPage");
        if (resultsPage) resultsPage.classList.remove("hidden");
        
        let audit = { promedioGral: 0, competencias: { MARCH_M: 0, MARCH_A: 0, General: 0 } };
        if (window.EvaluationEngine && typeof window.EvaluationEngine.getFinalMetrics === 'function') {
            audit = window.EvaluationEngine.getFinalMetrics();
        }

        const scoreDisplay = document.getElementById("resultScore");
        const levelDisplay = document.getElementById("resultLevel");

        if (died) {
            if (scoreDisplay) scoreDisplay.innerText = "0 pts (Óbito)";
            if (levelDisplay) levelDisplay.innerText = "💀 Óbito del Paciente en Operación";
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
                strengthsList.innerHTML = "<li>❌ No se mitigó el colapso exanguinante o respiratorio a tiempo.</li>";
                weaknessesList.innerHTML = "<li>⚠️ Falla crítica en el algoritmo de priorización MARCH / TCCC.</li><li>⚠️ Prescripción de tratamientos secundarios antes de asegurar amenazas vitales.</li>";
            } else {
                strengthsList.innerHTML = "<li>✅ Demostración de criterio lógico bajo presión.</li><li>✅ Mitigación correcta de la cascada hemodinámica.</li>";
                weaknessesList.innerHTML = audit.promedioGral < 85 ? "<li>⚠️ Se registraron acciones secundarias inefectivas fuera de secuencia.</li>" : "<li>✅ Apego riguroso a las guías tácticas internacionales.</li>";
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
        const campus = document.getElementById("campusPage");
        if (campus) campus.classList.remove("hidden");
        this.renderCampusCourses();
    },

    renderCampusCourses() {
        const grid = document.getElementById('coursesGrid');
        if (!grid) return;

        grid.innerHTML = CoursesDB.map(course => `
            <div class="bg-white rounded-3xl shadow-lg border border-slate-200 flex flex-col overflow-hidden transform hover:-translate-y-1 transition-all">
                <div class="bg-blue-600 h-36 flex items-center justify-center text-white relative">
                    <i class="fas ${course.icon} text-5xl opacity-90"></i>
                    <div class="absolute top-3 right-3 bg-slate-900/80 text-white text-xs font-bold px-3 py-1 rounded-lg">$${course.price.toLocaleString('es-AR')}</div>
                </div>
                <div class="p-6 flex-1 flex flex-col">
                    <h3 class="text-lg font-bold text-slate-800 mb-1 leading-tight">${course.title}</h3>
                    <p class="text-slate-500 text-xs mb-4 flex-1 leading-relaxed">${course.desc}</p>
                    
                    ${course.purchased ? `
                        <div class="space-y-3 mt-auto">
                            <div class="relative pb-[56.25%] h-0 rounded-xl overflow-hidden shadow border border-slate-100">
                                <iframe class="absolute top-0 left-0 w-full h-full" src="https://www.youtube.com/embed/${course.videoId}" frameborder="0" allowfullscreen></iframe>
                            </div>
                            <button onclick="App.downloadCourseMaterial('${course.title}')" class="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl text-sm transition shadow"><i class="fas fa-file-pdf mr-2"></i>Descargar Manual Clínico</button>
                        </div>
                    ` : `
                        <a href="${course.link}" target="_blank" class="w-full mt-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-center text-sm transition shadow"><i class="fas fa-shopping-cart mr-2"></i>Adquirir Formación</a>
                    `}
                </div>
            </div>
        `).join('');
    },

    downloadCourseMaterial(courseTitle) {
        if (!window.jspdf) {
            alert("Motor de PDFs no disponible en este momento.");
            return;
        }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        doc.setFillColor(15, 23, 42); 
        doc.rect(0, 0, 210, 40, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text("Manual de Estudio Académico Oficial", 15, 18);
        
        doc.setFontSize(13);
        doc.setFont("helvetica", "normal");
        doc.text(`Material de soporte para el programa: ${courseTitle}`, 15, 28);
        
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(15);
        doc.setFont("helvetica", "bold");
        doc.text("Índice de Contenidos Analíticos de Criterio:", 15, 55);
        
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.text("1. Algoritmos de abordaje primario bajo escenarios de alto estrés operativo.", 15, 70);
        doc.text("2. Toma de decisiones dinámicas basadas en evidencia prehospitalaria.", 15, 80);
        doc.text("3. Identificación y tratamiento prioritario de amenazas letales.", 15, 90);
        doc.text("4. Administración estratégica de recursos e inmovilización pre-evacuación.", 15, 100);
        
        doc.setTextColor(148, 163, 184);
        doc.setFontSize(9);
        doc.text("Documento oficial para operadores prehospitalarios.", 15, 280);

        doc.save(`Manual_${courseTitle.replace(/ /g, '_')}.pdf`);
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
        const name = prompt("Nombre completo del profesional para asimilar en los avales:") || "Operador Clínico";
        let audit = { promedioGral: 0 };
        if (window.EvaluationEngine && typeof window.EvaluationEngine.getFinalMetrics === 'function') {
            audit = window.EvaluationEngine.getFinalMetrics();
        }
        if (window.CertificateGenerator) {
            window.CertificateGenerator.generate(name, audit.promedioGral || 0);
        } else {
            alert("Módulo de generación de certificados no disponible.");
        }
    }
};

document.addEventListener("DOMContentLoaded", () => {
    if (window.App) window.App.init();
});
