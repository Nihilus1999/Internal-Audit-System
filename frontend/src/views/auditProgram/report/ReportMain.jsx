import { useEffect, useState } from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";
import EvaluateReportTab from "./tabs/EvaluateReportTab";
import KPITab from "./tabs/KPITab";
import { getAuditProgramBySlug } from "@/services/auditProgram/AuditProgram";
import AuditProgram from "@/models/AuditProgram";
import ReportStatusModal from "./ReportStatusModal";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import User from "@/models/User";

const ReportMain = () => {
  const { slug } = useParams();
  const STORAGE_KEY = "report-tab";
  const user = new User(useSelector((state) => state.auth.data));

  const [tabIndex, setTabIndex] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? parseInt(stored, 10) : 0;
  });

  const [openModal, setOpenModal] = useState(false);
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportStatus, setReportStatus] = useState(false);

  useEffect(() => {
    fetchAuditProgram();
    if (reportStatus) setReportStatus(false);
  }, [slug, reportStatus]);

  const hasPermission = (requiredPermissions = []) => {
    if (requiredPermissions.length === 0) return true;
    return requiredPermissions.every((perm) =>
      user._permissions.includes(perm)
    );
  };

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

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
    localStorage.setItem(STORAGE_KEY, newValue.toString());
  };

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const renderTabContent = () => {
    switch (tabIndex) {
      case 0:
        return <EvaluateReportTab />;
      case 1:
        return <KPITab />;
      default:
        return null;
    }
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

  return (
    <Box sx={{ mb: 2, p: 2 }}>
      {/* Título + Botón */}
      <Box mb={2}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems={{ xs: "center", sm: "flex-start" }}
          flexDirection={{ xs: "column", sm: "row" }}
          textAlign={{ xs: "center", sm: "left" }}
          gap={1}
        >
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Reporte - {program.name}
            </Typography>
            <Typography variant="h6" fontWeight="bold" color="black" mt={0.5}>
              Estatus:{" "}
              <Box
                component="span"
                sx={{
                  color: program._reporting_status_color || "text.primary",
                  fontWeight: "bold",
                }}
              >
                {program.reporting_status}
              </Box>
            </Typography>
          </Box>
          {hasPermission(["update.report.audit_program", "update.status.audit_program"]) && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpenModal}
              sx={{
                borderRadius: "20px",
                px: "20px",
                py: "8px",
                fontWeight: "bold",
                textTransform: "uppercase",
                mt: { xs: 2, sm: 0 },
                alignSelf: { xs: "center", sm: "flex-start" },
              }}
            >
              Gestionar Status
            </Button>
          )}
        </Box>
      </Box>

      {/* Tabs */}
      <Tabs
        value={tabIndex}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        centered
        sx={{ borderBottom: 1, borderColor: "divider" }}
      >
        <Tab label="Informe de resultados" sx={{ fontWeight: "bold" }} />
        <Tab label="Indicadores / Dashboard" sx={{ fontWeight: "bold" }} />
      </Tabs>

      {/* Contenido de la pestaña activa */}
      {renderTabContent()}

      {/* Modal */}
      <ReportStatusModal
        open={openModal}
        onClose={handleCloseModal}
        onStatusSuccess={() => setReportStatus(true)}
      />
    </Box>
  );
};

export default ReportMain;
