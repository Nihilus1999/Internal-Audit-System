import React from "react";
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  WidthType,
  ShadingType,
  ImageRun,
  AlignmentType,
  PageOrientation,
  BorderStyle,
} from "docx";
import { saveAs } from "file-saver";
import logo from "@/assets/image/logoConsultoresJDG.png";

// ✅ Convertir imagen a base64 (para el logo)
const getBase64ImageFromUrl = async (url) => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Celda de cabecera
const headerCell = (text, widthPct) =>
  new TableCell({
    width: { size: widthPct, type: WidthType.PERCENTAGE },
    shading: { type: ShadingType.CLEAR, fill: "333333" },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: text.split("\n").flatMap((t, idx) => {
          const runs = [];
          if (idx > 0) runs.push(new TextRun({ break: 1 }));
          runs.push(new TextRun({ text: t, bold: true, color: "FFFFFF" }));
          return runs;
        }),
      }),
    ],
  });

// Celda de datos
const dataCell = ({ text, align = "center", fill, color, widthPct }) =>
  new TableCell({
    width: widthPct ? { size: widthPct, type: WidthType.PERCENTAGE } : undefined,
    shading: fill ? { type: ShadingType.CLEAR, fill } : undefined,
    children: [
      new Paragraph({
        alignment:
          align === "left"
            ? AlignmentType.LEFT
            : align === "right"
            ? AlignmentType.RIGHT
            : AlignmentType.CENTER,
        children: [new TextRun({ text: String(text), color, bold: false })],
      }),
    ],
  });

export const GenerateBudgetHoursDOCX = async (data) => {

  const base64Logo = await getBase64ImageFromUrl(logo);

  // === Banner superior ===
  const bannerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 15, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, fill: "333333" },
            margins: { top: 120, bottom: 120, left: 120, right: 120 },
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [
                  new ImageRun({
                    data: base64Logo,
                    transformation: { width: 90, height: 90 },
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 85, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, fill: "333333" },
            margins: { top: 120, bottom: 120, left: 120, right: 120 },
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [
                  new TextRun({
                    text: `Presupuesto de Horas | ${data.name} - FY ${data.fiscal_year}`,
                    bold: true,
                    size: 28,
                    color: "FFFFFF",
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [
                  new TextRun({
                    text: "Consultores J.D.G. S.A.",
                    bold: true,
                    size: 24,
                    color: "FFFFFF",
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  // === Tabla principal ===
  const widths = [12, 15, 13, 11, 14, 14, 12, 11, 8];

  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      headerCell("Cargo", widths[0]),
      headerCell("Nombre Completo", widths[1]),
      headerCell("Planificación y\nrequerimientos", widths[2]),
      headerCell("Ejecución de\nPruebas", widths[3]),
      headerCell("Documentación de\nEvidencia", widths[4]),
      headerCell("Documentación de\nHallazgos", widths[5]),
      headerCell("Preparación del\nInforme", widths[6]),
      headerCell("Revisión del\nInforme", widths[7]),
      headerCell("Total", widths[8]),
    ],
  });

  const dataRows = data.users.map((u, idx) => {
    const zebra = idx % 2 === 1 ? "F2F2F2" : undefined;
    const commonNum = (v) => dataCell({ text: v, align: "center", fill: zebra });

    return new TableRow({
      children: [
        dataCell({ text: u.role, align: "left", fill: zebra, widthPct: widths[0] }),
        dataCell({ text: u.name, align: "left", fill: zebra, widthPct: widths[1] }),
        commonNum(u.planning_requirements_hours),
        commonNum(u.test_execution_hours),
        commonNum(u.document_evidence_hours),
        commonNum(u.document_findings_hours),
        commonNum(u.report_preparation_hours),
        commonNum(u.report_revision_hours),
        new TableCell({
          width: { size: widths[8], type: WidthType.PERCENTAGE },
          shading: { type: ShadingType.CLEAR, fill: "6E6E6E" },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: String(u.total_hours), bold: true, color: "FFFFFF" })],
            }),
          ],
        }),
      ],
    });
  });

  // === Tabla total ===
  const totalTable = new Table({
    width: { size: 40, type: WidthType.PERCENTAGE },
    alignment: AlignmentType.RIGHT,
    borders: {
      top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 70, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new TextRun({ text: "Total de Horas:", bold: true })],
              }),
            ],
          }),
          new TableCell({
            width: { size: 30, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new TextRun({ text: String(data.total_hours), bold: true })],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  // === Documento final ===
  const doc = new Document({
    styles: { default: { document: { run: { font: "Arial" } } } },
    sections: [
      {
        properties: { page: { size: { orientation: PageOrientation.LANDSCAPE } } },
        children: [
          bannerTable,
          new Paragraph({ text: "", spacing: { after: 200 } }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [headerRow, ...dataRows],
          }),
          new Paragraph({ text: "", spacing: { after: 120 } }),
          totalTable,
        ],
      },
    ],
  });

  const safeTitle = data.name.trim().replace(/[^a-zA-Z0-9]/g, "_");
  const fileName = `presupuesto_horas_${data.fiscal_year}_${safeTitle}.docx`;

  const blob = await Packer.toBlob(doc);
  saveAs(blob, fileName);
};
