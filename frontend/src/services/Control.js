import index from "@/configs/axios/index";
import { handleStatus } from "@/utils/HelpersLib";

const statusMessages = {
  getControls: {
    success: "Los Controles se han obtenido correctamente",
    error: {
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },

  getControlBySlug: {
    success: "El Control se ha obtenido correctamente",
    error: {
      404: "Control no encontrado",
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },

  createControl: {
    success: "El Control se ha creado correctamente",
    error: {
      403: "Ya existe un control con ese nombre",
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },

  patchControlForm: {
    success: "El control se ha actualizado correctamente",
    error: {
      403: "Ya existe otro control con ese nombre",
      404: "Control no encontrado",
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },
};

export const getControls = async () => {
  try {
    const response = await index.get("/controls");
    return response.data.data;
  } catch (error) {
    throw new Error(handleStatus(error, "getControls", statusMessages));
  }
};

export const getActiveControls = async () => {
  try {
    const response = await index.get("/controls");
    const allControls = response.data.data;
    const activeControls = allControls.filter(
      (Control) => Control.status === true
    );
    return activeControls;
  } catch (error) {
    throw new Error(handleStatus(error, "getControls", statusMessages));
  }
};

export const getControlBySlug = async (slug) => {
  try {
    const response = await index.get(`/controls/${slug}`);
    return response.data.data;
  } catch (error) {
    throw new Error(handleStatus(error, "getControlBySlug", statusMessages));
  }
};

export const createControl = async (formData) => {
  try {
    await index.post("/controls", formData);
    return statusMessages.createControl.success;
  } catch (error) {
    throw new Error(handleStatus(error, "createControl", statusMessages));
  }
};

export const patchControlForm = async (slug, formData) => {
  try {
    await index.patch(`/controls/${slug}`, formData);
    return statusMessages.patchControlForm.success;
  } catch (error) {
    throw new Error(handleStatus(error, "patchControlForm", statusMessages));
  }
};
