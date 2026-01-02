import index from "@/configs/axios/index";
import { handleStatus } from "@/utils/HelpersLib";

const statusMessages = {
  getProfile: {
    success: "Los datos se han obtenido correctamente",
    error: {
      404: "El usuario que había iniciado sesión, no existe o ha sido deshabilitado",
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },
  updateProfile: {
    success: "Los datos fueron actualizados exitosamente",
    error: {
      403: "Ya existe otro usuario con ese correo electrónico",
      404: "El usuario que había iniciado sesión, no existe o ha sido deshabilitado",
      500: "Error al actualizar los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },
  updatePassword: {
    success: "La contraseña ha sido restablecida correctamente.",
    error: {
      403: "La contraseña no cumple con los requisitos de seguridad",
      404: "El usuario que había iniciado sesión, no existe o ha sido deshabilitado",
      500: "Error al restablecer la contraseña. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },
};

export const getProfile = async () => {
  try {
    const response = await index.get("/users/profile");
    return response.data.data;
  } catch (error) {
    throw new Error(handleStatus(error, "getProfile", statusMessages));
  }
};

export const updateProfile = async (formData) => {
  try {
    await index.put("/users/profile", {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      phone: formData.phone,
    });
    return statusMessages.updateProfile.success;
  } catch (error) {
    throw new Error(handleStatus(error, "updateProfile", statusMessages));
  }
};

export const updatePassword = async (password, confirmPassword) => {
  try {
    await index.put("/users/profile/change-password", {
      password,
      confirm_password: confirmPassword,
    });
    return statusMessages.updatePassword.success;
  } catch (error) {
    throw new Error(handleStatus(error, "updatePassword", statusMessages));
  }
};