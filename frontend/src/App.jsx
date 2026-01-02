import { useEffect, useState } from "react";
import { BrowserRouter, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile } from "@/configs/redux/authSlice";
import TokenExpiredMessage from "@/common/warningsInterfaces/TokenExpiredMessage";
import { Box, CircularProgress, Snackbar, Alert } from "@mui/material";
import AppRoutesBuilder from "@/configs/routes/AppRoutesBuilder.jsx";
import { appInsights, reactPlugin } from "@/configs/tracking/AzureInsights";
import "@/assets/styles/app.scss";
import {
  setUnauthorizedHandler,
  setNotAcceptableHandler,
  setGoneHandler,
} from "@/configs/axios/index";

function AppWrapper() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { status, token, data } = useSelector((state) => state.auth);
  const [aiBlocked, setAiBlocked] = useState(false);

  // Configura el handler para errores globales 
  useEffect(() => {
    setUnauthorizedHandler(() => {
      if (window.location.pathname !== "/token-expired") {
        navigate("/token-expired");
      }
    });
    setNotAcceptableHandler(() => {
      if (window.location.pathname !== "/access-denied") {
        navigate("/access-denied");
      }
    });
    setGoneHandler(() => {
      if (window.location.pathname !== "/suspended") {
        navigate("/suspended");
      }
    });
  }, [navigate]);

  // Trackeo de páginas Azure Insights
  useEffect(() => {
    const fullPath = location.pathname + location.search;
    try {
      if (import.meta.env.PROD) {
        appInsights.trackPageView({
          name: fullPath,
          uri: fullPath,
          properties: { reactPlugin },
        });
      }
    } catch (error) {
      console.warn("Azure Insights tracking error", error);
      setAiBlocked(true);
    }
  }, [location]);

  // Obtener perfil de usuario si hay token y estado idle
  useEffect(() => {
    if (token && status === "idle") {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, token, status]);

  if (token && (status === "idle" || status === "loading" || !data)) {
    if (status === "failed") {
      return <TokenExpiredMessage />;
    }
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <AppRoutesBuilder />
      <Snackbar
        open={aiBlocked}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        onClose={() => setAiBlocked(false)}
      >
        <Alert severity="warning" sx={{ fontWeight: "bold" }}>
          Azure Application Insights no está disponible o fue bloqueado.
        </Alert>
      </Snackbar>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppWrapper />
    </BrowserRouter>
  );
}
