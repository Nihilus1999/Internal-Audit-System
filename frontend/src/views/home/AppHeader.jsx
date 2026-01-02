import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Tooltip,
} from "@mui/material";
import ConfirmModalDesign from "@/common/template/ConfirmModalDesign";
import PersonIcon from "@mui/icons-material/Person";
import PasswordIcon from "@mui/icons-material/Password";
import LogoutIcon from "@mui/icons-material/Logout";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import MenuIcon from "@mui/icons-material/Menu";
import { removeLocalStorageItems } from "@/utils/HelpersLib"
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { logout } from "@/configs/redux/authSlice";
import LogoLogin from "@/assets/image/logoConsultoresJDG.png";
import User from "@/models/User";

const AppHeader = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = new User(useSelector((state) => state.auth.data));
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);

  const handleOpenLogoutDialog = () => {
    setOpenConfirmationDialog(true);
    handleClose();
  };

  const handleConfirmLogout = () => {
    dispatch(logout());
    setOpenConfirmationDialog(false);
    navigate("/login/session");
  };

  const handleCancelLogout = () => {
    setOpenConfirmationDialog(false);
  };

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const menuOptions = [
    {
      label: "Gestionar perfil",
      icon: <PersonIcon />,
      path: "/home/profile/manage-profile",
    },
    {
      label: "Cambiar contraseña",
      icon: <PasswordIcon />,
      path: "/home/profile/change-password",
    },
    {
      label: "Cerrar sesión",
      icon: <LogoutIcon />,
      onClick: handleOpenLogoutDialog,
    },
  ];

  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: "#333",
        zIndex: 1200,
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Logo y toggle */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={onToggleSidebar}
            sx={{ ml: "30px" }}
          >
            <MenuIcon />
          </IconButton>
          <Link to="/home/main-view" style={{ textDecoration: "none" }}>
            <Box
              sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
            >
              <img
                src={LogoLogin}
                alt="Logo"
                style={{
                  height: "80px",
                  marginLeft: "20px",
                  marginTop: "10px",
                  marginBottom: "10px",
                }}
              />
            </Box>
          </Link>
        </Box>

        {/* Avatar + Menú */}
        <Box
          sx={{ display: "flex", alignItems: "center", marginRight: "40px" }}
        >
          <Tooltip title="Menú de usuario">
            <IconButton onClick={handleAvatarClick}>
              <Avatar
                sx={{
                  bgcolor: user._avatar_background_color,
                  width: 50,
                  height: 50,
                  fontSize: "18px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  color: "black",
                }}
              >
                {user._initials}
              </Avatar>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            sx={{
              "& .MuiMenu-paper": {
                width: 300,
                padding: "16px",
                borderRadius: "16px",
              },
            }}
          >
            {/* Encabezado del menú */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mb: "10px",
              }}
            >
              <Avatar
                sx={{
                  backgroundColor: user._avatar_background_color,
                  width: 80,
                  height: 80,
                  fontSize: "32px",
                  mb: 1,
                  color: "black",
                  fontWeight: "bold",
                }}
              >
                {user._initials}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight="bold" textAlign="center">
                  {user._fullName}
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  textAlign="center"
                >
                  {user.username}
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  textAlign="center"
                >
                  {user.email}
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  textAlign="center"
                >
                  {user._role}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ borderTop: "1px solid #ccc", mb: "10px" }} />

            {/* Opciones del menú */}
            {menuOptions.map(({ label, icon, path, onClick }, index) => (
              <MenuItem
                key={index}
                component={path ? Link : "li"}
                to={path}
                onClick={() => {
                  if (path) {
                    removeLocalStorageItems();
                    handleClose();
                  } else if (onClick) {
                    onClick();
                  }
                }}
                sx={{
                  borderRadius: "8px",
                  "&:hover": { backgroundColor: "#f5f5f5" },
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  color: "inherit",
                  textDecoration: "none",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  {icon}
                  <Typography textAlign="left" ml={2}>
                    {label}
                  </Typography>
                </Box>
                <ChevronRightIcon />
              </MenuItem>
            ))}
          </Menu>

          <ConfirmModalDesign
            open={openConfirmationDialog}
            title="Confirmación de Cierre de Sesión"
            message="¿Está seguro de que desea cerrar sesión?"
            onConfirm={handleConfirmLogout}
            onCancel={handleCancelLogout}
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default AppHeader;
