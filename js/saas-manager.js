const SaaSManager = {
    currentTenant: {
        id: 'tenant_matriz_01',
        name: 'ASARI S.A.S.',
        registrySeal: 'REMTYO',
        acronym: 'B.A.R.I.E.C.',
        contact: {
            whatsapp: "5491100000000",
            instagram: "https://instagram.com/tu_academia",
            web: "https://tu-web.com"
        },
        signatures: [
            { name: "Marcelo Alejandro Patri", role: "Fundador y CEO" }
        ]
    },

    init: function() {
        const savedConfig = localStorage.getItem('saas_tenant_config');
        if (savedConfig) {
            this.currentTenant = JSON.parse(savedConfig);
        }
        console.log("Configuración SaaS cargada:", this.currentTenant.name);
        this.populateAdminFields();
    },

    populateAdminFields: function() {
        // Llena los campos del panel admin si existen
        setTimeout(() => {
            const sealInput = document.getElementById('registrySealInput');
            const wpInput = document.getElementById('adminWpInput');
            const igInput = document.getElementById('adminIgInput');
            const webInput = document.getElementById('adminWebInput');
            
            if(sealInput) sealInput.value = this.currentTenant.registrySeal;
            if(wpInput) wpInput.value = this.currentTenant.contact.whatsapp;
            if(igInput) igInput.value = this.currentTenant.contact.instagram;
            if(webInput) webInput.value = this.currentTenant.contact.web;
        }, 100);
    },

    saveSettings: function() {
        this.currentTenant.registrySeal = document.getElementById('registrySealInput').value || this.currentTenant.registrySeal;
        
        // Guardar redes
        this.currentTenant.contact = {
            whatsapp: document.getElementById('adminWpInput').value,
            instagram: document.getElementById('adminIgInput').value,
            web: document.getElementById('adminWebInput').value
        };
        
        localStorage.setItem('saas_tenant_config', JSON.stringify(this.currentTenant));
        alert('✅ Identidad y Contacto guardados. El campus se actualizará con estos datos.');
    },
    
    getTenantConfig: function() {
        return this.currentTenant;
    }
};

SaaSManager.init();
