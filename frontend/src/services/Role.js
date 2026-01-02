import index from "@/configs/axios/index";
import { handleStatus } from "@/utils/HelpersLib";

const statusMessages = {

  getRoles: {
    success: "Los roles se han obtenido correctamente",
    error: {
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },

  getRoleById: {
    success: "El rol se ha obtenido correctamente",
    error: {
      404: "Rol no encontrado",
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },

  createRole: {
    success: "El rol se ha creado correctamente",
    error: {
      403: "Ya existe un rol con ese nombre",
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },

  updateRole: {
    success: "El rol se ha actualizado correctamente",
    error: {
      403: "Ya existe otro rol con ese nombre",
      404: "Rol no encontrado",
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },
};

export const getRoles = async () => {
  try {
    const response = await index.get("/roles");
    return response.data.data;
  } catch (error) {
    throw new Error(handleStatus(error, "getRoles", statusMessages));
  }
};

export const getActiveRoles = async () => {
  try {
    const response = await index.get("/roles");
    const allRoles = response.data.data;
    const activeRoles = allRoles.filter(role => role.status === true);
    return activeRoles;
  } catch (error) {
    throw new Error(handleStatus(error, "getRoles", statusMessages));
  }
};

export const getRoleById = async (id) => {
  try {
    const response = await index.get(`/roles/${id}`);
    return response.data.data;
  } catch (error) {
    throw new Error(handleStatus(error, "getRoleById", statusMessages));
  }
};

export const createRole = async (formData) => {
  try {
    await index.post("/roles", {
      name: formData.name,
      ids_permission: formData.ids_permission.map((permissions) => permissions),
    });
    return statusMessages.createRole.success;
  } catch (error) {
    throw new Error(handleStatus(error, "createRole", statusMessages));
  }
};

export const updateRole = async (id, formData) => {
  try {
    await index.put(`/roles/${id}`, {
      name: formData.name,
      ids_permission: formData.ids_permission.map((permissions) => permissions),
      status: formData.status
    });
    return statusMessages.updateRole.success;
  } catch (error) {
    throw new Error(handleStatus(error, "updateRole", statusMessages));
  }
};

export const getPermissions = async () => {
  try {
    const response = await index.get("/permissions");
    return response.data.data;
  } catch (error) {
    throw new Error(handleStatus(error, "getPermissions", statusMessages));
  }
};