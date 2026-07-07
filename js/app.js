// ====================================================================
// app.js - CENTRO DE MANDO CLÍNICO V2 (ASARI S.A.S. BRANDING)
// ====================================================================

let CoursesDB = [
    { id: 1, title: "Trauma y Control de Hemorragias (TECC)", desc: "Protocolos internacionales y control volumétrico.", icon: "fa-tint", price: 45000, link: "#", purchased: false, videoId: "dQw4w9WgXcQ" },
    { id: 2, title: "Soporte Vital Básico Integral", desc: "Consenso prehospitalario de reanimación.", icon: "fa-heartbeat", price: 35000, link: "#", purchased: true, videoId: "dQw4w9WgXcQ" }
];

window.App = {
    state: {
        currentScenarioIndex: 0,
        patientEngine: null,
        timelineEngine: null,
        sessionLog: []
    },

    init() {
        console.log("✅ ASARI Command Center: Sistemas Operativos.");
        this.loadCoursesData();
        
        // Atajo Oculto para Administradores (Ctrl + Shift + S)
        document.addEventListener('keydown', (e) => { 
            if (e.ctrlKey && e.shiftKey && e.key === 'S') { 
                e.preventDefault(); 
                this.showSaaSPanel(); 
            }
        });
    },

    loadCoursesData() { try { const saved = localStorage.getItem("saas_courses_db"); if (saved) CoursesDB = JSON.parse(saved); } catch (err) {} },
    saveCoursesData() { localStorage.setItem("saas_courses_db", JSON.stringify(CoursesDB)); },
    hideAllPages() { ["landingPage", "simulatorPage", "resultsPage", "campusPage", "saasAdminPanel"].forEach(id => { const el = document.getElementById(id); if (el) el.classList.add("hidden"); }); },
    goBackToLanding() { if (this.state.timelineEngine) this.state.timelineEngine.stop(); this.hideAllPages(); const landing = document.getElementById("landingPage"); if (landing) landing.classList.remove("hidden"); },

    startSimulation() {
        // Corrección: Búsqueda directa sin forzar el scope de 'window'
        if (typeof ScenariosDB === "undefined" || ScenariosDB.length === 0) { 
            alert("Sincronizando base de datos clínica. Aguarde un instante..."); 
            return; 
        }
        
        this.state.currentScenarioIndex = 0;
        this.state.sessionLog = [];
        
        if (typeof EvaluationEngine !== "undefined" && typeof EvaluationEngine.reset === 'function') {
            EvaluationEngine.reset();
        }
        
        this.hideAllPages();
        const simPage = document.getElementById("simulatorPage");
        if (simPage) simPage.classList.remove("hidden");
        
        this.initScenarioInstance();
    },

    initScenarioInstance() {
        const scenario = ScenariosDB[this.state.currentScenarioIndex];
        if (!scenario) return;

        if (typeof PatientEngine !== "undefined") {
            this.state.patientEngine = new PatientEngine(scenario.patientTemplate || {});
        }
        
        this.mountScenarioUI(scenario);

        if (typeof TimelineEngine !== "undefined") {
            this.state.timelineEngine = new TimelineEngine(
                (tick) => this.onPhysiologicTick(tick),
                (complication) => this.onDynamicComplication(complication)
            );
        }
        this.state.timelineEngine.start(scenario.timeLimit);
    },

    mountScenarioUI(scenario) {
        const container = document.getElementById("scenarioContainer");
        if (!container) return;

        container.innerHTML = `
            <div class="bg-slate-900 rounded-3xl p-6 border border-slate-700 shadow-[0_0_40px_rgba(0,0,0,0.8)] relative flex flex-col lg:flex-row gap-6 h-[85vh]">
                
                <!-- PANEL IZQUIERDO: DIAGNÓSTICO Y ANATOMÍA -->
                <div class="w-full lg:w-4/12 flex flex-col gap-4 h-full">
                    
                    <!-- HUD Superior -->
                    <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between items-center shadow-inner">
                        <div>
                            <div class="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Operación en Curso</div>
                            <div class="text-emerald-500 font-mono text-sm font-bold mt-1">SISTEMA B.A.R.I.E.C ACTIVO</div>
                        </div>
                        <div class="text-right">
                            <div class="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Cronómetro (T-Minus)</div>
                            <div id="timerDisplay" class="text-3xl font-mono font-black text-blue-500 tracking-tighter">0</div>
                        </div>
                    </div>

                    <!-- MAPA ANATÓMICO SVG DINÁMICO -->
                    <div class="relative flex-1 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center shadow-inner overflow-hidden min-h-[300px]">
                        <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800/20 via-slate-900/5 to-transparent pointer-events-none"></div>
                        
                        <!-- Charco de Sangre Creciente -->
                        <div id="visual-blood" class="absolute bottom-10 bg-red-600 rounded-[100%] blur-xl opacity-0 transition-all duration-[2000ms] ease-out" style="width: 0px; height: 0px;"></div>
                        
                        <!-- Silueta Humana Vectorial -->
                        <svg id="svg-body" viewBox="0 0 100 250" class="h-[85%] z-10 transition-colors duration-1000 ease-in-out" fill="#cbd5e1">
                            <path d="M50,10 C56,10 61,15 61,21 C61,27 56,32 50,32 C44,32 39,27 39,21 C39,15 44,10 50,10 Z M50,35 C65,35 75,40 80,50 L85,90 C86,95 80,97 78,92 L72,60 L65,110 L65,230 C65,240 55,240 53,230 L50,140 L47,230 C45,240 35,240 35,230 L35,110 L28,60 L22,92 C20,97 14,95 15,90 L20,50 C25,40 35,35 50,35 Z"/>
                        </svg>

                        <!-- Indicador GCS Flotante -->
                        <div id="visual-eyes" class="absolute top-4 right-4 text-[10px] font-bold px-3 py-1.5 rounded bg-slate-900/90 text-slate-300 border border-slate-700 shadow-lg">
                            <i class='fas fa-brain text-emerald-400 mr-2'></i> GCS: 15
                        </div>
                    </div>

                    <!-- MONITORES MULTIPARAMÉTRICOS -->
                    <div class="grid grid-cols-2 gap-3">
                        <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center">
                            <div class="text-[10px] text-slate-500 font-bold uppercase tracking-widest"><i class="fas fa-heartbeat text-red-500 mr-2"></i>FC (bpm)</div>
                            <div id="display-fc-box" class="text-4xl font-black mt-1 font-mono text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">
                                <span id="display-fc">0</span>
                            </div>
                        </div>
                        <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center">
                            <div class="text-[10px] text-slate-500 font-bold uppercase tracking-widest"><i class="fas fa-compress-alt text-blue-400 mr-2"></i>PA (mmHg)</div>
                            <div id="display-pa-box" class="text-4xl font-black mt-1 font-mono text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">
                                <span id="display-pa">0/0</span>
                            </div>
                        </div>
                        <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center">
                            <div class="text-[10px] text-slate-500 font-bold uppercase tracking-widest"><i class="fas fa-lungs text-sky-400 mr-2"></i>SpO₂ (%)</div>
                            <div id="display-spo2-box" class="text-4xl font-black mt-1 font-mono text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">
                                <span id="display-spo2">0</span>
                            </div>
                        </div>
                        <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden">
                            <div class="text-[10px] text-slate-500 font-bold uppercase tracking-widest"><i class="fas fa-tint text-red-400 mr-2"></i>VOL (%)</div>
                            <div id="display-volumen-box" class="text-4xl font-black mt-1 font-mono text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">
                                <span id="display-volumen">0</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- PANEL DERECHO: BITÁCORA Y COMANDOS -->
                <div class="w-full lg:w-8/12 flex flex-col gap-4 h-full">
                    
                    <!-- Información del Escenario -->
                    <div class="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
                        <h2 class="text-xl font-black tracking-tight text-white mb-2">${scenario.title}</h2>
                        <p class="text-sm text-slate-300 leading-relaxed font-medium"><span class="text-blue-400 font-bold">📋 Despacho:</span> ${scenario.vitals}</p>
                    </div>

                    <!-- BITÁCORA CLÍNICA (Instructor Silencioso) -->
                    <div class="flex-1 bg-slate-950 rounded-xl border border-slate-800 flex flex-col overflow-hidden shadow-inner">
                        <div class="bg-slate-900 px-4 py-2 border-b border-slate-800 flex justify-between items-center">
                            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest"><i class="fas fa-satellite-dish mr-2 text-blue-500"></i>Log de Operaciones Tácticas</span>
                            <span class="text-[10px] font-bold text-slate-600">REMTYO LINK</span>
                        </div>
                        <div id="clinicalLogBox" class="flex-1 p-4 overflow-y-auto space-y-3 scroll-smooth">
                            <div class="text-xs font-mono text-slate-500">> Enlace de telemetría establecido. Aguardando órdenes médicas...</div>
                        </div>
                    </div>

                    <!-- TERMINAL DE COMANDOS -->
                    <div class="bg-slate-900 p-4 rounded-xl border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                        <label class="text-[11px] font-bold text-blue-400 uppercase tracking-widest flex items-center mb-2">
                            <i class="fas fa-terminal mr-2"></i> Consola de Mando Clínico
                        </label>
                        <div class="flex flex-col sm:flex-row gap-3">
                            <textarea id="clinicalCommandInput" rows="2" class="w-full flex-1 bg-slate-950 text-slate-200 text-sm rounded-lg p-3 border border-slate-700 focus:border-blue-500 outline-none resize-none font-mono" placeholder="Ingresar prescripción, procedimiento y argumento..."></textarea>
                            
                            <div class="flex sm:flex-col gap-2 min-w-[140px]">
                                <button onclick="App.submitClinicalCommand()" class="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-sm transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_rgba(59,130,246,0.6)]">
                                    EJECUTAR
                                </button>
                                <button onclick="App.processClinicalAction('transport_patient', 'Evacuación táctica ordenada por el operador.')" class="flex-1 bg-slate-800 hover:bg-red-600 text-white font-bold rounded-lg text-xs transition-colors border border-slate-700 hover:border-red-500">
                                    EVACUAR MEDEVAC
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        this.updateMonitorValues();
    },

    appendClinicalLog(message, isAlert = false) {
        const logBox = document.getElementById("clinicalLogBox");
        if (!logBox) return;
        
        const timeStr = document.getElementById("timerDisplay")?.innerText || "000";
        const msgDiv = document.createElement("div");
        msgDiv.className = `text-sm font-mono border-l-2 pl-3 py-1 ${isAlert ? 'border-red-500 text-red-400' : 'border-blue-500 text-emerald-400'}`;
        msgDiv.innerHTML = `<span class="text-slate-600 mr-2">[T-${timeStr}]</span> ${message}`;
        
        logBox.appendChild(msgDiv);
        logBox.scrollTop = logBox.scrollHeight;
    },

    updateMonitorValues() {
        if (!this.state.patientEngine) return;
        const patient = this.state.patientEngine.getState();
        
        if (typeof ScenariosDB === "undefined") return;
        const scenario = ScenariosDB[this.state.currentScenarioIndex];

        const timerDisplay = document.getElementById("timerDisplay");
        if (timerDisplay) timerDisplay.innerText = scenario.timeLimit - patient.elapsedTime;

        const fcDisplay = document.getElementById("display-fc");
        if (fcDisplay) {
            fcDisplay.innerText = Math.round(patient.fc);
            document.getElementById("display-fc-box").className = `text-4xl font-black mt-1 font-mono drop-shadow-[0_0_8px_rgba(52,211,153,0.3)] ${patient.fc > 120 || patient.fc === 0 ? 'text-red-500 animate-pulse' : 'text-emerald-400'}`;
        }

        const paDisplay = document.getElementById("display-pa");
        if (paDisplay) {
            paDisplay.innerText = `${Math.round(patient.paSistolica)}/${Math.round(patient.paDiastolica)}`;
            document.getElementById("display-pa-box").className = `text-4xl font-black mt-1 font-mono drop-shadow-[0_0_8px_rgba(52,211,153,0.3)] ${patient.paSistolica < 90 || patient.paSistolica === 0 ? 'text-red-500 font-bold' : 'text-emerald-400'}`;
        }

        const spo2Display = document.getElementById("display-spo2");
        if (spo2Display) {
            spo2Display.innerText = Math.round(patient.spo2);
            document.getElementById("display-spo2-box").className = `text-4xl font-black mt-1 font-mono drop-shadow-[0_0_8px_rgba(52,211,153,0.3)] ${patient.spo2 < 90 || patient.spo2 === 0 ? 'text-red-500' : 'text-emerald-400'}`;
        }

        const volDisplay = document.getElementById("display-volumen");
        if (volDisplay) {
            volDisplay.innerText = Math.round(patient.volSanguineo);
            document.getElementById("display-volumen-box").className = `text-4xl font-black mt-1 font-mono drop-shadow-[0_0_8px_rgba(52,211,153,0.3)] ${patient.volSanguineo < 80 ? 'text-red-500' : 'text-emerald-400'}`;
        }

        const bloodPool = document.getElementById("visual-blood");
        const bodySVG = document.getElementById("svg-body");
        const eyesStatus = document.getElementById("visual-eyes");

        if (bloodPool) {
            if (patient.hemorragia === "Severa") {
                const lostVol = 100 - patient.volSanguineo;
                const size = Math.min(300, lostVol * 8); 
                bloodPool.style.width = `${size}px`;
                bloodPool.style.height = `${size/3}px`;
                bloodPool.style.opacity = "0.7";
            } else if (patient.hemorragia === "Controlada") {
                bloodPool.style.opacity = "0.2"; 
            }
        }

        if (bodySVG) {
            if (patient.spo2 < 85 || patient.paSistolica < 60) bodySVG.setAttribute("fill", "#0891b2"); 
            else if (patient.paSistolica < 90) bodySVG.setAttribute("fill", "#94a3b8"); 
            else bodySVG.setAttribute("fill", "#e2e8f0"); 
        }

        if (eyesStatus) {
            if (patient.gcs === 15) eyesStatus.innerHTML = "<i class='fas fa-brain text-emerald-400 mr-2'></i> GCS: 15 (Alerta)";
            else if (patient.gcs > 8) eyesStatus.innerHTML = `<i class='fas fa-brain text-yellow-500 mr-2'></i> GCS: ${patient.gcs} (Obnubilado)`;
            else eyesStatus.innerHTML = `<i class='fas fa-brain text-red-500 mr-2'></i> GCS: ${patient.gcs} (Coma)`;
        }
    },

    submitClinicalCommand() {
        const inputField = document.getElementById("clinicalCommandInput");
        if (!inputField) return;

        const rawText = inputField.value.trim().toLowerCase();
        if (!rawText) return;

        let action = "ineffective_action";

        if (rawText.includes("torniquete") || rawText.includes("tq") || rawText.includes("empaquetamiento") || rawText.includes("hemostatico")) {
            action = "tourniquet_correct";
        } else if (rawText.includes("presion directa") || rawText.includes("presión") || rawText.includes("comprimir")) {
            action = "direct_pressure";
        } else if (rawText.includes("oxigeno") || rawText.includes("oxígeno") || rawText.includes("o2") || rawText.includes("mascara")) {
            action = "oxygen";
        } else if (rawText.includes("rcp") || rawText.includes("compresiones") || rawText.includes("masaje")) {
            action = "start_cpr";
        } else if (rawText.includes("dea") || rawText.includes("desfibrilar") || rawText.includes("choque")) {
            action = "apply_aed";
        } else if (rawText.includes("via aerea") || rawText.includes("vía aérea") || rawText.includes("intubar")) {
            action = "airway_management";
        } else if (rawText.includes("via") || rawText.includes("vía") || rawText.includes("suero") || rawText.includes("fluidos")) {
            action = "iv_access";
        }

        this.appendClinicalLog(`> OP: "${inputField.value.trim()}"`);
        this.processClinicalAction(action, inputField.value.trim());
    },

    processClinicalAction(action, argumentText = "") {
        if (!this.state.patientEngine) return;
        const patientState = this.state.patientEngine.getState();

        if (action === "transport_patient") {
            this.terminateSimulationLoop("evacuated");
            return;
        }

        if (typeof ClinicalRules !== "undefined" && typeof EvaluationEngine !== "undefined") {
            const feedback = ClinicalRules.evaluateDecision(action, patientState);
            EvaluationEngine.logDecision(action, patientState, feedback, argumentText);
            this.appendClinicalLog(feedback.logMessage, !feedback.correct);
        }
        
        if (action !== "ineffective_action") {
            this.state.patientEngine.applyProcedure(action);
        }
        
        this.state.patientEngine.nextTick(10);
        
        const inputField = document.getElementById("clinicalCommandInput");
        if (inputField) {
            inputField.value = "";
            inputField.focus(); 
        }

        this.updateMonitorValues();
    },

    onPhysiologicTick(seconds) {
        if (!this.state.patientEngine) return;
        const patient = this.state.patientEngine.nextTick(seconds);
        if (!patient.alive) { this.terminateSimulationLoop("patient_died"); return; }
        this.updateMonitorValues(); 
    },

    onDynamicComplication(complication) {
        this.appendClinicalLog(`[ALERTA CRÍTICA] ${complication.title}: ${complication.message}`, true);
        
        const container = document.getElementById("scenarioContainer");
        if(container) {
            container.classList.add("border-red-500", "shadow-[0_0_50px_rgba(239,68,68,0.5)]");
            setTimeout(() => {
                container.classList.remove("border-red-500", "shadow-[0_0_50px_rgba(239,68,68,0.5)]");
            }, 1000);
        }
    },

    terminateSimulationLoop(endReason) {
        if (this.state.timelineEngine) this.state.timelineEngine.stop();
        if (endReason === "patient_died") { this.showResults(true); return; }
        
        this.state.currentScenarioIndex++;
        if (typeof ScenariosDB !== "undefined" && this.state.currentScenarioIndex < ScenariosDB.length) { 
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
        if (typeof EvaluationEngine !== "undefined" && typeof EvaluationEngine.getFinalMetrics === 'function') audit = EvaluationEngine.getFinalMetrics();

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
    renderCampusCourses() { /* Lógica del campus omitida para brevedad */ },
    
    showSaaSPanel() { 
        this.hideAllPages(); 
        const panel = document.getElementById("saasAdminPanel"); 
        if (panel) { 
            panel.classList.remove("hidden"); 
            panel.classList.add("flex"); 
        } 
    },
    
    downloadCertificate() {
        const name = prompt("Operador Clínico (Certificación Oficial):") || "Operador Prehospitalario";
        let audit = { promedioGral: 0 };
        if (typeof EvaluationEngine !== "undefined" && typeof EvaluationEngine.getFinalMetrics === 'function') {
            audit = EvaluationEngine.getFinalMetrics();
        }
        if (typeof CertificateGenerator !== "undefined") {
            CertificateGenerator.generate(name, audit.promedioGral || 0);
        } else {
            alert("Módulo de generación no disponible.");
        }
    }
};

document.addEventListener("DOMContentLoaded", () => { if (window.App) window.App.init(); });
