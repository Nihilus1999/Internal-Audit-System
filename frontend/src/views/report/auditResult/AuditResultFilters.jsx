// AuditResultFilters.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Alert,
  Snackbar,
  CircularProgress,
  TextField,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { getAuditResult } from "@/services/Report";
import { getAuditPrograms, getFiscalYears } from "@/services/auditProgram/AuditProgram";
import { GenerateAuditResultPDF } from "./GenerateAuditResultPDF";
import { GenerateAuditResultDOCX } from "./GenerateAuditResultDOCX";

const AuditResultFilters = () => {
  const navigate = useNavigate();

  // UI state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [warning, setWarning] = useState("");
  const [success, setSuccess] = useState("");
  const [fiscalYears, setFiscalYears] = useState([]);
  const [programs, setPrograms] = useState([]);  
  const [loadingYears, setLoadingYears] = useState(false);
  const [loadingPrograms, setLoadingPrograms] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      fiscal_year: null,
      name: null,        
      programObj: null, 
      yearObj: null, 
    },
  });

  const selectedYear = watch("fiscal_year");
  const selectedProgramName = watch("name");

  const normalizeYears = (yearsResp) => {
    return yearsResp?.map((y) =>
      typeof y === "number"
        ? { label: String(y), value: y }
        : { label: String(y?.year ?? y?.value ?? y), value: Number(y?.year ?? y?.value ?? y) }
    ) ?? [];
  };

  const normalizePrograms = (programsResp) => {
    return programsResp?.map((p) =>
      typeof p === "string"
        ? { label: p, value: p, raw: { name: p } }
        : { label: p?.name ?? p?.title ?? String(p), value: p?.name ?? p?.title ?? String(p), raw: p }
    ) ?? [];
  };

  useEffect(() => {
    const loadFiscalYears = async () => {
      setLoadingYears(true);
      setWarning("");
      setSuccess("");
      try {
        const years = await getFiscalYears();
        const normalized = normalizeYears(years);
        setFiscalYears(normalized);
      } catch (error) {
        setWarning(error?.message || "Error al cargar los años fiscales.");
        setSnackbarOpen(true);
      } finally {
        setLoadingYears(false);
      }
    };
    loadFiscalYears();
  }, []);

  useEffect(() => {
    const loadPrograms = async () => {
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
        const data = await getAuditPrograms(0, 100, selectedYear);
        const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
        const normalized = normalizePrograms(list);
        setPrograms(normalized);
        setValue("programObj", null);
        setValue("name", null);
      } catch (error) {
        setPrograms([]);
        setWarning(error?.message || "Error al cargar los programas de auditoría.");
        setSnackbarOpen(true);
      } finally {
        setLoadingPrograms(false);
      }
    };
    loadPrograms();
  }, [selectedYear]);

  // --- Exportación ---
  const fetchAndExport = async (formValues, format) => {
    const { fiscal_year, name } = formValues;
    try {
      setWarning("");
      setSuccess("");

      if (!fiscal_year || !name) {
        setWarning("Selecciona Año Fiscal y Programa de Auditoría.");
        setSnackbarOpen(true);
        return;
      }

      const data = await getAuditResult(name, fiscal_year);

      if (!data || (Array.isArray(data) && data.length === 0)) {
        setWarning("No se encontraron registros con los filtros aplicados.");
        setSnackbarOpen(true);
        return;
      }

      if (format === "pdf") {
        await GenerateAuditResultPDF(data);
        setSuccess("El archivo PDF se descargó correctamente.");
      } else if (format === "docx") {
        await GenerateAuditResultDOCX(data);
        setSuccess("El archivo Word se descargó correctamente.");
      } else {
        setWarning("Formato de exportación no soportado.");
      }

      setSnackbarOpen(true);
    } catch (error) {
      setWarning(error?.message || "Ocurrió un error durante la exportación.");
      setSnackbarOpen(true);
    }
  };

  const exportDisabled = useMemo(() => {
    return !selectedYear || !selectedProgramName || isSubmitting || loadingYears || loadingPrograms;
  }, [selectedYear, selectedProgramName, isSubmitting, loadingYears, loadingPrograms]);

  const handleVolver = () => navigate("/report-audit-programs/report-options");

  return (
    <Box display="flex" justifyContent="center" alignItems="center">
      <Paper elevation={10} sx={{ padding: 4, width: 520, maxWidth: "95vw" }}>
        <form onSubmit={handleSubmit((values) => fetchAndExport(values))} noValidate>
          <Stack spacing={4}>
            <Typography variant="h5" fontWeight="bold" textAlign="center">
              Filtros para Generar el Informe de Resultados de Auditoría
            </Typography>

            <Typography variant="body2" color="text.secondary" textAlign="center">
              Los campos <strong>Nombre del Programa</strong> y <strong>Año Fiscal</strong> son obligatorios.
            </Typography>

            {/* Combobox Año Fiscal */}
            <Controller
              name="yearObj"
              control={control}
              rules={{ required: "El año fiscal es obligatorio" }}
              render={({ field, fieldState }) => (
                <Autocomplete
                  {...field}
                  options={fiscalYears}
                  loading={loadingYears}
                  getOptionLabel={(opt) => (opt?.label ?? "")}
                  onChange={(_, newVal) => {
                    field.onChange(newVal);
                    setValue("fiscal_year", newVal?.value ?? null, { shouldValidate: true });
                  }}
                  isOptionEqualToValue={(opt, val) => opt?.value === val?.value}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Año Fiscal"
                      placeholder="Selecciona el año"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loadingYears ? <CircularProgress size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
              )}
            />

            {/* Combobox Programa de Auditoría */}
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
                  getOptionLabel={(opt) => (opt?.label ?? "")}
                  onChange={(_, newVal) => {
                    field.onChange(newVal);
                    setValue("name", newVal?.value ?? null, { shouldValidate: true });
                  }}
                  isOptionEqualToValue={(opt, val) => opt?.value === val?.value}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Nombre del Programa de Auditoría"
                      placeholder={selectedYear ? "Selecciona el programa" : "Primero selecciona el año"}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loadingPrograms ? <CircularProgress size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
              )}
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
                onClick={handleSubmit((data) => fetchAndExport(data, "pdf"))}
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
                onClick={handleSubmit((data) => fetchAndExport(data, "docx"))}
              >
                Word
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
          <Alert severity="warning" onClose={() => setSnackbarOpen(false)} sx={{ fontWeight: "bold" }}>
            {warning}
          </Alert>
        ) : success ? (
          <Alert severity="success" onClose={() => setSnackbarOpen(false)} sx={{ fontWeight: "bold" }}>
            {success}
          </Alert>
        ) : null}
      </Snackbar>
    </Box>
  );
};

export default AuditResultFilters;