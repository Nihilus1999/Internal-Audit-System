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
  PageBreak,
} from "docx";
import { saveAs } from "file-saver";
import logo from "@/assets/image/logoConsultoresJDG.png";

// Convertir imagen a base64
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
    borders: {
      top: { style: BorderStyle.SINGLE, size: 8, color: "000000" },
      bottom: { style: BorderStyle.SINGLE, size: 8, color: "000000" },
      left: { style: BorderStyle.SINGLE, size: 8, color: "000000" },
      right: { style: BorderStyle.SINGLE, size: 8, color: "000000" },
    },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text, bold: true, color: "FFFFFF" })],
      }),
    ],
  });

// Celda de datos
const dataCell = ({ text, align = "center", fill, widthPct, outerBorder }) =>
  new TableCell({
    width: widthPct
      ? { size: widthPct, type: WidthType.PERCENTAGE }
      : undefined,
    shading: fill ? { type: ShadingType.CLEAR, fill } : undefined,
    borders: {
      top: {
        style: BorderStyle.SINGLE,
        size: outerBorder ? 8 : 2,
        color: "999999",
      },
      bottom: {
        style: BorderStyle.SINGLE,
        size: outerBorder ? 8 : 2,
        color: "999999",
      },
      left: {
        style: BorderStyle.SINGLE,
        size: outerBorder ? 8 : 2,
        color: "999999",
      },
      right: {
        style: BorderStyle.SINGLE,
        size: outerBorder ? 8 : 2,
        color: "999999",
      },
    },
    children: [
      new Paragraph({
        alignment:
          align === "left"
            ? AlignmentType.LEFT
            : align === "right"
            ? AlignmentType.RIGHT
            : AlignmentType.CENTER,
        children: [new TextRun({ text: String(text || "—") })],
      }),
    ],
  });

export const GenerateRiskMatrixGeneralDOCX = async (data) => {
  const base64Logo = await getBase64ImageFromUrl(logo);
  const now = new Date();
  const dateString = now.toLocaleDateString("es-VE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  // Encabezado
  const createHeader = () =>
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
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
              width: { size: 15, type: WidthType.PERCENTAGE },
              shading: { type: ShadingType.CLEAR, fill: "333333" },
              children: [
                new Paragraph({
                  alignment: AlignmentType.LEFT,
                  children: [
                    new ImageRun({
                      data: base64Logo,
                      transformation: { width: 80, height: 80 },
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
                      text: "Matriz de Riesgos General",
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

  // === Tabla 1: Datos generales ===
  const header1 = new TableRow({
    children: [
      headerCell("Código", 10),
      headerCell("Nombre del Riesgo", 25),
      headerCell("Origen", 15),
      headerCell("Fuente del Riesgo", 25),
      headerCell("Descripción", 25),
    ],
  });

  const rows1 = data.map((r, idx) => {
    const zebra = idx % 2 === 1 ? "F2F2F2" : undefined;
    return new TableRow({
      children: [
        dataCell({ text: r.slug, fill: zebra, outerBorder: true }),
        dataCell({
          text: r.name,
          align: "left",
          fill: zebra,
          outerBorder: true,
        }),
        dataCell({ text: r.origin, fill: zebra, outerBorder: true }),
        dataCell({
          text: r.risk_source,
          align: "left",
          fill: zebra,
          outerBorder: true,
        }),
        dataCell({
          text: r.description,
          align: "left",
          fill: zebra,
          outerBorder: true,
        }),
      ],
    });
  });

  const table1 = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [header1, ...rows1],
  });

  // === Tabla 2: Evaluación del riesgo ===
  const header2 = new TableRow({
    children: [
      headerCell("Código", 10),
      headerCell("Probabilidad", 20),
      headerCell("Impacto", 20),
      headerCell("Riesgo Inherente", 20),
      headerCell("Eficacia de Controles", 20),
      headerCell("Riesgo Residual", 20),
    ],
  });

  const rows2 = data.map((r, idx) => {
    const zebra = idx % 2 === 1 ? "F2F2F2" : undefined;
    return new TableRow({
      children: [
        dataCell({ text: r.slug, fill: zebra, outerBorder: true }),
        dataCell({ text: r.probability, fill: zebra }),
        dataCell({ text: r.impact, fill: zebra }),
        dataCell({ text: r.inherent_risk, fill: zebra }),
        dataCell({ text: r.controls_effectiveness, fill: zebra }),
        dataCell({ text: r.residual_risk, fill: zebra }),
      ],
    });
  });

  const table2 = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [header2, ...rows2],
  });

  // === Pie de página ===
  const footer = [
    new Paragraph({ text: "" }),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      children: [
        new TextRun({
          text: `Total de riesgos: ${data.length}`,
          bold: true,
          size: 22,
        }),
      ],
    }),
  ];

  // === Documento final ===
  const doc = new Document({
    styles: { default: { document: { run: { font: "Arial" } } } },
    sections: [
      {
        properties: {
          page: { size: { orientation: PageOrientation.LANDSCAPE } },
        },
        children: [
          createHeader(),
          new Paragraph({ text: "", spacing: { after: 200 } }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Tabla 1 – Datos Generales del Riesgo",
                bold: true,
                size: 24,
              }),
            ],
          }),
          new Paragraph({ text: "", spacing: { after: 100 } }),
          table1,
          new Paragraph({ children: [new PageBreak()] }),
          new Paragraph({ text: "", spacing: { after: 100 } }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Tabla 2 – Evaluación del Riesgo",
                bold: true,
                size: 24,
              }),
            ],
          }),
          new Paragraph({ text: "", spacing: { after: 100 } }),
          table2,
          ...footer,
        ],
      },
    ],
  });

  // Guardar archivo
  const safeTitle = "matriz_riesgos_general";
  const fileName = `${safeTitle}_${dateString.replace(/\s/g, "_")}.docx`;
  const blob = await Packer.toBlob(doc);
  saveAs(blob, fileName);
};
