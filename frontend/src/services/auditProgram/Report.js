import index from "@/configs/axios/index";
import { handleStatus } from "@/utils/HelpersLib";

const statusMessages = {
  updateReportStatus: {
    success: "El estado del reporte se ha actualizado correctamente",
    error: {
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },
  updateEvaluationReport: {
    success: "El informe de resultados se ha actualizado correctamente",
    error: {
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },
};

export const updateReportStatus = async (payload, slug) => {
  try {
    await index.put(`/auditPrograms/report/${slug}`, payload);
    return statusMessages.updateReportStatus.success;
  } catch (error) {
    throw new Error(
      handleStatus(error, "updateReportStatus", statusMessages)
    );
  }
};

export const updateEvaluationReport = async (payload, slug) => {
  try {
    await index.put(`/auditPrograms/report/results/${slug}`, payload);
    return statusMessages.updateEvaluationReport.success;
  } catch (error) {
    throw new Error(
      handleStatus(error, "updateEvaluationReport", statusMessages)
    );
  }
};


