const App = {
    state: {
        currentScenarioIndex: 0,
        score: 0,
        userAnswers: [],
        timer: null
    },

    init: function() {
        console.log("⚡ Emergency Academy inicializada.");
        this.bindEvents();
    },

    bindEvents: function() {
        // Atajo secreto: Ctrl + Shift + S para abrir el panel de configuración SaaS
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'S') {
                e.preventDefault();
                this.showSaaSPanel();
            }
        });
    },

    startSimulation: function() {
        // Reseteo de estado
        this.state.currentScenarioIndex = 0;
        this.state.score = 0;
        this.state.userAnswers = [];
        
        document.getElementById('totalScenarios').innerText = ScenariosDB.length;
        
        // Transición de UI
        document.getElementById('landingPage').classList.add('hidden');
        document.getElementById('simulatorPage').classList.remove('hidden');
        
        this.renderScenario();
    },

    renderScenario: function() {
        const scenario = ScenariosDB[this.state.currentScenarioIndex];
        const container = document.getElementById('scenarioContainer');
        
        document.getElementById('currentScenarioIndex').innerText = this.state.currentScenarioIndex + 1;
        
        // Opciones mezcladas (aleatoriedad)
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
                this.checkAnswer(false, true); // Falló por tiempo
            }
        }, 1000);
    },

    checkAnswer: function(isCorrect, timeout = false) {
        if (this.state.timer) clearInterval(this.state.timer);
        
        if (isCorrect) this.state.score += 10;
        
        this.state.userAnswers.push({
            scenarioId: ScenariosDB[this.state.currentScenarioIndex].id,
            correct: isCorrect,
            timeout: timeout
        });

        this.state.currentScenarioIndex++;
        
        if (this.state.currentScenarioIndex < ScenariosDB.length) {
            this.renderScenario();
        } else {
            this.finishSimulation();
        }
    },

    finishSimulation: function() {
        document.getElementById('simulatorPage').classList.add('hidden');
        
        // Pedimos el nombre para el diploma
        const studentName = prompt("¡Simulación terminada! Ingresá tu nombre completo para emitir el certificado:") || "Operador Clínico";
        
        // Generamos el PDF dinámico
        CertificateGenerator.generate(studentName, this.state.score);
        
        this.goBackToLanding();
    },

    goBackToLanding: function() {
        if (this.state.timer) clearInterval(this.state.timer);
        document.getElementById('simulatorPage').classList.add('hidden');
        document.getElementById('landingPage').classList.remove('hidden');
    },

    showSaaSPanel: function() {
        document.getElementById('landingPage').classList.add('hidden');
        document.getElementById('simulatorPage').classList.add('hidden');
        document.getElementById('saasAdminPanel').classList.remove('hidden');
    },

    hideSaaSPanel: function() {
        document.getElementById('saasAdminPanel').classList.add('hidden');
        document.getElementById('landingPage').classList.remove('hidden');
    }
};

// Inicializador
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
