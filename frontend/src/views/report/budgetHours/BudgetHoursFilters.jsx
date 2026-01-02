// BudgetHoursFilters.jsx
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
import { getBudgetHours } from "@/services/Report";
import {
  getFiscalYears,
  getAuditPrograms,
  getAuditProgramBySlug, // <--- usamos este endpoint para roles/usuarios vía slug
} from "@/services/auditProgram/AuditProgram";
import { GenerateBudgetHoursPDF } from "./GenerateBudgetHoursPDF";
import { GenerateBudgetHoursDOCX } from "./GenerateBudgetHoursDOCX";
import { GenerateBudgetHoursXLSX } from "./GenerateBudgetHoursXLSX";

const Items_Page = 1000;

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

const BudgetHoursFilters = () => {
  const navigate = useNavigate();

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [warning, setWarning] = useState("");
  const [success, setSuccess] = useState("");

  const [fiscalYears, setFiscalYears] = useState([]);
  const [loadingYears, setLoadingYears] = useState(false);

  const [programs, setPrograms] = useState([]);
  const [loadingPrograms, setLoadingPrograms] = useState(false);

  // Estados para roles/usuarios derivados del detalle por slug
  const [roles, setRoles] = useState([]); // [{ id, name }]
  const [users, setUsers] = useState([]); // [{ value, label }]
  const [loadingProgramDetail, setLoadingProgramDetail] = useState(false);

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
      role: "",
      user_name: "",
    },
  });

  const selectedYear = watch("fiscal_year");
  const selectedProgram = watch("name");

  // === Años fiscales ===
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

  // === Programas por año ===
  useEffect(() => {
    // limpiar selecciones dependientes
    setValue("name", "");
    setValue("role", "");
    setValue("user_name", "");
    setPrograms([]);
    setRoles([]);
    setUsers([]);

    if (!selectedYear) return;

    const fetchProgramsByYear = async () => {
      setLoadingPrograms(true);
      try {
        const data = await getAuditPrograms(0, Items_Page, selectedYear);
        const list = (data?.data || []).map((p) => p?.name).filter(Boolean);
        list.sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));
        setPrograms(list);
      } catch {
        setWarning("Error al cargar los programas");
        setSnackbarOpen(true);
      } finally {
        setLoadingPrograms(false);
      }
    };

    fetchProgramsByYear();
  }, [selectedYear, setValue]);

  // === Detalle del programa por slug (cuando ya hay año + programa)
  useEffect(() => {
    // limpiar cuando cambie el programa
    setValue("role", "");
    setValue("user_name", "");
    setRoles([]);
    setUsers([]);

    if (!selectedYear || !selectedProgram) return;

    const fetchProgramDetail = async () => {
      setLoadingProgramDetail(true);
      try {
        const slug = buildSlug(selectedProgram, selectedYear);
        const detail = await getAuditProgramBySlug(slug);

        // Usuarios (nombre completo)
        const programUsers = Array.isArray(detail?.users) ? detail.users : [];
        const userOptions = programUsers
          .map((u) => {
            const fullName = [u?.first_name, u?.last_name]
              .filter(Boolean)
              .join(" ")
              .trim();
            return fullName ? { value: fullName, label: fullName } : null;
          })
          .filter(Boolean)
          .sort((a, b) =>
            a.label.localeCompare(b.label, "es", { sensitivity: "base" })
          );

        setUsers(userOptions);

        // Roles (nombre desde u.role?.name)
        const roleNames = [
          ...new Set(
            programUsers
              .map((u) => u?.role?.name)
              .filter((n) => typeof n === "string" && n.trim().length > 0)
          ),
        ].sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));

        // Guardamos como [{ id, name }] aunque no usemos id aquí
        setRoles(roleNames.map((name) => ({ id: name, name })));
      } catch {
      } finally {
        setLoadingProgramDetail(false);
      }
    };

    fetchProgramDetail();
  }, [selectedYear, selectedProgram, setValue]);

  // === Habilitar exportación ===
  const canExport = useMemo(
    () => Boolean(selectedYear && selectedProgram),
    [selectedYear, selectedProgram]
  );

  // === Exportar ===
  const fetchAndExport = async (
    { name, fiscal_year, role, user_name },
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

      const fy =
        typeof fiscal_year === "string" ? Number(fiscal_year) : fiscal_year;
      const data = await getBudgetHours(name, fy, role, user_name);

      const hasUsers = Array.isArray(data?.users) && data.users.length > 0;
      if (!data || !hasUsers) {
        setWarning("No se encontraron registros con los filtros aplicados.");
        setSnackbarOpen(true);
        return;
      }

      if (format === "pdf") {
        await GenerateBudgetHoursPDF(data);
        setSuccess("El archivo PDF se descargó correctamente");
      } else if (format === "docx") {
        await GenerateBudgetHoursDOCX(data);
        setSuccess("El archivo Word se descargó correctamente");
      } else if (format === "xlsx") {
        await GenerateBudgetHoursXLSX(data);
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
      <Paper elevation={10} sx={{ padding: 4, width: 520 }}>
        <form onSubmit={handleSubmit(() => {})} noValidate>
          <Stack spacing={4}>
            <Typography variant="h5" fontWeight="bold" textAlign="center">
              Filtros para Generar Reporte de Presupuesto de Horas
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
            >
              Los campos <strong>Nombre del Programa</strong> y{" "}
              <strong>Año Fiscal</strong> son obligatorios para generar el
              reporte. Los demás filtros son opcionales y pueden utilizarse
              únicamente si se desea obtener información más específica.
            </Typography>

            {/* === Año Fiscal (requerido) === */}
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
                        <Stack direction="row" gap={1} alignItems="center">
                          <CircularProgress size={18} /> Cargando años...
                        </Stack>
                      </MenuItem>
                    ) : fiscalYears.length === 0 ? (
                      <MenuItem disabled>
                        No hay años fiscales disponibles
                      </MenuItem>
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

            {/* === Programa (requerido) === */}
            <FormControl
              fullWidth
              disabled={!selectedYear}
              error={!!errors.name}
            >
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
                        <Stack direction="row" gap={1} alignItems="center">
                          <CircularProgress size={18} /> Cargando programas...
                        </Stack>
                      </MenuItem>
                    ) : programs.length === 0 ? (
                      <MenuItem disabled>
                        No hay programas para el año seleccionado
                      </MenuItem>
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

            {/* === Título de sección: Campos no requeridos === */}
            <Typography
              variant="h6"
              fontWeight="bold"
              textAlign="center"
              sx={{ mt: 1 }}
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

            {/* === Rol (no requerido) — desde auditProgramBySlug -> users[*].role.name === */}
            <FormControl
              fullWidth
              disabled={!selectedProgram || loadingProgramDetail}
            >
              <InputLabel id="role-label">Rol</InputLabel>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select
                    labelId="role-label"
                    label="Rol"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    disabled={!roles.length || loadingProgramDetail}
                  >
                    {loadingProgramDetail ? (
                      <MenuItem disabled>
                        <Stack direction="row" gap={1} alignItems="center">
                          <CircularProgress size={18} /> Cargando roles...
                        </Stack>
                      </MenuItem>
                    ) : roles.length === 0 ? (
                      <MenuItem disabled>No hay roles asociados</MenuItem>
                    ) : (
                      [
                        <MenuItem key="__all_roles__" value="">
                          <em>Sin selección</em>
                        </MenuItem>,
                        ...roles.map((r) => (
                          <MenuItem key={r.name} value={r.name}>
                            {r.name}
                          </MenuItem>
                        )),
                      ]
                    )}
                  </Select>
                )}
              />
            </FormControl>

            {/* === Usuario (no requerido) — desde auditProgramBySlug === */}
            <FormControl
              fullWidth
              disabled={!selectedProgram || loadingProgramDetail}
            >
              <InputLabel id="user-label">Usuario</InputLabel>
              <Controller
                name="user_name"
                control={control}
                render={({ field }) => (
                  <Select
                    labelId="user-label"
                    label="Usuario"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    disabled={!users.length || loadingProgramDetail}
                  >
                    {loadingProgramDetail ? (
                      <MenuItem disabled>
                        <Stack direction="row" gap={1} alignItems="center">
                          <CircularProgress size={18} /> Cargando usuarios...
                        </Stack>
                      </MenuItem>
                    ) : users.length === 0 ? (
                      <MenuItem disabled>No hay usuarios asociados</MenuItem>
                    ) : (
                      [
                        <MenuItem key="__all_users__" value="">
                          <em>Sin selección</em>
                        </MenuItem>,
                        ...users.map((u) => (
                          <MenuItem key={u.value} value={u.value}>
                            {u.label}
                          </MenuItem>
                        )),
                      ]
                    )}
                  </Select>
                )}
              />
            </FormControl>

            {/* === Botones === */}
            <Stack direction="row" justifyContent="center" spacing={2}>
              <Button
                variant="contained"
                color="error"
                startIcon={<PictureAsPdfIcon />}
                disabled={!canExport || isSubmitting || loadingProgramDetail}
                onClick={handleSubmit((d) => fetchAndExport(d, "pdf"))}
                sx={{
                  mt: 2,
                  borderRadius: "20px",
                  px: "20px",
                  py: "8px",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                }}
              >
                PDF
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<DescriptionIcon />}
                disabled={!canExport || isSubmitting || loadingProgramDetail}
                onClick={handleSubmit((d) => fetchAndExport(d, "docx"))}
                sx={{
                  mt: 2,
                  borderRadius: "20px",
                  px: "20px",
                  py: "8px",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                }}
              >
                Word
              </Button>
              <Button
                variant="contained"
                color="success"
                startIcon={<TableChartIcon />}
                disabled={!canExport || isSubmitting || loadingProgramDetail}
                onClick={handleSubmit((d) => fetchAndExport(d, "xlsx"))}
                sx={{
                  mt: 2,
                  borderRadius: "20px",
                  px: "20px",
                  py: "8px",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                }}
              >
                Excel
              </Button>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() =>
                  navigate("/report-audit-programs/report-options")
                }
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

      {/* === Snackbar === */}
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

export default BudgetHoursFilters;
