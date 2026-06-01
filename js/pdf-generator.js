const CertificateGenerator = {
    generate: function(studentName, score) {
        // Traemos la configuración del inquilino actual
        const tenant = SaaSManager.getTenantConfig();
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('landscape', 'mm', 'a4'); // Orientación horizontal
        
        // 1. Fondo y Marcos
        doc.setFillColor(30, 58, 138); // Azul institucional oscuro
        doc.rect(0, 0, 297, 210, 'F');
        
        doc.setDrawColor(255, 255, 255);
        doc.setLineWidth(2);
        doc.rect(10, 10, 277, 190); // Marco perimetral
        
        // 2. Textos Centrales
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(35);
        doc.setFont("helvetica", "bold");
        doc.text('CERTIFICADO DE APROBACIÓN', 148.5, 60, { align: 'center' });
        
        doc.setFontSize(16);
        doc.setFont("helvetica", "normal");
        doc.text('Otorgado por ' + tenant.name + ' a:', 148.5, 90, { align: 'center' });
        
        // 3. Nombre del Alumno
        doc.setFontSize(30);
        doc.setTextColor(250, 204, 21); // Amarillo dorado
        doc.setFont("helvetica", "bold");
        doc.text(studentName.toUpperCase(), 148.5, 115, { align: 'center' });
        
        // 4. Detalle y Sello Registral Dinámico
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont("helvetica", "normal");
        doc.text(`Por haber completado la Evaluación Clínica Avanzada con un puntaje de ${score}.`, 148.5, 135, { align: 'center' });
        
        // Aquí insertamos el registro actualizado (REMTYO o el que el inquilino haya puesto)
        doc.text(`Aval Registral: ${tenant.registrySeal} | ${tenant.acronym}`, 148.5, 145, { align: 'center' });
        
        // 5. Renderizado Dinámico de Firmas (Placeholder)
        // Calcula el espacio para acomodar las firmas dinámicamente
        const sigs = tenant.signatures;
        const startX = (297 - (sigs.length * 70)) / 2; 
        
        sigs.forEach((sig, index) => {
            const xPos = startX + (index * 80);
            doc.setDrawColor(255, 255, 255);
            doc.setLineWidth(0.5);
            doc.line(xPos, 180, xPos + 50, 180); // Línea para la firma
            
            doc.setFontSize(10);
            doc.text(sig.name, xPos + 25, 185, { align: 'center' });
            doc.text(sig.role, xPos + 25, 190, { align: 'center' });
        });
        
        // Descargar el archivo
        doc.save(`Diploma_${tenant.acronym}_${studentName.replace(/ /g, '_')}.pdf`);
    }
};
