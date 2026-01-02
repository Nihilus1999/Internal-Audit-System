import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";
import TableChartIcon from "@mui/icons-material/TableChart";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { useForm, Controller, useWatch } from "react-hook-form";
import { getRiskMatrixAuditProgram } from "@/services/Report";
import { getAuditFilteredRisks } from "@/services/Report";
import {
  getAuditPrograms,
  getFiscalYears,
} from "@/services/auditProgram/AuditProgram";
import { GenerateRiskMatrixAuditProgramPDF } from "./GenerateRiskMatrixAuditProgramPDF";
import { GenerateRiskMatrixAuditProgramDOCX } from "./GenerateRiskMatrixAuditProgramDOCX";
import { GenerateRiskMatrixAuditProgramXLSX } from "./GenerateRiskMatrixAuditProgramXLSX";

const normalizeYears = (yearsResp) =>
  yearsResp?.map((y) =>
    typeof y === "number"
      ? { label: String(y), value: y }
      : {
          label: String(y?.year ?? y?.value ?? y),
          value: Number(y?.year ?? y?.value ?? y),
        }
  ) ?? [];

const normalizePrograms = (programsResp) =>
  programsResp?.map((p) =>
    typeof p === "string"
      ? { label: p, value: p, raw: { name: p } }
      : {
          label: p?.name ?? p?.title ?? String(p),
          value: p?.name ?? p?.title ?? String(p),
          raw: p,
        }
  ) ?? [];

