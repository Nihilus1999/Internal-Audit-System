import { useState } from "react";
import {
  Box,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  StepConnector,
  Typography,
  Snackbar,
  Alert,
  Stack
} from "@mui/material";
import { useTheme, styled } from "@mui/material/styles";
import { steps } from "@/views/control/controlCreate/ControlStepperConfig";
import { useForm } from "react-hook-form";
import PropTypes from "prop-types";
import ConfirmModalDesign from "@/common/template/ConfirmModalDesign";
import { useNavigate } from "react-router-dom";
import { createControl } from "@/services/Control";
import { removeLocalStorageItems } from "@/utils/HelpersLib";

// Conectores personalizados (puedes agregar estilos si quieres)
const CustomConnector = styled(StepConnector)(({ theme }) => ({}));

const CustomStepIconRoot = styled("div")(({ theme, ownerState }) => ({
  color: ownerState.completed
    ? theme.palette.primary.main
    : ownerState.active
    ? theme.palette.primary.main
    : "#757575",
  display: "flex",
  height: 22,
  alignItems: "center",
}));

const CustomStepIcon = (props) => {
  const { active, completed, className, icon } = props;
  const IconComponent = steps[icon - 1].icon;
  const theme = useTheme();
  const iconColor =
    active || completed ? theme.palette.primary.main : "#757575";

  return (
    <CustomStepIconRoot
      ownerState={{ active, completed }}
      className={className}
    >
      <IconComponent sx={{ color: iconColor, fontSize: 24 }} />
    </CustomStepIconRoot>
  );
};

CustomStepIcon.propTypes = {
  active: PropTypes.bool,
  completed: PropTypes.bool,
  className: PropTypes.string,
  icon: PropTypes.node,
};

const ControlStepperCreate = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [openConfirmModalDesign, setOpenConfirmModalDesign] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const StepComponent = steps[activeStep].component;
  const {
    register,
    control,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors },
  } = useForm({ mode: "onTouched" });
  const theme = useTheme();

  const handleNext = async () => {
    const isStepValid = await trigger(steps[activeStep].fields);
    if (isStepValid) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleFinalSubmit = async () => {
    const isStepValid = await trigger(steps[activeStep].fields);
    if (isStepValid) {
      handleSubmit(handleFormSubmit)();
    }
  };

  const handleFormSubmit = () => {
    setError("");
    setOpenConfirmModalDesign(true);
  };

  const handleCancel = () => {
    setOpenConfirmModalDesign(false);
  };

  const navigate = useNavigate();

  const handleConfirm = async () => {
    const formData = getValues();
    setOpenConfirmModalDesign(false);
    setError("");
    setSuccess("");

    try {
      const success = await createControl(formData);
      setSuccess(success);
      setSnackbarOpen(true);
      removeLocalStorageItems()
      setTimeout(() => navigate("/controls/manage-controls/crud"), 2000);
    } catch (error) {
      setSnackbarOpen(true);
      setError(error.message || "Error al crear el control");
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      sx={{ width: "100%" }}
    >
      {/* Stepper Header */}
      <Stepper
        alternativeLabel
        activeStep={activeStep}
        connector={<CustomConnector />}
        sx={{ mt: 2 }}
      >
        {steps.map((step, index) => (
          <Step key={index}>
            <StepLabel StepIconComponent={CustomStepIcon}>
              <Typography
                sx={{
                  fontWeight: "bold",
                  color:
                    activeStep >= index
                      ? theme.palette.primary.main
                      : "inherit",
                }}
              >
                {step.label}
              </Typography>
            </StepLabel>
          </Step>
        ))}
      </Stepper>
      {/* Formulario dentro de Paper */}
      <Paper
        elevation={6}
        sx={{ p: 4, borderRadius: 3, width: "100%", maxWidth: 600, mt: 3 }}
      >
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <Box sx={{ margin: "0 auto", padding: 2}}>
            <Stack spacing={3} >
            <StepComponent
              register={register}
              control={control}
              errors={errors}
            />
            </Stack>
          </Box>

          <Box display="flex" justifyContent="space-between">
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="contained"
              sx={{
                mt: 2,
                borderRadius: "20px",
                px: "20px",
                py: "8px",
                fontWeight: "bold",
                textTransform: "uppercase",
              }}
            >
              Atrás
            </Button>

            {activeStep === steps.length - 1 ? (
              <Button
                type="button"
                variant="contained"
                color="primary"
                onClick={handleFinalSubmit}
                sx={{
                  mt: 2,
                  borderRadius: "20px",
                  px: "20px",
                  py: "8px",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                }}
              >
                Finalizar
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleNext}
                variant="contained"
                color="primary"
                sx={{
                  mt: 2,
                  borderRadius: "20px",
                  px: "20px",
                  py: "8px",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                }}
              >
                Siguiente
              </Button>
            )}
          </Box>
        </form>
        <ConfirmModalDesign
          open={openConfirmModalDesign}
          title="Confirmación de creación del control"
          message="¿Estás seguro de que deseas crear este control con estos datos?"
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          {error ? (
            <Alert severity="error" sx={{ fontWeight: "bold" }}>
              {error}
            </Alert>
          ) : success ? (
            <Alert severity="success" sx={{ fontWeight: "bold" }}>
              {success}
            </Alert>
          ) : null}
        </Snackbar>
      </Paper>
    </Box>
  );
};

export default ControlStepperCreate;
