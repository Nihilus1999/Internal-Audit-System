import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const TestDetailsModal = ({ open, onClose, data }) => {
  if (!data) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: "20px" }, // Esquinas más redondas
      }}
    >
      <DialogTitle
        variant="h5"
        sx={{
          fontWeight: "bold",
          textAlign: "center",
          position: "relative",
          pr: 5, // espacio para que el texto no se solape con la X
        }}
      >
        Información de la Prueba
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            position: "absolute",
            right: 8,
            top: "50%",
            transform: "translateY(-50%)",
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box mb={2}>
          <Typography variant="h6" fontWeight="bold">
            Objetivo:
          </Typography>
          <Typography>{data.Objetivo || "No especificado"}</Typography>
        </Box>

        <Box mb={2}>
          <Typography variant="h6" fontWeight="bold">
            Alcance:
          </Typography>
          <Typography>{data.Alcance || "No especificado"}</Typography>
        </Box>

        <Box mb={2}>
          <Typography variant="h6" fontWeight="bold">
            Criterios:
          </Typography>
          <Typography>{data.Criterios || "No especificado"}</Typography>
        </Box>

        <Box mb={2}>
          <Typography variant="h6" fontWeight="bold">
            Procedimiento:
          </Typography>
          <Typography>{data.Procedimiento || "No especificado"}</Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default TestDetailsModal;
