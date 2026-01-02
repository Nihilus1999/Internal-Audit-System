import { Dialog, DialogTitle, DialogContent, Typography } from '@mui/material';

const SessionExpiredWarning = ({ open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} sx={{ padding: 2 }}>
      <DialogTitle sx={{ fontWeight: 'bold', textAlign: 'center' }}>
        Sesión Expirada
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 2 }}>
        <Typography variant="body1" align="center">
          Tu sesión ha expirado. Por favor, vuelve a iniciar sesión para continuar.
        </Typography>
      </DialogContent>
    </Dialog>
  );
};

export default SessionExpiredWarning;

