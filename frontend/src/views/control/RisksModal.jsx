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

function RisksModal({ open, onClose, title, items }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
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

      <DialogContent sx={{ maxHeight: 300, overflowY: "auto", px: 2 }}>
        {items.length > 0 ? (
          <List dense>
            {items.map((item, index) => (
              <ListItem key={item.id || index}>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary={item.name} />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            py={2}
          >
            Este control no tiene riesgos asignados.
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default RisksModal;