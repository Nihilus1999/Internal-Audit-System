import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getAuditProgramBySlug } from "@/services/auditProgram/AuditProgram";
import AuditProgramSuspendModal from "@/views/auditProgram/AuditProgramSuspendModal";
import AuditProgramActivateModal from "@/views/auditProgram/AuditProgramActivateModal";
import AuditProgramUsersModal from "@/views/auditProgram/AuditProgramUsersModal";
import AuditProgram from "@/models/AuditProgram";
import {
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  List,
  ListItem,
  ListItemText,
  Snackbar,
  Alert,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { AuditProgramStatusColor } from "@/utils/HelpersLib";
import { useSelector } from "react-redux";
import User from "@/models/User";

export default function AuditProgramDetails() {
  const { slug } = useParams();
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [activateModalOpen, setActivateModalOpen] = useState(false);
  const [usersModalOpen, setUsersModalOpen] = useState(false);
  const [programUpdated, setProgramUpdated] = useState(false);
  const user = new User(useSelector((state) => state.auth.data));

  const hasPermission = (requiredPermissions = []) => {
    if (requiredPermissions.length === 0) return true;
    return requiredPermissions.every((perm) =>
      user._permissions.includes(perm)
    );
  };

  useEffect(() => {
    fetchAuditProgram();
    if (programUpdated) setProgramUpdated(false);
  }, [slug, programUpdated]);

  const fetchAuditProgram = async () => {
    try {
      const data = await getAuditProgramBySlug(slug);
      const auditProgram = new AuditProgram(data);
      setProgram(auditProgram);
    } catch (error) {
      setError(error.message || "Error al obtener los datos del programa.");
      setSnackbarOpen(true);
      setProgram(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
    setError("");
  };

  const handleOpenSuspendModal = () => {
    setSuspendModalOpen(true);
  };

  const handleCloseSuspendModal = () => {
    setSuspendModalOpen(false);
  };

  const handleOpenActivateModal = () => {
    setActivateModalOpen(true);
  };

  const handleCloseActivateModal = () => {
    setActivateModalOpen(false);
  };

  const handleOpenUsersModal = () => {
    setUsersModalOpen(true);
  };

  const handleCloseUsersModal = () => {
    setUsersModalOpen(false);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!program) {
    return (
      <Box p={3}>
        <Typography variant="h6" color="error" align="center">
          No se pudieron cargar los datos del programa.
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Box
        sx={{
          width: "100%",
          minWidth: 1000,
          overflowX: isSmallScreen ? "visible" : "auto",
        }}
      >
        <Box
          p={3}
          sx={{
            minWidth: isSmallScreen ? "100%" : 600,
            transition: "margin-left 0.3s ease",
            overflow: "hidden",
            width: "95%",
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

          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
            flexWrap="wrap"
            gap={1}
          >
            <Typography
              variant="h4"
              fontWeight="bold"
              flex="1 1 auto"
              minWidth={250}
            >
              {program.name} - FY {program.fiscal_year}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: isSmallScreen ? "column" : "row",
              gap: 3,
            }}
          >
            <Paper
              elevation={3}
              sx={{
                flexGrow: 1,
                flexShrink: 1,
                flexBasis: isSmallScreen ? "100%" : "auto",
                maxWidth: isSmallScreen ? "100%" : "calc(100% - 360px)",
                maxHeight: 900,
                p: 4,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Typography
                variant="h6"
                align="center"
                fontWeight="bold"
                gutterBottom
              >
                Información general del programa de auditoría
              </Typography>

              <Box
                sx={{
                  flexGrow: 1,
                  overflowY: "auto",
                  pr: 1,
                }}
              >
                <Typography mt={0} fontWeight="bold" gutterBottom>
                  Objetivos:
                </Typography>
                <Typography>{program.objectives}</Typography>

                <Typography mt={2} fontWeight="bold" gutterBottom>
                  Alcance:
                </Typography>
                <Typography>{program.scope}</Typography>

                <Typography mt={2} fontWeight="bold" gutterBottom>
                  Criterios de Evaluación:
                </Typography>
                <Typography>{program.evaluation_criteria}</Typography>
              </Box>

              <Box pt={2} display="flex" justifyContent="center" gap={2}>
                {hasPermission(["update.audit_program"]) && (
                  <Button
                    component={Link}
                    to={`/audit-programs/manage-audit-programs/edit-program/${slug}`}
                    variant="contained"
                    color="success"
                    size="medium"
                    sx={{
                      borderRadius: "20px",
                      px: "20px",
                      py: "8px",
                      fontWeight: "bold",
                      textTransform: "uppercase",
                    }}
                  >
                    Editar detalles
                  </Button>
                )}
                {program.status !== "Suspendido"
                  ? hasPermission(["update.audit_program"]) && (
                      <Button
                        variant="contained"
                        color="error"
                        size="medium"
                        sx={{
                          borderRadius: "20px",
                          px: "20px",
                          py: "8px",
                          fontWeight: "bold",
                          textTransform: "uppercase",
                        }}
                        onClick={handleOpenSuspendModal}
                      >
                        Suspender programa
                      </Button>
                    )
                  : hasPermission(["update.audit_program"]) && (
                      <Button
                        variant="contained"
                        color="primary"
                        size="medium"
                        sx={{
                          borderRadius: "20px",
                          px: "20px",
                          py: "8px",
                          fontWeight: "bold",
                          textTransform: "uppercase",
                        }}
                        onClick={handleOpenActivateModal}
                      >
                        Activar Programa
                      </Button>
                    )}
              </Box>
            </Paper>

            <Box
              sx={{
                width: isSmallScreen ? "100%" : 420,
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                gap: 3,
                height: "100%",
              }}
            >
              <Paper
                elevation={3}
                sx={{
                  flex: 1,
                  p: 3,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  gap={1}
                  mb={2}
                >
                  <Typography variant="h6" fontWeight="bold">
                    Estatus del Programa
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    -
                  </Typography>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{
                      color: AuditProgramStatusColor[program.status] || "#000",
                    }}
                  >
                    {program.status}
                  </Typography>
                </Box>
                <Stack spacing={2} flexGrow={1} sx={{ mt: 2 }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography fontWeight="bold">
                      Planificación:{"  "}
                      <Box
                        component="span"
                        sx={{
                          color:
                            program._planning_status_color || "text.primary",
                          fontWeight: "bold",
                          ml: 1,
                        }}
                      >
                        {program.planning_status}
                      </Box>
                    </Typography>

                    <Box sx={{ minWidth: 140 }}>
                      {hasPermission(["update.planning.audit_program"]) && (
                        <Button
                          component={Link}
                          to={`/audit-programs/manage-audit-programs/planning/${slug}`}
                          variant="contained"
                          color="primary"
                          size="small"
                          disabled={program.status === "Suspendido"}
                          sx={{
                            borderRadius: "20px",
                            px: "20px",
                            py: "8px",
                            fontWeight: "bold",
                            textTransform: "uppercase",
                            whiteSpace: "nowrap",
                          }}
                        >
                          Planificación
                        </Button>
                      )}
                    </Box>
                  </Stack>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography fontWeight="bold">
                      Ejecución:{"  "}
                      <Box
                        component="span"
                        sx={{
                          color:
                            program._execution_status_color || "text.primary",
                          fontWeight: "bold",
                          ml: 1,
                        }}
                      >
                        {program.execution_status}
                      </Box>
                    </Typography>
                    <Box sx={{ minWidth: 140 }}>
                      {hasPermission(["update.execution.audit_program"]) && (
                        <Button
                          component={Link}
                          to={`/audit-programs/manage-audit-programs/execution/${slug}`}
                          variant="contained"
                          color="error"
                          size="small"
                          disabled={
                            program.status === "Suspendido" ||
                            program.planning_status !== "Completado"
                          }
                          sx={{
                            borderRadius: "20px",
                            px: "20px",
                            py: "8px",
                            fontWeight: "bold",
                            textTransform: "uppercase",
                            whiteSpace: "nowrap",
                          }}
                        >
                          Ejecución
                        </Button>
                      )}
                    </Box>
                  </Stack>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography fontWeight="bold">
                      Reporte:{"  "}
                      <Box
                        component="span"
                        sx={{
                          color:
                            program._reporting_status_color || "text.primary",
                          fontWeight: "bold",
                          ml: 1,
                        }}
                      >
                        {program.reporting_status}
                      </Box>
                    </Typography>
                    <Box sx={{ minWidth: 140 }}>
                      {hasPermission(["update.report.audit_program"]) && (
                        <Button
                          component={Link}
                          to={`/audit-programs/manage-audit-programs/report/${slug}`}
                          variant="contained"
                          size="small"
                          disabled={
                            program.status === "Suspendido" ||
                            program.planning_status !== "Completado" ||
                            program.execution_status !== "Completado"
                          }
                          sx={{
                            backgroundColor: "#9c27b0",
                            color: "white",
                            borderRadius: "20px",
                            px: "20px",
                            py: "8px",
                            fontWeight: "bold",
                            textTransform: "uppercase",
                            whiteSpace: "nowrap",
                            "&:hover": {
                              backgroundColor: "#7b1fa2",
                            },
                          }}
                        >
                          Reporte
                        </Button>
                      )}
                    </Box>
                  </Stack>
                </Stack>

                <Box mt={3} display="flex" justifyContent="center" gap={4}>
                  <Typography>
                    <b>Inicio del período auditado:</b>{" "}
                    {program._audit_start_date}
                  </Typography>
                  <Typography>
                    <b>Fin del período auditado:</b> {program._audit_end_date}
                  </Typography>
                </Box>
              </Paper>

              <Paper
                elevation={3}
                sx={{
                  flex: 1,
                  p: 3,
                  overflowY: "auto",
                  maxHeight: 200,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Typography
                  variant="h6"
                  align="center"
                  fontWeight="bold"
                  gutterBottom
                >
                  Participantes en el programa
                </Typography>

                <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
                  <List>
                    {program.users.map((user) => (
                      <ListItem key={user.id} divider>
                        <ListItemText
                          primary={`${user.first_name} ${user.last_name}`}
                          secondary={user.role.name}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>

                <Box mt={2} display="flex" justifyContent="center">
                  {hasPermission(["update.planning.audit_program"]) && (
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      disabled={program.status === "Suspendido"}
                      onClick={handleOpenUsersModal}
                      sx={{
                        borderRadius: "20px",
                        px: "20px",
                        py: "8px",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                      }}
                    >
                      Editar participantes
                    </Button>
                  )}
                </Box>
              </Paper>
            </Box>
          </Box>
        </Box>
      </Box>

      <AuditProgramSuspendModal
        open={suspendModalOpen}
        onClose={handleCloseSuspendModal}
        onSuspendSuccess={() => setProgramUpdated(true)}
      />
      <AuditProgramActivateModal
        open={activateModalOpen}
        onClose={handleCloseActivateModal}
        onActivateSuccess={() => setProgramUpdated(true)}
      />
      <AuditProgramUsersModal
        open={usersModalOpen}
        onClose={handleCloseUsersModal}
        onUserSuccess={() => setProgramUpdated(true)}
      />
    </>
  );
}
