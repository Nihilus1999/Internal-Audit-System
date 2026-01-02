// src/services/CompanyProcess.js
import index from "@/configs/axios/index";
import { handleStatus } from "@/utils/HelpersLib";

const statusMessages = {
  // Company
  getCompany: {
    success: "Los datos se han obtenido correctamente",
    error: {
      404: "Empresa no encontrada",
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },
  putCompany: {
    success: "Los datos de la empresa fueron actualizados exitosamente",
    error: {
      403: "Los campos no cumplen con los requisitos",
      404: "Empresa no encontrada",
      500: "Error al actualizar los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },

  // Process
  getProcess: {
    success: "Los procesos se han obtenido correctamente",
    error: {
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },

  getProcessById: {
    success: "Los procesos se han obtenido correctamente",
    error: {
      404: "Proceso no encontrado",
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },

  createProcess: {
    success: "El proceso se ha creado correctamente",
    error: {
      403: "Ya existe un proceso con ese nombre",
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },

  updateProcess: {
    success: "El proceso se ha actualizado correctamente",
    error: {
      403: "Ya existe otro proceso con ese nombre.",
      404: "Proceso no encontrado",
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },
};

export const getCompany = async () => {
  try {
    const response = await index.get("/company");
    return response.data.data;
  } catch (error) {
    throw new Error(handleStatus(error, "getCompany", statusMessages));
  }
};

export const updateCompany = async (formData) => {
  try {
    await index.put("/company", {
      name: formData.name,
      description: formData.description,
      phone: formData.phone,
      email: formData.email,
      sector: formData.sector,
      fiscal_year_month: formData.fiscal_year_month,
    });
    return statusMessages.putCompany.success;
  } catch (error) {
    throw new Error(handleStatus(error, "putCompany", statusMessages));
  }
};

export const getProcess = async () => {
  try {
    const response = await index.get("/processes");
    return response.data.data;
  } catch (error) {
    throw new Error(handleStatus(error, "getProcess", statusMessages));
  }
};

export const getActiveProcess = async () => {
  try {
    const response = await index.get("/processes");
    const allProcess = response.data.data;
    const activeProcess = allProcess.filter(Process => Process.status === true);
    return activeProcess;
  } catch (error) {
   throw new Error(handleStatus(error, "getProcess", statusMessages));
  }
};

export const getProcessById = async (slug) => {
  try {
    const response = await index.get(`/processes/${slug}`);
    return response.data.data;
  } catch (error) {
    throw new Error(handleStatus(error, "getProcessById", statusMessages));
  }
};

export const createProcess = async (formData) => {
  try {
    await index.post("/processes", {
      name: formData.name,
      description: formData.description,
      objective: formData.objective,
      ids_user: formData.ids_user.map((user) => user),
    });
    return statusMessages.createProcess.success;
  } catch (error) {
    throw new Error(handleStatus(error, "createProcess", statusMessages));
  }
};

export const updateProcess = async (id, formData) => {
  try {
    await index.put(`/processes/${id}`, {
      name: formData.name,
      description: formData.description,
      objective: formData.objective,
      ids_user: formData.ids_user.map((user) => user),
      status: formData.status,
    });
    return statusMessages.updateProcess.success;
  } catch (error) {
    throw new Error(handleStatus(error, "updateProcess", statusMessages));
  }
};