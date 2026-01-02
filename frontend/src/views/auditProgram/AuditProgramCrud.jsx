import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Typography,
  IconButton,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Alert,
  Pagination,
  Snackbar,
  Stack,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { Link } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import {
  getAuditPrograms,
  getFiscalYears,
} from "@/services/auditProgram/AuditProgram";
import { getProcess } from "@/services/Company";
import AuditProgram from "@/models/AuditProgram";
import { useSelector } from "react-redux";
import User from "@/models/User";

const AuditProgramStatusColor = {
  "En planificación": "#2962FF", // Azul
  "En ejecución": "#FB8C00", // Naranja
  "En progreso": "#FFD600", // Amarillo
  "Completado": "#388E3C", // Verde
  "Por iniciar": "#616161", // Gris
  "Suspendido": "#D32F2F", // Rojo fuerte
  "En reporte": "#9c27b0", // Morado
};

const Items_Page = 9;

const AuditProgramCrud = () => {
  const [programs, setPrograms] = useState([]);
  const [fiscalYears, setFiscalYears] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedProcess, setSelectedProcess] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const user = new User(useSelector((state) => state.auth.data));

  const hasPermission = (requiredPermissions = []) => {
    if (requiredPermissions.length === 0) return true;
    return requiredPermissions.every((perm) =>
      user._permissions.includes(perm)
    );
  };

  useEffect(() => {
    const loadFiscalYears = async () => {
      try {
        const years = await getFiscalYears();
        setFiscalYears(years);
      } catch (error) {
        setError("Error al cargar los años fiscales");
        setSnackbarOpen(true);
      }
    };

    const loadProcesses = async () => {
      try {
        const data = await getProcess();
        setProcesses(data);
      } catch (error) {
        setError("Error al cargar los procesos");
        setSnackbarOpen(true);
      }
    };

    loadFiscalYears();
    loadProcesses();
  }, []);

  useEffect(() => {
    fetchPrograms();
  }, [page, selectedYear, selectedProcess, Items_Page]);

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const skip = (page - 1) * Items_Page;
      const data = await getAuditPrograms(
        skip,
        Items_Page,
        selectedYear,
        selectedProcess
      );
      const auditPrograms = data.data.map((ap) => new AuditProgram(ap));
      setPrograms(auditPrograms);
      setTotalCount(data.count);
    } catch (error) {
      setError(error.message || "Error desconocido");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
    setError("");
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
    setPage(1);
  };

  const handleProcessChange = (event) => {
    setSelectedProcess(event.target.value);
    setPage(1);
  };

  const totalPages = Math.ceil(totalCount / Items_Page);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        backgroundColor: "#4a4a4a",
        border: "1px solid #444",
        borderRadius: 2,
        p: 3,
        maxWidth: "100%",
        margin: "0 auto",
      }}
    >
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        {error && (
          <Alert severity="error" sx={{ fontWeight: "bold" }}>
            {error}
          </Alert>
        )}
      </Snackbar>

      {/* Header */}
      <Grid
        container
        direction={{ xs: "column", sm: "row" }}
        alignItems="center"
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 2, textAlign: { xs: "center", sm: "left" } }}
      >
        <Grid>
          <Typography
            fontWeight="bold"
            sx={{
              fontSize: { xs: "28px", sm: "36px" },
              color: "#ffffff",
              ml: { xs: 0, md: 6 },
            }}
          >
            Consultores J.D.G - Programas de Auditoría
          </Typography>
        </Grid>

        <Grid
          sx={{
            display: "flex",
            justifyContent: { xs: "center", sm: "flex-end" },
            mr: { xs: 0, md: 6 },
          }}
        >
          {hasPermission(['create.audit_program']) && (
            <IconButton
              component={Link}
              to={"/audit-programs/manage-audit-programs/create"}
              sx={{
                backgroundColor: "#ffffff",
                color: "#000000",
                borderRadius: "16px",
                "&:hover": {
                  backgroundColor: "#f0f0f0",
                },
              }}
            >
              <AddIcon sx={{ fontSize: "36px" }} />
            </IconButton>
          )}
        </Grid>
      </Grid>

      {/* Contenedor de filtros (años fiscales y procesos) */}
      <Box
        sx={{
          display: "flex",
          justifyContent: { xs: "center", md: "flex-start" },
          mt: 1,
          mb: 4,
          px: { xs: 2, md: 6 },
          gap: 4,
          flexWrap: "wrap",
        }}
      >
        {/* Combo Box de años fiscales */}
        <FormControl
          variant="standard"
          sx={{
            minWidth: 150,
            "& .MuiInputBase-root": {
              color: "white",
              fontWeight: "bold",
            },
            "& .MuiInput-underline:before": {
              borderBottomColor: "#ccc",
            },
            "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
              borderBottomColor: "#ccc",
            },
            "& .MuiInput-underline:after": {
              borderBottomColor: "#ccc",
            },
            "& .MuiSvgIcon-root": {
              color: "white",
            },
            "& .MuiInputLabel-root": {
              color: "white",
              fontWeight: "bold",
            },
          }}
        >
          <InputLabel id="fiscal-year-label">Año Fiscal</InputLabel>
          <Select
            labelId="fiscal-year-label"
            id="fiscal-year"
            value={selectedYear}
            onChange={handleYearChange}
            label="Año Fiscal"
          >
            <MenuItem value="">
              <em>Todos</em>
            </MenuItem>
            {fiscalYears.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Combo Box de procesos */}
        <FormControl
          variant="standard"
          sx={{
            minWidth: 200,
            "& .MuiInputBase-root": {
              color: "white",
              fontWeight: "bold",
            },
            "& .MuiInput-underline:before": {
              borderBottomColor: "#ccc",
            },
            "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
              borderBottomColor: "#ccc",
            },
            "& .MuiInput-underline:after": {
              borderBottomColor: "#ccc",
            },
            "& .MuiSvgIcon-root": {
              color: "white",
            },
            "& .MuiInputLabel-root": {
              color: "white",
              fontWeight: "bold",
            },
          }}
        >
          <InputLabel id="process-label">Procesos</InputLabel>
          <Select
            labelId="process-label"
            id="process"
            value={selectedProcess}
            onChange={handleProcessChange}
            label="Proceso"
          >
            <MenuItem value="">
              <em>Todos</em>
            </MenuItem>
            {processes.map((proc) => (
              <MenuItem key={proc.id} value={proc.id}>
                {proc.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Cards o mensaje de vacío */}
      {programs.length === 0 ? (
        <Box
          sx={{
            mt: 4,
            textAlign: "center",
            color: "white",
            fontWeight: "bold",
            px: { xs: 2, md: 6 },
          }}
        >
          <Typography variant="h6">No hay programas de auditoria.</Typography>
        </Box>
      ) : (
        <Grid
          container
          spacing={2}
          columns={{ xs: 12, sm: 12, md: 12 }}
          px={{ xs: 2, md: 6 }}
        >
          {programs.map((program) => (
            <Grid key={program.id}>
              <Card
                sx={{
                  backgroundColor: "#ffffff",
                  borderRadius: 3,
                  boxShadow: 3,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  width: 330,
                  margin: "0 auto",
                }}
              >
                <CardContent
                  sx={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                  }}
                >
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    gutterBottom
                    sx={{ fontSize: "20px" }}
                  >
                    {program.name}
                  </Typography>

                  <Typography
                    variant="body1"
                    fontWeight="bold"
                    sx={{ mb: 1, fontSize: "16px", color: "#e91e63" }}
                  >
                    FY-{program.fiscal_year}
                  </Typography>

                  <Typography
                    variant="body1"
                    fontWeight="bold"
                    sx={{
                      color: AuditProgramStatusColor[program.status] || "#000",
                      fontSize: "16px",
                    }}
                  >
                    {program.status}
                  </Typography>

                  <Box mt={2}>
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      color="text.secondary"
                    >
                      Fecha de inicio: {program._start_date}
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      color="text.secondary"
                      mt={1}
                    >
                      Fecha de fin: {program._end_date}
                    </Typography>
                  </Box>
                </CardContent>

                <CardActions sx={{ px: 2, pb: 2 }}>
                  <Button
                    size="small"
                    variant="contained"
                    fullWidth
                    component={Link}
                    sx={{
                      borderRadius: "20px",
                      px: "20px",
                      py: "8px",
                      fontWeight: "bold",
                      textTransform: "uppercase",
                    }}
                    to={`/audit-programs/manage-audit-programs/details-program/${program.slug}`}
                  >
                    Ver detalles
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Paginación */}
      <Stack
        spacing={3}
        sx={{
          marginTop: 5,
          justifyContent: "center",
          alignItems: "center",
          color: "white",
        }}
      >
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          color="primary"
          size="large"
          sx={{
            "& .MuiPaginationItem-root": {
              color: "white",
            },
            "& .MuiPaginationItem-icon": {
              color: "white",
            },
          }}
        />
      </Stack>
    </Box>
  );
};

export default AuditProgramCrud;
