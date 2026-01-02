import index from "@/configs/axios/index";
import { handleStatus } from "@/utils/HelpersLib";

const statusMessages = {
  getExecutionTests: {
    success: "Las pruebas de ejecucion se han obtenido correctamente",
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
  getControlsAuditTestBySlug: {
    success: "Los controles de la prueba se han obtenido correctamente",
    error: {
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },
  updateExecutionStatus: {
    success: "El estado de la ejecución se ha actualizado correctamente",
    error: {
      400: "No se puede cambiar el estado de la ejecución si está en progreso o completado la fase de reporte",
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },
  getInformationSourceDocuments: {
    success: "Los documentos se han obtenido correctamente",
    error: {
      404: "Prueba de auditoría no encontrada",
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },
  getInformationSourceDownloadDocuments: {
    success: "El documento se ha descargado correctamente",
    error: {
      404: "Prueba de auditoría no encontrada",
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },
  getEvidenceDocuments: {
    success: "Los documentos se han obtenido correctamente",
    error: {
      404: "Prueba de auditoría no encontrada",
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },
  createEvidenceDocuments: {
    success: "Prueb",
    error: {
      400: "No se han enviado los archivos",
      404: "Prueba de auditoría no encontrada",
      415: "La extensión de los archivos no puede ser mayor a 5 caracteres",
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },
  deleteEvidenceDocuments: {
    success: "El documento se ha eliminado correctamente",
    error: {
      404: "Documento no encontrado",
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },
  updateEvidenceConlusions: {
    success: "Las conclusiones se han actualizado correctamente",
    error: {
      400: "No se puede cambiar el estado de la ejecución si está en progreso o completado la fase de ejecución",
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },
  getFindings: {
    success: "Los hallazgos se han obtenido correctamente",
    error: {
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },
  getFindingBySlug: {
    success: "El Hallazgo se ha obtenido correctamente",
    error: {
      404: "Plan de acción no encontrado",
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },
  createFinding: {
    success: "El hallazgo se ha creado correctamente",
    error: {
      403: "Los campos no cumplen con los requisitos",
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },
  updateFinding: {
    success: "El Hallazgo se ha actualizado correctamente",
    error: {
      403: "Los campos no cumplen con los requisitos",
      404: "Hallazog no encontrado",
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },
};

export const getExecutionTests = async (slug) => {
  try {
    const response = await index.get(`/auditPrograms/execution/tests/${slug}`);
    console.log(response);
    return response.data.data;
  } catch (error) {
    throw new Error(handleStatus(error, "getExecutionTests", statusMessages));
  }
};

export const getAuditTestBySlug = async (slug) => {
  try {
    const response = await index.get(
      `/auditPrograms/execution/tests/get/${slug}`
    );
    return response.data.data;
  } catch (error) {
    throw new Error(handleStatus(error, "getAuditTestBySlug", statusMessages));
  }
};

export const getControlsAuditTestBySlug = async (slug) => {
  try {
    const response = await index.get(
      `/auditPrograms/execution/tests/get/${slug}`
    );
    return response.data.data.controls;
  } catch (error) {
    throw new Error(
      handleStatus(error, "getControlsAuditTestBySlug", statusMessages)
    );
  }
};

export const updateExecutionStatus = async (payload, slug) => {
  try {
    await index.put(`/auditPrograms/execution/${slug}`, payload);
    return statusMessages.updateExecutionStatus.success;
  } catch (error) {
    throw new Error(
      handleStatus(error, "updateExecutionStatus", statusMessages)
    );
  }
};

export const getInformationSourceDocuments = async (slug) => {
  try {
    const response = await index.get(
      `/auditPrograms/execution/tests/files/source/${slug}`
    );
    return response.data.data;
  } catch (error) {
    throw new Error(
      handleStatus(error, "getInformationSourceDocuments", statusMessages)
    );
  }
};

export const getInformationSourceDownloadDocuments = async (id) => {
  try {
    const response = await index.get(
      `/auditPrograms/execution/tests/files/source/download/${id}`,
      {
        responseType: "blob",
      }
    );
    return response;
  } catch (error) {
    throw new Error(
      handleStatus(
        error,
        "getInformationSourceDownloadDocuments",
        statusMessages
      )
    );
  }
};

export const getEvidenceDocuments = async (slug) => {
  try {
    const response = await index.get(
      `/auditPrograms/execution/tests/files/evidence/${slug}`
    );
    return response.data.data;
  } catch (error) {
    throw new Error(
      handleStatus(error, "getEvidenceDocuments", statusMessages)
    );
  }
};

export const createEvidenceDocuments = async (slug, formData) => {
  try {
    await index.post(
      `/auditPrograms/execution/tests/files/evidence/${slug}`,
      formData
    );
    return statusMessages.createEvidenceDocuments.success;
  } catch (error) {
    throw new Error(
      handleStatus(error, "createEvidenceDocuments", statusMessages)
    );
  }
};

export const deleteEvidenceDocuments = async (id) => {
  try {
    await index.delete(
      `/auditPrograms/execution/tests/files/evidence/delete/${id}`
    );
    return statusMessages.deleteEvidenceDocuments.success;
  } catch (error) {
    throw new Error(
      handleStatus(error, "deleteEvidenceDocuments", statusMessages)
    );
  }
};

export const getEvidenceDownloadDocuments = async (id) => {
  try {
    const response = await index.get(
      `/auditPrograms/execution/tests/files/evidence/download/${id}`,
      {
        responseType: "blob",
      }
    );
    return response;
  } catch (error) {
    throw new Error(
      handleStatus(error, "getEvidenceDownloadDocuments", statusMessages)
    );
  }
};

export const updateEvidenceConlusions = async (payload, slug) => {
  try {
    await index.put(`/auditPrograms/execution/tests/update/${slug}`, payload);
    return statusMessages.updateEvidenceConlusions.success;
  } catch (error) {
    throw new Error(
      handleStatus(error, "updateEvidenceConlusions", statusMessages)
    );
  }
};

export const getFindings = async (slug) => {
  try {
    const response = await index.get(
      `/auditPrograms/execution/tests/findings/${slug}`
    );
    return response.data.data;
  } catch (error) {
    throw new Error(handleStatus(error, "getFinding", statusMessages));
  }
};

export const getFindingBySlug = async (slug) => {
  try {
    const response = await index.get(
      `/auditPrograms/execution/tests/findings/get/${slug}`
    );
    return response.data.data;
  } catch (error) {
    throw new Error(handleStatus(error, "getFindingBySlug", statusMessages));
  }
};

export const createFinding = async (slug, payload) => {
  try {
    await index.post(
      `/auditPrograms/execution/tests/findings/${slug}`,
      payload
    );
    return statusMessages.createFinding.success;
  } catch (error) {
    throw new Error(handleStatus(error, "createFinding", statusMessages));
  }
};

export const updateFinding = async (slug, payload) => {
  try {
    await index.put(
      `/auditPrograms/execution/tests/findings/update/${slug}`,
      payload
    );
    return statusMessages.updateFinding.success;
  } catch (error) {
    throw new Error(handleStatus(error, "updateFinding", statusMessages));
  }
};
