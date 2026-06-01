const SaaSManager = {
    // Configuración por defecto de la academia matriz
    currentTenant: {
        id: 'tenant_matriz_01',
        name: 'ASARI S.A.S.',
        registrySeal: 'REMTYO',
        acronym: 'B.A.R.I.E.C.',
        signatures: [
            { name: "Marcelo Alejandro Patri", role: "Fundador y CEO" }
        ]
    },

    init: function() {
        // Al arrancar, intentamos cargar si el administrador guardó una configuración nueva
        const savedConfig = localStorage.getItem('saas_tenant_config');
        if (savedConfig) {
            this.currentTenant = JSON.parse(savedConfig);
        }
        console.log("Configuración SaaS cargada:", this.currentTenant.name);
    },

    saveSettings: function() {
        // Capturamos el nuevo sello de registro del panel (ej. si otro instructor pone el suyo)
        const newRegistry = document.getElementById('registrySealInput').value || this.currentTenant.registrySeal;
        
        // Actualizamos el estado
        this.currentTenant.registrySeal = newRegistry;
        
        // En una app real acá subiríamos las imágenes de logos y firmas a Supabase.
        // Por ahora lo guardamos localmente.
        localStorage.setItem('saas_tenant_config', JSON.stringify(this.currentTenant));
        
        alert('Configuración de la Academia guardada correctamente. Los próximos diplomas saldrán con estos datos.');
    },
    
    getTenantConfig: function() {
        return this.currentTenant;
    }
};

// Inicializamos el manager al cargar el archivo
SaaSManager.init();
