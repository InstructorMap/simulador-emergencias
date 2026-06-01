const AITutor = {
    apiKey: null, // Acá irá tu API Key de Gemini en el futuro
    
    init: function() {
        console.log("🤖 Asistente Clínico Virtual en espera...");
    },

    // Función que llamaremos cuando el alumno abra un curso
    analyzeCourseContext: async function(courseTopic) {
        console.log(`Buscando material complementario para: ${courseTopic}`);
        
        // Simulamos una respuesta de la IA sugiriendo videos de YouTube
        return {
            topic: courseTopic,
            aiSummary: `El manejo de ${courseTopic} requiere atención inmediata. Te sugiero repasar los protocolos de inmovilización y restricción de movimiento.`,
            suggestedVideos: [
                { title: "Protocolo Trauma Update", url: "https://youtube.com/..." }
            ]
        };
    }
};

// Inicializamos
AITutor.init();
