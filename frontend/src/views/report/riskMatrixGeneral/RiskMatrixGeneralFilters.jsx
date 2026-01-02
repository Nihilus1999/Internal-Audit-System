// RiskMatrixGeneralFilters.jsx (versión simplificada)
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
import { getRiskMatrixGeneral, getFilteredRisks } from "@/services/Report";
import { GenerateRiskMatrixGeneralPDF } from "./GenerateRiskMatrixGeneralPDF";
import { GenerateRiskMatrixGeneralDOCX } from "./GenerateRiskMatrixGeneralDOCX";
import { GenerateRiskMatrixGeneralXLSX } from "./GenerateRiskMatrixGeneralXLSX";

const RiskMatrixGeneralFilters = () => {
  const navigate = useNavigate();

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [warning, setWarning] = useState("");
  const [success, setSuccess] = useState("");

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      origin: "",
      probability: "",
      impact: "",
      inherent_risk: "",
      residual_risk: "",
      slug: "",
      name: "",
    },
  });

  const filters = useWatch({
    control,
    name: ["origin", "probability", "impact", "inherent_risk", "residual_risk"],
  });

  const [riskOptions, setRiskOptions] = useState([]);
  const [loadingRisks, setLoadingRisks] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const [origin, probability, impact, inherent_risk, residual_risk] =
        filters || [];
      try {
        setLoadingRisks(true);
        const resp = await getFilteredRisks(
          origin || "",
          probability || "",
          impact || "",
          inherent_risk || "",
          residual_risk || ""
        );
        const list = Array.isArray(resp)
          ? resp
          : Array.isArray(resp?.data)
          ? resp.data
          : [];
        setRiskOptions(list);
      } catch (e) {
        setRiskOptions([]);
        setWarning("No fue posible cargar los riesgos filtrados.");
        setSnackbarOpen(true);
      } finally {
        setLoadingRisks(false);
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [filters]);

  // Mapas para sincronizar
  const maps = useMemo(() => {
    const slugToName = new Map();
    const nameToSlug = new Map();
    for (const r of riskOptions) {
      if (r?.slug) slugToName.set(r.slug, r?.name ?? "");
      if (r?.name) nameToSlug.set(r.name, r?.slug ?? "");
    }
    return { slugToName, nameToSlug };
  }, [riskOptions]);

  // Si las opciones cambian y la selección ya no existe → limpiar
  useEffect(() => {
    const currentSlug = getValues("slug");
    const currentName = getValues("name");

    if (!riskOptions.length) {
      if (currentSlug || currentName) {
        setValue("slug", "");
        setValue("name", "");
      }
      return;
    }
    if (currentSlug && !maps.slugToName.has(currentSlug)) {
      setValue("slug", "");
      setValue("name", "");
      return;
    }
    if (currentName && !maps.nameToSlug.has(currentName)) {
      setValue("slug", "");
      setValue("name", "");
      return;
    }
    if (currentSlug) {
      const syncedName = maps.slugToName.get(currentSlug) || "";
      if (syncedName !== currentName) setValue("name", syncedName);
    } else if (currentName) {
      const syncedSlug = maps.nameToSlug.get(currentName) || "";
      if (syncedSlug !== currentSlug) setValue("slug", syncedSlug);
    }
  }, [riskOptions, maps, getValues, setValue]);

  const fetchAndExport = async (
    { slug, name, origin, probability, impact, inherent_risk, residual_risk },
    format
  ) => {
    try {
      setWarning("");
      setSuccess("");
      const data = await getRiskMatrixGeneral(
        slug,
        name,
        origin,
        probability,
        impact,
        inherent_risk,
        residual_risk
      );
      if (!data || data.length === 0) {
        setWarning("No se encontraron registros con los filtros aplicados.");
        setSnackbarOpen(true);
        return;
      }
      if (format === "pdf") await GenerateRiskMatrixGeneralPDF(data);
      if (format === "docx") await GenerateRiskMatrixGeneralDOCX(data);
      if (format === "xlsx") await GenerateRiskMatrixGeneralXLSX(data);
      setSuccess(
        `El archivo ${format.toUpperCase()} se descargó correctamente`
      );
      setSnackbarOpen(true);
    } catch (error) {
      console.error(error);
      setWarning(error?.message || "Ocurrió un error generando el archivo.");
      setSnackbarOpen(true);
    }
  };

  const optionsByField = {
    probability: ["Alta", "Media", "Baja"],
    impact: ["Alto", "Medio", "Bajo"],
    inherent_risk: ["Alto", "Medio", "Bajo"],
    residual_risk: ["Alto", "Medio", "Bajo"],
  };

  const clearRiskSelections = () => {
    setValue("slug", "");
    setValue("name", "");
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center">
      <Paper elevation={8} sx={{ p: 4, width: 500 }}>
        <form
          onSubmit={handleSubmit((data) => fetchAndExport(data))}
          noValidate
        >
          <Stack spacing={3}>
            <Typography variant="h5" fontWeight="bold" textAlign="center">
              Filtros para Generar la Matriz de Riesgos General
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
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel id="origin">Origen</InputLabel>
                  <Select
                    {...field}
                    labelId="origin"
                    label="Origen"
                    onChange={(e) => {
                      clearRiskSelections();
                      field.onChange(e.target.value);
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
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel id={f.name}>{f.label}</InputLabel>
                    <Select
                      {...field}
                      labelId={f.name}
                      label={f.label}
                      onChange={(e) => {
                        clearRiskSelections();
                        field.onChange(e.target.value);
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

            {/* Código */}
            <Controller
              name="slug"
              control={control}
              render={({ field: { value } }) => (
                <Autocomplete
                  options={riskOptions.map((r) => r.slug)}
                  loading={loadingRisks}
                  value={value || ""}
                  onChange={(_, v) => {
                    if (!v) {
                      setValue("slug", "");
                      setValue("name", "");
                      return;
                    }
                    setValue("slug", v);
                    setValue("name", maps.slugToName.get(v) || "");
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Código"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loadingRisks && <CircularProgress size={18} />}
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
                  message: "Solo letras, números, guion y guion bajo",
                },
              }}
            />

            {/* Nombre */}
            <Controller
              name="name"
              control={control}
              render={({ field: { value } }) => (
                <Autocomplete
                  options={riskOptions.map((r) => r.name)}
                  loading={loadingRisks}
                  value={value || ""}
                  onChange={(_, v) => {
                    if (!v) {
                      setValue("name", "");
                      setValue("slug", "");
                      return;
                    }
                    setValue("name", v);
                    setValue("slug", maps.nameToSlug.get(v) || "");
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Nombre del Riesgo"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loadingRisks && <CircularProgress size={18} />}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                      error={!!errors.name}
                      helperText={errors.name?.message}
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
                disabled={isSubmitting}
                sx={{
                  mt: 2,
                  borderRadius: "20px",
                  px: "20px",
                  py: "8px",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                }}
                onClick={handleSubmit((d) => fetchAndExport(d, "pdf"))}
              >
                PDF
              </Button>

              <Button
                variant="contained"
                color="primary"
                startIcon={<DescriptionIcon />}
                disabled={isSubmitting}
                sx={{
                  mt: 2,
                  borderRadius: "20px",
                  px: "20px",
                  py: "8px",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                }}
                onClick={handleSubmit((d) => fetchAndExport(d, "docx"))}
              >
                Word
              </Button>

              <Button
                variant="contained"
                color="success"
                startIcon={<TableChartIcon />}
                disabled={isSubmitting}
                sx={{
                  mt: 2,
                  borderRadius: "20px",
                  px: "20px",
                  py: "8px",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                }}
                onClick={handleSubmit((d) => fetchAndExport(d, "xlsx"))}
              >
                Excel
              </Button>

              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                sx={{
                  mt: 2,
                  borderRadius: "20px",
                  px: "20px",
                  py: "8px",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                }}
                onClick={() =>
                  navigate("/report-audit-programs/report-options")
                }
              >
                Volver
              </Button>
            </Stack>
          </Stack>
        </form>
      </Paper>

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

export default RiskMatrixGeneralFilters;
