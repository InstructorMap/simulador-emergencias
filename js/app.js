// ============================================
// BASE DE DATOS DE CURSOS DEL CAMPUS (Dinámica)
// ============================================
let CoursesDB = [
    { id: 1, title: "Trauma y Control de Hemorragias", desc: "Protocolos internacionales TCCC/TECC, uso de torniquetes.", icon: "fa-tint", price: 45000, link: "https://mpago.la/ejemplo1", purchased: false },
    { id: 2, title: "Soporte Vital Básico y DEA", desc: "Reanimación cardiopulmonar de alta calidad según guías 2025.", icon: "fa-heartbeat", price: 35000, link: "https://mpago.la/ejemplo2", purchased: true },
    { id: 3, title: "Triage y Múltiples Víctimas", desc: "Protocolos START y SALT para incidentes masivos.", icon: "fa-users", price: 42000, link: "https://mpago.la/ejemplo3", purchased: false },
    { id: 4, title: "Manejo Avanzado de Vía Aérea", desc: "Dispositivos supraglóticos e intubación endotraqueal.", icon: "fa-lungs", price: 55000, link: "https://mpago.la/ejemplo4", purchased: false },
    { id: 5, title: "Medicina Táctica Operativa", desc: "Atención bajo fuego y extracción táctica.", icon: "fa-shield-alt", price: 65000, link: "https://mpago.la/ejemplo5", purchased: false },
    { id: 6, title: "Urgencias Pediátricas", desc: "Soporte vital pediátrico y convulsiones.", icon: "fa-child", price: 48000, link: "https://mpago.la/ejemplo6", purchased: false },
    { id: 7, title: "Farmacología Prehospitalaria", desc: "Cálculo de dosis y vasopresores.", icon: "fa-pills", price: 40000, link: "https://mpago.la/ejemplo7", purchased: false },
    { id: 8, title: "Electrocardiografía Paramédica", desc: "Lectura rápida de ECG e IAMCEST.", icon: "fa-wave-square", price: 50000, link: "https://mpago.la/ejemplo8", purchased: false },
    { id: 9, title: "Rescate y Extricación Vehicular", desc: "Cinemática del trauma y estabilización.", icon: "fa-car-crash", price: 58000, link: "https://mpago.la/ejemplo9", purchased: false },
    { id: 10, title: "Emergencias Toxicológicas", desc: "Manejo de sobredosis y antídotos.", icon: "fa-skull-crossbones", price: 38000, link: "https://mpago.la/ejemplo10", purchased: false }
];

