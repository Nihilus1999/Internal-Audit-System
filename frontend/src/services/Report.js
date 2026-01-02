// src/services/Reports.js
import index from "@/configs/axios/index";
import { handleStatus } from "@/utils/HelpersLib";

const statusMessages = {
  getBudgetHours: {
    error: {
      404: "No se encontraron registros con los filtros aplicados.",
      500: "Error en el servidor al obtener los reportes.",
      default: "Error desconocido al buscar los programas.",
    },
  },
  getAuditResult: {
    error: {
      404: "No se encontraron registros con los filtros aplicados.",
      409: "La fase de ejecución debe estar completa para generar el informe de resultados.",
      412: "En la fase de reporte faltan datos obligatorios para generar el informe de resultados.",
      500: "Error en el servidor al obtener los reportes.",
      default: "Error desconocido al buscar los programas.",
    },
  },
  getRiskMatrixGeneral: {
    success: "Datos de matriz de riesgos obtenidos correctamente.",
    error: {
      400: "Parámetros inválidos.",
      404: "No se encontraron registros de matriz de riesgos.",
      500: "Error del servidor. Intenta más tarde.",
      default: "Error desconocido al obtener la matriz de riesgos.",
    },
  },
  getRiskMatrixAuditProgram: {
    success:
      "Datos de la matriz de riesgos de auditoría obtenidos correctamente.",
    error: {
      400: "Parámetros inválidos o incompletos.",
      404: "No se encontraron registros de la matriz de riesgos de auditoría.",
      500: "Error del servidor. Intenta más tarde.",
      default:
        "Error desconocido al obtener la matriz de riesgos de auditoría.",
    },
  },
  getAuditPlan: {
    success: "Datos del plan de auditoría obtenidos correctamente.",
    error: {
      400: "Parámetros inválidos.",
      404: "No se encontraron registros del plan de auditoría.",
      500: "Error del servidor al obtener el plan de auditoría.",
      default: "Error desconocido al obtener los datos del plan de auditoría.",
    },
  },
  getFilteredRisks: {
    success: "Datos de riesgos obtenidos correctamente.",
    error: {
      400: "Parámetros inválidos.",
      404: "No se encontraron registros de riesgos",
      500: "Error del servidor. Intenta más tarde.",
      default: "Error desconocido al obtener los datos de riesgos.",
    },
  },
  getAuditFilteredRisks: {
    success: "Datos de riesgos obtenidos correctamente.",
    error: {
      400: "Parámetros inválidos.",
      404: "Debe colocar los parámetros obligatorios: Nombre y Año Fiscal.",
      500: "Error del servidor. Intenta más tarde.",
      default: "Error desconocido al obtener los datos de riesgos.",
    },
  },
};

export const getBudgetHours = async (name, fiscalYear, role, userName) => {
  try {
    let url = `/reports/audit-hours-budget/?name=${encodeURIComponent(
      name
    )}&fiscal_year=${fiscalYear}`;

    if (role && role.trim() !== "") {
      url += `&role=${encodeURIComponent(role)}`;
    }
    if (userName && userName.trim() !== "") {
      url += `&user_name=${encodeURIComponent(userName)}`;
    }
    const response = await index.get(url);
    return response.data.data;
  } catch (error) {
    throw new Error(handleStatus(error, "getBudgetHours", statusMessages));
  }
};

export const getAuditResult = async (name, fiscalYear) => {
  try {
    let url = `/reports/audit-results-report/?name=${encodeURIComponent(
      name
    )}&fiscal_year=${fiscalYear}`;
    const response = await index.get(url);
    return response.data.data;
  } catch (error) {
    throw new Error(handleStatus(error, "getAuditResult", statusMessages));
  }
};

export const getRiskMatrixGeneral = async (
  slug,
  name,
  origin,
  probability,
  impact,
  inherentRisk,
  residualRisk
) => {
  try {
    let url = `/reports/risks-matrix?`;
    const params = [];

    if (slug && slug.trim() !== "") {
      params.push(`slug=${encodeURIComponent(slug)}`);
    }
    if (name && name.trim() !== "") {
      params.push(`name=${encodeURIComponent(name)}`);
    }
    if (origin && origin.trim() !== "") {
      params.push(`origin=${encodeURIComponent(origin)}`);
    }
    if (probability && probability.trim() !== "") {
      params.push(`probability=${encodeURIComponent(probability)}`);
    }
    if (impact && impact.trim() !== "") {
      params.push(`impact=${encodeURIComponent(impact)}`);
    }
    if (inherentRisk && inherentRisk.trim() !== "") {
      params.push(`inherent_risk=${encodeURIComponent(inherentRisk)}`);
    }
    if (residualRisk && residualRisk.trim() !== "") {
      params.push(`residual_risk=${encodeURIComponent(residualRisk)}`);
    }

    url += params.join("&");

    const response = await index.get(url);
    return response.data.data;
  } catch (error) {
    throw new Error(
      handleStatus(error, "getRiskMatrixGeneral", statusMessages)
    );
  }
};

