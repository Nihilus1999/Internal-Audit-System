import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Paper,
  Typography,
} from "@mui/material";

const PermissionListCheck = ({ permisos, selectedPerms, setSelectedPerms }) => {
  const handleToggle = (permiso) => () => {
    const exists = selectedPerms.some((p) => p.id === permiso.id);
    const newSelected = exists
      ? selectedPerms.filter((p) => p.id !== permiso.id)
      : [...selectedPerms, permiso];

    setSelectedPerms(newSelected);
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Typography
        variant="h6"
        sx={{
          fontWeight: "bold",
          textAlign: "center",
          mb: 1,
        }}
      >
        Lista de Permisos
      </Typography>
      <Paper
        sx={{
          maxHeight: 350,
          overflow: "auto",
          px: 3,
          py: 2,
        }}
      >
        <List dense>
          {permisos.map((permiso) => {
            const labelId = `checkbox-list-label-${permiso.id}`;
            const isChecked = selectedPerms.some((p) => p.id === permiso.id);

            return (
              <ListItemButton
                key={permiso.id}
                onClick={handleToggle(permiso)}
                sx={{ py: 1 }}
              >
                <ListItemIcon>
                  <Checkbox
                    edge="start"
                    checked={isChecked}
                    tabIndex={-1}
                    disableRipple
                    inputProps={{ "aria-labelledby": labelId }}
                  />
                </ListItemIcon>
                <ListItemText id={labelId} primary={permiso.name} />
              </ListItemButton>
            );
          })}
        </List>
      </Paper>
    </Box>
  );
};

export default PermissionListCheck;