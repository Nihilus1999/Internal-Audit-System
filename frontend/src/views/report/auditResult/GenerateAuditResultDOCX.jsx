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

// Convertir logo a base64
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

// Celda de cabecera (tabla)
const headerCell = (text, widthPct) =>
  new TableCell({
    width: { size: widthPct, type: WidthType.PERCENTAGE },
    shading: { type: ShadingType.CLEAR, fill: "333333" },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text, bold: true, color: "FFFFFF" }),
        ],
      }),
    ],
  });

// Celda de datos (tabla)
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
        children: [new TextRun({ text: String(text), color: color || "000000" })],
      }),
    ],
  });

// Helpers para títulos en negrita
const H1 = (text) =>
  new Paragraph({
    spacing: { after: 200 },
    children: [new TextRun({ text, bold: true })],
  });

const H2 = (text) =>
  new Paragraph({
    spacing: { before: 300, after: 100 },
    children: [new TextRun({ text, bold: true })],
  });

const TableTitle = (text) =>
  new Paragraph({
    spacing: { before: 400, after: 150 },
    children: [new TextRun({ text, bold: true })],
  });

export const GenerateAuditResultDOCX = async (data) => {
  const base64Logo = await getBase64ImageFromUrl(logo);

  const today = new Date().toLocaleDateString("es-VE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });

  // 1) Encabezado corporativo (solo primera página)
  const headerTable = new Table({
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
            width: { size: 20, type: WidthType.PERCENTAGE },
            shading: { fill: "333333" },
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
            width: { size: 80, type: WidthType.PERCENTAGE },
            shading: { fill: "333333" },
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [new TextRun({ text: "Consultores J.D.G. S.A.", bold: true, size: 28, color: "FFFFFF" })],
              }),
              new Paragraph({
                children: [new TextRun({ text: "Oficina 607, CC. Ciudad Center, Calle sanatorio del Ávila", size: 20, color: "FFFFFF" })],
              }),
              new Paragraph({
                children: [new TextRun({ text: "Boleita, Caracas, Venezuela", size: 20, color: "FFFFFF" })],
              }),
              new Paragraph({
                children: [new TextRun({ text: "Tlf: (0212) 7501145, Rif: J-401375855", size: 20, color: "FFFFFF" })],
              }),
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new TextRun({ text: `Fecha: ${today}`, size: 20, color: "FFFFFF" })],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  // 2) Secciones textuales (todos los títulos en negrita)
  const sections = [
    H1("Título del Informe de Resultados"),
    H1(`Auditoría de ${data.name} FY ${data.fiscal_year}`),

    H2("Introducción"),
    new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: data.report_introduction || "No disponible" })] }),

    H2("Objetivos"),
    new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: data.objectives || "No disponible" })] }),

    H2("Alcance"),
    new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: data.scope || "No disponible" })] }),

    H2("Criterios de Evaluación"),
    new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: data.evaluation_criteria || "No disponible" })] }),

    H2("Resumen de la Auditoría"),
    new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: data.report_audit_summary || "No disponible" })] }),

    H2("Opinión del Auditor"),
    new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: data.report_auditor_opinion || "No disponible" })] }),
  ];

  // 3) Tabla 1: Procesos auditados
  const processTableTitle = TableTitle("Tabla 1. Procesos auditados");

  const processTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [headerCell("Nombre", 30), headerCell("Descripción", 40), headerCell("Objetivo", 30)],
      }),
      ...data.processes.map((p, idx) => {
        const zebra = idx % 2 === 0 ? "F2F2F2" : "FFFFFF";
        return new TableRow({
          children: [
            dataCell({ text: p.name, align: "left", fill: zebra }),
            dataCell({ text: p.description, align: "left", fill: zebra }),
            dataCell({ text: p.objective, align: "left", fill: zebra }),
          ],
        });
      }),
    ],
  });

  // 4) Tabla 2: Hallazgos
  const findingsTableTitle = TableTitle("Tabla 2. Hallazgos encontrados");

  const findingsTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          headerCell("Título", 25),
          headerCell("Causa raíz", 25),
          headerCell("Tipo", 15),
          headerCell("Clasificación", 15),
          headerCell("Observaciones", 20),
        ],
      }),
      ...data.audit_findings.map((f, idx) => {
        const zebra = idx % 2 === 0 ? "F2F2F2" : "FFFFFF";
        return new TableRow({
          children: [
            dataCell({ text: f.title, align: "left", fill: zebra }),
            dataCell({ text: f.root_cause, align: "left", fill: zebra }),
            dataCell({ text: f.finding_type, align: "center", fill: zebra }),
            dataCell({ text: f.classification, align: "center", fill: zebra }),
            dataCell({ text: f.observations, align: "left", fill: zebra }),
          ],
        });
      }),
    ],
  });

  // 5) Conclusión
  const conclusion = [
    TableTitle("Conclusión y Recomendaciones"),
    new Paragraph({ children: [new TextRun({ text: data.report_conclusion || "No disponible" })] }),
  ];

  // 6) Documento final
  const doc = new Document({
    styles: { default: { document: { run: { font: "Arial" } } } },
    sections: [
      {
        properties: { page: { size: { orientation: PageOrientation.PORTRAIT } } },
        children: [
          headerTable,
          new Paragraph({ text: "", spacing: { after: 200 } }),
          ...sections,
          processTableTitle,
          processTable,
          findingsTableTitle,
          findingsTable,
          ...conclusion,
        ],
      },
    ],
  });

  // Guardar DOCX
  const safeTitle = data.name.trim().replace(/[^a-zA-Z0-9]/g, "_");
  const fileName = `informe_resultados_${data.fiscal_year}_${safeTitle}.docx`;
  const blob = await Packer.toBlob(doc);
  saveAs(blob, fileName);
};