const App = {
    state: {
        currentScenarioIndex: 0,
        score: 0,
        userAnswers: [],
        timer: null,
        radarInstance: null
    },

    init: function() {
        console.log("⚡ Emergency Academy inicializada.");
        this.loadCoursesData();
        this.bindEvents();
    },

    loadCoursesData: function() {
        const savedCourses = localStorage.getItem('saas_courses_db');
        if (savedCourses) {
            CoursesDB = JSON.parse(savedCourses);
        }
    },

    saveCoursesData: function() {
        localStorage.setItem('saas_courses_db', JSON.stringify(CoursesDB));
    },

    bindEvents: function() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'S') {
                e.preventDefault();
                this.showSaaSPanel();
            }
        });
    },

    // --- SIMULADOR ---
    startSimulation: function() {
        this.state.currentScenarioIndex = 0;
        this.state.score = 0;
        this.state.userAnswers = [];
        document.getElementById('totalScenarios').innerText = ScenariosDB.length;
        this.hideAllPages();
        document.getElementById('simulatorPage').classList.remove('hidden');
        this.renderScenario();
    },

    renderScenario: function() {
        const scenario = ScenariosDB[this.state.currentScenarioIndex];
        const container = document.getElementById('scenarioContainer');
        document.getElementById('currentScenarioIndex').innerText = this.state.currentScenarioIndex + 1;
        const shuffledOptions = [...scenario.options].sort(() => Math.random() - 0.5);
        
        container.innerHTML = `
            <div class="bg-slate-800 rounded-2xl p-8 border border-slate-700 text-white slide-in shadow-2xl">
                <div class="flex justify-between items-start mb-6">
                    <h2 class="text-3xl font-bold">${scenario.title}</h2>
                    <div class="bg-slate-900 rounded-lg px-4 py-2 text-center border border-slate-700">
                        <div class="text-2xl font-mono font-bold text-blue-500" id="timerDisplay">${scenario.timeLimit}</div>
                        <div class="text-[10px] text-slate-400 uppercase tracking-widest">Segundos</div>
                    </div>
                </div>
                <div class="bg-blue-900/20 border border-blue-800/30 rounded-xl p-5 mb-8">
                    <p class="mb-2 text-lg"><strong class="text-blue-400">📋 Contexto:</strong> ${scenario.context}</p>
                    <p class="text-lg"><strong class="text-blue-400">📊 Signos vitales:</strong> ${scenario.vitals}</p>
                </div>
                <div class="space-y-4">
                    ${shuffledOptions.map((opt, idx) => `
                        <button onclick="App.checkAnswer(${opt.correct})" class="w-full text-left p-5 bg-slate-700/50 hover:bg-blue-600/30 rounded-xl transition border border-slate-600 hover:border-blue-500 text-lg">
                            <span class="font-bold text-slate-400 mr-3">${String.fromCharCode(65+idx)}.</span> ${opt.text}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
        this.startTimer(scenario.timeLimit);
    },

    startTimer: function(seconds) {
        if (this.state.timer) clearInterval(this.state.timer);
        let timeLeft = seconds;
        const display = document.getElementById('timerDisplay');
        this.state.timer = setInterval(() => {
            timeLeft--;
            if(display) display.innerText = timeLeft;
            if (timeLeft <= 5 && display) display.classList.add('timer-warning');
            if (timeLeft <= 0) {
                clearInterval(this.state.timer);
                this.checkAnswer(false, true); 
            }
        }, 1000);
    },

    checkAnswer: function(isCorrect) {
        if (this.state.timer) clearInterval(this.state.timer);
        if (isCorrect) this.state.score += 10;
        
        this.state.userAnswers.push({ correct: isCorrect });
        this.state.currentScenarioIndex++;
        
        if (this.state.currentScenarioIndex < ScenariosDB.length) {
            this.renderScenario();
        } else {
            this.showResults(); 
        }
    },

    // --- RESULTADOS ---
    showResults: function() {
        this.hideAllPages();
        document.getElementById('resultsPage').classList.remove('hidden');
        document.getElementById('aiChatWidget').classList.remove('hidden'); 

        const percentage = (this.state.score / (ScenariosDB.length * 10)) * 100;
        document.getElementById('resultScore').innerText = `${this.state.score} pts`;
        document.getElementById('resultLevel').innerText = percentage >= 80 ? '🏆 Alto Criterio' : percentage >= 60 ? '⚡ Operador Avanzado' : '🌱 Operador Básico';

        document.getElementById('strengthsList').innerHTML = percentage > 50 ? '<li>✅ Rápida toma de decisiones</li><li>✅ Reconocimiento de prioridades</li>' : '<li>✅ Completaste la prueba bajo presión</li>';
        document.getElementById('weaknessesList').innerHTML = percentage < 100 ? '<li>⚠️ Repasar protocolos de vía aérea</li><li>⚠️ Ajustar tiempos de RCP</li>' : '<li>✅ Nivel excelente. Sin debilidades críticas.</li>';

        if (this.state.radarInstance) this.state.radarInstance.destroy();
        const ctx = document.getElementById('radarChart').getContext('2d');
        this.state.radarInstance = new Chart(ctx, {
            type: 'radar',
            data: { 
                labels: ['Cardio', 'Trauma', 'Triage', 'Vía Aérea'], 
                datasets: [{ 
                    label: 'Perfil Clínico', 
                    data: [percentage, percentage-10, percentage+10, percentage-5], 
                    backgroundColor: 'rgba(37, 99, 235, 0.4)', 
                    borderColor: '#3b82f6',
                    pointBackgroundColor: '#fff'
                }] 
            },
            options: { scales: { r: { beginAtZero: true, max: 100, ticks: { display: false }, grid: { color: 'rgba(255,255,255,0.1)' }, pointLabels: { color: '#94a3b8', font: { size: 14 } } } }, plugins: { legend: { display: false } } }
        });
    },

    downloadCertificate: function() {
        const studentName = prompt("Ingresá tu nombre completo tal como aparecerá en el diploma:") || "Operador Clínico";
        CertificateGenerator.generate(studentName, this.state.score);
    },

    // --- CAMPUS VIRTUAL ---
    showCampus: function() {
        this.hideAllPages();
        document.getElementById('campusPage').classList.remove('hidden');
        this.renderCampusCourses();
    },

    renderCampusCourses: function() {
        const grid = document.getElementById('coursesGrid');
        
        grid.innerHTML = CoursesDB.map(course => `
            <div class="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200 hover:shadow-2xl transition-all flex flex-col transform hover:-translate-y-1">
                <div class="bg-blue-600 h-36 flex items-center justify-center text-white relative">
                    <i class="fas ${course.icon} text-6xl opacity-90"></i>
                    <div class="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-lg">
                        $${course.price.toLocaleString('es-AR')} ARS
                    </div>
                </div>
                <div class="p-6 flex-1 flex flex-col">
                    <h3 class="text-lg font-bold text-slate-800 mb-2 leading-tight">${course.title}</h3>
                    <p class="text-slate-500 text-sm mb-6 flex-1 leading-relaxed">${course.desc}</p>
                    
                    ${course.purchased ? `
                        <div class="space-y-3 mt-auto">
                            <button onclick="App.downloadCourseMaterial('${course.title}')" class="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition shadow-md flex items-center justify-center">
                                <i class="fas fa-file-pdf mr-2"></i>Descargar Manual
                            </button>
                            <button onclick="alert('Iniciando entorno virtual para: ${course.title}')" class="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-xl transition shadow-md">
                                <i class="fas fa-play-circle mr-2"></i>Entrar al Aula
                            </button>
                        </div>
                    ` : `
                        <a href="${course.link}" target="_blank" onclick="App.simulatePurchase(${course.id})" class="w-full mt-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition shadow-md flex items-center justify-center">
                            <i class="fas fa-shopping-cart mr-2"></i>Comprar Curso
                        </a>
                    `}
                </div>
            </div>
        `).join('');
    },

    downloadCourseMaterial: function(courseTitle) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        doc.setFillColor(30, 58, 138); 
        doc.rect(0, 0, 210, 40, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text("Manual de Estudio Académico", 20, 20);
        
        doc.setFontSize(14);
        doc.setFont("helvetica", "normal");
        doc.text(courseTitle, 20, 32);
        
        doc.setTextColor(50, 50, 50);
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("Contenido Analítico:", 20, 60);
        
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text("1. Introducción a los protocolos de actuación.", 20, 75);
        doc.text("2. Algoritmos de decisión clínica basados en evidencia.", 20, 85);
        doc.text("3. Identificación temprana de riesgos y triage.", 20, 95);
        doc.text("4. Procedimientos invasivos y no invasivos.", 20, 105);
        doc.text("5. Aspectos legales en la atención prehospitalaria.", 20, 115);
        
        doc.setTextColor(150, 150, 150);
        doc.setFontSize(10);
        doc.text("Documento oficial generado por Emergency Academy | B.A.R.I.E.C.", 20, 280);

        doc.save(`Manual_${courseTitle.replace(/ /g, '_')}.pdf`);
    },

    simulatePurchase: function(courseId) {
        const course = CoursesDB.find(c => c.id === courseId);
        if(course) course.purchased = true;
        setTimeout(() => this.renderCampusCourses(), 1500);
    },

    // --- NAVEGACIÓN Y PANEL SAAS ---
    hideAllPages: function() {
        if (this.state.timer) clearInterval(this.state.timer);
        ['landingPage', 'simulatorPage', 'resultsPage', 'campusPage', 'saasAdminPanel'].forEach(id => {
            document.getElementById(id).classList.add('hidden');
        });
    },

    goBackToLanding: function() {
        this.hideAllPages();
        document.getElementById('landingPage').classList.remove('hidden');
    },

    showSaaSPanel: function() {
        this.hideAllPages();
        document.getElementById('saasAdminPanel').classList.remove('hidden');
        document.getElementById('saasAdminPanel').classList.add('flex');
        this.switchAdminTab('branding'); 
    },

    hideSaaSPanel: function() {
        document.getElementById('saasAdminPanel').classList.remove('flex');
        this.goBackToLanding();
    },

    switchAdminTab: function(tabName) {
        document.querySelectorAll('.admin-tab').forEach(tab => tab.classList.add('hidden'));
        document.querySelectorAll('.admin-tab').forEach(tab => tab.classList.remove('block'));
        
        document.querySelectorAll('[id^="tabBtn-"]').forEach(btn => {
            btn.className = "w-full text-left px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 transition";
        });
        
        document.getElementById(`adminTab-${tabName}`).classList.remove('hidden');
        document.getElementById(`adminTab-${tabName}`).classList.add('block');
        
        const activeBtn = document.getElementById(`tabBtn-${tabName}`);
        activeBtn.className = "w-full text-left px-4 py-3 rounded-xl bg-blue-600 text-white font-semibold transition shadow-lg border border-blue-500/30";

        if(tabName === 'courses') this.renderAdminCoursesList();
    },

    // --- GESTIÓN CRUD DE CURSOS ---
    renderAdminCoursesList: function() {
        const tbody = document.getElementById('adminCoursesTableList');
        tbody.innerHTML = CoursesDB.map(course => `
            <tr class="hover:bg-slate-50 transition border-b border-slate-100">
                <td class="p-4">
                    <div class="font-bold text-slate-800 flex items-center"><i class="fas ${course.icon} text-blue-500 w-6 text-center mr-2"></i> ${course.title}</div>
                    <div class="text-xs text-slate-400 truncate w-48">${course.desc}</div>
                </td>
                <td class="p-4 font-semibold text-emerald-600">
                    $${course.price.toLocaleString('es-AR')}
                </td>
                <td class="p-4">
                    <a href="${course.link}" target="_blank" class="text-blue-500 hover:underline text-xs break-all"><i class="fas fa-external-link-alt mr-1"></i>Link de Pago</a>
                </td>
                <td class="p-4 text-right space-x-2">
                    <button onclick="App.openCourseModal(${course.id})" class="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-2 rounded-lg font-bold transition text-xs">Editar</button>
                    <button onclick="App.deleteCourse(${course.id})" class="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg font-bold transition text-xs"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    },

    openCourseModal: function(id = null) {
        const modalTitle = document.getElementById('modalMainTitle');
        const isEditing = id !== null;
        
        if (isEditing) {
            const course = CoursesDB.find(c => c.id === id);
            document.getElementById('modalCourseId').value = course.id;
            document.getElementById('modalCourseTitle').value = course.title;
            document.getElementById('modalCourseDesc').value = course.desc;
            document.getElementById('modalCourseIcon').value = course.icon;
            document.getElementById('modalCoursePrice').value = course.price;
            document.getElementById('modalCourseLink').value = course.link;
            modalTitle.innerHTML = `<i class="fas fa-edit mr-2 text-blue-500"></i>Editar Curso`;
        } else {
            document.getElementById('modalCourseId').value = "new";
            document.getElementById('modalCourseTitle').value = "";
            document.getElementById('modalCourseDesc').value = "";
            document.getElementById('modalCourseIcon').value = "fa-book-medical";
            document.getElementById('modalCoursePrice').value = "";
            document.getElementById('modalCourseLink').value = "";
            modalTitle.innerHTML = `<i class="fas fa-plus-circle mr-2 text-emerald-500"></i>Crear Nuevo Curso`;
        }

        document.getElementById('courseEditModal').classList.remove('hidden');
        document.getElementById('courseEditModal').classList.add('flex');
    },

    closeCourseModal: function() {
        document.getElementById('courseEditModal').classList.remove('flex');
        document.getElementById('courseEditModal').classList.add('hidden');
    },

    saveCourseEdits: function() {
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

    deleteCourse: function(id) {
        if(confirm("¿Estás seguro de eliminar este curso del Campus? Esta acción no se puede deshacer.")) {
            CoursesDB = CoursesDB.filter(c => c.id !== id);
            this.saveCoursesData();
            this.renderAdminCoursesList();
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
