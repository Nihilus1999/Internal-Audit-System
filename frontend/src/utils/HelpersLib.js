export const handleStatus = (error, type, statusMessages) => {
  if (error.response) {
    const message =
      statusMessages?.[type]?.error?.[error.response.status] ||
      statusMessages?.[type]?.error?.default ||
      "Error desconocido.";
    return message;
  } else if (error.request) {
    return "No se pudo conectar con el servidor.";
  } else {
    return `${error.message}`;
  }
};

const localstorageKey = [
  "selected_controls",
  "selected_processes",
  "selected_risks",
  "planning-tab",
  "report-tab",
];

export const removeLocalStorageItems = () => {
  localstorageKey.forEach((key) => {
    localStorage.removeItem(key);
  });
};

export const getRandomPastelColor = () => {
  const hue = Math.floor(Math.random() * 360);
  const saturation = Math.floor(Math.random() * 50) + 50;
  const lightness = Math.floor(Math.random() * 20) + 70;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

export const statusOptions = [
  { label: "Habilitado", value: true, color: "green" },
  { label: "Deshabilitado", value: false, color: "red" },
];

export const statusPhasesOptions = [
  { label: "Por Iniciar", value: "Por iniciar", color: "#3191ffff" },
  { label: "En progreso", value: "En progreso", color: "#FB8C00" },
  { label: "Completado", value: "Completado", color: "#1eb352ff" },
];

export const AuditProgramStatusColor = {
  "En planificación": "#2962FF",
  "En ejecución": "#FB8C00",
  "En progreso": "#FB8C00",
  "Completado": "#388E3C",
  "Por iniciar": "#616161",
  "Suspendido": "#D32F2F",
  "En reporte": "#9c27b0",
};

export const inherentOptions = [
  { label: "Alto (3)", value: "Alto", color: "red" },
  { label: "Medio (2)", value: "Medio", color: "orange" },
  { label: "Bajo (1)", value: "Bajo", color: "green" },
];

export const residualOptions = [
  { label: "Alto (3)", value: "Alto", color: "red" },
  { label: "Medio (2)", value: "Medio", color: "orange" },
  { label: "Bajo (1)", value: "Bajo", color: "green" },
];

export const criticalityOptions = [
  { label: "Alta", value: "Alta", color: "red" },
  { label: "Media", value: "Media", color: "orange" },
  { label: "Baja", value: "Baja", color: "green" },
];

export const teoric_effectivenessOptions = [
  { label: "Óptimo (3)", value: "Óptimo", color: "green" },
  { label: "Aceptable (1)", value: "Aceptable", color: "orange" },
  { label: "Deficiente (0)", value: "Deficiente", color: "red" },
];

export const control_typeOptions = [
  { label: "Preventivo", value: "Preventivo", color: "" },
  { label: "Detectivo", value: "Detectivo", color: "" },
  { label: "Correctivo", value: "Correctivo", color: "" },
];

export const application_frequencyOptions = [
  { label: "Cuando sea requerido", value: "Cuando sea requerido", color: "" },
  { label: "Anual", value: "Anual", color: "" },
  { label: "Mensual", value: "Mensual", color: "" },
  { label: "Semanal", value: "Semanal", color: "" },
  { label: "Diario", value: "Diario", color: "" },
  { label: "Por hora", value: "Por hora", color: "" },
  { label: "Tiempo real", value: "Tiempo real", color: "" },
];

export const management_typeOptions = [
  { label: "Automático", value: "Automático", color: "" },
  { label: "Manual", value: "Manual", color: "" },
  { label: "Combinado", value: "Combinado", color: "" },
];

export const statusPlanActions = [
  { label: "Pendiente", value: "Pendiente", color: "dimgray" },
  { label: "En progreso", value: "En progreso", color: "darkorange" },
  { label: "Completado", value: "Completado", color: "green" },
  { label: "Suspendido", value: "Suspendido", color: "red" },
];

export const statusEventsOptions = [
  { label: "Reportado", value: "Reportado", color: "" },
  { label: "En resolución", value: "En resolución", color: "" },
  { label: "Cerrado", value: "Cerrado", color: "" },
  { label: "Anulado", value: "Anulado", color: "" },
];

export const riskSourceOptions = [
  { label: "Interno", value: "Interno" },
  { label: "Externo", value: "Externo" },
];

export const probabilityOptions = [
  { label: "Alta (3)", value: "Alta", color: "red" },
  { label: "Media (2)", value: "Media", color: "orange" },
  { label: "Baja (1)", value: "Baja", color: "green" },
];

export const impactOptions = [
  { label: "Alto (3)", value: "Alto", color: "red" },
  { label: "Medio (2)", value: "Medio", color: "orange" },
  { label: "Bajo (1)", value: "Bajo", color: "green" },
];

export const statusAuditTestOptions = [
  { label: "Por iniciar", value: "Por iniciar" },
  { label: "Suspendido", value: "Suspendido" },
];

export const statusAuditTestExecutionOptions = [
  { label: "Por iniciar", value: "Por Iniciar", color: "#3191ffff" },
  { label: "En progreso", value: "En progreso", color: "#FB8C00" },
  { label: "Completado", value: "Completado", color: "#388E3C" },
];

export const statusAuditTestPlanningOptions = [
  { label: "Por iniciar", value: "Por iniciar", color: "#3191ffff" },
  { label: "En progreso", value: "En progreso", color: "#FB8C00" },
  { label: "Completado", value: "Completado", color: "#388E3C" },
  { label: "Suspendido", value: "Suspendido", color: "#da2b2bff" },
];

export const findingTypeOptions = [
  { label: "Conforme", value: "Conforme", color: "" },
  { label: "No conforme", value: "No conforme", color: "" },
];

export const findingClassificationOptions = [
  { label: "Menor", value: "Menor", color: "" },
  { label: "Moderado", value: "Moderado", color: "" },
  { label: "Importante", value: "Importante", color: "" },
  { label: "Crítico", value: "Crítico", color: "" },
];

export const countryCodes = [
  {
    code: "VE",
    label: "Venezuela",
    dial_code: "+58",
    flag: "https://flagcdn.com/w40/ve.png",
  },
];

export const months = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export const sectors = [
  "Banca",
  "Energía",
  "Construcción/Infraestructura",
  "Salud",
  "Financiero",
  "Educación",
  "Comercio",
  "Seguros",
  "Alimentos",
  "Transporte",
  "TI / Telecomunicaciones",
];

export const emptyCounts = {
  processes: 0,
  users: 0,
  risks: 0,
  events: 0,
  controls: 0,
  actionPlans: 0,
  auditPrograms: 0,
};

export const emptyHeatMap = [
  {
    key: "Baja",
    data: [
      { key: "Bajo", data: 1, metadata: { total_count: 0, processes: "" } },
      { key: "Medio", data: 1, metadata: { total_count: 0, processes: "" } },
      {
        key: "Alto",
        data: 2,
        metadata: {
          total_count: 0,
          processes: "",
        },
      },
    ],
  },
  {
    key: "Media",
    data: [
      { key: "Bajo", data: 1, metadata: { total_count: 0, processes: "" } },
      { key: "Medio", data: 2, metadata: { total_count: 0, processes: "" } },
      { key: "Alto", data: 3, metadata: { total_count: 0, processes: "" } },
    ],
  },
  {
    key: "Alta",
    data: [
      { key: "Bajo", data: 2, metadata: { total_count: 0, processes: "" } },
      {
        key: "Medio",
        data: 3,
        metadata: { total_count: 0, processes: "" },
      },
      { key: "Alto", data: 3, metadata: { total_count: 0, processes: "" } },
    ],
  },
];

export const emptyPieChartReport = [{ id: 1, value: 1, label: "sin datos" }];

export const emptyCountsReport = {
  affected_processes: 0,
  conforming_findings: 0,
  critical_findings_percentage: "0",
  deficient_controles: 0,
  no_conforming_findings: 0,
  total_findings: 0,
};

export const emptyBarChartControlReport = [
    {
        "controls": 0,
        "classification": "Sin datos",
    },
]

export const emptyBarChartFindingReport = [
    {
        "findings": 0,
        "classification": "Sin datos"
    },
]
