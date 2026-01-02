import { Snackbar, SnackbarContent, Button, Alert } from "@mui/material";
import { useState } from "react";
import ConfirmModalDesign from "../template/ConfirmModalDesign";

function WarningSnackbar({ open, onClose, confirmLogout, refreshToken }) {
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);
  const [showRefreshSuccess, setShowRefreshSuccess] = useState(false);

  const handleLogoutClick = () => {
    setOpenConfirmationDialog(true);
  };

  const handleConfirmLogout = () => {
    confirmLogout();
    setOpenConfirmationDialog(false);
  };

  const handleCancelLogout = () => {
    setOpenConfirmationDialog(false);
  };

  const handleRefreshTokenClick = async () => {
    try {
      await refreshToken();
      setShowRefreshSuccess(true);
    } catch (error) {
      console.error("Error renovando sesión");
    }
  };

  return (
    <>
      {/* Snackbar de renovar token y cerrar sesion */}
      <Snackbar
        open={open}
        onClose={onClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <SnackbarContent
          message="Su sesión expirará en un minuto. ¿Desea renovarla?"
          action={
            <>
              <Button
                color="primary"
                size="small"
                onClick={handleRefreshTokenClick}
              >
                Renovar Sesión
              </Button>
              <Button size="small" onClick={handleLogoutClick}>
                Cerrar Sesión
              </Button>
            </>
          }
        />
      </Snackbar>

      {/* Snackbar de éxito al renovar sesión */}
      <Snackbar
        open={showRefreshSuccess}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        autoHideDuration={3000}
        onClose={() => setShowRefreshSuccess(false)}
      >
        <Alert severity="success" sx={{ fontWeight: "bold" }}>
          La sesión se ha establecido correctamente.
        </Alert>
      </Snackbar>

      <ConfirmModalDesign
        open={openConfirmationDialog}
        title="Confirmación de Cierre de Sesión"
        message="¿Está seguro de que desea cerrar sesión?"
        onConfirm={handleConfirmLogout}
        onCancel={handleCancelLogout}
      />
    </>
  );
}

export default WarningSnackbar;
