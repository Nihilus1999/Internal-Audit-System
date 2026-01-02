import index from "@/configs/axios/index";
import { handleStatus } from "@/utils/HelpersLib";

const statusMessages = {
  getBudgetedHoursByUser: {
    success: "Las horas del usuariop se han obtenido correctamente",
    error: {
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },
  getAuditTests: {
    success: "Las pruebas de auditoría se han obtenido correctamente",
    error: {
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },
  getAuditTestBySlug: {
    success: "La prueba de auditoría se han obtenido correctamente",
    error: {
      404: "Prueba de auditoría no encontrada",
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },
  createAuditTest: {
    success: "La prueba de auditoría se ha creado correctamente",
    error: {
      400: "No pueden existir pruebas de auditoría con la misma combinación de título y año fiscal",
      403: "Los campos no cumplen con los requisitos",
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },
  updateAuditTest: {
    success: "La prueba de auditoría se ha actualizado correctamente",
    error: {
      400: "No pueden existir pruebas de auditoría con la misma combinación de título y año fiscal",
      403: "Los campos no cumplen con los requisitos",
      404: "Prueba de auditoría no encontrada",
      422: "No puedes eliminar controles ya utilizados en hallazgos",
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },
  updateControlsPlanning: {
    success: "Los Controles se ha actualizado correctamente",
    error: {
      400: "No puedes eliminar controles ya utilizados en pruebas de auditoría",
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },
  updateProcessPlanning: {
    success: "El proceso se ha actualizado correctamente",
    error: {
      400: "No puedes eliminar procesos ya utilizados en pruebas de auditoría",
      403: "Algunos de los procesos nuevos no tienen controles activos",
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },
  updatePlanningStatus: {
    success: "El estado de planificación se ha actualizado correctamente",
    error: {
      400: "No se puede cambiar el estado de la planificación si está en progreso o completado la fase de ejecución",
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },
  updateBudgetedHours: {
    success: "El presupuesto de horas se ha actualizado correctamente",
    error: {
      403: "Las horas no deben ser menores a 0",
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },
  getAuditTestDocuments: {
    success: "Los documentos se han obtenido correctamente",
    error: {
      404: "Prueba de auditoría no encontrada",
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },
  createAuditTestDocuments: {
    success: "Los documentos se ha creado correctamente",
    error: {
      400: "No se han enviado los archivos",
      404: "Prueba de auditoría no encontrada",
      415: "La extensión de los archivos no puede ser mayor a 5 caracteres",
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },
  deleteAuditTestDocuments: {
    success: "El documento se ha eliminado correctamente",
    error: {
      404: "Documento no encontrado",
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },
};

export const getBudgetedHoursByUser = async (slug, userId) => {
  try {
    const response = await index.get(
      `/auditPrograms/planning/${slug}/user/${userId}`
    );
    return response.data.data;
  } catch (error) {
    throw new Error(
      handleStatus(error, "getBudgetedHoursByUser", statusMessages)
    );
  }
};

export const getAuditTests = async (slug) => {
  try {
    const response = await index.get(`/auditPrograms/planning/tests/${slug}`);
    return response.data.data;
  } catch (error) {
    throw new Error(handleStatus(error, "getAuditTests", statusMessages));
  }
};

export const getAuditTestBySlug = async (slug) => {
  try {
    const response = await index.get(
      `/auditPrograms/planning/tests/get/${slug}`
    );
    return response.data.data;
  } catch (error) {
    throw new Error(handleStatus(error, "getAuditTestBySlug", statusMessages));
  }
};

export const createAuditTest = async (payload, slug) => {
  try {
    await index.post(`/auditPrograms/planning/tests/${slug}`, payload);
    return statusMessages.createAuditTest.success;
  } catch (error) {
    throw new Error(handleStatus(error, "createAuditTest", statusMessages));
  }
};

export const updateAuditTest = async (payload, slug) => {
  try {
    await index.put(`/auditPrograms/planning/tests/update/${slug}`, payload);
    return statusMessages.updateAuditTest.success;
  } catch (error) {
    throw new Error(handleStatus(error, "updateAuditTest", statusMessages));
  }
};

export const updateControlsPlanning = async (payload, slug) => {
  try {
    await index.put(`/auditPrograms/planning/controls/${slug}`, payload);
    return statusMessages.updateControlsPlanning.success;
  } catch (error) {
    throw new Error(
      handleStatus(error, "updateControlsPlanning", statusMessages)
    );
  }
};

export const updateProcessPlanning = async (payload, slug) => {
  try {
    await index.put(`/auditPrograms/planning/processes/${slug}`, payload);
    return statusMessages.updateProcessPlanning.success;
  } catch (error) {
    throw new Error(
      handleStatus(error, "updateProcessPlanning", statusMessages)
    );
  }
};

export const updatePlanningStatus = async (payload, slug) => {
  try {
    await index.put(`/auditPrograms/planning/${slug}`, payload);
    return statusMessages.updatePlanningStatus.success;
  } catch (error) {
    throw new Error(
      handleStatus(error, "updatePlanningStatus", statusMessages)
    );
  }
};

export const updateBudgetedHours = async (payload, slug, userId) => {
  try {
    await index.put(`/auditPrograms/planning/${slug}/user/${userId}`, payload);
    return statusMessages.updateBudgetedHours.success;
  } catch (error) {
    throw new Error(handleStatus(error, "updateBudgetedHours", statusMessages));
  }
};

export const getAuditTestDocuments = async (slug) => {
  try {
    const response = await index.get(
      `/auditPrograms/planning/tests/files/source/${slug}`
    );
    return response.data.data;
  } catch (error) {
    throw new Error(
      handleStatus(error, "getAuditTestDocuments", statusMessages)
    );
  }
};

export const createAuditTestDocuments = async (slug, formData) => {
  try {
    await index.post(
      `/auditPrograms/planning/tests/files/source/${slug}`,
      formData
    );
    return statusMessages.createAuditTestDocuments.success;
  } catch (error) {
    throw new Error(
      handleStatus(error, "createAuditTestDocuments", statusMessages)
    );
  }
};

export const deleteAuditTestDocuments = async (id) => {
  try {
    await index.delete(
      `/auditPrograms/planning/tests/files/source/delete/${id}`
    );
    return statusMessages.deleteAuditTestDocuments.success;
  } catch (error) {
    throw new Error(
      handleStatus(error, "deleteAuditTestDocuments", statusMessages)
    );
  }
};

export const getAuditTestDownloadDocuments = async (id) => {
  try {
    const response = await index.get(
      `/auditPrograms/planning/tests/files/source/download/${id}`,
      {
        responseType: "blob",
      }
    );
    return response;
  } catch (error) {
    throw new Error(
      handleStatus(error, "getAuditTestDownloadDocuments", statusMessages)
    );
  }
};
