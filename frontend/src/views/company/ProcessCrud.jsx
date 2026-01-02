import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Box, Button, CircularProgress, Snackbar, Alert } from "@mui/material";
import { getProcess } from "@/services/Company";
import TableDesign from "@/common/template/TableDesign";
import Process from "@/models/Process";
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import { statusOptions } from "@/utils/HelpersLib";

const ProcessCrud = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const limitPage = 10;

  useEffect(() => {
    fetchProcess();
  }, []);

  const fetchProcess = async () => {
    try {
      const data = await getProcess();
      const process = data.map((item) => new Process(item));
      const processRows = process.map((item) => ({
        id: item.slug,
        Nombre: item.name,
        Objetivo: item.objective,
        Fecha: item._updated_at,
        Estado: item._status,
      }));
      setRows(processRows);
    } catch (error) {
      setError(error.message || "No se pudo obtener los datos");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
    setError("");
  };

  const columns = [
    {
      field: "Nombre",
      flex: 1,
      minWidth: 150,
      headerAlign: "center",
      align: "center",
      renderHeader: () => (
        <strong
          style={{ textAlign: "center", width: "100%", display: "block" }}
        >
          Nombre del proceso
        </strong>
      ),
    },
    {
      field: "Objetivo",
      headerName: "Objetivo",
      flex: 1,
      minWidth: 200,
      headerAlign: "center",
      align: "center",
      renderHeader: () => (
        <strong
          style={{ textAlign: "center", width: "100%", display: "block" }}
        >
          Objetivo
        </strong>
      ),
    },
    {
      field: "Fecha",
      flex: 1,
      minWidth: 200,
      headerAlign: "center",
      align: "center",
      renderHeader: () => (
        <strong
          style={{ textAlign: "center", width: "100%", display: "block" }}
        >
          Fecha de actualización
        </strong>
      ),
    },
    {
      field: "Estado",
      minWidth: 150,
      headerAlign: "center",
      align: "center",
      renderHeader: () => (
        <strong
          style={{ textAlign: "center", width: "100%", display: "block" }}
        >
          Estado
        </strong>
      ),
      renderCell: (data) => {
        const status = statusOptions.find(
          (option) => option.label === data.value
        );
        const color = status ? status.color : "#000";
        return <span style={{ color, fontWeight: "bold" }}>{data.value}</span>;
      },
    },
    {
      field: "",
      headerAlign: "center",
      minWidth: 150,
      align: "center",
      sortable: false,
      disableColumnMenu: true,
      renderHeader: () => (
        <strong
          style={{ textAlign: "center", width: "100%", display: "block" }}
        >
          Gestionar
        </strong>
      ),
      renderCell: (params) => (
        <Button
          component={Link}
          to={`/company/manage-processes/edit-process/${params.row.id}`}
        >
          <DriveFileRenameOutlineIcon sx={{ color: "#333" }} />
        </Button>
      ),
    },
  ];

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
    <Box sx={{ width: "100%" }}>
      <TableDesign
        title="Lista de Procesos"
        buttonLink="/company/manage-processes/create-process"
        rows={rows}
        columns={columns}
        limit={limitPage}
        rowHeight={'auto'}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        {error && (
          <Alert severity={"error"} sx={{ fontWeight: "bold" }}>
            {error}
          </Alert>
        )}
      </Snackbar>
    </Box>
  );
};

export default ProcessCrud;
