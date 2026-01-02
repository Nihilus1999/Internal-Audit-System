import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  CircularProgress,
  Snackbar,
  Alert,
  Typography,
  Paper,
} from "@mui/material";
import { PieChart, BarChart } from "@mui/x-charts";
import { emptyPieChartReport, emptyCountsReport, emptyBarChartControlReport, emptyBarChartFindingReport } from "@/utils/HelpersLib";
import {
  getReportPieChart,
  getReportBarChartFinding,
  getReportBarChartControl,
  getCountsReport,
} from "@/services/Dashboard";
import { set } from "react-hook-form";

const KPITab = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [error, setError] = useState("");
  const [pieChart, setPieChart] = useState([]);
  const [kpi, setKpi] = useState([]);
  const [barChartFinding, setBarChartFinding] = useState([]);
  const [barChartControl, setBarChartControl] = useState([]);
  const { slug } = useParams();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const pieChart = await getReportPieChart(slug);
      setPieChart(pieChart);
      const kpi = await getCountsReport(slug);
      setKpi(kpi);
      const findingsData = await getReportBarChartFinding(slug);
      const barChartFinding = {
        xAxis: [{ data: findingsData.map((item) => item.classification) }],
        series: [
          {
            data: findingsData.map((item) => item.findings),
          },
        ],
      };
      setBarChartFinding(barChartFinding);
      const controlsData = await getReportBarChartControl(slug);
      const barChartControl = {
        xAxis: [{ data: controlsData.map((item) => item.classification) }],
        series: [
          {
            data: controlsData.map((item) => item.controls),
            color: '#9c27b0',
          },
        ],
      };
      setBarChartControl(barChartControl);
    } catch (error) {
      setPieChart(emptyPieChartReport);
      setKpi(emptyCountsReport);
      const barChartFinding = {
        xAxis: [{ data: emptyBarChartFindingReport.map((item) => item.classification) }],
        series: [
          {
            data: emptyBarChartFindingReport.map((item) => item.findings),
          },
        ],
      };
      setBarChartFinding(barChartFinding);
      const barChartControl = {
        xAxis: [{ data: emptyBarChartControlReport.map((item) => item.classification) }],
        series: [
          {
            data: emptyBarChartControlReport.map((item) => item.controls),
          },
        ],
      };
      setBarChartControl(barChartControl);
      setError(error.message || "No se pudo obtener los datos");
      setSnackbarOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
    setError("");
  };

  if (isLoading) {
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
    <>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          mb: 3,
          mt: 3,
        }}
      >
        <Box
          sx={{
            width: "80%",
            height: "80%",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gridTemplateRows: "1fr 1fr",
            gap: 4,
            p: 2,
          }}
        >
          {/* Gráfico 1 */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" mb={1}>
              Hallazgos: Conformes vs No Conformes (%)
            </Typography>
            <PieChart
              series={[
                {
                  data: pieChart.map((item) => ({
                    ...item,
                    color: item.label === "Conformes" ? "#4caf50" : "#f44336", // verde y rojo
                  })),
                  highlightScope: { fade: "global", highlight: "item" },
                  faded: {
                    innerRadius: 30,
                    additionalRadius: -30,
                    color: "gray",
                  },
                },
              ]}
              height={250}
            />
          </Paper>

          {/* Gráfico 2 */}
          {/* Indicadores Clave de Desempeño (KPI) */}
          <Paper sx={{ p: 2 }}>
            <Typography
              variant="h6"
              align="center"
              fontWeight="bold"
              gutterBottom
              mb={3}
            >
              Indicadores Clave de Desempeño (KPI)
            </Typography>

            <Box
              display="grid"
              gridTemplateColumns={{ xs: "1fr", sm: "repeat(3, 1fr)" }}
              gap={2}
            >
              {[
                { label: "Total Hallazgos", value: kpi.total_findings },
                {
                  label: "Hallazgos Conformes",
                  value: kpi.conforming_findings,
                },
                {
                  label: "Hallazgos No Conformes",
                  value: kpi.no_conforming_findings,
                },
                {
                  label: "Hallazgos Críticos (%)",
                  value: kpi.critical_findings_percentage + "%",
                },
                {
                  label: "Controles Deficientes",
                  value: kpi.deficient_controles,
                },
                { label: "Procesos Afectados", value: kpi.affected_processes },
              ].map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    p: 1.5,
                    borderRadius: 2,
                    boxShadow: 1,
                    bgcolor: "#f5f5f5",
                    minHeight: 60,
                    cursor: "default",
                    "&:hover": {
                      backgroundColor: "#e0e0e0",
                    },
                  }}
                >
                  <Box textAlign="center" width="100%">
                    <Typography
                      fontWeight="bold"
                      fontSize="0.9rem"
                      color="black"
                      mb={2}
                    >
                      {item.label}
                    </Typography>
                    <Typography
                      fontWeight="bold"
                      lineHeight={1}
                      fontSize="1.2rem"
                      color="black"
                    >
                      {item.value}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>

          {/* Gráfico 3 */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" mb={1}>
              Clasificacion de hallazgos
            </Typography>
            <BarChart
              xAxis={[
                {
                  ...barChartFinding.xAxis[0],
                  label: "Clasificación",
                  labelStyle: { fontWeight: "bold" },
                },
              ]}
              yAxis={[
                {
                  label: "Cantidad de hallazgos",
                  labelStyle: { fontWeight: "bold" },
                },
              ]}
              series={barChartFinding.series}
              height={250}
            />
          </Paper>

          {/* Gráfico 4 */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" mb={1}>
              Controles: Efectivos vs Deficientes
            </Typography>
            <BarChart
              xAxis={[
                {
                  ...barChartControl.xAxis[0],
                  label: "Clasificación",
                  labelStyle: { fontWeight: "bold" },
                },
              ]}
              yAxis={[
                {
                  label: "Cantidad de hallazgos",
                  labelStyle: { fontWeight: "bold" },
                },
              ]}
              series={barChartControl.series}
              height={250}
            />
          </Paper>
        </Box>
      </Box>

      {/* Snackbar de error */}
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
    </>
  );
};

export default KPITab;
