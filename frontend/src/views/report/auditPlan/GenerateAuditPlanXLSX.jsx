import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import logo from "@/assets/image/logoConsultoresJDG.png";

export const GenerateAuditPlanXLSX = async (data) => {

  // === Crear workbook y hoja ===
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Plan de Auditoría", {
    pageSetup: { orientation: "landscape" },
  });

  // === Banner superior ===
  ws.mergeCells("A1:F3");
  const banner = ws.getCell("A1");
  banner.value = `Plan de Auditoría | ${data.name} - FY ${data.fiscal_year}\nConsultores J.D.G. S.A.`;
  banner.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
  banner.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "333333" } };
  banner.font = { bold: true, size: 14, color: { argb: "FFFFFF" } };

  // === Logo ===
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

  // === Encabezado de la tabla ===
  const header = [
    "Título",
    "Objetivo",
    "Alcance",
    "Criterios de Evaluación",
    "Fecha de Inicio",
    "Horas Estimadas",
  ];
  ws.addRow(header);

  header.forEach((_, i) => {
    const cell = ws.getRow(4).getCell(i + 1);
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "333333" } };
    cell.font = { bold: true, color: { argb: "FFFFFF" } };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    cell.border = {
      top: { style: "thin", color: { argb: "000000" } },
      left: { style: "thin", color: { argb: "000000" } },
      bottom: { style: "thin", color: { argb: "000000" } },
      right: { style: "thin", color: { argb: "000000" } },
    };
  });

  // === Datos ===
  data.tests.forEach((t, index) => {
    const row = ws.addRow([
      t.title,
      t.objective,
      t.scope,
      t.evaluation_criteria,
      t.start_date,
      t.estimated_hours,
    ]);

    // Zebra alternada
    if (index % 2 === 1) {
      row.eachCell((cell) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "F5F5F5" } };
      });
    }

    row.eachCell((cell) => {
      cell.alignment = { vertical: "top", horizontal: "left", wrapText: true };
      cell.border = {
        top: { style: "thin", color: { argb: "999999" } },
        left: { style: "thin", color: { argb: "999999" } },
        bottom: { style: "thin", color: { argb: "999999" } },
        right: { style: "thin", color: { argb: "999999" } },
      };
    });
  });

  // === Fila de total ===
  const totalRow = ws.addRow([
    "", "", "", "", "Total de Horas", data.total_hours,
  ]);
  totalRow.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "D3D3D3" } };
    cell.font = { bold: true };
    cell.alignment = { horizontal: "right" };
  });

  // === Ajustar anchos de columna ===
  ws.columns = [
    { width: 40 }, // Título
    { width: 45 }, // Objetivo
    { width: 40 }, // Alcance
    { width: 45 }, // Criterios
    { width: 20 }, // Fecha
    { width: 18 }, // Horas
  ];

  // === Descargar archivo ===
  const safeTitle = data.name.trim().replace(/[^a-zA-Z0-9]/g, "_");
  const fileName = `plan_auditoria_${data.fiscal_year}_${safeTitle}.xlsx`;

  const buf = await wb.xlsx.writeBuffer();
  saveAs(new Blob([buf]), fileName);
};