const RiskMatrixAuditProgramFilters = () => {
  const navigate = useNavigate();

  // Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [warning, setWarning] = useState("");
  const [success, setSuccess] = useState("");

  // Combos Año/Programa
  const [fiscalYears, setFiscalYears] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loadingYears, setLoadingYears] = useState(false);
  const [loadingPrograms, setLoadingPrograms] = useState(false);

  // Riesgos (para combos Código/Nombre)
  const [riskOptions, setRiskOptions] = useState([]); // [{ slug, name }]
  const [loadingRisks, setLoadingRisks] = useState(false);
  const debounceRef = useRef(null);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    register,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      // requeridos
      fiscal_year: null,
      name: null,
      yearObj: null,
      programObj: null,
      // no requeridos
      slug: "",
      risk_name: "",
      origin: "",
      probability: "",
      impact: "",
      inherent_risk: "",
      residual_risk: "",
    },
  });

  const selectedYear = watch("fiscal_year");
  const selectedProgram = watch("name");

  // Cargar años fiscales
  useEffect(() => {
    const loadYears = async () => {
      setLoadingYears(true);
      setWarning("");
      setSuccess("");
      try {
        const years = await getFiscalYears();
        setFiscalYears(normalizeYears(years));
      } catch (err) {
        setWarning(err?.message || "Error al cargar los años fiscales.");
        setSnackbarOpen(true);
      } finally {
        setLoadingYears(false);
      }
    };
    loadYears();
  }, []);

  // Cargar programas por año
  useEffect(() => {
    const loadPrograms = async () => {
      clearRiskSelections();
      setRiskOptions([]);

      if (!selectedYear) {
        setPrograms([]);
        setValue("programObj", null);
        setValue("name", null);
        return;
      }

      setLoadingPrograms(true);
      setWarning("");
      setSuccess("");
      try {
        const data = await getAuditPrograms(0, 1000, selectedYear);
        const list = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
          ? data
          : [];
        const normalized = normalizePrograms(list);
        setPrograms(normalized);
        setValue("programObj", null);
        setValue("name", null);
      } catch (err) {
        setPrograms([]);
        setWarning(
          err?.message || "Error al cargar los programas de auditoría."
        );
        setSnackbarOpen(true);
      } finally {
        setLoadingPrograms(false);
      }
    };
    loadPrograms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear]);

  // Opciones fijas
  const optionsByField = {
    probability: ["Alta", "Media", "Baja"],
    impact: ["Alto", "Medio", "Bajo"],
    inherent_risk: ["Alto", "Medio", "Bajo"],
    residual_risk: ["Alto", "Medio", "Bajo"],
  };

  // Watch de requeridos + filtros para disparar fetch de riesgos (audit-filtered)
  const [
    wName,
    wFiscalYear,
    wOrigin,
    wProbability,
    wImpact,
    wInherent,
    wResidual,
  ] =
    useWatch({
      control,
      name: [
        "name",
        "fiscal_year",
        "origin",
        "probability",
        "impact",
        "inherent_risk",
        "residual_risk",
      ],
    }) || [];

  useEffect(() => {
    if (!wName || !wFiscalYear) {
      setRiskOptions([]);
      clearRiskSelections();
      return; // no mensajes si faltan requeridos
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        setLoadingRisks(true);

        // getAuditFilteredRisks(name, fiscalYear, origin, probability, impact, inherentRisk, residualRisk)
        const resp = await getAuditFilteredRisks(
          wName,
          wFiscalYear,
          wOrigin || "",
          wProbability || "",
          wImpact || "",
          wInherent || "",
          wResidual || ""
        );

        const list = Array.isArray(resp)
          ? resp
          : Array.isArray(resp?.data)
          ? resp.data
          : [];
        setRiskOptions(list);

        // Si no hay coincidencias, limpiar y (solo si hay requeridos) avisar
        if (list.length === 0) {
          clearRiskSelections();
        }
      } catch (err) {
        setRiskOptions([]);
        clearRiskSelections();
      } finally {
        setLoadingRisks(false);
      }
    }, 350);

    return () => clearTimeout(debounceRef.current);
  }, [
    wName,
    wFiscalYear,
    wOrigin,
    wProbability,
    wImpact,
    wInherent,
    wResidual,
  ]);

  // Mapas para sincronizar slug <-> name
  const maps = useMemo(() => {
    const slugToName = new Map();
    const nameToSlug = new Map();
    for (const r of riskOptions) {
      if (r?.slug) slugToName.set(r.slug, r?.name ?? "");
      if (r?.name) nameToSlug.set(r.name, r?.slug ?? "");
    }
    return { slugToName, nameToSlug };
  }, [riskOptions]);

  // Validar selección cuando cambian opciones
  useEffect(() => {
    const currentSlug = getValues("slug");
    const currentName = getValues("risk_name");

    if (!riskOptions.length) {
      if (currentSlug || currentName) {
        setValue("slug", "", { shouldDirty: true });
        setValue("risk_name", "", { shouldDirty: true });
      }
      return;
    }

    if (currentSlug && !maps.slugToName.has(currentSlug)) {
      setValue("slug", "", { shouldDirty: true });
      setValue("risk_name", "", { shouldDirty: true });
      return;
    }

    if (currentName && !maps.nameToSlug.has(currentName)) {
      setValue("slug", "", { shouldDirty: true });
      setValue("risk_name", "", { shouldDirty: true });
      return;
    }

    if (currentSlug && maps.slugToName.has(currentSlug)) {
      const syncedName = maps.slugToName.get(currentSlug) || "";
      if (syncedName !== currentName) {
        setValue("risk_name", syncedName, { shouldDirty: true });
      }
    } else if (currentName && maps.nameToSlug.has(currentName)) {
      const syncedSlug = maps.nameToSlug.get(currentName) || "";
      if (syncedSlug !== currentSlug) {
        setValue("slug", syncedSlug, { shouldDirty: true });
      }
    }
  }, [riskOptions, maps, getValues, setValue]);

  // Export
  const fetchAndExport = async (values, format) => {
    const {
      name,
      fiscal_year,
      slug,
      risk_name,
      origin,
      probability,
      impact,
      inherent_risk,
      residual_risk,
    } = values;

    try {
      setWarning("");
      setSuccess("");

      if (!fiscal_year || !name) {
        setWarning("Selecciona Año Fiscal y Programa de Auditoría.");
        setSnackbarOpen(true);
        return;
      }

      const data = await getRiskMatrixAuditProgram(
        name,
        fiscal_year,
        slug,
        risk_name,
        origin,
        probability,
        impact,
        inherent_risk,
        residual_risk
      );

      if (!data || !Array.isArray(data?.risks) || data.risks.length === 0) {
        setWarning("No se encontraron registros con los filtros aplicados.");
        setSnackbarOpen(true);
        return;
      }

      if (format === "pdf") {
        await GenerateRiskMatrixAuditProgramPDF(data);
        setSuccess("El archivo PDF se descargó correctamente");
      } else if (format === "docx") {
        await GenerateRiskMatrixAuditProgramDOCX(data);
        setSuccess("El archivo Word se descargó correctamente");
      } else if (format === "xlsx") {
        await GenerateRiskMatrixAuditProgramXLSX(data);
        setSuccess("El archivo Excel se descargó correctamente");
      }

      setSnackbarOpen(true);
    } catch (error) {
      setWarning(error?.message || "Ocurrió un error durante la exportación.");
      setSnackbarOpen(true);
    }
  };

  const exportDisabled = useMemo(
    () =>
      !selectedYear ||
      !selectedProgram ||
      isSubmitting ||
      loadingYears ||
      loadingPrograms,
    [selectedYear, selectedProgram, isSubmitting, loadingYears, loadingPrograms]
  );

  const clearRiskSelections = () => {
    setValue("slug", "", { shouldDirty: true });
    setValue("risk_name", "", { shouldDirty: true });
  };

  const handleVolver = () => navigate("/report-audit-programs/report-options");

  return (
    <Box display="flex" justifyContent="center" alignItems="center">
      <Paper elevation={10} sx={{ padding: 4, width: 520, maxWidth: "95vw" }}>
        <form
          onSubmit={handleSubmit((vals) => fetchAndExport(vals))}
          noValidate
        >
          <Stack spacing={4}>
            <Typography variant="h5" fontWeight="bold" textAlign="center">
              Filtros para Generar la Matriz de Riesgos de Auditoría
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
            >
              Los campos <strong>Nombre del Programa</strong> y{" "}
              <strong>Año Fiscal</strong> son obligatorios para generar el
              reporte. Los demás filtros son opcionales y pueden utilizarse si
              se desea información más específica.
            </Typography>

            {/* Año Fiscal */}
            <Controller
              name="yearObj"
              control={control}
              rules={{ required: "El año fiscal es obligatorio" }}
              render={({ field, fieldState }) => (
                <Autocomplete
                  {...field}
                  options={fiscalYears}
                  loading={loadingYears}
                  getOptionLabel={(opt) => opt?.label ?? ""}
                  isOptionEqualToValue={(opt, val) => opt?.value === val?.value}
                  onChange={(_, newVal) => {
                    field.onChange(newVal);
                    setValue("fiscal_year", newVal?.value ?? null, {
                      shouldValidate: true,
                    });
                    clearRiskSelections();
                    setRiskOptions([]);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Año Fiscal"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loadingYears ? (
                              <CircularProgress size={20} />
                            ) : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
              )}
            />

            {/* Programa de Auditoría */}
            <Controller
              name="programObj"
              control={control}
              rules={{ required: "El programa es obligatorio" }}
              render={({ field, fieldState }) => (
                <Autocomplete
                  {...field}
                  options={programs}
                  loading={loadingPrograms}
                  disabled={!selectedYear || loadingPrograms || loadingYears}
                  getOptionLabel={(opt) => opt?.label ?? ""}
                  isOptionEqualToValue={(opt, val) => opt?.value === val?.value}
                  onChange={(_, newVal) => {
                    field.onChange(newVal);
                    setValue("name", newVal?.value ?? null, {
                      shouldValidate: true,
                    });
                    clearRiskSelections();
                    setRiskOptions([]);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Nombre del Programa"
                      placeholder={
                        selectedYear
                          ? "Selecciona el programa"
                          : "Primero selecciona el año"
                      }
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loadingPrograms ? (
                              <CircularProgress size={20} />
                            ) : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
              )}
            />

            {/* Sección de filtros opcionales */}
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{ mt: 1, textAlign: "center" }}
            >
              ------- Campos no requeridos -------
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
            >
              Los siguientes campos no son obligatorios para generar el reporte.
              Su propósito es permitirte filtrar o especificar información más
              precisa en caso de ser necesario. Si los dejas vacíos, el reporte
              se generará con la totalidad de los datos del programa
              seleccionado.
            </Typography>

            {/* Origen */}
            <Controller
              name="origin"
              control={control}
              render={({ field: { value, onChange } }) => (
                <FormControl fullWidth>
                  <InputLabel id="select-origin-label">Origen</InputLabel>
                  <Select
                    labelId="select-origin-label"
                    label="Origen"
                    value={value || ""}
                    onChange={(e) => {
                      clearRiskSelections();
                      onChange(e.target.value);
                    }}
                  >
                    <MenuItem value="">
                      <em>Sin selección</em>
                    </MenuItem>
                    <MenuItem value="Interno">Interno</MenuItem>
                    <MenuItem value="Externo">Externo</MenuItem>
                  </Select>
                </FormControl>
              )}
            />

            {/* Probabilidad, Impacto, Inherente, Residual */}
            {[
              { name: "probability", label: "Probabilidad" },
              { name: "impact", label: "Impacto" },
              { name: "inherent_risk", label: "Riesgo Inherente" },
              { name: "residual_risk", label: "Riesgo Residual" },
            ].map((f) => (
              <Controller
                key={f.name}
                name={f.name}
                control={control}
                render={({ field: { value, onChange } }) => (
                  <FormControl fullWidth>
                    <InputLabel id={`select-${f.name}-label`}>
                      {f.label}
                    </InputLabel>
                    <Select
                      labelId={`select-${f.name}-label`}
                      label={f.label}
                      value={value || ""}
                      onChange={(e) => {
                        clearRiskSelections();
                        onChange(e.target.value);
                      }}
                    >
                      <MenuItem value="">
                        <em>Sin selección</em>
                      </MenuItem>
                      {optionsByField[f.name].map((opt) => (
                        <MenuItem key={opt} value={opt}>
                          {opt}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            ))}

            {/* Código (slug) sincronizado */}
            <Controller
              name="slug"
              control={control}
              render={({ field: { value } }) => (
                <Autocomplete
                  disablePortal
                  options={riskOptions.map((r) => r.slug)}
                  loading={loadingRisks}
                  disabled={!selectedYear || !selectedProgram || loadingRisks}
                  value={value || ""}
                  onChange={(_, newSlug) => {
                    if (!newSlug) {
                      setValue("slug", "", { shouldDirty: true });
                      setValue("risk_name", "", { shouldDirty: true });
                      return;
                    }
                    setValue("slug", newSlug, { shouldDirty: true });
                    setValue("risk_name", maps.slugToName.get(newSlug) || "", {
                      shouldDirty: true,
                    });
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Código"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loadingRisks ? (
                              <CircularProgress size={18} />
                            ) : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                      error={!!errors.slug}
                      helperText={errors.slug?.message}
                    />
                  )}
                />
              )}
              rules={{
                pattern: {
                  value: /^[A-Za-z0-9_-]*$/,
                  message: "Solo letras, números y guiones",
                },
              }}
            />

            {/* Nombre del Riesgo sincronizado */}
            <Controller
              name="risk_name"
              control={control}
              render={({ field: { value } }) => (
                <Autocomplete
                  disablePortal
                  options={riskOptions.map((r) => r.name)}
                  loading={loadingRisks}
                  disabled={!selectedYear || !selectedProgram || loadingRisks}
                  value={value || ""}
                  onChange={(_, newName) => {
                    if (!newName) {
                      setValue("risk_name", "", { shouldDirty: true });
                      setValue("slug", "", { shouldDirty: true });
                      return;
                    }
                    setValue("risk_name", newName, { shouldDirty: true });
                    setValue("slug", maps.nameToSlug.get(newName) || "", {
                      shouldDirty: true,
                    });
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Nombre del Riesgo"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loadingRisks ? (
                              <CircularProgress size={18} />
                            ) : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                      error={!!errors.risk_name}
                      helperText={errors.risk_name?.message}
                    />
                  )}
                />
              )}
              rules={{
                pattern: {
                  value: /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s]*$/,
                  message: "Solo letras, números y espacios",
                },
              }}
            />

            {/* Botones */}
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="contained"
                color="error"
                startIcon={<PictureAsPdfIcon />}
                disabled={exportDisabled}
                sx={{
                  mt: 2,
                  borderRadius: "20px",
                  px: "20px",
                  py: "8px",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                }}
                onClick={handleSubmit((vals) => fetchAndExport(vals, "pdf"))}
              >
                PDF
              </Button>

              <Button
                variant="contained"
                color="primary"
                startIcon={<DescriptionIcon />}
                disabled={exportDisabled}
                sx={{
                  mt: 2,
                  borderRadius: "20px",
                  px: "20px",
                  py: "8px",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                }}
                onClick={handleSubmit((vals) => fetchAndExport(vals, "docx"))}
              >
                Word
              </Button>

              <Button
                variant="contained"
                color="success"
                startIcon={<TableChartIcon />}
                disabled={exportDisabled}
                sx={{
                  mt: 2,
                  borderRadius: "20px",
                  px: "20px",
                  py: "8px",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                }}
                onClick={handleSubmit((vals) => fetchAndExport(vals, "xlsx"))}
              >
                Excel
              </Button>

              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={handleVolver}
                sx={{
                  mt: 2,
                  borderRadius: "20px",
                  px: "20px",
                  py: "8px",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                }}
              >
                Volver
              </Button>
            </Stack>
          </Stack>
        </form>
      </Paper>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        autoHideDuration={4000}
      >
        {warning ? (
          <Alert
            severity="warning"
            onClose={() => setSnackbarOpen(false)}
            sx={{ fontWeight: "bold" }}
          >
            {warning}
          </Alert>
        ) : success ? (
          <Alert
            severity="success"
            onClose={() => setSnackbarOpen(false)}
            sx={{ fontWeight: "bold" }}
          >
            {success}
          </Alert>
        ) : null}
      </Snackbar>
    </Box>
  );
};

export default RiskMatrixAuditProgramFilters;
