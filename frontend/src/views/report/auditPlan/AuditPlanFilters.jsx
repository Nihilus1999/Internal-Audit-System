// AuditPlanFilters.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  FormHelperText,
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";
import TableChartIcon from "@mui/icons-material/TableChart";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { getAuditPlan } from "@/services/Report";
import {
  getFiscalYears,
  getAuditPrograms,
  getAuditProgramBySlug,
} from "@/services/auditProgram/AuditProgram";
import { getExecutionTests } from "@/services/auditProgram/Execution";
import { GenerateAuditPlanPDF } from "./GenerateAuditPlanPDF";
import { GenerateAuditPlanDOCX } from "./GenerateAuditPlanDOCX";
import { GenerateAuditPlanXLSX } from "./GenerateAuditPlanXLSX";

const Items_Page = 1000;

// Genera "auditoría-de-marketing-FY2024"
const buildSlug = (name, year) => {
  if (!name || !year) return "";
  const base = String(name)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/[^-\p{L}\p{N}]/gu, "");
  return `${base}-FY${year}`;
};

// Evita desfases por zona horaria al tratar fechas ISO con "Z"
const isoToDayjsDateOnly = (iso) => {
  if (!iso || typeof iso !== "string") return null;
  const d = iso.split("T")[0]; // "YYYY-MM-DD"
  return dayjs(d);
};

