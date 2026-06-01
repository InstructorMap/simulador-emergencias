const AITutor = {
    // Pegá tu API Key acá adentro de las comillas
    apiKey: "------", 
    
    // Instrucción oculta para que Gemini se comporte como un experto paramédico
    systemPrompt: "Eres un instructor médico experto en atención prehospitalaria, trauma y emergencias. Responde de forma clara, directa y profesional. Si te preguntan algo fuera de la medicina o emergencias, di amablemente que solo puedes ayudar con temas clínicos.",
    
    chatHistory: [],

    init: function() {
        console.log("🤖 Asistente Clínico conectado.");
    },

    toggleChat: function() {
        const chatWindow = document.getElementById('aiChatWindow');
        if (chatWindow.classList.contains('hidden')) {
            chatWindow.classList.remove('hidden');
            chatWindow.classList.add('flex');
            document.getElementById('aiChatInput').focus();
        } else {
            chatWindow.classList.add('hidden');
            chatWindow.classList.remove('flex');
        }
    },

    sendMessage: async function() {
        const inputField = document.getElementById('aiChatInput');
        const message = inputField.value.trim();
        if (!message) return;

        // Limpiar input y mostrar mensaje del usuario
        inputField.value = '';
        this.renderMessage(message, 'user');

        // Mostrar indicador de "escribiendo..."
        const typingId = this.renderTypingIndicator();

        try {
            // Preparar el cuerpo de la petición para Gemini 1.5 Flash (rápido y gratuito)
            const requestBody = {
                contents: [
                    { role: "user", parts: [{ text: this.systemPrompt + "\n\nPregunta del alumno: " + message }] }
                ]
            };

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();
            
            // Quitar el indicador de escribiendo
            document.getElementById(typingId).remove();

            if (data.candidates && data.candidates.length > 0) {
                const aiText = data.candidates[0].content.parts[0].text;
                this.renderMessage(aiText, 'ai');
            } else {
                this.renderMessage("Hubo un error de conexión clínica. Intenta de nuevo.", 'error');
            }

        } catch (error) {
            console.error("Error AI:", error);
            document.getElementById(typingId).remove();
            this.renderMessage("El servidor de comunicaciones no responde. Verifica tu conexión.", 'error');
        }
    },

    renderMessage: function(text, sender) {
        const chatBox = document.getElementById('aiChatMessages');
        const msgDiv = document.createElement('div');
        msgDiv.className = "flex items-start gap-2 " + (sender === 'user' ? "flex-row-reverse" : "");

        // Convertir negritas de markdown (**texto**) a HTML para que se vea lindo
        const formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        if (sender === 'user') {
            msgDiv.innerHTML = `
                <div class="bg-blue-600 text-white p-3 rounded-2xl rounded-tr-none shadow-sm text-sm max-w-[85%]">
                    ${formattedText}
                </div>
            `;
        } else {
            msgDiv.innerHTML = `
                <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0"><i class="fas fa-robot"></i></div>
                <div class="bg-white border border-slate-200 text-slate-700 p-3 rounded-2xl rounded-tl-none shadow-sm text-sm max-w-[85%]">
                    ${formattedText}
                </div>
            `;
        }

        chatBox.appendChild(msgDiv);
        chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll hacia abajo
    },

    renderTypingIndicator: function() {
        const chatBox = document.getElementById('aiChatMessages');
        const typingId = 'typing-' + Date.now();
        const typingDiv = document.createElement('div');
        typingDiv.id = typingId;
        typingDiv.className = "flex items-start gap-2";
        typingDiv.innerHTML = `
            <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0"><i class="fas fa-robot"></i></div>
            <div class="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm text-sm flex gap-1 items-center h-[44px]">
                <div class="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                <div class="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                <div class="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
            </div>
        `;
        chatBox.appendChild(typingDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
        return typingId;
    }
};
