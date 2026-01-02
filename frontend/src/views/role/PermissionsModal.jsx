import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

function PermissionsModal({ open, onClose, title, items }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: { borderRadius: 2, p: 3 },
      }}
    >
      <DialogTitle sx={{ p: 0 }}>
        <Box display="flex" justifyContent="flex-end">
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Typography variant="h6" fontWeight="bold" textAlign="center" mb={2}>
          {title}
        </Typography>

        <Box sx={{ maxHeight: 300, overflowY: "auto", px: 1 }}>
          {items.length > 0 ? (
            <List dense>
              {items.map((perm, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary={perm} />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
            >
              Este rol no tiene permisos asignados.
            </Typography>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default PermissionsModal;