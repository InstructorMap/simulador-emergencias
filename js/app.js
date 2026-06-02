// ============================================
// BASE DE DATOS DE CURSOS
// ============================================

let CoursesDB = [
    {
        id: 1,
        title: "Trauma y Control de Hemorragias",
        desc: "Protocolos internacionales TCCC/TECC.",
        icon: "fa-tint",
        price: 45000,
        link: "#",
        purchased: false
    },
    {
        id: 2,
        title: "Soporte Vital Básico y DEA",
        desc: "RCP y desfibrilación.",
        icon: "fa-heartbeat",
        price: 35000,
        link: "#",
        purchased: true
    }
];

// ============================================
// APP
// ============================================

window.App = {

    state: {
        currentScenarioIndex: 0,
        score: 0,
        timer: null,
        radarInstance: null
    },

    init() {
        console.log("✅ Emergency Academy iniciada");

        this.loadCoursesData();

        // Protección
        if (typeof ScenariosDB === "undefined") {
            console.error("❌ scenarios.js no cargó");
            return;
        }

        console.log("📚 Escenarios cargados:", ScenariosDB.length);
    },

    // ============================================
    // CURSOS
    // ============================================

    loadCoursesData() {
        try {
            const saved = localStorage.getItem("saas_courses_db");

            if (saved) {
                CoursesDB = JSON.parse(saved);
            }
        } catch (err) {
            console.warn("Error cargando cursos:", err);
        }
    },

    saveCoursesData() {
        localStorage.setItem(
            "saas_courses_db",
            JSON.stringify(CoursesDB)
        );
    },

    // ============================================
    // NAVEGACIÓN
    // ============================================

    hideAllPages() {
        const pages = [
            "landingPage",
            "simulatorPage",
            "resultsPage",
            "campusPage",
            "saasAdminPanel"
        ];

        pages.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add("hidden");
        });
    },

    goBackToLanding() {
        this.hideAllPages();

        const landing = document.getElementById("landingPage");

        if (landing) {
            landing.classList.remove("hidden");
        }
    },

    // ============================================
    // SIMULADOR
    // ============================================

    startSimulation() {

        console.log("🚑 Iniciando simulador");

        if (!window.ScenariosDB || !ScenariosDB.length) {
            alert("No se encontraron escenarios.");
            return;
        }

        this.state.currentScenarioIndex = 0;
        this.state.score = 0;

        const total = document.getElementById(
            "totalScenarios"
        );

        if (total) {
            total.innerText = ScenariosDB.length;
        }

        this.hideAllPages();

        const simPage =
            document.getElementById("simulatorPage");

        if (simPage) {
            simPage.classList.remove("hidden");
        }

        this.renderScenario();
    },

    renderScenario() {

        const scenario =
            ScenariosDB[
                this.state.currentScenarioIndex
            ];

        const container =
            document.getElementById(
                "scenarioContainer"
            );

        if (!scenario || !container) {
            console.error(
                "❌ escenario o container no encontrado"
            );
            return;
        }

        document.getElementById(
            "currentScenarioIndex"
        ).innerText =
            this.state.currentScenarioIndex + 1;

        const shuffled =
            [...scenario.options]
            .sort(() => Math.random() - 0.5);

        container.innerHTML = `
            <div class="bg-slate-800 rounded-2xl p-8 border border-slate-700 text-white">

                <div class="flex justify-between mb-6">
                    <h2 class="text-3xl font-bold">
                        ${scenario.title}
                    </h2>

                    <div class="bg-slate-900 px-4 py-2 rounded-xl">
                        <div id="timerDisplay" class="text-2xl text-blue-500 font-bold">
                            ${scenario.timeLimit}
                        </div>
                    </div>
                </div>

                <div class="bg-blue-900/20 rounded-xl p-5 mb-6">
                    <p>
                        <strong>Contexto:</strong>
                        ${scenario.context}
                    </p>

                    <p>
                        <strong>Signos:</strong>
                        ${scenario.vitals}
                    </p>
                </div>

                <div class="space-y-3">
                    ${shuffled.map(opt => `
                        <button
                            onclick="App.checkAnswer(${opt.correct})"
                            class="w-full bg-slate-700 hover:bg-blue-700 transition p-5 rounded-xl text-left"
                        >
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

        const display =
            document.getElementById(
                "timerDisplay"
            );

        this.state.timer =
            setInterval(() => {

                timeLeft--;

                if (display) {
                    display.innerText = timeLeft;
                }

                if (timeLeft <= 0) {
                    clearInterval(this.state.timer);

                    this.checkAnswer(false);
                }

            }, 1000);
    },

    checkAnswer(correct) {

        clearInterval(this.state.timer);

        if (correct) {
            this.state.score += 10;
        }

        this.state.currentScenarioIndex++;

        if (
            this.state.currentScenarioIndex <
            ScenariosDB.length
        ) {
            this.renderScenario();
        } else {
            this.showResults();
        }
    },

    // ============================================
    // RESULTADOS
    // ============================================

    showResults() {

        this.hideAllPages();

        const page =
            document.getElementById(
                "resultsPage"
            );

        page.classList.remove("hidden");

        const result =
            document.getElementById(
                "resultScore"
            );

        if (result) {
            result.innerText =
                this.state.score + " pts";
        }

        const level =
            document.getElementById(
                "resultLevel"
            );

        level.innerText =
            this.state.score >= 20
                ? "🏆 Excelente"
                : "⚡ En entrenamiento";

        console.log(
            "✅ simulación terminada"
        );
    },

    // ============================================
    // CAMPUS
    // ============================================

    showCampus() {

        this.hideAllPages();

        const page =
            document.getElementById(
                "campusPage"
            );

        if (page) {
            page