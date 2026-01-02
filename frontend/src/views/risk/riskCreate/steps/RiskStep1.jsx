import {
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import { riskSourceOptions } from "@/utils/HelpersLib";
import { Controller } from "react-hook-form";

const RiskStep1 = ({ register, control, errors }) => {
  return (
    <>
      <Typography
        variant="h5"
        gutterBottom
        sx={{
          textAlign: "center",
          fontWeight: "bold",
        }}
      >
        Información básica del riesgo
      </Typography>
      <Typography variant="body2" color="text.secondary" textAlign="center">
        Escriba los campos básicos del riesgo.
      </Typography>

      <TextField
        fullWidth
        label="Nombre"
        margin="normal"
        {...register("name", { required: "El nombre es obligatorio" })}
        error={!!errors.name}
        helperText={errors.name?.message}
      />

      <TextField
        fullWidth
        label="Descripción"
        margin="normal"
        multiline
        rows={3}
        {...register("description", {
          required: "La descripción es obligatoria",
        })}
        error={!!errors.description}
        helperText={errors.description?.message}
      />

      <TextField
        fullWidth
        label="Fuente de riesgo"
        multiline
        rows={2}
        margin="normal"
        {...register("risk_source", {
          required: "La fuente de riesgo es obligatoria",
        })}
        error={!!errors.risk_source}
        helperText={errors.risk_source?.message}
      />

      <TextField
        fullWidth
        label="Posibles consecuencias"
        margin="normal"
        multiline
        rows={2}
        {...register("possible_consequences", {
          required: "Las consecuencias son obligatorias",
        })}
        error={!!errors.possible_consequences}
        helperText={errors.possible_consequences?.message}
      />

      <FormControl fullWidth error={!!errors.risk_origin} sx={{ mb: 2 }}>
        <InputLabel id="risk_origin-label">Origen del riesgo</InputLabel>
        <Controller
          name="risk_origin"
          control={control}
          rules={{ required: "El origen del riesgo es obligatorio" }}
          render={({ field }) => (
            <Select
              labelId="risk_origin-label"
              label="Origen del riesgo"
              {...field}
              value={field.value || ""}
            >
              {riskSourceOptions.map((tipo) => (
                <MenuItem key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </MenuItem>
              ))}
            </Select>
          )}
        />
        <FormHelperText>{errors.risk_origin?.message}</FormHelperText>
      </FormControl>
    </>
  );
};

export default RiskStep1;