const AuditPlanFilters = () => {
  const navigate = useNavigate();

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [warning, setWarning] = useState("");
  const [success, setSuccess] = useState("");

  const [fiscalYears, setFiscalYears] = useState([]);
  const [loadingYears, setLoadingYears] = useState(false);

  const [programs, setPrograms] = useState([]);
  const [loadingPrograms, setLoadingPrograms] = useState(false);

  const [tests, setTests] = useState([]); // [{id, title, start_date}]
  const [loadingTests, setLoadingTests] = useState(false);

  // Límites de fecha del programa seleccionado (start_date / end_date)
  const [programBounds, setProgramBounds] = useState({ min: null, max: null });

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      fiscal_year: "",
      name: "",
      title: "",
      start_date: null, // "DD/MM/YYYY"
    },
  });

  const selectedYear = watch("fiscal_year");
  const selectedProgram = watch("name");
  const selectedTitle = watch("title");

  // === Cargar años fiscales ===
  useEffect(() => {
    const loadYears = async () => {
      setLoadingYears(true);
      try {
        const years = await getFiscalYears();
        const normalized = Array.isArray(years) ? years : [];
        normalized.sort((a, b) => Number(b) - Number(a));
        setFiscalYears(normalized);
      } catch {
        setWarning("Error al cargar los años fiscales");
        setSnackbarOpen(true);
      } finally {
        setLoadingYears(false);
      }
    };
    loadYears();
  }, []);

  // === Cargar programas por año ===
  useEffect(() => {
    setValue("name", "");
    setValue("title", "");
    setValue("start_date", null);
    setTests([]);
    setProgramBounds({ min: null, max: null });
    if (!selectedYear) return;

    const fetchProgramsByYear = async () => {
      setLoadingPrograms(true);
      try {
        const data = await getAuditPrograms(0, Items_Page, selectedYear);
        const list = (data?.data || []).map((p) => p?.name).filter(Boolean);
        list.sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));
        setPrograms(list);
      } catch {
        setPrograms([]);
        setWarning("Error al cargar los programas");
        setSnackbarOpen(true);
      } finally {
        setLoadingPrograms(false);
      }
    };
    fetchProgramsByYear();
  }, [selectedYear, setValue]);

  // === Cargar pruebas por slug Y límites de fecha del programa (start/end) ===
  useEffect(() => {
    setValue("title", "");
    setValue("start_date", null);
    setTests([]);
    setProgramBounds({ min: null, max: null });

    if (!selectedYear || !selectedProgram) return;

    const run = async () => {
      setLoadingTests(true);
      try {
        const slug = buildSlug(selectedProgram, selectedYear);

        // 1) Obtener límites de fecha (start_date / end_date) del programa (normalizados)
        try {
          const program = await getAuditProgramBySlug(slug);
          const min = isoToDayjsDateOnly(program?.start_date);
          const max = isoToDayjsDateOnly(program?.end_date);
          setProgramBounds({ min, max });
        } catch {
          setProgramBounds({ min: null, max: null });
        }

        // 2) Pruebas (con su start_date si llega)
        const data = await getExecutionTests(slug);
        const titles = (Array.isArray(data) ? data : []).map((t) => ({
          id: t.id,
          title: t.title,
          start_date: t.start_date || null,
        }));
        titles.sort((a, b) =>
          a.title.localeCompare(b.title, "es", { sensitivity: "base" })
        );
        setTests(titles);
      } catch {
        setTests([]);
      } finally {
        setLoadingTests(false);
      }
    };

    run();
  }, [selectedYear, selectedProgram, setValue]);

  // === Cuando se selecciona un título, autollenar la fecha y bloquear edición ===
  useEffect(() => {
    if (!selectedTitle) {
      setValue("start_date", null);
      return;
    }
    const found = tests.find((t) => t.title === selectedTitle);
    if (found?.start_date) {
      const d = isoToDayjsDateOnly(found.start_date);
      const formatted = d && d.isValid() ? d.format("DD/MM/YYYY") : null;
      setValue("start_date", formatted);
    } else {
      setValue("start_date", null);
    }
  }, [selectedTitle, tests, setValue]);

  // === Habilitar exportación solo si hay año + programa ===
  const canExport = useMemo(
    () => Boolean(selectedYear) && Boolean(selectedProgram),
    [selectedYear, selectedProgram]
  );

  // === Exportar ===
  const fetchAndExport = async (
    { name, fiscal_year, title, start_date },
    format
  ) => {
    try {
      setWarning("");
      setSuccess("");

      if (!fiscal_year || !name) {
        setWarning("Debes seleccionar Año Fiscal y Programa de Auditoría.");
        setSnackbarOpen(true);
        return;
      }

      const data = await getAuditPlan(name, fiscal_year, title, start_date);

      const hasTests =
        data &&
        (Array.isArray(data?.tests)
          ? data.tests.length > 0
          : data?.tests?.length > 0);

      if (!data || !hasTests) {
        setWarning("No se encontraron registros con los filtros aplicados.");
        setSnackbarOpen(true);
        return;
      }

      if (format === "pdf") {
        await GenerateAuditPlanPDF(data);
        setSuccess("El archivo PDF se descargó correctamente");
      } else if (format === "docx") {
        await GenerateAuditPlanDOCX(data);
        setSuccess("El archivo Word se descargó correctamente");
      } else if (format === "xlsx") {
        await GenerateAuditPlanXLSX(data);
        setSuccess("El archivo Excel se descargó correctamente");
      } else {
        setWarning("Formato no soportado");
      }

      setSnackbarOpen(true);
    } catch (error) {
      setWarning(error?.message || "Error al exportar");
      setSnackbarOpen(true);
    }
  };

  const handleVolver = () => navigate("/report-audit-programs/report-options");

  return (
    <Box display="flex" justifyContent="center" alignItems="center">
      <Paper elevation={8} sx={{ padding: 4, width: 550 }}>
        <form onSubmit={handleSubmit(() => {})} noValidate>
          <Stack spacing={4}>
            <Typography variant="h5" fontWeight="bold" textAlign="center">
              Filtros para Generar el Reporte del Plan de Auditoría
            </Typography>

            <Typography variant="body2" color="text.secondary" textAlign="center">
              Los campos <strong>Nombre del Programa</strong> y{" "}
              <strong>Año Fiscal</strong> son obligatorios para generar el
              reporte. Los demás filtros son opcionales y pueden utilizarse
              únicamente si se desea obtener información más específica.
            </Typography>

            {/* === Año Fiscal === */}
            <FormControl fullWidth error={!!errors.fiscal_year}>
              <InputLabel id="fy-label">Año Fiscal</InputLabel>
              <Controller
                name="fiscal_year"
                control={control}
                rules={{ required: "El año fiscal es obligatorio" }}
                render={({ field }) => (
                  <Select
                    labelId="fy-label"
                    label="Año Fiscal"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    disabled={loadingYears}
                  >
                    {loadingYears ? (
                      <MenuItem disabled>
                        <CircularProgress size={18} sx={{ mr: 1 }} />
                        Cargando años...
                      </MenuItem>
                    ) : fiscalYears.length === 0 ? (
                      <MenuItem disabled>No hay años fiscales</MenuItem>
                    ) : (
                      fiscalYears.map((y) => (
                        <MenuItem key={y} value={y}>
                          {y}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                )}
              />
              {errors.fiscal_year && (
                <FormHelperText>{errors.fiscal_year.message}</FormHelperText>
              )}
            </FormControl>

            {/* === Programa === */}
            <FormControl fullWidth error={!!errors.name}>
              <InputLabel id="prog-label">Programa de Auditoría</InputLabel>
              <Controller
                name="name"
                control={control}
                rules={{ required: "El nombre del programa es obligatorio" }}
                render={({ field }) => (
                  <Select
                    labelId="prog-label"
                    label="Programa de Auditoría"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    disabled={!selectedYear || loadingPrograms}
                  >
                    {!selectedYear ? (
                      <MenuItem disabled>
                        Selecciona un Año Fiscal primero
                      </MenuItem>
                    ) : loadingPrograms ? (
                      <MenuItem disabled>
                        <CircularProgress size={18} sx={{ mr: 1 }} />
                        Cargando programas...
                      </MenuItem>
                    ) : programs.length === 0 ? (
                      <MenuItem disabled>No hay programas disponibles</MenuItem>
                    ) : (
                      programs.map((p) => (
                        <MenuItem key={p} value={p}>
                          {p}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                )}
              />
            </FormControl>

            {/* === Sección de Campos Opcionales === */}
            <Typography
              variant="h6"
              fontWeight="bold"
              textAlign="center"
              sx={{ mt: 2 }}
            >
              ------- Campos no requeridos -------
            </Typography>

            <Typography variant="body2" color="text.secondary" textAlign="center">
              Si eliges un <strong>Título de la Prueba</strong>, la{" "}
              <strong>Fecha de Inicio</strong> se completará automáticamente y
              no podrá editarse. Si <strong>no seleccionas un título</strong>,
              podrás escoger una fecha dentro del rango permitido por el
              programa.
            </Typography>

            {/* === Título de Prueba === */}
            <FormControl fullWidth>
              <InputLabel id="test-label">Título de la Prueba</InputLabel>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <Select
                    labelId="test-label"
                    label="Título de la Prueba"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    disabled={!selectedProgram || loadingTests}
                  >
                    {!selectedProgram ? (
                      <MenuItem disabled>
                        Selecciona Programa para ver las pruebas
                      </MenuItem>
                    ) : loadingTests ? (
                      <MenuItem disabled>
                        <CircularProgress size={18} sx={{ mr: 1 }} />
                        Cargando pruebas...
                      </MenuItem>
                    ) : tests.length === 0 ? (
                      <MenuItem disabled>No hay pruebas disponibles</MenuItem>
                    ) : (
                      [
                        <MenuItem key="none" value="">
                          <em>Sin selección</em>
                        </MenuItem>,
                        ...tests.map((t) => (
                          <MenuItem key={t.id} value={t.title}>
                            {t.title}
                          </MenuItem>
                        )),
                      ]
                    )}
                  </Select>
                )}
              />
            </FormControl>

            {/* === Fecha === */}
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Controller
                name="start_date"
                control={control}
                render={({ field }) => {
                  const titleSelected = Boolean(selectedTitle);
                  return (
                    <DatePicker
                      label="Fecha de Inicio de la Prueba"
                      format="DD/MM/YYYY"
                      value={
                        field.value ? dayjs(field.value, "DD/MM/YYYY") : null
                      }
                      onChange={(date) => {
                        if (titleSelected) return; // bloqueado si hay título
                        if (!date || !dayjs(date).isValid()) {
                          field.onChange(null);
                          return;
                        }
                        field.onChange(dayjs(date).format("DD/MM/YYYY"));
                      }}
                      disabled={titleSelected ? true : false}
                      minDate={
                        !titleSelected && programBounds.min
                          ? programBounds.min
                          : undefined
                      }
                      maxDate={
                        !titleSelected && programBounds.max
                          ? programBounds.max
                          : undefined
                      }
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          InputProps: titleSelected ? { readOnly: true } : {},
                          helperText: titleSelected
                            ? "Fecha asignada automáticamente por la prueba seleccionada"
                            : programBounds.min && programBounds.max
                            ? `Rango permitido: ${programBounds.min.format(
                                "DD/MM/YYYY"
                              )} a ${programBounds.max.format("DD/MM/YYYY")}`
                            : "Selecciona una fecha",
                          error: !!errors.start_date,
                        },
                      }}
                    />
                  );
                }}
              />
            </LocalizationProvider>

            {/* === Botones === */}
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="contained"
                color="error"
                startIcon={<PictureAsPdfIcon />}
                disabled={isSubmitting || !canExport}
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
                disabled={isSubmitting || !canExport}
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
                variant="contained"
                color="success"
                startIcon={<TableChartIcon />}
                disabled={isSubmitting || !canExport}
                sx={{
                  mt: 2,
                  borderRadius: "20px",
                  px: "20px",
                  py: "8px",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                }}
                onClick={handleSubmit((data) => fetchAndExport(data, "xlsx"))}
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
                onClick={handleVolver}
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

export default AuditPlanFilters;