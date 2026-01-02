// src/services/Auth.js
import index from "@/configs/axios/index";
import { handleStatus } from "@/utils/HelpersLib";

const statusMessages = {
  login: {
    success: "Inicio de sesión exitoso. Redirigiendo....",
    error: {
      401: "Credenciales Invalidas, por favor verifique sus datos e intente nuevamente",
      403: "El usuario se encuentra inactivo en el sistema",
      500: "Error en el servidor. Intenta más tarde.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },
  forgotPassword: {
    success:
      "Se ha enviado un correo con las instrucciones para restablecer tu contraseña.",
    error: {
      404: "El correo no esta registrado o se encuentra inactivo.",
      403: "El correo electronico no esta registrado en el sistema.",
      500: "Error al intentar recuperar la contraseña. Intenta más tarde.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },
  otpVerification: {
    success: "El código OTP ha sido verificado exitosamente.",
    error: {
      400: "Codigo expirado. Solicita un nuevo código.",
      403: "El código no es válido. Verifica el código ingresado.",
      404: "El correo no está registrado o se encuentra inactivo",
      500: "Error al verificar el código OTP. Intenta más tarde.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },
  resetPassword: {
    success: "La contraseña ha sido restablecida correctamente.",
    error: {
      400: "Codigo expirado. Solicita un nuevo código.",
      403: "La contraseña no cumple con los requisitos de seguridad.",
      404: "El correo no está registrado o se encuentra inactivo",
      500: "Error al restablecer la contraseña. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },
};

export const login = async (identifier, password) => {
  try {
    const response = await index.post("auth/login", { identifier, password });
    const { tokenSession, data } = response.data;
    return {
      token: tokenSession,
      user: data,
      message: statusMessages.login.success,
    };
  } catch (error) {
    throw new Error(handleStatus(error, "login", statusMessages));
  }
};

export const forgotPassword = async (email) => {
  try {
    await index.post("/auth/request-reset", { email });
    return statusMessages.forgotPassword.success;
  } catch (error) {
    throw new Error(handleStatus(error, "forgotPassword", statusMessages));
  }
};

export const verifyOTP = async (email, otpCode) => {
  try {
    await index.post("/auth/verify-otp", { email, otp_code: otpCode });
    return statusMessages.otpVerification.success;
  } catch (error) {
    throw new Error(handleStatus(error, "otpVerification", statusMessages));
  }
};

export const resetPassword = async (
  email,
  otpCode,
  password,
  confirmPassword
) => {
  try {
    await index.post("/auth/reset-password", {
      email,
      otp_code: otpCode,
      password,
      confirm_password: confirmPassword,
    });
    return statusMessages.resetPassword.success;
  } catch (error) {
    throw new Error(handleStatus(error, "resetPassword", statusMessages));
  }
};

export const refreshToken = async (token) => {
  try {
    const response = await index.post("auth/refresh-token", { token });
    const { tokenSession } = response.data;
    return tokenSession;
  } catch (error) {
    throw new Error(handleStatus(error, "refreshToken", statusMessages));
  }
};