import index from "@/configs/axios/index";
import { handleStatus } from "@/utils/HelpersLib";

const statusMessages = {

  getRisks: {
    success: "El riesgo se han obtenido correctamente",
    error: {
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },

  getRiskBySlug: {
    success: "El riesgo se han obtenido correctamente",
    error: {
      404: "Riesgo no encontrado",
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },

  createRisk: {
    success: "El riesgo se ha creado correctamente",
    error: {
      403: "Ya existe un riesgo con ese nombre",
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },

  patchRiskForm: {
    success: "El riesgo se ha actualizado correctamente",
    error: {
      403: "Ya existe otro riesgo con ese nombre",
      404: "Riesgo no encontrado",
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },
};

export const getRisks = async () => {
  try {
    const response = await index.get("/risks");
    return response.data.data;
  } catch (error) {
    throw new Error(handleStatus(error, "getRisks", statusMessages));
  }
};

export const getActiveRisks = async () => {
  try {
    const response = await index.get("/risks");
    const allRisks = response.data.data;
    const activeRisks = allRisks.filter(Risk => Risk.status === true);
    return activeRisks;
  } catch (error) {
    throw new Error(handleStatus(error, "getRisks", statusMessages));
  }
};

export const getRiskBySlug = async (slug) => {
  try {
    const response = await index.get(`/risks/${slug}`);
    return response.data.data;
  } catch (error) {
    throw new Error(handleStatus(error, "getRiskBySlug", statusMessages));
  }
};

export const createRisk = async (formData) => {
  try {
    await index.post("/risks", formData);
    return statusMessages.createRisk.success;
  } catch (error) {
    throw new Error(handleStatus(error, "createRisk", statusMessages));
  }
};

export const patchRiskForm = async (slug, formData) => {
  try {
    await index.patch(`/Risks/${slug}`, formData);
    return statusMessages.patchRiskForm.success;
  } catch (error) {
    throw new Error(handleStatus(error, "patchRiskForm", statusMessages));
  }
};