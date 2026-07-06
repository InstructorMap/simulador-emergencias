// ====================================================================
// app.js - ORQUESTADOR COMPLETO DEL SIMULADOR CLÍNICO V2 (FLIGHT-SIM MODE)
// ====================================================================

// Base de datos dinámica del Campus (Preparada para expansión por IA y Video)
let CoursesDB = [
    { 
        id: 1, 
        title: "Trauma y Control de Hemorragias", 
        desc: "Protocolos internacionales TCCC/TECC avanzados. Uso de agentes hemostáticos y torniquetes mecánicos.", 
        icon: "fa-tint", 
        price: 45000, 
        link: "https://mpago.la/ejemplo1", 
        purchased: false,
        videoId: "dQw4w9WgXcQ" // ID del video de YouTube educativo asignado al curso
    },
    { 
        id: 2, 
        title: "Soporte Vital Básico y DEA", 
        desc: "Reanimación cardiopulmonar de alta calidad según directrices de consenso prehospitalario 2025.", 
        icon: "fa-heartbeat", 
        price: 35000, 
        link: "https://mpago.la/ejemplo2", 
        purchased: true, // Inicia comprado para demostración de descarga de material
        videoId: "dQw4w9WgXcQ"
    }
];

window.App = {
    state: {
        currentScenarioIndex: 0,
        patientEngine: null,
        timelineEngine: null
    },

    init() {
        console.log("✅ Emergency Academy V2 - Terminal de Órdenes Iniciada.");
        this.loadCoursesData();

        // Verificación de integridad estructural de los 9 motores modulares
        if (typeof ScenariosDB === "undefined" || typeof PatientEngine === "undefined" || typeof EvaluationEngine === "undefined" || typeof ClinicalRules === "undefined") {
            console.error("❌ Error de Arquitectura Crítico: Faltan cargar motores JavaScript independientes en index.html.");
            return;
        }
        console.log("📚 Catálogo de Casos Clínicos en Memoria Global:", ScenariosDB.length);

        // Atajo de comandos de administración Marca Blanca (Ctrl + Shift + S)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'S') {
                e.preventDefault();
                this.showSaaSPanel();
            }
        });
    },

    // --- MANEJO DE CACHÉ Y PERSISTENCIA LOCAL DE PRODUCTOS ---
    loadCoursesData() {
        try {
            const saved = localStorage.getItem("saas_courses_db");
            if (saved) CoursesDB = JSON.parse(saved);
        } catch (err) {
            console.warn("Advertencia al sincronizar cursos de caché local:", err);
        }
    },

    saveCoursesData() {
        localStorage.setItem("saas_courses_db", JSON.stringify(CoursesDB));
    },

    // --- SISTEMA DE NAVEGACIÓN SINGLE-PAGE APPLICATION (SPA) ---
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

    // --- CONTROLADOR CENTRAL DE LA SIMULACIÓN ---
    startSimulation() {
        console.log("🚑 Inicializando entorno operativo vivo...");
        
        if (typeof ScenariosDB === "undefined" || ScenariosDB.length === 0) {
            alert("Error: Base de datos clínica global inaccesible.");
            return;
        }

        this.state.currentScenarioIndex = 0;
        window.EvaluationEngine.reset();
        this.hideAllPages();
        document.getElementById("simulatorPage").classList.remove("hidden");
        
        this.initScenarioInstance();
    },

    initScenarioInstance() {
        const scenario = ScenariosDB[this.state.currentScenarioIndex];
        if (!scenario) return;

        // Inyectar la plantilla anatómica en el motor fisiológico autónomo
        this.state.patientEngine = new PatientEngine(scenario.patientTemplate || {});
        
        // Vincular los pulsos de tiempo asíncronos con el refresco de variables en pantalla
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

        // Renderizado del monitor paramétrico de alta gama y la terminal médica abierta
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
                        <div>Nivel Volumétrico Sanguíneo: <span class="text-white font-bold uppercase ml-1">${Math.round(patient.volSanguineo)}%</span></div>
                        <div>Estatus Clínico del Shock: <span class="text-white font-bold uppercase ml-1">Clase ${patient.shockLevel}</span></div>
                    </div>
                </div>

                <div class="bg-slate-900/80 p-6 rounded-2xl border border-slate-600 shadow-inner">
                    <label class="text-sm font-bold text-blue-400 uppercase tracking-widest flex items-center mb-3">
                        <i class="fas fa-terminal mr-2"></i> Terminal de Órdenes Abiertas y Argumentación de Criterio
                    </label>
                    <textarea id="clinicalCommandInput" rows="3" class="w-full bg-slate-950 text-slate-200 text-lg rounded-xl p-4 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none transition font-medium" placeholder="Escribí detalladamente tu orden y justificación clínica... (Ej: Coloco un torniquete proximal porque priorizo el control de la hemorragia femoral exanguinante)"></textarea>
                    
                    <div class="flex flex-col sm:flex-row gap-4 mt-4">
                        <button onclick="App.submitClinicalCommand()" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition shadow-lg text-lg flex items-center justify-center">
                            <i class="fas fa-play mr-2"></i> Prescribir / Ejecutar Orden
                        </button>
                        <button onclick="App.processClinicalAction('transport_patient', 'Evacuación táctico-médica por decisión del operador profesional.')" class="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-xl transition shadow-lg flex items-center justify-center">
                            <i class="fas fa-ambulance mr-2"></i> Evacuar Destino
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    submitClinicalCommand() {
        const inputField = document.getElementById("clinicalCommandInput");
        if (!inputField) return;

        const rawText = inputField.value.trim().toLowerCase();
        if (!rawText || rawText.length < 8) {
            alert("Falta Criterio: Escribí un procedimiento claro y fundamentá tu decisión clínica en la terminal antes de enviarla.");
            return;
        }

        let action = "unrecognized";

        // Parser Clínico Semántico de Palabras Clave (Procesamiento Lingüístico de Marca Blanca)
        if (rawText.includes("torniquete") || rawText.includes("tq") || rawText.includes("tourniquet") || rawText.includes("empaquetamiento") || rawText.includes("hemostatico")) {
            action = "tourniquet_correct";
        } else if (rawText.includes("presion directa") || rawText.includes("presión directa") || rawText.includes("comprimir")) {
            action = "direct_pressure";
        } else if (rawText.includes("oxigeno") || rawText.includes("oxígeno") || rawText.includes("o2") || rawText.includes("mascara") || rawText.includes("mascarilla")) {
            action = "oxygen";
        } else if (rawText.includes("rcp") || rawText.includes("compresiones") || rawText.includes("masaje")) {
            action = "start_cpr";
        } else if (rawText.includes("dea") || rawText.includes("desfibrilar") || rawText.includes("parches") || rawText.includes("choque")) {
            action = "apply_aed";
        } else if (rawText.includes("via aerea") || rawText.includes("vía aérea") || rawText.includes("canula") || rawText.includes("mayo") || rawText.includes("intubar") || rawText.includes("tubo")) {
            action = "airway_management";
        } else if (rawText.includes("via") || rawText.includes("vía") || rawText.includes("suero") || rawText.includes("fluidos") || rawText.includes("canalizar") || rawText.includes("periferica")) {
            action = "iv_access";
        }

        if (action === "unrecognized") {
            alert("⚠️ Alerta de Ejecución: El comando prescrito no coincide con un procedimiento ejecutable en el inventario prehospitalario actual o la justificación es indescifrable.");
            return;
        }

        // Ejecutar el procedimiento médico enviando el argumento del alumno para auditoría del PDF
        this.processClinicalAction(action, inputField.value.trim());
    },

    processClinicalAction(action, argumentText = "") {
        const patientState = this.state.patientEngine.getState();

        if (action === "transport_patient") {
            this.terminateSimulationLoop("evacuated");
            return;
        }

        // Evaluar en el motor clínico y registrar en el libro auditor
        const feedback = ClinicalRules.evaluateDecision(action, patientState);
        window.EvaluationEngine.logDecision(action, patientState, feedback, argumentText);
        
        // Impactar mecánicamente las variables fisiológicas del paciente
        this.state.patientEngine.applyProcedure(action);

        // Penalización Temporal Automática: Cada procedimiento consume 15 segundos metabólicos
        this.state.patientEngine.nextTick(15);
        this.renderActiveDashboard();
    },

    onPhysiologicTick(seconds) {
        if (!this.state.patientEngine) return;

        const patient = this.state.patientEngine.nextTick(seconds);
        const scenario = ScenariosDB[this.state.currentScenarioIndex];

        const display = document.getElementById("timerDisplay");
        if (display) display.innerText = scenario.timeLimit - patient.elapsedTime;

        if (!patient.alive) {
            this.terminateSimulationLoop("patient_died");
            return;
        }

        this.renderActiveDashboard();
    },

    onDynamicComplication(complication) {
        const banner = document.createElement("div");
        banner.className = "fixed top-6 left-1/2 transform -translate-x-1/2 bg-red-600 text-white font-bold px-6 py-4 rounded-2xl shadow-2xl z-50 text-center max-w-md border border-red-400 border-2";
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
        if (this.state.currentScenarioIndex < ScenariosDB.length) {
            this.initScenarioInstance();
        } else {
            this.showResults(false);
        }
    },

    // --- PANELES DE AUDITORÍA FINAL ---
    showResults(died = false) {
        this.hideAllPages();
        document.getElementById("resultsPage").classList.remove("hidden");
        
        const audit = window.EvaluationEngine.getFinalMetrics();
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

        if (died) {
            strengthsList.innerHTML = "<li>❌ No se mitigó el colapso exanguinante o respiratorio.</li>";
            weaknessesList.innerHTML = "<li>⚠️ Falla crítica en el algoritmo de priorización MARCH / TCCC.</li><li>⚠️ Prescripción de tratamientos secundarios antes de asegurar amenazas vitales.</li>";
        } else {
            strengthsList.innerHTML = "<li>✅ Demostración de criterio lógico bajo presión.</li><li>✅ Mitigación correcta de la cascada hemodinámica.</li>";
            weaknessesList.innerHTML = audit.promedioGral < 85 ? "<li>⚠️ Se registraron acciones secundarias inefectivas fuera de secuencia.</li>" : "<li>✅ Apego riguroso a las guías tácticas internacionales.</li>";
        }
    },

    renderCompetencyChart(competencias) {
        const ctx = document.getElementById("radarChart");
        if (!ctx) return;

        if (this.state.radarInstance) this.state.radarInstance.destroy();
        this.state.radarInstance = new Chart(ctx.getContext('2d'), {
            type: 'radar',
            data: {
                labels: ['M - Hemorrage', 'A - Airway', 'R - Respiration', 'C/H - Support'],
                datasets: [{
                    label: 'Perfil de Competencias',
                    data: [competencias.MARCH_M || 50, competencies.MARCH_A || 45, 60, competencias.General || 50],
                    backgroundColor: 'rgba(37, 99, 235, 0.3)',
                    borderColor: '#3b82f6',
                    pointBackgroundColor: '#fff'
                }]
            },
            options: { scales: { r: { beginAtZero: true, max: 100, ticks: { display: false }, grid: { color: 'rgba(255,255,255,0.1)' } } }, plugins: { legend: { display: false } } }
        });
    },

    // --- CAMPUS VIRTUAL CON SOPORTE MULTIMEDIA Y MANUALES ---
    showCampus() {
        this.hideAllPages();
        document.getElementById("campusPage").classList.remove("hidden");
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
        // Generación asíncrona a demanda de manuales en PDF para el alumno
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
        doc.text("Documento oficial emitido por INST. REGULUS y avalado por REMAEP.", 15, 280);

        doc.save(`Manual_${courseTitle.replace(/ /g, '_')}.pdf`);
    },

    // --- PANEL ADMINISTRATIVO SAAS MARCA BLANCA ---
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
        const audit = window.EvaluationEngine.getFinalMetrics();
        if (window.CertificateGenerator) {
            CertificateGenerator.generate(name, audit.promedioGral || 0);
        }
    }
};

// Inicialización asíncrona segura
document.addEventListener("DOMContentLoaded", () => {
    if (window.App) window.App.init();
});
