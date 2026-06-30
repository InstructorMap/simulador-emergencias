// ============================================
// BASE DE DATOS DE CURSOS
// ============================================
let CoursesDB = [
    { id: 1, title: "Trauma y Control de Hemorragias", desc: "Protocolos internacionales TCCC/TECC.", icon: "fa-tint", price: 45000, link: "#", purchased: false },
    { id: 2, title: "Soporte Vital Básico y DEA", desc: "RCP y desfibrilación.", icon: "fa-heartbeat", price: 35000, link: "#", purchased: true }
];

// ============================================
// APP & INTEGRACIÓN DEL MOTOR CLÍNICO
// ============================================
window.App = {
    state: {
        currentScenarioIndex: 0,
        score: 0,
        timer: null,
        radarInstance: null,
        patientEngine: null // Almacena el motor fisiológico actual
    },

    init() {
        console.log("✅ Emergency Academy iniciada");
        this.loadCoursesData();

        if (typeof ScenariosDB === "undefined" || typeof PatientEngine === "undefined") {
            console.error("❌ Faltan cargar los motores clínicos o escenarios.");
            return;
        }
        console.log("📚 Escenarios cargados:", ScenariosDB.length);

        // Atajo para el Panel SaaS
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'S') {
                e.preventDefault();
                this.showSaaSPanel();
            }
        });
    },

    // --- GESTIÓN DE CURSOS ---
    loadCoursesData() {
        try {
            const saved = localStorage.getItem("saas_courses_db");
            if (saved) CoursesDB = JSON.parse(saved);
        } catch (err) {
            console.warn("Error cargando cursos:", err);
        }
    },

    saveCoursesData() {
        localStorage.setItem("saas_courses_db", JSON.stringify(CoursesDB));
    },

    // --- NAVEGACIÓN ---
    hideAllPages() {
        ["landingPage", "simulatorPage", "resultsPage", "campusPage", "saasAdminPanel"].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add("hidden");
        });
    },

    goBackToLanding() {
        this.hideAllPages();
        const landing = document.getElementById("landingPage");
        if (landing) landing.classList.remove("hidden");
    },

    // --- SIMULADOR & MOTOR CLÍNICO ---
    startSimulation() {
        console.log("🚑 Iniciando simulador");
        if (!window.ScenariosDB || !ScenariosDB.length) {
            alert("No se encontraron escenarios.");
            return;
        }

        this.state.currentScenarioIndex = 0;
        this.state.score = 0;

        const total = document.getElementById("totalScenarios");
        if (total) total.innerText = ScenariosDB.length;

        this.hideAllPages();
        const simPage = document.getElementById("simulatorPage");
        if (simPage) simPage.classList.remove("hidden");

        this.renderScenario();
    },

    renderScenario() {
        const scenario = ScenariosDB[this.state.currentScenarioIndex];
        const container = document.getElementById("scenarioContainer");

        if (!scenario || !container) return;

        // Inicializamos el motor fisiológico para este escenario
        let template = window.SimulationConfig ? window.SimulationConfig[scenario.scenarioKey]?.patientTemplate : {};
        this.state.patientEngine = new PatientEngine(template || {});

        document.getElementById("currentScenarioIndex").innerText = this.state.currentScenarioIndex + 1;
        const shuffled = [...scenario.options].sort(() => Math.random() - 0.5);

        // Nota: Cambiamos opt.correct por opt.action en el onclick
        container.innerHTML = `
            <div class="bg-slate-800 rounded-2xl p-8 border border-slate-700 text-white slide-in shadow-2xl">
                <div class="flex justify-between items-start mb-6">
                    <h2 class="text-3xl font-bold">${scenario.title}</h2>
                    <div class="bg-slate-900 px-4 py-2 rounded-xl border border-slate-700">
                        <div id="timerDisplay" class="text-2xl text-blue-500 font-bold">${scenario.timeLimit}</div>
                    </div>
                </div>
                <div class="bg-blue-900/20 border border-blue-800/30 rounded-xl p-5 mb-6">
                    <p class="mb-2"><strong class="text-blue-400">Contexto:</strong> ${scenario.context}</p>
                    <p><strong class="text-blue-400">Signos:</strong> ${scenario.vitals}</p>
                </div>
                <div class="space-y-3">
                    ${shuffled.map(opt => `
                        <button onclick="App.checkAnswer('${opt.action}')" class="w-full bg-slate-700/50 hover:bg-blue-600/30 transition border border-slate-600 hover:border-blue-500 p-5 rounded-xl text-left text-lg">
                            ${opt.text}
                        </button>
                    `).join("")}
                </div>
            </div>
        `;
        this.startTimer(scenario.timeLimit);
    },

    startTimer(seconds) {
        clearInterval(this.state.timer);
        let timeLeft = seconds;
        const display = document.getElementById("timerDisplay");

        this.state.timer = setInterval(() => {
            timeLeft--;
            if (display) display.innerText = timeLeft;
            if (timeLeft <= 5 && display) display.classList.add('timer-warning');
            if (timeLeft <= 0) {
                clearInterval(this.state.timer);
                this.checkAnswer("timeout");
            }
        }, 1000);
    },

    checkAnswer(action) {
        clearInterval(this.state.timer);

        // Integración con ClinicalRules
        if (action !== "timeout") {
            const patientState = this.state.patientEngine.getState();
            const feedback = ClinicalRules.evaluateDecision(action, patientState);
            
            if (feedback.correct || feedback.score > 0) {
                this.state.score += (feedback.score / 10); // Normalizamos el puntaje a escala de 10
            }
        }

        this.state.currentScenarioIndex++;
        if (this.state.currentScenarioIndex < ScenariosDB.length) {
            this.renderScenario();
        } else {
            this.showResults();
        }
    },

    // --- RESULTADOS ---
    showResults() {
        this.hideAllPages();
        const page = document.getElementById("resultsPage");
        if (page) page.classList.remove("hidden");

        const result = document.getElementById("resultScore");
        if (result) result.innerText = this.state.score + " pts";

        const level = document.getElementById("resultLevel");
        if (level) {
            level.innerText = this.state.score >= (ScenariosDB.length * 8) ? "🏆 Alto Criterio" : "⚡ Operador Avanzado";
        }
    },

    downloadCertificate() {
        const studentName = prompt("Ingresá tu nombre completo para el diploma:") || "Operador Clínico";
        if (window.CertificateGenerator) {
            CertificateGenerator.generate(studentName, this.state.score);
        }
    },

    // --- CAMPUS ---
    showCampus() {
        this.hideAllPages();
        const page = document.getElementById("campusPage");
        if (page) {
            page.classList.remove("hidden");
            this.renderCampusCourses();
        }
    },

    renderCampusCourses() {
        const grid = document.getElementById('coursesGrid');
        if (!grid) return;
        grid.innerHTML = CoursesDB.map(course => `
            <div class="bg-white rounded-2xl shadow-lg border border-slate-200 flex flex-col">
                <div class="bg-blue-600 h-36 flex items-center justify-center text-white relative rounded-t-2xl">
                    <i class="fas ${course.icon} text-6xl opacity-90"></i>
                    <div class="absolute top-3 right-3 bg-slate-900/80 text-white text-xs font-bold px-3 py-1 rounded-lg">$${course.price.toLocaleString('es-AR')}</div>
                </div>
                <div class="p-6 flex-1 flex flex-col">
                    <h3 class="text-lg font-bold text-slate-800 mb-2">${course.title}</h3>
                    <p class="text-slate-500 text-sm mb-6 flex-1">${course.desc}</p>
                    ${course.purchased ? `
                        <button class="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition"><i class="fas fa-file-pdf mr-2"></i>Descargar Manual</button>
                    ` : `
                        <a href="${course.link}" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl text-center transition"><i class="fas fa-shopping-cart mr-2"></i>Comprar</a>
                    `}
                </div>
            </div>
        `).join('');
    },

    // --- PANEL ADMINISTRADOR SAAS ---
    showSaaSPanel() {
        this.hideAllPages();
        const panel = document.getElementById('saasAdminPanel');
        if (panel) {
            panel.classList.remove('hidden');
            panel.classList.add('flex');
            this.switchAdminTab('branding');
        }
    },

    hideSaaSPanel() {
        const panel = document.getElementById('saasAdminPanel');
        if (panel) panel.classList.remove('flex');
        this.goBackToLanding();
    },

    switchAdminTab(tabName) {
        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.classList.add('hidden');
            tab.classList.remove('block');
        });
        document.querySelectorAll('[id^="tabBtn-"]').forEach(btn => {
            btn.className = "w-full text-left px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 transition";
        });
        
        const targetTab = document.getElementById(`adminTab-${tabName}`);
        const activeBtn = document.getElementById(`tabBtn-${tabName}`);
        
        if (targetTab) {
            targetTab.classList.remove('hidden');
            targetTab.classList.add('block');
        }
        if (activeBtn) {
            activeBtn.className = "w-full text-left px-4 py-3 rounded-xl bg-blue-600 text-white font-semibold transition border border-blue-500/30";
        }

        if(tabName === 'courses') this.renderAdminCoursesList();
    },

    renderAdminCoursesList() {
        const tbody = document.getElementById('adminCoursesTableList');
        if (!tbody) return;
        tbody.innerHTML = CoursesDB.map(course => `
            <tr class="hover:bg-slate-50 border-b border-slate-100">
                <td class="p-4">
                    <div class="font-bold text-slate-800"><i class="fas ${course.icon} text-blue-500 w-6"></i> ${course.title}</div>
                </td>
                <td class="p-4 font-semibold text-emerald-600">$${course.price.toLocaleString('es-AR')}</td>
                <td class="p-4 text-right">
                    <button onclick="App.openCourseModal(${course.id})" class="bg-blue-50 text-blue-600 px-3 py-2 rounded-lg font-bold text-xs mr-2">Editar</button>
                    <button onclick="App.deleteCourse(${course.id})" class="bg-red-50 text-red-600 px-3 py-2 rounded-lg font-bold text-xs"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    },

    openCourseModal(id = null) {
        const modalTitle = document.getElementById('modalMainTitle');
        if (id !== null) {
            const course = CoursesDB.find(c => c.id === id);
            document.getElementById('modalCourseId').value = course.id;
            document.getElementById('modalCourseTitle').value = course.title;
            document.getElementById('modalCourseDesc').value = course.desc;
            document.getElementById('modalCourseIcon').value = course.icon;
            document.getElementById('modalCoursePrice').value = course.price;
            document.getElementById('modalCourseLink').value = course.link;
            if(modalTitle) modalTitle.innerHTML = `<i class="fas fa-edit mr-2 text-blue-500"></i>Editar Curso`;
        } else {
            document.getElementById('modalCourseId').value = "new";
            document.getElementById('modalCourseTitle').value = "";
            document.getElementById('modalCourseDesc').value = "";
            document.getElementById('modalCourseIcon').value = "fa-book-medical";
            document.getElementById('modalCoursePrice').value = "";
            document.getElementById('modalCourseLink').value = "";
            if(modalTitle) modalTitle.innerHTML = `<i class="fas fa-plus-circle mr-2 text-emerald-500"></i>Crear Curso`;
        }
        document.getElementById('courseEditModal').classList.remove('hidden');
        document.getElementById('courseEditModal').classList.add('flex');
    },

    closeCourseModal() {
        const modal = document.getElementById('courseEditModal');
        if (modal) {
            modal.classList.remove('flex');
            modal.classList.add('hidden');
        }
    },

    saveCourseEdits() {
        const idVal = document.getElementById('modalCourseId').value;
        const newCourse = {
            title: document.getElementById('modalCourseTitle').value,
            desc: document.getElementById('modalCourseDesc').value,
            icon: document.getElementById('modalCourseIcon').value || "fa-book",
            price: parseInt(document.getElementById('modalCoursePrice').value) || 0,
            link: document.getElementById('modalCourseLink').value,
            purchased: false
        };

        if (idVal === "new") {
            newCourse.id = Date.now();
            CoursesDB.unshift(newCourse);
        } else {
            const id = parseInt(idVal);
            const index = CoursesDB.findIndex(c => c.id === id);
            if(index !== -1) {
                newCourse.id = id;
                newCourse.purchased = CoursesDB[index].purchased;
                CoursesDB[index] = newCourse;
            }
        }
        
        this.saveCoursesData(); 
        this.renderAdminCoursesList(); 
        this.closeCourseModal();
    },

    deleteCourse(id) {
        if(confirm("¿Eliminar este curso?")) {
            CoursesDB = CoursesDB.filter(c => c.id !== id);
            this.saveCoursesData();
            this.renderAdminCoursesList();
        }
    }
};

// Auto-inicializador seguro
document.addEventListener('DOMContentLoaded', () => {
    if (window.App) window.App.init();
});