export const getRiskMatrixAuditProgram = async (
  name,
  fiscalYear,
  slug,
  riskName,
  origin,
  probability,
  impact,
  inherentRisk,
  residualRisk
) => {
  try {
    // Helpers
    const toStr = (v) => (v === null || v === undefined ? "" : String(v));
    const norm = (v) => toStr(v).trim();
    const hasVal = (v) => norm(v) !== "";

    // Normalizar obligatorios
    const nameStr = norm(name);
    const fyStr =
      typeof fiscalYear === "number" ? String(fiscalYear) : norm(fiscalYear);

    if (!nameStr || !fyStr) {
      throw new Error(
        "Debe colocar los parámetros obligatorios: Nombre y Año Fiscal."
      );
    }

    const qs = new URLSearchParams();
    qs.set("name", nameStr);
    qs.set("fiscal_year", fyStr);

    // Opcionales (solo agregar si tienen valor)
    if (hasVal(slug)) qs.set("slug", norm(slug));
    if (hasVal(riskName)) qs.set("risk_name", norm(riskName));
    if (hasVal(origin)) qs.set("origin", norm(origin));
    if (hasVal(probability)) qs.set("probability", norm(probability));
    if (hasVal(impact)) qs.set("impact", norm(impact));
    if (hasVal(inherentRisk)) qs.set("inherent_risk", norm(inherentRisk));
    if (hasVal(residualRisk)) qs.set("residual_risk", norm(residualRisk));

    const url = `/reports/audit-risks-matrix?${qs.toString()}`;
    const response = await index.get(url);
    return response.data.data;
  } catch (error) {
    throw new Error(
      handleStatus(error, "getRiskMatrixAuditProgram", statusMessages)
    );
  }
};

export const getFilteredRisks = async (
  origin,
  probability,
  impact,
  inherentRisk,
  residualRisk
) => {
  try {
    let url = `/risks/filtered?`;
    const params = [];

    console.log("getRiskMatrixGeneral called with:");

    if (origin && origin.trim() !== "") {
      params.push(`origin=${encodeURIComponent(origin)}`);
    }
    if (probability && probability.trim() !== "") {
      params.push(`probability=${encodeURIComponent(probability)}`);
    }
    if (impact && impact.trim() !== "") {
      params.push(`impact=${encodeURIComponent(impact)}`);
    }
    if (inherentRisk && inherentRisk.trim() !== "") {
      params.push(`inherent_risk=${encodeURIComponent(inherentRisk)}`);
    }
    if (residualRisk && residualRisk.trim() !== "") {
      params.push(`residual_risk=${encodeURIComponent(residualRisk)}`);
    }

    url += params.join("&");

    const response = await index.get(url);
    return response.data.data;
  } catch (error) {
    throw new Error(handleStatus(error, "getFilteredRisks", statusMessages));
  }
};

export const getAuditFilteredRisks = async (
  name,
  fiscalYear,
  origin,
  probability,
  impact,
  inherentRisk,
  residualRisk
) => {
  try {
    if (!name || !name.trim() || !fiscalYear || !String(fiscalYear).trim()) {
      throw new Error(
        "Debe colocar los parámetros obligatorios: Nombre y Año Fiscal."
      );
    }

    let url = `/risks/audit-filtered?`;
    const params = [];

    params.push(`name=${encodeURIComponent(name)}`);
    params.push(`fiscal_year=${encodeURIComponent(fiscalYear)}`);

    if (origin && origin.trim() !== "") {
      params.push(`origin=${encodeURIComponent(origin)}`);
    }
    if (probability && probability.trim() !== "") {
      params.push(`probability=${encodeURIComponent(probability)}`);
    }
    if (impact && impact.trim() !== "") {
      params.push(`impact=${encodeURIComponent(impact)}`);
    }
    if (inherentRisk && inherentRisk.trim() !== "") {
      params.push(`inherent_risk=${encodeURIComponent(inherentRisk)}`);
    }
    if (residualRisk && residualRisk.trim() !== "") {
      params.push(`residual_risk=${encodeURIComponent(residualRisk)}`);
    }

    url += params.join("&");

    const response = await index.get(url);

    return response.data.data;
  } catch (error) {
    throw new Error(
      handleStatus(error, "getAuditFilteredRisks", statusMessages)
    );
  }
};

export const getAuditPlan = async (name, fiscalYear, title, startDate) => {
  try {
    if (!name || !name.trim() || !fiscalYear || !fiscalYear.trim()) {
      throw new Error(
        "Debe colocar los parámetros obligatorios: Nombre y Año Fiscal."
      );
    }

    let url = `/reports/audit-plan?`;
    const params = [];

    // Campos obligatorios
    params.push(`name=${encodeURIComponent(name)}`);
    params.push(`fiscal_year=${encodeURIComponent(fiscalYear)}`);

    // Campos opcionales
    if (title && title.trim() !== "")
      params.push(`title=${encodeURIComponent(title)}`);
    if (startDate && startDate.trim() !== "")
      params.push(`start_date=${encodeURIComponent(startDate)}`);

    url += params.join("&");

    const response = await index.get(url);
    return response.data.data;
  } catch (error) {
    throw new Error(handleStatus(error, "getAuditPlan", statusMessages));
  }
};
