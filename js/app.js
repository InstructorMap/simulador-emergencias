// ============================================
// BASE DE DATOS DE CURSOS DEL CAMPUS
// ============================================
const CoursesDB = [
    { id: 1, title: "Trauma y Control de Hemorragias", desc: "Protocolos internacionales TCCC/TECC, uso de torniquetes y vendajes hemostáticos.", icon: "fa-tint", price: 45000, link: "https://mpago.la/ejemplo1", purchased: false },
    { id: 2, title: "Soporte Vital Básico y DEA", desc: "Reanimación cardiopulmonar de alta calidad según guías actualizadas 2025.", icon: "fa-heartbeat", price: 35000, link: "https://mpago.la/ejemplo2", purchased: true }, // Marcado como comprado para probar el PDF
    { id: 3, title: "Triage y Múltiples Víctimas", desc: "Manejo de incidentes con saldos masivos de víctimas. Protocolos START y SALT.", icon: "fa-users", price: 42000, link: "https://mpago.la/ejemplo3", purchased: false },
    { id: 4, title: "Manejo Avanzado de Vía Aérea", desc: "Dispositivos supraglóticos, intubación endotraqueal y vía aérea quirúrgica.", icon: "fa-lungs", price: 55000, link: "https://mpago.la/ejemplo4", purchased: false },
    { id: 5, title: "Medicina Táctica Operativa", desc: "Atención bajo fuego, extracción táctica y medicina en zonas hostiles.", icon: "fa-shield-alt", price: 65000, link: "https://mpago.la/ejemplo5", purchased: false },
    { id: 6, title: "Urgencias Pediátricas", desc: "Soporte vital avanzado pediátrico, reconocimiento de shock y convulsiones.", icon: "fa-child", price: 48000, link: "https://mpago.la/ejemplo6", purchased: false },
    { id: 7, title: "Farmacología Prehospitalaria", desc: "Cálculo de dosis, vasopresores, analgésicos y vías de administración en emergencias.", icon: "fa-pills", price: 40000, link: "https://mpago.la/ejemplo7", purchased: false },
    { id: 8, title: "Electrocardiografía Paramédica", desc: "Lectura rápida de ECG de 12 derivaciones, reconocimiento de IAMCEST y arritmias letales.", icon: "fa-wave-square", price: 50000, link: "https://mpago.la/ejemplo8", purchased: false },
    { id: 9, title: "Rescate y Extricación Vehicular", desc: "Cinemática del trauma, estabilización de vehículos y uso de herramientas hidráulicas.", icon: "fa-car-crash", price: 58000, link: "https://mpago.la/ejemplo9", purchased: false },
    { id: 10, title: "Emergencias Toxicológicas", desc: "Manejo de sobredosis, antídotos específicos y estabilización inicial del paciente intoxicado.", icon: "fa-skull-crossbones", price: 38000, link: "https://mpago.la/ejemplo10", purchased: false }
];

// ============================================
// NÚCLEO DE LA APLICACIÓN
// ============================================
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
        this.bindEvents();
    },

    bindEvents: function() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'S') {
                e.preventDefault();
                this.showSaaSPanel();
            }
        });
    },

    // --- FLUJO DEL SIMULADOR ---
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

    checkAnswer: function(isCorrect, timeout = false) {
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

    // --- FLUJO DE RESULTADOS ---
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

    // Generador dinámico de Manuales de Estudio (PDF)
    downloadCourseMaterial: function(courseTitle) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        doc.setFillColor(30, 58, 138); // Azul institucional
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
        // Esta función es solo visual para el prototipo.
        // Finge que el usuario compró el curso para que al recargar la vista aparezcan los botones de PDF.
        const course = CoursesDB.find(c => c.id === courseId);
        if(course) course.purchased = true;
        setTimeout(() => this.renderCampusCourses(), 1500); // Recarga la grilla después de 1.5s
    },

    // --- NAVEGACIÓN GENERAL ---
    hideAllPages: function() {
        if (this.state.timer) clearInterval(this.state.timer);
        ['landingPage', 'simulatorPage', 'resultsPage', 'campusPage', 'saasAdminPanel'].forEach(id => {
            document.getElementById(id).classList.add('hidden');
        });
    },

    goBackToLanding: function() {
        this.hideAllPages();
        document.getElementById('landingPage').classList.remove('hidden');
        document.getElementById('aiChatWidget').classList.add('hidden');
    },

    showSaaSPanel: function() {
        this.hideAllPages();
        document.getElementById('saasAdminPanel').classList.remove('hidden');
    },

    hideSaaSPanel: function() {
        this.goBackToLanding();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
