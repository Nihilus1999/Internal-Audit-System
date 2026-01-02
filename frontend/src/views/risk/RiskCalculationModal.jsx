// RiskCalculationModal.jsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import riskImage from "@/assets/image/risk-calculation.png"; // asegúrate que exista

const RiskCalculationModal = ({ open, onClose }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
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
      </DialogTitle>

      <DialogContent >
        <Box
          component="img"
          src={riskImage}
          alt="Fórmulas del riesgo"
          sx={{ width: "100%", height: "auto" }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default RiskCalculationModal;
