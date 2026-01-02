import visualize from "visualize";
import jsvisualizecomponenets from "js-visualize-components";
import logo from "@/assets/image/logoConsultoresJDG.png";

export const GenerateAuditPlanPDF = (data) => {

  const doc = new visualize({ orientation: "landscape", format: "a4" });
  const img = new Image();
  img.src = logo;

  img.onload = () => {
    const pageWidth = doc.internal.pageSize.getWidth();

    // === Parámetros generales del encabezado ===
    const marginX = 10;
    const headerTop = 8;
    const headerHeight = 28;
    const bannerWidth = pageWidth - marginX * 2;

    // === Banner oscuro ===
    doc.setFillColor(51, 51, 51);
    doc.rect(marginX, headerTop, bannerWidth, headerHeight, "F");

    // === Logo ===
    const imgWidth = 25;
    const imgHeight = 25;
    doc.addImage(img, "PNG", marginX + 4, 10, imgWidth, imgHeight);

    // === Títulos ===
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(
      `Plan de Auditoría | ${data.name} - FY ${data.fiscal_year}`,
      50,
      headerTop + 14
    );

    doc.setFontSize(11);
    doc.text("Consultores J.D.G. S.A.", 50, headerTop + 22);

    // === Texto negro para la tabla ===
    doc.setTextColor(0, 0, 0);

    // === Construcción del cuerpo de la tabla ===
    const body = data.tests.map((t) => [
      t.title || "—",
      t.objective || "—",
      t.scope || "—",
      t.evaluation_criteria || "—",
      t.start_date || "—",
      t.estimated_hours || 0,
    ]);

    // === Título de la tabla ===
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);

    // === Generación de la tabla ===
    jsvisualizecomponenets(doc, {
      startY: headerTop + headerHeight + 18,
      head: [
        [
          "Título",
          "Objetivo",
          "Alcance",
          "Criterios de Evaluación",
          "Fecha de Inicio",
          "Horas Estimadas",
        ],
      ],
      body,
      styles: {
        fontSize: 8.5,
        halign: "left",
        valign: "middle",
        cellPadding: 2,
        lineWidth: 0.1,
        lineColor: [150, 150, 150],
      },
      headStyles: {
        fillColor: [51, 51, 51],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
        valign: "middle",
      },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      columnStyles: {
        0: { cellWidth: 45 },
        1: { cellWidth: 55 },
        2: { cellWidth: 65 },
        3: { cellWidth: 65 },
        4: { cellWidth: 20, halign: "center" },
        5: { cellWidth: 15, halign: "center" },
      },
    });

    // === Total de horas ===
    const now = new Date();
    const dateString = now.toLocaleDateString("es-VE", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(
      `Total de Horas: ${data.total_hours}`,
      pageWidth - 14,
      doc.lastAutoTable.finalY + 10,
      { align: "right" }
    );

    // === Guardar archivo ===
    const safeTitle = data.name.trim().replace(/[^a-zA-Z0-9]/g, "_");
    const fileName = `plan_auditoria_${data.fiscal_year}_${safeTitle}_${dateString
      .replace(/\s/g, "_")
      .replace(/,/g, "")}.pdf`;
    doc.save(fileName);
  };
};