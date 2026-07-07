// js/supabase-client.js
// Configuración oficial para el proyecto: fvsgeiafzprnlznhravn

const SUPABASE_URL = 'https://fvsgeiafzprnlznhravn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2c2dlaWFmenBybmx6bmhyYXZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzODQyODgsImV4cCI6MjA5ODk2MDI4OH0.f-TSdHjVnSs1bVlETx_R05ut7U9IBxA0YtdL7uGuVDA';

window.supabaseClient = {
    client: null,

    init() {
        if (typeof supabase !== 'undefined') {
            this.client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log("✅ Conexión con Supabase establecida correctamente.");
        } else {
            console.error("⚠️ La librería de Supabase no está cargada.");
        }
    },

    async saveSession(sessionData) {
        if (!this.client) {
            console.error("Cliente no inicializado");
            return;
        }
        const { data, error } = await this.client
            .from('clinical_sessions')
            .insert([sessionData]);
        
        if (error) {
            console.error("Error al guardar en Supabase:", error);
            return { error };
        }
        return { data };
    }
};

window.supabaseClient.init();
