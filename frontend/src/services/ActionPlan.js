import index from "@/configs/axios/index";
import { handleStatus } from "@/utils/HelpersLib";

const statusMessages = {

  getActionPlans: {
    success: "Los planes de acción se han obtenido correctamente",
    error: {
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },

  getActiveFinding: {
    success: "Los hallazgos se han obtenido correctamente",
    error: {
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },

  getActionPlanBySlug: {
    success: "El plan de acción se ha obtenido correctamente",
    error: {
      404: "Plan de acción no encontrado",
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },

  createActionPlan: {
    success: "El plan de acción se ha creado correctamente",
    error: {
      403: "Los campos no cumplen con los requisitos",
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },

  updateActionPlan: {
    success: "El plan de acción se ha actualizado correctamente",
    error: {
      403: "Los campos no cumplen con los requisitos",
      404: "Plan de acción no encontrado",
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },

  getTasks: {
    success: "Las tareas se han obtenido correctamente",
    error: {
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },

  createTasks: {
    success: "La tarea se ha creado correctamente",
    error: {
      403: "Los campos no cumplen con los requisitos",
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },

  updateTasks: {
    success: "El nombre se ha actualizado correctamente",
    error: {
      403: "Los campos no cumplen con los requisitos",
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },

  deleteTasks: {
    success: "La tarea se ha eliminado correctamente",
    error: {
      403: "Los campos no cumplen con los requisitos",
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },

};

export const getActionPlans = async () => {
  try {
    const response = await index.get("/actionPlans");
    return response.data.data;
  } catch (error) {
    throw new Error(handleStatus(error, "getActionPlans", statusMessages));
  }
};

export const getActiveFinding = async () => {
  try {
    const response = await index.get("/auditFindings");
    const allFinding = response.data.data;
    const activeFinding = allFinding.filter(FInding => FInding.status === true);
    return activeFinding;
  } catch (error) {
    throw new Error(handleStatus(error, "getActiveFinding", statusMessages));
  }
};

export const getActiveActionPlans = async () => {
  try {
    const response = await index.get("/actionPlans");
    const allActionPlans = response.data.data;
    const activeActionPlans = allActionPlans.filter(ActionPlan => ActionPlan.status === true);
    return activeActionPlans;
  } catch (error) {
    throw new Error(handleStatus(error, "getActionPlans", statusMessages));
  }
};

export const getActionPlanBySlug = async (slug) => {
  try {
    const response = await index.get(`/actionPlans/${slug}`);
    return response.data.data;
  } catch (error) {
    throw new Error(handleStatus(error, "getActionPlanBySlug", statusMessages));
  }
};

export const createActionPlan = async (payload) => {
  try {
    await index.post("/actionPlans", payload);
    return statusMessages.createActionPlan.success;
  } catch (error) {
    throw new Error(handleStatus(error, "createActionPlan", statusMessages));
  }
};

export const updateActionPlan = async (slug, payload) => {
  try {
    await index.put(`/actionPlans/${slug}`, payload);
    return statusMessages.updateActionPlan.success;
  } catch (error) {
    throw new Error(handleStatus(error, "updateActionPlan", statusMessages));
  }
};

export const getTasks = async (slug) => {
  try {
    const response = await index.get(`/actionPlans/tasks/${slug}`);
    return response.data.data;
  } catch (error) {
    throw new Error(handleStatus(error, "getTasks", statusMessages));
  }
};

export const createTasks = async (slug, payload) => {
  try {
    await index.post(`/actionPlans/tasks/${slug}`, payload);
    return statusMessages.createTasks.success;
  } catch (error) {
    throw new Error(handleStatus(error, "createTasks", statusMessages));
  }
};

export const updateTasks = async (id, payload) => {
  try {
    await index.put(`actionPlans/tasks/update/${id}`, payload);
    return statusMessages.updateTasks.success;
  } catch (error) {
    throw new Error(handleStatus(error, "updateTasks", statusMessages));
  }
};

export const deleteTasks = async (id) => {
  try {
    await index.delete(`actionPlans/tasks/delete/${id}`);
    return statusMessages.deleteTasks.success;
  } catch (error) {
    throw new Error(handleStatus(error, "deleteTasks", statusMessages));
  }
};