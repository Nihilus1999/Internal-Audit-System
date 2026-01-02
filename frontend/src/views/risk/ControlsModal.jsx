import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Control from "@/models/Control";
import { teoric_effectivenessOptions } from "@/utils/HelpersLib";

function ControlsModal({ open, onClose, title, items = [] }) {
  const controlList = items.map((item) => new Control(item));

  const getEffectivenessColor = (value) => {
    const option = teoric_effectivenessOptions.find(
      (opt) => opt.label === value
    );
    return option?.color || "#000";
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      slotProps={{
        paper: {
          sx: {
            borderRadius: 4,
            padding: 2,
          },
        },
      }}
    >
      <DialogTitle sx={{ p: 0 }}>
        <Box display="flex" justifyContent="flex-end">
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Typography variant="h6" fontWeight="bold" textAlign="center" mt={-3} mb={2}>
          {title}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ maxHeight: "60vh", overflowY: "auto", px: 3 }}>
        {controlList.length === 0 ? (
          <Typography textAlign="center" color="text.secondary">
            No hay controles disponibles.
          </Typography>
        ) : (
          <Box display="flex" flexWrap="wrap" gap={2} justifyContent="center">
            {controlList.map((control, index) => {
              const effectiveness = control._teoric_effectiveness || "N/A";
              const color = getEffectivenessColor(effectiveness);

              return (
                <Box
                  key={control.id || index}
                  sx={{
                    width: 280,
                    borderRadius: 2,
                    boxShadow: 3,
                    bgcolor: "#f9f9f9",
                    p: 2,
                    transition: "transform 0.2s ease",
                  }}
                >
                  <Typography variant="body1" fontWeight="bold">
                    Nombre del control {index + 1}
                  </Typography>
                  <Typography variant="subtitle2">
                    {control.name || "N/A"}
                  </Typography>

                  <Typography variant="body1" fontWeight="bold" sx={{ mt: 2 }}>
                    Efectividad Teórica
                  </Typography>
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ color }}>
                    {effectiveness}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ControlsModal;