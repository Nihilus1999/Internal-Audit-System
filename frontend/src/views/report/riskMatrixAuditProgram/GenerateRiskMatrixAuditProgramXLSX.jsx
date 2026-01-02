import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import logo from "@/assets/image/logoConsultoresJDG.png";

export const GenerateRiskMatrixAuditProgramXLSX = async (data) => {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Matriz de Riesgos", {
    pageSetup: { orientation: "landscape" },
  });

  // ====== BANNER SUPERIOR ======
  ws.mergeCells("A1:F3");
  const banner = ws.getCell("A1");
  banner.value = `Matriz de riesgo | ${data.name} - FY ${data.fiscal_year}\nConsultores J.D.G. S.A.`;
  banner.alignment = {
    vertical: "middle",
    horizontal: "center",
    wrapText: true,
  };
  banner.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "333333" },
  };
  banner.font = { bold: true, size: 15, color: { argb: "FFFFFF" } };

  // Logo dentro del banner
  try {
    const response = await fetch(logo);
    const buffer = await response.arrayBuffer();
    const imageId = wb.addImage({
      buffer,
      extension: "png",
    });
    ws.addImage(imageId, {
      tl: { col: 0.2, row: 0.3 },
      ext: { width: 55, height: 55 },
    });
  } catch (e) {
    console.warn("No se pudo cargar el logo en Excel:", e);
  }

  // ====== TÍTULO TABLA 1 ======
  ws.mergeCells("A5:F5");
  const title1 = ws.getCell("A5");
  title1.value = "Tabla 1 – Datos Generales del Riesgo";
  title1.font = { bold: true, size: 12 };
  title1.alignment = { horizontal: "left" };

  // ====== ENCABEZADO TABLA 1 ======
  const header1 = [
    "Código",
    "Nombre del Riesgo",
    "Origen",
    "Fuente del Riesgo",
    "Descripción",
  ];
  ws.addRow(header1);

  const header1Row = ws.getRow(6);
  header1.forEach((_, i) => {
    const cell = header1Row.getCell(i + 1);
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "333333" },
    };
    cell.font = { bold: true, color: { argb: "FFFFFF" } };
    cell.alignment = {
      horizontal: "center",
      vertical: "middle",
      wrapText: true,
    };
  });

  // ====== DATOS TABLA 1 ======
  const firstTableStart = 6;
  data.risks.forEach((r) => {
    ws.addRow([
      r.slug || "—",
      r.name || "—",
      r.origin || "—",
      r.risk_source || "—",
      r.description || "—",
    ]);
  });
  const firstTableEnd = ws.lastRow.number;

  // ====== BORDES TABLA 1 ======
  for (let i = firstTableStart; i <= firstTableEnd; i++) {
    const row = ws.getRow(i);
    row.eachCell((cell, colNumber) => {
      cell.border = {
        top: { style: i === firstTableStart ? "medium" : "thin" },
        bottom: { style: i === firstTableEnd ? "medium" : "thin" },
        left: { style: colNumber === 1 ? "medium" : "thin" },
        right: { style: colNumber === header1.length ? "medium" : "thin" },
      };
    });
  }

  const lastRowTable1 = firstTableEnd + 2;

  // ====== TÍTULO TABLA 2 ======
  ws.mergeCells(`A${lastRowTable1}:F${lastRowTable1}`);
  const title2 = ws.getCell(`A${lastRowTable1}`);
  title2.value = "Tabla 2 – Evaluación del Riesgo";
  title2.font = { bold: true, size: 12 };
  title2.alignment = { horizontal: "left" };

  // ====== ENCABEZADO TABLA 2 ======
  const header2 = [
    "Código",
    "Probabilidad",
    "Impacto",
    "Riesgo Inherente",
    "Eficacia de Controles",
    "Riesgo Residual",
  ];
  ws.addRow(header2);

  const header2Row = ws.getRow(lastRowTable1 + 1);
  header2.forEach((_, i) => {
    const cell = header2Row.getCell(i + 1);
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "333333" },
    };
    cell.font = { bold: true, color: { argb: "FFFFFF" } };
    cell.alignment = {
      horizontal: "center",
      vertical: "middle",
      wrapText: true,
    };
  });

  // ====== DATOS TABLA 2 ======
  const secondTableStart = lastRowTable1 + 1;
  data.risks.forEach((r) => {
    ws.addRow([
      r.slug || "—",
      r.probability || "—",
      r.impact || "—",
      r.inherent_risk || "—",
      r.controls_effectiveness || "—",
      r.residual_risk || "—",
    ]);
  });
  const secondTableEnd = ws.lastRow.number;

  // ====== BORDES TABLA 2 ======
  for (let i = secondTableStart; i <= secondTableEnd; i++) {
    const row = ws.getRow(i);
    row.eachCell((cell, colNumber) => {
      cell.border = {
        top: { style: i === secondTableStart ? "medium" : "thin" },
        bottom: { style: i === secondTableEnd ? "medium" : "thin" },
        left: { style: colNumber === 1 ? "medium" : "thin" },
        right: { style: colNumber === header2.length ? "medium" : "thin" },
      };
    });
  }

  // ====== ANCHOS DE COLUMNA ======
  ws.columns = [
    { width: 15 }, // Código
    { width: 30 }, // Nombre
    { width: 20 }, // Origen
    { width: 35 }, // Fuente del riesgo
    { width: 60 }, // Descripción
    { width: 20 }, // Impacto (tabla 2)
  ];

  ws.eachRow((row) => {
    row.eachCell((cell) => {
      cell.alignment = { ...cell.alignment, wrapText: true };
    });
  });

  // ====== NOMBRE DEL ARCHIVO ======
  const safeTitle = data.name.trim().replace(/[^a-zA-Z0-9]/g, "_");
  const fileName = `presupuesto_horas_${data.fiscal_year}_${safeTitle}.xlsx`;

  const buf = await wb.xlsx.writeBuffer();
  saveAs(new Blob([buf]), fileName);
};
