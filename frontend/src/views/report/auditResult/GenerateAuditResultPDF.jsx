import visualize from "visualize";
import jsvisualizecomponents from "js-visualize-components";
import logo from "@/assets/image/logoConsultoresJDG.png";

export const GenerateAuditResultPDF = (data) => {
  const doc = new visualize({ orientation: "portrait" });

  const img = new Image();
  img.src = logo;

  img.onload = () => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const margin = 15;
    const headerHeight = 40;
    const TOP_MARGIN = 40; // margen superior para páginas internas
    const BOTTOM_MARGIN = 30; // pie
    const LINE_HEIGHT = 5; // interlineado
    const TITLE_SPACING = 5; // espacio entre título y párrafo
    const SECTION_SPACING = 6; // espacio final antes del próximo título
    const textWidth = pageWidth - margin * 2;

    const today = new Date().toLocaleDateString("es-VE", {
      weekday: "long",
      day: "2-digit",
      month: "long",
    });

    // ===== Encabezado (solo primera página)
    doc.setFillColor(51, 51, 51);
    doc.rect(0, 0, pageWidth, headerHeight, "F");
    doc.addImage(img, "PNG", 12, 6, 28, 28);

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Consultores J.D.G. S.A.", 50, 14);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    let infoY = 19;
    [
      "Oficina 607, CC. Ciudad Center, Calle Sanatorio del Ávila",
      "Boleita, Caracas, Venezuela",
      "Tlf: (0212) 7501145, Rif: J-401375855",
    ].forEach((line) => {
      doc.text(line, 50, infoY);
      infoY += 5;
    });
    doc.text(`Fecha: ${today}`, pageWidth - 65, 14);

    // ===== Titular
    let y = headerHeight + 15;
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Informe de Resultados de Auditoría", margin, y);
    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`Auditoría de ${data.name} FY ${data.fiscal_year}`, margin, y);
    y += 12;

    // ===== Helpers
    const ensureSpace = () => {
      if (y > pageHeight - BOTTOM_MARGIN) {
        doc.addPage();
        y = TOP_MARGIN;
      }
    };

    // Fuerza nueva página y posiciona y en TOP_MARGIN
    const forceNewPage = () => {
      doc.addPage();
      y = TOP_MARGIN;
    };

    // Escribe un párrafo (con posible \n) sin justificar.
    const writeParagraph = (text = "No disponible") => {
      const paras = String(text)
        .split(/\r?\n/)
        .filter((p) => p.trim() !== "");
      paras.forEach((p, idx) => {
        const lines = doc.splitTextToSize(p, textWidth);
        lines.forEach((line) => {
          ensureSpace();
          doc.text(line, margin, y);
          y += LINE_HEIGHT;
        });
        if (idx < paras.length - 1) {
          // espacio entre párrafos
          y += LINE_HEIGHT;
        }
      });
    };

    const addSection = (title, content) => {
      ensureSpace();
      // Título
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(title, margin, y);
      y += TITLE_SPACING;

      // Contenido
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      writeParagraph(content);

      // Pequeño espacio final (≈1 línea) antes del siguiente título
      y += SECTION_SPACING;
    };

    // ===== Secciones (flujo continuo)
    addSection("Introducción", data.report_introduction);
    addSection("Objetivos", data.objectives);
    addSection("Alcance", data.scope);
    addSection("Criterios de Evaluación", data.evaluation_criteria);
    addSection("Resumen de la Auditoría", data.report_audit_summary);
    addSection("Opinión del Auditor", data.report_auditor_opinion);

    // === TABLAS (una sola vez se fuerza salto de página antes de ambas)
    doc.addPage();
    y = 20;

    // === TABLA 1: PROCESOS AUDITADOS
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Tabla 1. Procesos auditados", margin, y);
    y += 8;

    if (data.processes?.length > 0) {
      jsvisualizecomponents(doc, {
        startY: y,
        head: [["Nombre", "Descripción", "Objetivo"]],
        body: data.processes.map((p) => [p.name, p.description, p.objective]),
        styles: {
          fontSize: 9,
          halign: "center",
          valign: "middle",
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [51, 51, 51],
          textColor: [255, 255, 255],
          halign: "center",
          fontStyle: "bold",
        },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 65 },
          2: { cellWidth: 65 },
        },
      });
      y = doc.lastAutoTable?.finalY + 12 || y + 15;
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("No se registraron procesos auditados.", margin, y);
      y += 12;
    }

    // === TABLA 2: HALLAZGOS ENCONTRADOS (sin salto de página adicional)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Tabla 2. Hallazgos encontrados", margin, y);
    y += 8;

    if (data.audit_findings?.length > 0) {
      jsvisualizecomponents(doc, {
        startY: y,
        head: [
          ["Título", "Causa Raíz", "Tipo", "Clasificación", "Observaciones"],
        ],
        body: data.audit_findings.map((f) => [
          f.title,
          f.root_cause,
          f.finding_type,
          f.classification,
          f.observations,
        ]),
        styles: { fontSize: 9, cellPadding: 2, valign: "middle" },
        headStyles: {
          fillColor: [51, 51, 51],
          textColor: [255, 255, 255],
          halign: "center",
          fontStyle: "bold",
        },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 50 },
          2: { cellWidth: 20 },
          3: { cellWidth: 20 },
          4: { cellWidth: 50 },
        },
      });
      y = doc.lastAutoTable?.finalY + 12 || y + 15;
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("No se registraron hallazgos en esta auditoría.", margin, y);
      y += 12;
    }

    // ===== Conclusión (continúa flujo normal)
    addSection("Conclusión y Recomendaciones", data.report_conclusion);

    // ===== Pie de página con numeración
    const footer = (page) => {
      const h = doc.internal.pageSize.getHeight();
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(`Página ${page}`, pageWidth - 25, h - 10);
    };
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      footer(i);
    }

    // ===== Guardar
    const safeTitle = data.name.trim().replace(/[^a-zA-Z0-9]/g, "_");
    doc.save(`informe_resultados_${data.fiscal_year}_${safeTitle}.pdf`);
  };
};
