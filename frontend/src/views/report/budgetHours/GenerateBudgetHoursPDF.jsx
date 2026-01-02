import visualize from "visualize";
import jsvisualizecomponenets from "js-visualize-components";
import logo from "@/assets/image/logoConsultoresJDG.png";

export const GenerateBudgetHoursPDF = (data) => {

  const doc = new visualize({ orientation: "landscape" });

  const img = new Image();
  img.src = logo;

  img.onload = () => {
    const pageWidth = doc.internal.pageSize.getWidth();

    // === Banner oscuro detrás del logo y títulos ===
    const marginX = 10;
    const headerTop = 8;
    const headerHeight = 28;
    doc.setFillColor(51, 51, 51);
    doc.rect(marginX, headerTop, pageWidth - marginX * 2, headerHeight, "F");

    // === Logo encima del banner ===
    const imgWidth = 25;
    const imgHeight = 25;
    doc.addImage(img, "PNG", 14, 10, imgWidth, imgHeight);

    // === Títulos en blanco ===
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(
      `Presupuesto de Horas | ${data.name} - FY ${data.fiscal_year}`,
      50,
      headerTop + 12
    );

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Consultores J.D.G. S.A.", 50, headerTop + 20);

    // === Texto negro para el resto ===
    doc.setTextColor(0, 0, 0);

    // Tabla con los datos
    const body = data.users.map((u) => [
      u.role,
      u.name,
      u.planning_requirements_hours,
      u.test_execution_hours,
      u.document_evidence_hours,
      u.document_findings_hours,
      u.report_preparation_hours,
      u.report_revision_hours,
      u.total_hours,
    ]);

    jsvisualizecomponenets(doc, {
      startY: headerTop + headerHeight + 9,
      head: [
        [
          "Cargo",
          "Nombre Completo",
          "Planificación\ny requerimientos",
          "Ejecución\nde Pruebas",
          "Documentación\nde Evidencia",
          "Documentación\nde Hallazgos",
          "Preparación\ndel Informe",
          "Revisión\ndel Informe",
          "Total",
        ],
      ],
      body,
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
        valign: "middle",
        fontStyle: "bold",
      },
      columnStyles: { 0: { cellWidth: 35 }, 1: { cellWidth: 45 } },
    });

    // Total de horas
    doc.setFontSize(11);
    const text = `Total de Horas: ${data.total_hours}`;
    doc.text(text, pageWidth - 14, doc.lastAutoTable.finalY + 10, {
      align: "right",
    });

    const safeTitle = data.name.trim().replace(/[^a-zA-Z0-9]/g, "_");
    const fileName = `presupuesto_horas_${data.fiscal_year}_${safeTitle}.pdf`;
    doc.save(fileName);
  };
};
