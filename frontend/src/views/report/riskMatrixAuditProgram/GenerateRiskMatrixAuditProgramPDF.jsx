import visualize from "visualize";
import jsvisualizecomponenets from "js-visualize-components";
import logo from "@/assets/image/logoConsultoresJDG.png";

export const GenerateRiskMatrixAuditProgramPDF = (data) => {
  const doc = new visualize({
    orientation: "landscape",
    format: "a4",
  });

  const img = new Image();
  img.src = logo;

  img.onload = () => {
    const pageWidth = doc.internal.pageSize.getWidth();

    // === Parámetros del encabezado ===
    const marginX = 10;
    const headerTop = 8;
    const headerHeight = 28;
    const bannerWidth = pageWidth - marginX * 2;
    const titleX = 50;

    // === Banner oscuro detrás del logo y títulos ===
    doc.setFillColor(51, 51, 51);
    doc.rect(marginX, headerTop, bannerWidth, headerHeight, "F");

    // === Logo encima del banner ===
    const imgWidth = 25;
    const imgHeight = 25;
    doc.addImage(img, "PNG", marginX + 4, 10, imgWidth, imgHeight);

    // === Títulos blancos ===
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(
      `Matriz de riesgo | ${data.name} - FY ${data.fiscal_year}`,
      50,
      headerTop + 12
    );
    doc.setFontSize(11);
    doc.text("Consultores J.D.G. S.A.", titleX, headerTop + 22);

    // === Texto negro para el resto ===
    doc.setTextColor(0, 0, 0);

    // === Tabla 1: Datos generales ===
    const generalBody = data.risks.map((r) => [
      r.slug || "—",
      r.name || "—",
      r.origin || "—",
      r.risk_source || "—",
      r.description || "—",
    ]);

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(
      "Tabla 1 – Datos Generales del Riesgo",
      marginX,
      headerTop + headerHeight + 15
    );

    jsvisualizecomponenets(doc, {
      startY: headerTop + headerHeight + 20,
      head: [
        [
          "Código",
          "Nombre del Riesgo",
          "Origen",
          "Fuente del Riesgo",
          "Descripción",
        ],
      ],
      body: generalBody,
      styles: {
        fontSize: 8.5,
        halign: "center",
        valign: "middle",
        cellPadding: 2,
        lineWidth: 0.1,
        lineColor: [100, 100, 100],
      },
      headStyles: {
        fillColor: [51, 51, 51],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 65 },
        2: { cellWidth: 32 },
        3: { cellWidth: 50 },
        4: { cellWidth: 90 },
      },
    });

    // === Nueva página para la Tabla 2 ===
    doc.addPage("a4", "landscape");

    // === Tabla 2: Evaluación del riesgo ===
    const detailsBody = data.risks.map((r) => [
      r.slug || "—",
      r.probability || "—",
      r.impact || "—",
      r.inherent_risk || "—",
      r.controls_effectiveness || "—",
      r.residual_risk || "—",
    ]);

    const table2StartY = 25;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Tabla 2 – Evaluación del Riesgo", marginX, table2StartY - 5);

    jsvisualizecomponenets(doc, {
      startY: table2StartY,
      head: [
        [
          "Código",
          "Probabilidad",
          "Impacto",
          "Riesgo Inherente",
          "Eficacia de Controles",
          "Riesgo Residual",
        ],
      ],
      body: detailsBody,
      styles: {
        fontSize: 8.5,
        halign: "center",
        valign: "middle",
        cellPadding: 2,
        lineWidth: 0.1,
        lineColor: [100, 100, 100],
      },
      headStyles: {
        fillColor: [51, 51, 51],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 55 },
        2: { cellWidth: 50 },
        3: { cellWidth: 40 },
        4: { cellWidth: 40 },
        5: { cellWidth: 40 },
      },
      overflow: "linebreak",
    });

    // === Pie con total ===
    const now = new Date();
    const dateString = now.toLocaleDateString("es-VE", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    doc.setFontSize(9);
    doc.text(
      `Total de riesgos: ${data.risks.length}`,
      marginX,
      doc.lastAutoTable.finalY + 10
    );

    // === Guardar archivo ===
    const safeTitle = data.name.trim().replace(/[^a-zA-Z0-9]/g, "_");
    const fileName = `matriz_de_riesgo_${data.fiscal_year}_${safeTitle}.pdf`;
    doc.save(fileName);
  };
};
