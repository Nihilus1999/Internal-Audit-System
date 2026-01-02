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

// === Convertir imagen a Base64 ===
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

// === Celda de cabecera ===
const headerCell = (text, widthPct) =>
  new TableCell({
    width: { size: widthPct, type: WidthType.PERCENTAGE },
    shading: { type: ShadingType.CLEAR, fill: "333333" },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text, bold: true, color: "FFFFFF" })],
      }),
    ],
  });

// === Celda de datos ===
const dataCell = ({ text, align = "left", fill, widthPct }) =>
  new TableCell({
    width: widthPct ? { size: widthPct, type: WidthType.PERCENTAGE } : undefined,
    shading: fill ? { type: ShadingType.CLEAR, fill } : undefined,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: "D9D9D9" },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: "D9D9D9" },
      left: { style: BorderStyle.SINGLE, size: 4, color: "D9D9D9" },
      right: { style: BorderStyle.SINGLE, size: 4, color: "D9D9D9" },
    },
    children: [
      new Paragraph({
        alignment:
          align === "center"
            ? AlignmentType.CENTER
            : align === "right"
            ? AlignmentType.RIGHT
            : AlignmentType.LEFT,
        children: [new TextRun({ text: String(text), size: 20 })],
      }),
    ],
  });

export const GenerateAuditPlanDOCX = async (data) => {

  const base64Logo = await getBase64ImageFromUrl(logo);

  // === Banner superior ===
  const bannerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 15, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, fill: "333333" },
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [
                  new ImageRun({
                    data: base64Logo,
                    transformation: { width: 85, height: 85 },
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 85, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, fill: "333333" },
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [
                  new TextRun({
                    text: `Plan de Auditoría | ${data.name} - FY ${data.fiscal_year}`,
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
  const widths = [22, 20, 20, 20, 10, 8];
  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      headerCell("Título", widths[0]),
      headerCell("Objetivo", widths[1]),
      headerCell("Alcance", widths[2]),
      headerCell("Criterios de Evaluación", widths[3]),
      headerCell("Fecha Inicio", widths[4]),
      headerCell("Horas", widths[5]),
    ],
  });

  const dataRows = data.tests.map((t, i) => {
    const zebra = i % 2 === 1 ? "F2F2F2" : undefined;
    return new TableRow({
      children: [
        dataCell({ text: t.title || "—", align: "left", fill: zebra }),
        dataCell({ text: t.objective || "—", align: "left", fill: zebra }),
        dataCell({ text: t.scope || "—", align: "left", fill: zebra }),
        dataCell({ text: t.evaluation_criteria || "—", align: "left", fill: zebra }),
        dataCell({ text: t.start_date || "—", align: "center", fill: zebra }),
        dataCell({ text: t.estimated_hours || 0, align: "center", fill: zebra }),
      ],
    });
  });

  // === Tabla total ===
  const totalTable = new Table({
    width: { size: 40, type: WidthType.PERCENTAGE },
    alignment: AlignmentType.RIGHT,
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new TextRun({ text: "Total de Horas:", bold: true })],
              }),
            ],
          }),
          new TableCell({
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

  const today = new Date().toLocaleDateString("es-VE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const safeTitle = data.name.trim().replace(/[^a-zA-Z0-9]/g, "_");
  const fileName = `plan_auditoria_${data.fiscal_year}_${safeTitle}_${today
    .replace(/\s/g, "_")
    .replace(/,/g, "")}.docx`;

  const blob = await Packer.toBlob(doc);
  saveAs(blob, fileName);
};