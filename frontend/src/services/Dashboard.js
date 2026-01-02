import index from "@/configs/axios/index";
import { handleStatus } from "@/utils/HelpersLib";

const statusMessages = {
  getHeatMapHome: {
    success: "Los datos del mapa de calor de procesos internos se han obtenido correctamente",
    error: {
      400: "Codigo expirado. Solicita un nuevo código.",
      403: "Los datos no se pudieron obtener correctamente",
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },
  getCountsHome: {
    success: "El total de registro se han obtenido correctamente",
    error: {
      400: "Codigo expirado. Solicita un nuevo código.",
      403: "Los campos no cumplen con los requisitos",
      500: "Error al actualizar los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },
  getHeatMapPlanning: {
    success: "Los datos del mapa de calor del programa de auditoria se han obtenido correctamente",
    error: {
      400: "Codigo expirado. Solicita un nuevo código.",
      403: "Los campos no cumplen con los requisitos",
      500: "Error al actualizar los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },
  getCountsReport: {
    success: "El total de registro KPI se han obtenido correctamente",
    error: {
      400: "Codigo expirado. Solicita un nuevo código.",
      403: "Los campos no cumplen con los requisitos",
      500: "Error al actualizar los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },
  getReportPieChart: {
    success: "Los datos de la grafica de torta se han obtenido correctamente",
    error: {
      400: "Codigo expirado. Solicita un nuevo código.",
      403: "Los campos no cumplen con los requisitos",
      500: "Error al actualizar los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },
  getReportBarChartControl: {
    success: "Los datos de la grafica de barra de los controles se han obtenido correctamente",
    error: {
      400: "Codigo expirado. Solicita un nuevo código.",
      403: "Los campos no cumplen con los requisitos",
      500: "Error al actualizar los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },
  getReportBarChartFinding: {
    success: "Los datos de la grafica de barra de los hallazgos se han obtenido correctamente",
    error: {
      400: "Codigo expirado. Solicita un nuevo código.",
      403: "Los campos no cumplen con los requisitos",
      500: "Error al actualizar los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },
};

export const getHeatMapHome = async () => {
  try {
    const response = await index.get("/home/heatMap");
    return response.data.data;
  } catch (error) {
    throw new Error(handleStatus(error, "getHeatMapHome", statusMessages));
  }
};

export const getCountsHome = async () => {
  try {
    const response = await index.get("/home/totalCounts");
    return response.data.data;
  } catch (error) {
    throw new Error(handleStatus(error, "getCountsHome", statusMessages));
  }
};

export const getHeatMapPlanning = async (slug) => {
  try {
    const response = await index.get(`/auditPrograms/planning/heatMap/${slug}`);
    return response.data.data;
  } catch (error) {
    throw new Error(
      handleStatus(error, "getHeatMapPlanning", statusMessages)
    );
  }
};

export const getReportPieChart = async (slug) => {
  try {
    const response = await index.get(`/auditPrograms/report/dashboard/pieChart/${slug}`);
    return response.data.data;
  } catch (error) {
    throw new Error(
      handleStatus(error, "getReportPieChart", statusMessages)
    );
  }
};

export const getReportBarChartFinding = async (slug) => {
  try {
    const response = await index.get(`/auditPrograms/report/dashboard/barChart/findings/${slug}`);
    return response.data.data;
  } catch (error) {
    throw new Error(
      handleStatus(error, "getReportPieChart", statusMessages)
    );
  }
};

export const getReportBarChartControl = async (slug) => {
  try {
    const response = await index.get(`/auditPrograms/report/dashboard/barChart/controls/${slug}`);
    return response.data.data;
  } catch (error) {
    throw new Error(
      handleStatus(error, "getReportPieChart", statusMessages)
    );
  }
};

export const getCountsReport = async (slug) => {
  try {
    const response = await index.get(`/auditPrograms/report/dashboard/kpi/${slug}`);
    return response.data.data;
  } catch (error) {
    throw new Error(handleStatus(error, "getCountsHome", statusMessages));
  }
};