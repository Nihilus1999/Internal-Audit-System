import index from "@/configs/axios/index";
import { handleStatus } from "@/utils/HelpersLib";

const statusMessages = {
  getAuditPrograms: {
    success: "Los programas de auditoria se han obtenido correctamente",
    error: {
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },
  getUserAuditProgramsBySlug: {
    success:
      "Los participantes del programas de auditoria se han obtenido correctamente",
    error: {
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },
  getControlsAuditProgramBySlug: {
    success:
      "Los controles del programas de auditoria se han obtenido correctamente",
    error: {
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },
  getFiscalYears: {
    success: "Los años fiscales se han obtenido correctamente",
    error: {
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },
  getAuditProgramBySlug: {
    success: "El programa de auditoria se ha obtenido correctamente",
    error: {
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },
  createAuditPrograms: {
    success: "El programa de auditoria se ha creado correctamente",
    error: {
      400: "El programa de auditoría debe pertenecer a un único año fiscal, y su nombre debe ser único dentro de ese mismo año",
      403: "Algunos procesos seleccionados no tienen controles activos",
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },
  updateAuditPrograms: {
    success: "El programa de auditoria se ha actualizado correctamente",
    error: {
      400: "El programa de auditoría debe pertenecer a un único año fiscal, y su nombre debe ser único dentro de ese mismo año",
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },
  updateUserAuditPrograms: {
    success:
      "Los participantes en el programa de auditoría se ha actualizado correctamente",
    error: {
      400: "No puedes eliminar usuarios ya asignados en pruebas de auditoría",
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },
  activateAuditProgramBySlug: {
    success: "El programa de auditoria se ha activado correctamente",
    error: {
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },
  suspendAuditProgramBySlug: {
    success: "El programa de auditoria se ha suspendido correctamente",
    error: {
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },
};

export const getAuditPrograms = async (skip, limit, fiscalYear, processId) => {
  try {
    let url = `/auditPrograms?skip=${skip}&limit=${limit}`;

    if (fiscalYear) {
      url += `&fiscal_year=${fiscalYear}`;
    }
    if (processId) {
      url += `&process=${processId}`;
    }

    const response = await index.get(url);
    return response.data;
  } catch (error) {
    throw new Error(handleStatus(error, "getAuditPrograms", statusMessages));
  }
};

export const getFiscalYears = async () => {
  try {
    const response = await index.get(`/auditPrograms/fiscalyears`);
    return response.data.data;
  } catch (error) {
    throw new Error(handleStatus(error, "getFiscalYears", statusMessages));
  }
};

export const getAuditProgramBySlug = async (slug) => {
  try {
    const response = await index.get(`/auditPrograms/${slug}`);
    return response.data.data;
  } catch (error) {
    throw new Error(
      handleStatus(error, "getAuditProgramBySlug", statusMessages)
    );
  }
};

export const getUserAuditProgramBySlug = async (slug) => {
  try {
    const response = await index.get(`/auditPrograms/${slug}`);
    return response.data.data.users;
  } catch (error) {
    throw new Error(
      handleStatus(error, "getUserAuditProgramBySlug", statusMessages)
    );
  }
};

export const getControlsAuditProgramBySlug = async (slug) => {
  try {
    const response = await index.get(`/auditPrograms/${slug}`);
    return response.data.data.controls;
  } catch (error) {
    throw new Error(
      handleStatus(error, "getControlsAuditProgramBySlug", statusMessages)
    );
  }
};

export const createAuditProgram = async (payload) => {
  try {
    await index.post("/auditPrograms", payload);
    return statusMessages.createAuditPrograms.success;
  } catch (error) {
    throw new Error(handleStatus(error, "createAuditPrograms", statusMessages));
  }
};

export const updateAuditProgram = async (payload, slug) => {
  try {
    await index.put(`/auditPrograms/${slug}`, payload);
    return statusMessages.updateAuditPrograms.success;
  } catch (error) {
    throw new Error(handleStatus(error, "updateAuditPrograms", statusMessages));
  }
};

export const updateUserAuditProgram = async (payload, slug) => {
  try {
    await index.put(`/auditPrograms/planning/users/${slug}`, payload);
    return statusMessages.updateUserAuditPrograms.success;
  } catch (error) {
    throw new Error(
      handleStatus(error, "updateUserAuditPrograms", statusMessages)
    );
  }
};

export const activateAuditProgramBySlug = async (slug) => {
  try {
    await index.put(`/auditPrograms/activate/${slug}`);
    return statusMessages.activateAuditProgramBySlug.success;
  } catch (error) {
    throw new Error(
      handleStatus(error, "activateAuditProgramBySlug", statusMessages)
    );
  }
};

export const suspendAuditProgramBySlug = async (slug) => {
  try {
    await index.put(`/auditPrograms/suspend/${slug}`);
    return statusMessages.suspendAuditProgramBySlug.success;
  } catch (error) {
    throw new Error(
      handleStatus(error, "suspendAuditProgramBySlug", statusMessages)
    );
  }
};
