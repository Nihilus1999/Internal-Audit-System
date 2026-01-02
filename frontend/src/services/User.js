import index from "@/configs/axios/index";
import { handleStatus } from "@/utils/HelpersLib";

const statusMessages = {
  getUsers: {
    success: "Los usuarios se han obtenido correctamente",
    error: {
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },

  getuserById: {
    success: "El usuario se ha obtenido correctamente",
    error: {
      404: "Usuario no encontrado",
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },

  createUser: {
    success: "El usuario se ha creado correctamente",
    error: {
      403: "Ya existe un usuario con ese correo electrónico",
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },

  updateUser: {
    success: "El usuario se ha actualizado correctamente",
    error: {
      403: "Ya existe otro usuario con ese correo electrónico",
      404: "Usuario no encontrado",
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },
};

export const getUsers = async () => {
  try {
    const response = await index.get("/users");
    return response.data.data;
  } catch (error) {
    throw new Error(handleStatus(error, "getUsers", statusMessages));
  }
};

export const getActiveUsers = async () => {
  try {
    const response = await index.get("/users");
    const allUsers = response.data.data;
    const activeUsers = allUsers.filter((user) => user.status === true);
    return activeUsers;
  } catch (error) {
    throw new Error(handleStatus(error, "getUsers", statusMessages));
  }
};

export const getAuditUsers = async () => {
  try {
    const response = await index.get("/users");
    const allUsers = response.data.data;
    const auditProgramUsers = allUsers.filter((user) => {
      const hasPermission = user.role?.permissions?.some(
        (perm) => perm.key === "get.audit_program" && perm.status === true
      );
      return user.status === true && hasPermission;
    });
    return auditProgramUsers;
  } catch (error) {
    throw new Error(handleStatus(error, "getUsers", statusMessages));
  }
};

export const getUserById = async (id) => {
  try {
    const response = await index.get(`/users/${id}`);
    return response.data.data;
  } catch (error) {
    throw new Error(handleStatus(error, "getUserById", statusMessages));
  }
};

export const createUser = async (formData) => {
  try {
    await index.post("/users", {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      phone: formData.phone,
      id_role: formData.id_role,
    });
    return statusMessages.createUser.success;
  } catch (error) {
    throw new Error(handleStatus(error, "createUser", statusMessages));
  }
};

export const updateUser = async (id, formData) => {
  try {
    await index.put(`/users/${id}`, {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      phone: formData.phone,
      id_role: formData.id_role,
      status: formData.status,
    });
    return statusMessages.updateUser.success;
  } catch (error) {
    throw new Error(handleStatus(error, "updateUser", statusMessages));
  }
};
