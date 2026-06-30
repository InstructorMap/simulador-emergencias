const SaaSManager = {
    currentTenant: {
        id: 'tenant_matriz_01',
        name: 'ASARI S.A.S.',
        registrySeal: 'REMAEP',
        acronym: 'INST.REGULUS',
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
        setTimeout(() => {
            const sealInput = document.getElementById('registrySealInput');
            const wpInput = document.getElementById('adminWpInput');
            const igInput = document.getElementById('adminIgInput');
            const webInput = document.getElementById('adminWebInput');
            
            // Blindaje de seguridad: si 'contact' no existe en registros viejos, crea uno vacío temporal
            const contactInfo = this.currentTenant.contact || { whatsapp: "", instagram: "", web: "" };
            
            if(sealInput) sealInput.value = this.currentTenant.registrySeal || "";
            if(wpInput) wpInput.value = contactInfo.whatsapp || "";
            if(igInput) igInput.value = contactInfo.instagram || "";
            if(webInput) webInput.value = contactInfo.web || "";
        }, 100);
    },

    saveSettings: function() {
        this.currentTenant.registrySeal = document.getElementById('registrySealInput').value || this.currentTenant.registrySeal;
        
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
