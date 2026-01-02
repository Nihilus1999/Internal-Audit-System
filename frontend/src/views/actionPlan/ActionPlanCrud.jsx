import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  CircularProgress,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { getActionPlans } from "@/services/ActionPlan";
import TableDesign from "@/common/template/TableDesign";
import ActionPlan from "@/models/ActionPlan";
import { statusPlanActions } from "@/utils/HelpersLib";


const ActionPlanCrud = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const limitPage = 10;

  useEffect(() => {
    fetchActionPlans();
  }, []);

  const fetchActionPlans = async () => {
    try {
      const data = await getActionPlans();
      const actionPlans = data.map((item) => new ActionPlan(item));
      const actionPlanRows = actionPlans.map((item) => ({
        id: item.slug,
        Codigo: item.slug,
        Nombre: item.name,
        Tipo: item.plan_type,
        FechaInicio: item._start_date,
        FechaFin: item._end_date,
        Estado: item.status,
      }));
      setRows(actionPlanRows);
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
    /*{
      field: "Codigo",
      flex: 1,
      minWidth: 150,
      headerAlign: "center",
      align: "center",
      renderHeader: () => (
        <strong
          style={{ textAlign: "center", width: "100%", display: "block" }}
        >
          Codigo
        </strong>
      ),
      renderCell: (data) => {
        return (
          <span
            style={{
              fontWeight: "bold",
            }}
          >
            {data.value}
          </span>
        );
      },
    },*/
    {
      field: "Nombre",
      flex: 1,
      minWidth: 300,
      headerAlign: "center",
      align: "center",
      renderHeader: () => (
        <strong
          style={{ textAlign: "center", width: "100%", display: "block" }}
        >
          Nombre del Plan
        </strong>
      ),
    },
    {
      field: "Tipo",
      flex: 1,
      minWidth: 150,
      headerAlign: "center",
      align: "center",
      renderHeader: () => (
        <strong
          style={{ textAlign: "center", width: "100%", display: "block" }}
        >
          Tipo de Plan
        </strong>
      ),
    },
    {
      field: "FechaInicio",
      flex: 1,
      minWidth: 200,
      headerAlign: "center",
      align: "center",
      renderHeader: () => (
        <strong
          style={{ textAlign: "center", width: "100%", display: "block" }}
        >
          Fecha Inicio
        </strong>
      ),
    },
        {
      field: "FechaFin",
      flex: 1,
      minWidth: 200,
      headerAlign: "center",
      align: "center",
      renderHeader: () => (
        <strong
          style={{ textAlign: "center", width: "100%", display: "block" }}
        >
          Fecha Fin
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
        const status = statusPlanActions.find(
          (option) => option.label === data.value
        );
        const color = status ? status.color : "#000";
        return (
          <span
            style={{
              color,
              fontWeight: "bold",
            }}
          >
            {data.value}
          </span>
        );
      },
    },
    {
      field: " ",
      headerAlign: "center",
      align: "center",
      width: 130,
      sortable: false,
      disableColumnMenu: true,
      renderHeader: () => (
        <strong
          style={{ textAlign: "center", width: "100%", display: "block" }}
        >
          Gest. Datos
        </strong>
      ),
      renderCell: (params) => (
        <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
          <IconButton
            component={Link}
            to={`/action-plans/manage-action-plans/edit-action-plans/${params.row.id}`}
            size="small"
          >
            <DriveFileRenameOutlineIcon sx={{ color: "#333" }} />
          </IconButton>
        </Box>
      ),
    },
    {
      field: "  ",
      headerAlign: "center",
      align: "center",
      width: 150,
      sortable: false,
      disableColumnMenu: true,
      renderHeader: () => (
        <strong
          style={{ textAlign: "center", width: "100%", display: "block" }}
        >
          Gest. Tareas
        </strong>
      ),
      renderCell: (params) => (
        <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
          <IconButton
            component={Link}
            to={`/action-plans/manage-action-plans/edit-tasks/${params.row.id}`}
            size="small"
          >
            <ListAltIcon sx={{ color: "#333" }} />
          </IconButton>
        </Box>
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
    <>
      <TableDesign
        title="Planes de Acción"
        buttonLink="/action-plans/manage-action-plans/create-action-plans"
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
    </>
  );
};

export default ActionPlanCrud;
