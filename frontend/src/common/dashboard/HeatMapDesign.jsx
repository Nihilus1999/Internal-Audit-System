import { Box, Typography } from "@mui/material";
import Chart from "react-apexcharts";

/**
 * Función para generar las opciones del heatmap en ApexCharts.
 */
export const getHeatmapOptions = (data, tittle) => ({
  chart: {
    type: "heatmap",
    toolbar: { show: false },
  },
  title: {
    text: tittle,
    align: "center",
    margin: 10,
    offsetX: 30,
    style: {
      fontSize: "16px",
      fontWeight: "bold",
      color: "#000",
    },
  },
  legend: {
    show: true,
    position: "bottom",
    horizontalAlign: "center",
    offsetY: 25,
    offsetX: 47,
    fontSize: "15px",
    fontWeight: 550,
    labels: {
      colors: "#000", // letras en negro
    },
    itemMargin: {
      horizontal: 12,
      vertical: 4,
    },
    markers: {
      offsetX: -4, // separa el cuadrito del texto
    },
  },
  dataLabels: {
    enabled: true,
    formatter: function (val, opts) {
      const metadata =
        opts.w.config.series[opts.seriesIndex].data[opts.dataPointIndex].meta;
      return `${metadata.total_count} procesos`;
    },
    style: { fontSize: "14px", colors: ["#000"] },
  },
  tooltip: {
    shared: true,
    intersect: false,
    custom: function ({ seriesIndex, dataPointIndex }) {
      const metadata = data[seriesIndex].data[dataPointIndex].metadata;
      const items = metadata.processes
        ? metadata.processes.split(", ").filter((p) => p.trim() !== "")
        : [];

      if (!items.length) {
        return `
        <div style="
          padding: 8px;
          font-family: Roboto, sans-serif;
          font-size: 14px;
        ">
          Sin procesos
        </div>`;
      }

      return `
      <div style="
        background-color: #fff;
        color: #000;
        padding: 12px;
        border-radius: 8px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        font-family: Roboto, sans-serif;
        font-size: 14px;
        max-width: 250px;
      ">
        <div style="font-weight: 600; margin-bottom: 6px;">Procesos:</div>
        ${items
          .map((item) => `<div style="margin-bottom: 4px;">• ${item}</div>`)
          .join("")}
      </div>`;
    },
  },

  plotOptions: {
    heatmap: {
      colorScale: {
        ranges: [
          { from: 0, to: 1.5, color: "#008000", name: "Bajo" },
          { from: 2, to: 2.4, color: "#FFA500", name: "Medio" },
          { from: 2.5, to: 3, color: "#FF0000", name: "Alto" },
        ],
      },
    },
  },
  xaxis: {
    labels: { style: { fontWeight: "bold", fontSize: "13.5px" }, padding: 150 },
    title: {
      text: "Impacto",
      style: { fontWeight: "bold", color: "#000", fontSize: "16px" },
    },
    axisBorder: {
      show: true,
      color: "#000",
      offsetY: 5,
    },
  },
  yaxis: {
    labels: {
      minWidth: 48,
      offsetX: -3,
      style: { fontWeight: "bold", fontSize: "13.5px" },
    },
    title: {
      text: "Probabilidad",
      rotate: -90,
      style: { fontWeight: "bold", color: "#000", fontSize: "16px" },
      offsetX: -14,
      offsetY: 2,
    },
    axisBorder: {
      show: true,
      color: "#000",
      offsetX: -3,
    },
  },
});

/**
 * Función para generar las series para el heatmap.
 */
export const generateHeatmapSeries = (data) =>
  data.map((row) => ({
    name: row.key,
    data: row.data.map((cell) => ({
      x: cell.key,
      y: cell.data,
      meta: cell.metadata,
    })),
  }));

/**
 * Componente reutilizable HeatMapChart con leyenda personalizada.
 */
const HeatMapChart = ({ data, height, widht, tittle }) => {
  const options = getHeatmapOptions(data, tittle);
  const series = generateHeatmapSeries(data);

  return (
    <Box
      sx={{
        position: "relative",
        width: 550,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Chart
        options={options}
        series={series}
        type="heatmap"
        height={height}
        width={widht}
      />
    </Box>
  );
};

export default HeatMapChart;
