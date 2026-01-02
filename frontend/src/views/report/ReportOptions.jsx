import React from "react";
import { Box, Paper, Typography, Stack, Button } from "@mui/material";
import AssessmentIcon from "@mui/icons-material/Assessment";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";
import { Link as RouterLink } from "react-router-dom";

const ReportOptions = () => {
  return (
    <Box display="flex" justifyContent="center" alignItems="flex-start">
      <Paper elevation={10} sx={{ padding: 4, width: 500 }}>
        <Stack spacing={3} alignItems="center">
          <Typography variant="h4" fontWeight="bold" textAlign="center">
            Reportes de Auditoría
          </Typography>

          <Button
            component={RouterLink}
            to="/report-audit-programs/risk-matrix-general-report"
            variant="contained"
            fullWidth
            startIcon={<WarningAmberIcon />}
            sx={{
              borderRadius: "20px",
              px: 2,
              py: 1.5,
              fontWeight: "bold",
              textTransform: "uppercase",
              fontSize: "0.95rem",
              boxShadow: 3,
              "&:hover": { boxShadow: 6 },
            }}
          >
            Matriz de Riesgos General
          </Button>

          <Button
            component={RouterLink}
            to="/report-audit-programs/risk-matrix-audit-program-report"
            variant="contained"
            fullWidth
            startIcon={<WarningAmberIcon />}
            sx={{
              borderRadius: "20px",
              px: 2,
              py: 1.5,
              fontWeight: "bold",
              textTransform: "uppercase",
              fontSize: "0.95rem",
              boxShadow: 3,
              "&:hover": { boxShadow: 6 },
            }}
          >
            Matriz de Riesgos por programa de Auditoría
          </Button>

          <Button
            component={RouterLink}
            to="/report-audit-programs/budget-hours-report"
            variant="contained"
            fullWidth
            startIcon={<AccessTimeFilledIcon />}
            sx={{
              borderRadius: "20px",
              px: 2,
              py: 1.5,
              fontWeight: "bold",
              textTransform: "uppercase",
              fontSize: "0.95rem",
              boxShadow: 3,
              "&:hover": { boxShadow: 6 },
            }}
          >
            Presupuesto de Horas
          </Button>

          <Button
            component={RouterLink}
            to="/report-audit-programs/audit-plan-report"
            variant="contained"
            fullWidth
            startIcon={<AssignmentTurnedInIcon />}
            sx={{
              borderRadius: "20px",
              px: 2,
              py: 1.5,
              fontWeight: "bold",
              textTransform: "uppercase",
              fontSize: "0.95rem",
              boxShadow: 3,
              "&:hover": { boxShadow: 6 },
            }}
          >
            Plan de Auditoría
          </Button>

          <Button
            component={RouterLink}
            to="/report-audit-programs/audit-results-report"
            variant="contained"
            fullWidth
            startIcon={<AssessmentIcon />}
            sx={{
              borderRadius: "20px",
              px: 2,
              py: 1.5,
              fontWeight: "bold",
              textTransform: "uppercase",
              fontSize: "0.95rem",
              boxShadow: 3,
              "&:hover": { boxShadow: 6 },
            }}
          >
            Informe de Resultados de Auditoría
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default ReportOptions;
