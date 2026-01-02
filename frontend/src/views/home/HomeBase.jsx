// src/views/home/HomeBase.jsx
import { Outlet, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode";
import WarningSnackbar from "@/common/warningsInterfaces/WarningSnackbar";
import SessionExpiredWarning from "@/common/warningsInterfaces/SessionExpiredWarning";
import { useEffect, useState } from "react";
import { logout } from "@/configs/redux/authSlice";
import { refreshToken } from "@/services/Auth";
import { Box } from "@mui/material";
import AppHeader from "./AppHeader";
import AppSidebar from "./AppSidebar";

export function HomeBase() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!token) return;
    const { exp } = jwtDecode(token);

    const checkToken = () => {
      const timeLeft = exp * 1000 - Date.now();

      // Convertir el tiempo restante a formato legible
      const totalSeconds = Math.floor(timeLeft / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      const milliseconds = timeLeft % 1000;

      //console.log(`Tiempo restante: ${minutes} min, ${seconds} seg, ${milliseconds} ms`);

      if (timeLeft >= 65000) {
        setShowSnackbar(false);
        setSessionExpired(false);
        localStorage.removeItem("expiredAt");
      } else if (timeLeft <= 65000 && timeLeft > 4000) {
        setShowSnackbar(true);
        setSessionExpired(false);
        localStorage.removeItem("expiredAt");
      } else if (timeLeft <= 4000) {
        setShowSnackbar(false);
        setSessionExpired(true);

        // Persistir para TokenExpiredMessage
        if (!localStorage.getItem("expiredAt")) {
          localStorage.setItem("expiredAt", Date.now().toString());
        }
      }

      if (timeLeft < 0) {
        localStorage.removeItem("expiredAt");
        dispatch(logout());
        clearInterval(interval);
      }
    };

    const interval = setInterval(checkToken, 1000);
    return () => clearInterval(interval);
  }, [token, dispatch]);

  const handleLogout = () => {
    localStorage.removeItem("expiredAt");
    dispatch(logout());
    navigate("/login/session");
  };

  const handleRefreshToken = async () => {
    const newToken = await refreshToken(token);
    localStorage.setItem("token", newToken);
    localStorage.removeItem("expiredAt");
    setShowSnackbar(false);
  };

  const handleToggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <AppHeader onToggleSidebar={handleToggleSidebar} />
      <AppSidebar open={sidebarOpen} />

      <Box
        component="main"
        sx={{
          overflowY: "auto",
          padding: "20px",
          mt: "100px",
          ml: { xs: 0, sm: sidebarOpen ? "300px" : 0 },
          transition: "margin-left 0.4s ease",
        }}
      >
        <Outlet />
      </Box>

      <WarningSnackbar
        open={showSnackbar}
        onClose={() => setShowSnackbar(false)}
        confirmLogout={handleLogout}
        refreshToken={handleRefreshToken}
      />
      <SessionExpiredWarning
        open={sessionExpired}
        onClose={() => setSessionExpired(false)}
      />
    </Box>
  );
}

export default HomeBase;