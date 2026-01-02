import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import logo from "@/assets/image/logoConsultoresJDG.png";

export const GenerateBudgetHoursXLSX = async (data) => {

  // Crear workbook y hoja
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Presupuesto Horas", {
    pageSetup: { orientation: "landscape" },
  });

  // ====== Banner oscuro ======
  ws.mergeCells("A1:I3");
  const banner = ws.getCell("A1");
  banner.value = `Presupuesto de Horas | ${data.name} - FY ${data.fiscal_year}\nConsultores J.D.G. S.A.`;
  banner.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
  banner.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "333333" } };
  banner.font = { bold: true, size: 14, color: { argb: "FFFFFF" } };

  // (Opcional) añadir logo
  try {
    const response = await fetch(logo);
    const buffer = await response.arrayBuffer();
    const imageId = wb.addImage({
      buffer: buffer,
      extension: "png",
    });
    ws.addImage(imageId, {
      tl: { col: 0, row: 0 },
      ext: { width: 60, height: 60 },
    });
  } catch (e) {
    console.warn("No se pudo cargar el logo en Excel:", e);
  }

  // ====== Encabezado de la tabla ======
  const header = [
    "Cargo",
    "Nombre Completo",
    "Planificación y requerimientos",
    "Ejecución de Pruebas",
    "Documentación de Evidencia",
    "Documentación de Hallazgos",
    "Preparación del Informe",
    "Revisión del Informe",
    "Total",
  ];
  ws.addRow(header);

  header.forEach((_, i) => {
    const cell = ws.getRow(4).getCell(i + 1);
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "333333" } };
    cell.font = { bold: true, color: { argb: "FFFFFF" } };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  });

  // ====== Datos ======
  data.users.forEach((u) => {
    ws.addRow([
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
  });

  // ====== Fila de total ======
  const totalRow = ws.addRow([
    "", "", "", "", "", "", "", "Total de Horas", data.total_hours,
  ]);
  totalRow.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "D3D3D3" } };
    cell.font = { bold: true };
  });

  // Ajustar ancho de columnas
  ws.columns = [
    { width: 20 },
    { width: 25 },
    { width: 25 },
    { width: 20 },
    { width: 25 },
    { width: 25 },
    { width: 22 },
    { width: 22 },
    { width: 15 },
  ];

  // Descargar archivo
  const safeTitle = data.name.trim().replace(/[^a-zA-Z0-9]/g, "_");
  const fileName = `presupuesto_horas_${data.fiscal_year}_${safeTitle}.xlsx`;

  const buf = await wb.xlsx.writeBuffer();
  saveAs(new Blob([buf]), fileName);
};
