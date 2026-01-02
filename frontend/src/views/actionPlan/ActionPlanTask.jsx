import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  List,
  ListItem,
  Snackbar,
  Alert,
  CircularProgress,
  Dialog,
  DialogContent
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import UndoIcon from "@mui/icons-material/Undo";
import { getActionPlanBySlug } from "@/services/ActionPlan";
import {
  getTasks,
  createTasks,
  updateTasks,
  deleteTasks,
} from "@/services/ActionPlan";
import ConfirmationDialog from "@/common/template/ConfirmModalDesign";

const ActionPlanTask = () => {
  const { slug } = useParams();
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [actionPlanName, setActionPlanName] = useState("");
  const [taskError, setTaskError] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [editedName, setEditedName] = useState("");

  // Estados para confirmación de eliminación
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const pendingTasks = tasks.filter((t) => !t.status);
  const completedTasks = tasks.filter((t) => t.status);

  useEffect(() => {
    fetchTasks();
  }, [slug]);

  const fetchTasks = async () => {
    try {
      const actionPlanData = await getActionPlanBySlug(slug);
      setActionPlanName(actionPlanData.name);
      const tasks = await getTasks(slug);
      setTasks(tasks);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newTask.trim()) {
      setTaskError(true);
      return;
    }

    try {
      const payload = { name: newTask };
      const successMessage = await createTasks(slug, payload);
      setSuccess(successMessage);
      setNewTask("");
      setTaskError(false);
      fetchTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleStatus = async (task) => {
    try {
      const payload = { name: task.name, status: !task.status };
      await updateTasks(task.id, payload);
      if (!task.status) {
        setSuccess("La tarea se ha completado correctamente");
      } else {
        setSuccess("La tarea se deshizo correctamente");
      }
      fetchTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditClick = (task) => {
    setTaskToEdit(task);
    setEditedName(task.name);
    setEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editedName.trim()) {
      setError("El nombre de la tarea no puede estar vacío.");
      return;
    }
    try {
      const payload = { name: editedName, status: taskToEdit.status };
      const successMessage = await updateTasks(taskToEdit.id, payload);
      setSuccess(successMessage);
      setEditModalOpen(false);
      setTaskToEdit(null);
      setEditedName("");
      fetchTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setTaskToEdit(null);
    setEditedName("");
  };

  // Confirmación de eliminación
  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;

    try {
      const successMessage = await deleteTasks(taskToDelete.id);
      setSuccess(successMessage);
      fetchTasks();
    } catch (err) {
      setError(err.message || "No se pudo eliminar la tarea");
    } finally {
      setConfirmOpen(false);
      setTaskToDelete(null);
    }
  };

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
    <Box p={3}>
      <Typography
        variant="h5"
        mb={2}
        sx={{ fontWeight: "bold", textAlign: "center" }}
      >
        Gestionar Tareas - {actionPlanName}
      </Typography>

      <Box display="flex" gap={2} mb={3}>
        <TextField
          fullWidth
          value={newTask}
          onChange={(e) => {
            setNewTask(e.target.value);
            if (taskError && e.target.value.trim()) {
              setTaskError(false);
            }
          }}
          error={taskError}
          helperText={
            taskError ? "El nombre de la tarea no puede estar vacío" : ""
          }
          placeholder="Escribe el nombre que tendrá la tarea..."
          variant="outlined"
        />
        <Button
          sx={{
            mt: 1,
            height: "40px",
            minWidth: "150px",
            borderRadius: "20px",
            fontWeight: "bold",
            textTransform: "uppercase",
          }}
          variant="contained"
          onClick={handleCreate}
        >
          Crear Tarea
        </Button>
      </Box>

      <Box display="flex" gap={4}>
        {/* Tareas Pendientes */}
        <Box flex={1}>
          <Typography textAlign="center" fontWeight="bold" mb={1}>
            Tareas Pendientes
          </Typography>
          <List
            sx={{
              border: "1px solid #ccc",
              borderRadius: 1,
              height: 300,
              overflow: "auto",
              p: 1,
            }}
          >
            {pendingTasks.map((task, index) => (
              <ListItem
                key={task.id}
                alignItems="flex-start"
                sx={{ pl: 1, pr: 2 }}
                secondaryAction={
                  <Box sx={{ display: "flex", gap: 0.8, ml: 2 }}>
                    <IconButton
                      onClick={() => handleToggleStatus(task)}
                      edge="end"
                    >
                      <CheckIcon sx={{ color: "#333" }} />
                    </IconButton>
                    <IconButton
                      onClick={() => handleEditClick(task)}
                      edge="end"
                    >
                      <EditIcon sx={{ color: "#333" }} />
                    </IconButton>
                    <IconButton
                      onClick={() => {
                        setTaskToDelete(task);
                        setConfirmOpen(true);
                      }}
                      edge="end"
                    >
                      <DeleteIcon sx={{ color: "#333" }} />
                    </IconButton>
                  </Box>
                }
              >
                <Typography
                  variant="body2"
                  sx={{
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                    maxWidth: "80%",
                  }}
                >
                  {index + 1}. {task.name}
                </Typography>
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Tareas Completadas */}
        <Box flex={1}>
          <Typography textAlign="center" fontWeight="bold" mb={1}>
            Tareas Completadas
          </Typography>
          <List
            sx={{
              border: "1px solid #ccc",
              borderRadius: 1,
              height: 300,
              overflow: "auto",
              p: 1,
            }}
          >
            {completedTasks.map((task, index) => (
              <ListItem
                key={task.id}
                alignItems="flex-start"
                secondaryAction={
                  <IconButton onClick={() => handleToggleStatus(task)}>
                    <UndoIcon />
                  </IconButton>
                }
              >
                <Typography
                  variant="body2"
                  sx={{
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                    maxWidth: "85%",
                    textDecoration: "line-through",
                  }}
                >
                  {index + 1}. {task.name}
                </Typography>
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>

      {/* Modal para editar */}
      <Dialog
        open={editModalOpen}
        onClose={handleCloseEditModal}
        fullWidth
        slotProps={{
        paper: {
          sx: {
            borderRadius: 4,
            padding: 2,
          },
        },
      }}
      >
        <DialogContent
          sx={{
            backgroundColor: "#fff",
            borderRadius: 3,
            p: 4,
          }}
        >
          <Typography
            variant="h6"
            mb={2}
            sx={{ fontWeight: "bold", textAlign: "center" }}
          >
            Editar nombre
          </Typography>

          <TextField
            fullWidth
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            variant="outlined"
            placeholder="Nuevo nombre de la tarea"
          />

          <Box mt={3} display="flex" justifyContent="center" gap={2}>
            <Button
              sx={{
                borderRadius: "20px",
                px: "20px",
                py: "8px",
                fontWeight: "bold",
                textTransform: "uppercase",
                fontSize: "0.75rem",
              }}
              variant="contained"
              onClick={handleSaveEdit}
            >
              Guardar
            </Button>
            <Button
              sx={{
                borderRadius: "20px",
                px: "20px",
                py: "8px",
                fontWeight: "bold",
                textTransform: "uppercase",
                fontSize: "0.75rem",
              }}
              variant="outlined"
              onClick={handleCloseEditModal}
            >
              Cancelar
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Snackbar de error */}
      <Snackbar
        open={!!error}
        autoHideDuration={3000}
        onClose={() => setError("")}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="error" sx={{ fontWeight: "bold" }}>
          {error}
        </Alert>
      </Snackbar>

      {/* Snackbar de éxito */}
      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess("")}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success" sx={{ fontWeight: "bold" }}>
          {success}
        </Alert>
      </Snackbar>

      {/* Modal de Confirmación de Eliminación */}
      <ConfirmationDialog
        open={confirmOpen}
        title="Confirmar Eliminación"
        message={`¿Deseas eliminar la tarea "${taskToDelete?.name}"?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setTaskToDelete(null);
        }}
      />
    </Box>
  );
};

export default ActionPlanTask;
