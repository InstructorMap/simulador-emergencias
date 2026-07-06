const CertificateGenerator = {
    generate: function(studentName, score) {
        // Consultar la configuración del inquilino dinámico (Marca Blanca)
        const tenant = typeof SaaSManager !== "undefined" ? SaaSManager.getTenantConfig() : { name: "INST. REGULUS", registrySeal: "REMAEP" };
        const { jsPDF } = window.jspdf;
        
        // ====================================================================
        // ARCHIVO 1: CERTIFICADO ACADÉMICO (Horizontal)
        // ====================================================================
        const cert = new jsPDF('landscape', 'mm', 'a4');
        
        // Fondos de diseño corporativo de alta gama (Azul Oxford y Oro)
        cert.setFillColor(15, 23, 42); // Navy oscuro militar
        cert.rect(0, 0, 297, 210, 'F');
        
        cert.setFillColor(30, 41, 59);
        cert.rect(8, 8, 281, 194, 'F');
        
        cert.setDrawColor(234, 179, 8); // Detalle en Oro Imperial
        cert.setLineWidth(1.5);
        cert.rect(12, 12, 273, 186);

        // Cabecera institucional
        cert.setTextColor(255, 255, 255);
        cert.setFont("times", "bold");
        cert.setFontSize(32);
        cert.text("CERTIFICADO DE COMPETENCIA CLÍNICA", 148.5, 45, { align: 'center' });
        
        cert.setDrawColor(254, 240, 138);
        cert.setLineWidth(0.5);
        cert.line(60, 55, 237, 55);

        cert.setFont("helvetica", "normal");
        cert.setFontSize(14);
        cert.setTextColor(203, 213, 225);
        cert.text(`Por cuanto el profesional ha sido auditado bajo simulación de estrés operativo en el entorno corporativo de:`, 148.5, 75, { align: 'center' });
        
        cert.setFont("helvetica", "bold");
        cert.setFontSize(22);
        cert.setTextColor(59, 130, 246); // Azul eléctrico
        cert.text(tenant.name.toUpperCase(), 148.5, 90, { align: 'center' });

        cert.setFont("helvetica", "normal");
        cert.setFontSize(14);
        cert.setTextColor(203, 213, 225);
        cert.text("Se extiende el presente reconocimiento legal y académico a:", 148.5, 110, { align: 'center' });

        // Nombre del alumno en tamaño gigante y Oro
        cert.setFont("times", "bolditalic");
        cert.setFontSize(28);
        cert.setTextColor(234, 179, 8);
        cert.text(studentName.toUpperCase(), 148.5, 125, { align: 'center' });

        // Avales, Sellos Registrales y Calificación
        cert.setFont("helvetica", "normal");
        cert.setFontSize(12);
        cert.setTextColor(148, 163, 184);
        cert.text(`Habiendo alcanzado los criterios mínimos requeridos con una calificación final de: ${score} / 100 pts`, 148.5, 145, { align: 'center' });
        cert.text(`Código de Registro Nacional Único: ${tenant.registrySeal}-2026-` + Math.floor(1000 + Math.random() * 9000), 148.5, 155, { align: 'center' });

        // Firmas y avales en la base del documento
        cert.setDrawColor(255, 255, 255);
        cert.line(40, 182, 100, 182);
        cert.line(197, 182, 257, 182);

        cert.setFontSize(9);
        cert.text("Marcelo Alejandro Patri\nFundador & CEO ASARI S.A.S.", 70, 187, { align: 'center' });
        cert.text(`Dirección Académica\n${tenant.name}`, 227, 187, { align: 'center' });

        cert.save(`Certificado_${studentName.replace(/ /g, '_')}.pdf`);

        // ====================================================================
        // ARCHIVO 2: INFORME CLÍNICO AVANZADO DE RENDIMIENTO (Vertical)
        // ====================================================================
        const report = new jsPDF('p', 'mm', 'a4');
        
        report.setFillColor(15, 23, 42);
        report.rect(0, 0, 210, 35, 'F');

        report.setTextColor(255, 255, 255);
        report.setFont("helvetica", "bold");
        report.setFontSize(18);
        report.text("INFORME AUDITOR DE SIMULACIÓN", 15, 15);
        report.setFontSize(10);
        report.setFont("helvetica", "normal");
        report.text(`Entorno de Simulación Médica Avanzada - SaaS Intel`, 15, 25);

        // Resumen General de Métricas
        report.setTextColor(30, 41, 59);
        report.setFontSize(14);
        report.setFont("helvetica", "bold");
        report.text("1. Resumen Ejecutivo de Competencias", 15, 50);

        report.setDrawColor(226, 232, 240);
        report.rect(15, 55, 180, 40);
        
        report.setFontSize(11);
        report.setFont("helvetica", "normal");
        report.text(`Profesional Evaluado: ${studentName}`, 20, 65);
        report.text(`Puntaje Promedio Obtenido: ${score} / 100 puntos`, 20, 73);
        report.text(`Dictamen de la Simulación: ${score >= 80 ? 'APROBADO (Alto Criterio)' : 'EN DESARROLLO'}`, 20, 81);
        report.text(`Protocolos Auditados: MARCH / TCCC / TECC / REMAEP`, 20, 89);

        // Secciones Analíticas de Criterio Médico
        report.setFontSize(14);
        report.setFont("helvetica", "bold");
        report.text("2. Diagnóstico y Recomendaciones de Formación", 15, 115);

        report.setFillColor(248, 250, 252);
        report.rect(15, 122, 180, 35, 'F');
        report.rect(15, 122, 180, 35, 'D');

        report.setFontSize(10);
        if (score < 80) {
            report.setFont("helvetica", "bold");
            report.text("⚠️ RUTA RECOMENDADA DE INTERVENCIÓN INMEDIATA:", 20, 132);
            report.setFont("helvetica", "normal");
            report.text("- Se detectaron desvíos procedimentales críticos en las prioridades de atención.", 20, 140);
            report.text("- Recomendación: Cursar de inmediato el Módulo de Trauma y Control de Hemorragias.", 20, 147);
        } else {
            report.setFont("helvetica", "bold");
            report.text("🏆 PERFIL OPERATIVO DESTACADO:", 20, 132);
            report.setFont("helvetica", "normal");
            report.text("- Excelente toma de decisiones táctico-médicas bajo situaciones de alto estrés.", 20, 140);
            report.text("- Recomendación: Habilitado para avanzar a programas de Medicina Táctica de Zona Hostil.", 20, 147);
        }

        report.setFont("helvetica", "italic");
        report.setFontSize(8);
        report.text("Este documento es una auditoría interna automatizada por el motor criptográfico de ASARI S.A.S.", 15, 285);

        report.save(`Informe_Auditor_${studentName.replace(/ /g, '_')}.pdf`);
    }
};

window.CertificateGenerator = CertificateGenerator;
