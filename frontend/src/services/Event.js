import index from "@/configs/axios/index";
import { handleStatus } from "@/utils/HelpersLib";

const statusMessages = {
  getEvents: {
    success: "Los eventos se han obtenido correctamente",
    error: {
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },

  getEventBySlug: {
    success: "El evento se ha obtenido correctamente",
    error: {
      404: "Evento no encontrado",
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },

  createEvent: {
    success: "El evento se ha creado correctamente",
    error: {
      403: "Los campos no cumplen con los requisitos",
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },

  updateEvent: {
    success: "El evento se ha actualizado correctamente",
    error: {
      403: "Los campos no cumplen con los requisitos",
      404: "Evento no encontrado",
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },
  getEventDocuments: {
    success: "Los documentos se han obtenido correctamente",
    error: {
      404: "Evento no encontrado",
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },

  createEventDocuments: {
    success: "Los documentos se ha creado correctamente",
    error: {
      400: "No se han enviado los archivos",
      404: "Evento no encontrado",
      415: "La extensión de los archivos no puede ser mayor a 5 caracteres",
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },

  deleteEventDocuments: {
    success: "El documento se ha eliminado correctamente",
    error: {
      404: "Documento no encontrado",
      500: "Error al obtener los datos. Intenta nuevamente.",
      default: "Error desconocido. Intenta nuevamente.",
    },
  },
};

export const getEvents = async () => {
  try {
    const response = await index.get("/events");
    return response.data.data;
  } catch (error) {
    throw new Error(handleStatus(error, "getEvents", statusMessages));
  }
};

export const getActiveEvents = async () => {
  try {
    const response = await index.get("/events");
    const allEvents = response.data.data;
    const activeEvents = allEvents.filter((Event) => Event.status !== "Anulado");
    return activeEvents;
  } catch (error) {
    throw new Error(handleStatus(error, "getEvents", statusMessages));
  }
};

export const getEventBySlug = async (slug) => {
  try {
    const response = await index.get(`/events/${slug}`);
    return response.data.data;
  } catch (error) {
    throw new Error(handleStatus(error, "getEventBySlug", statusMessages));
  }
};

export const createEvent = async (formData) => {
  try {
    await index.post("/Events", formData);
    return statusMessages.createEvent.success;
  } catch (error) {
    throw new Error(handleStatus(error, "createEvent", statusMessages));
  }
};

export const updateEvent = async (slug, formData) => {
  try {
    await index.put(`/events/${slug}`, formData);
    return statusMessages.updateEvent.success;
  } catch (error) {
    throw new Error(handleStatus(error, "updateEvent", statusMessages));
  }
};

export const getEventDocuments = async (slug) => {
  try {
    const response = await index.get(`events/files/${slug}`);
    return response.data.data;
  } catch (error) {
    throw new Error(handleStatus(error, "getEventDocuments", statusMessages));
  }
};

export const createEventDocuments = async (slug, formData) => {
  try {
    await index.post(`events/files/${slug}`, formData);
    return statusMessages.createEventDocuments.success;
  } catch (error) {
    throw new Error(handleStatus(error, "createEventDocuments", statusMessages));
  }
};

export const deleteEventDocuments = async (id) => {
  try {
    await index.delete(`events/files/delete/${id}`);
    return statusMessages.deleteEventDocuments.success;
  } catch (error) {
    throw new Error(handleStatus(error, "deleteEventDocuments", statusMessages));
  }
};

export const getEventDownloadDocuments = async (id) => {
  try {
    const response = await index.get(`events/files/download/${id}`, {
      responseType: "blob",
    });
    return response;
  } catch (error) {
    throw new Error(handleStatus(error, "getDocuments", statusMessages));
  }
};
