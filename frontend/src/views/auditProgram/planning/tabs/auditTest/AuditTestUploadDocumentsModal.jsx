import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  Typography,
  IconButton,
  Button,
  Divider,
  Alert,
  Snackbar,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { createAuditTestDocuments } from "@/services/auditProgram/Planning";

const AuditTestUploadDocumentsModal = ({ open, onClose, onUploadSuccess }) => {
  const { slugAuditTest } = useParams();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleRemove = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    try {
      setLoading(true);
      await createAuditTestDocuments(slugAuditTest, formData);
      setFiles([]);
      setSnackbar({
        open: true,
        message: "Archivos subidos con éxito",
        severity: "success",
      });

      if (onUploadSuccess) {
        onUploadSuccess();
        onClose();
      }

    } catch (error) {
      const msg = error.message || "Error al subir archivos";
      setSnackbar({
        open: true,
        message: msg,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
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
            position: "relative",
            backgroundColor: "#fff",
            borderRadius: 3,
            maxHeight: "80vh",
            overflowY: "auto",
            p: 4,
          }}
        >
          <IconButton
            onClick={onClose}
            sx={{ position: "absolute", top: 8, right: 8 }}
          >
            <CloseIcon />
          </IconButton>

          <Typography
            variant="h5"
            fontWeight="bold"
            textAlign="center"
            gutterBottom
          >
            Cargar Documentos
          </Typography>

          <Box
            sx={{
              border: "2px dashed #999",
              borderRadius: "8px",
              textAlign: "center",
              py: 6,
              px: 2,
              mb: 3,
            }}
          >
            <CloudUploadIcon sx={{ fontSize: 40 }} />
            <Typography variant="body1" mt={2}>
              <label htmlFor="file-upload">
                <input
                  id="file-upload"
                  type="file"
                  hidden
                  multiple
                  onChange={handleFileChange}
                />
                <Button variant="outlined" component="span">
                  Elegir archivos
                </Button>
              </label>
            </Typography>
            <Typography variant="body2" mt={1} color="text.secondary">
              o arrástralos aquí
            </Typography>
          </Box>

          {files.map((file, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              bgcolor="#f5f5f5"
              p={2}
              mb={2}
              borderRadius={2}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  width={40}
                  height={40}
                  bgcolor="#ddd"
                  borderRadius={2}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontWeight="bold"
                >
                  {file.name.split(".").pop().toUpperCase()}
                </Box>
                <Box>
                  <Typography fontWeight="medium">{file.name}</Typography>
                  <Typography variant="caption">
                    Tamaño: {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </Typography>
                </Box>
              </Box>
              <Button
                color="error"
                size="small"
                onClick={() => handleRemove(index)}
              >
                X
              </Button>
            </Box>
          ))}

          <Divider sx={{ my: 2 }} />

          <Box textAlign="center">
            <Button
              sx={{
                mt: 2,
                borderRadius: "20px",
                px: "20px",
                py: "8px",
                fontWeight: "bold",
                textTransform: "uppercase",
              }}
              variant="contained"
              size="large"
              onClick={handleUpload}
              disabled={loading || files.length === 0}
            >
              {loading ? "Subiendo..." : "Subir Archivos"}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} sx={{ fontWeight: "bold" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AuditTestUploadDocumentsModal;
