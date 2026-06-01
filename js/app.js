const App = {
    state: {
        currentScenarioIndex: 0,
        score: 0,
        userAnswers: [],
        timer: null,
        radarInstance: null // Guardamos el gráfico acá para evitar que se superpongan
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
            this.showResults(); // Vamos a la pantalla de resultados!
        }
    },

    showResults: function() {
        this.hideAllPages();
        document.getElementById('resultsPage').classList.remove('hidden');
        document.getElementById('aiChatWidget').classList.remove('hidden'); // Mostramos a la IA

        const percentage = (this.state.score / (ScenariosDB.length * 10)) * 100;
        document.getElementById('resultScore').innerText = `${this.state.score} pts`;
        document.getElementById('resultLevel').innerText = percentage >= 80 ? '🏆 Alto Criterio' : percentage >= 60 ? '⚡ Operador Avanzado' : '🌱 Operador Básico';

        // Lógica visual del feedback
        document.getElementById('strengthsList').innerHTML = percentage > 50 ? '<li>✅ Rápida toma de decisiones</li><li>✅ Reconocimiento de prioridades</li>' : '<li>✅ Completaste la prueba bajo presión</li>';
        document.getElementById('weaknessesList').innerHTML = percentage < 100 ? '<li>⚠️ Repasar protocolos de vía aérea</li><li>⚠️ Ajustar tiempos de RCP</li>' : '<li>✅ Nivel excelente. Sin debilidades críticas.</li>';

        // Dibujar Gráfico Radar
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

    showCampus: function() {
        this.hideAllPages();
        document.getElementById('campusPage').classList.remove('hidden');
    },

    downloadCertificate: function() {
        const studentName = prompt("Ingresá tu nombre completo tal como aparecerá en el diploma:") || "Operador Clínico";
        CertificateGenerator.generate(studentName, this.state.score);
    },

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
