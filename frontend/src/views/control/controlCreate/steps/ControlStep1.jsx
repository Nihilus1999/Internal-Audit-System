import {
  Box,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import {
  control_typeOptions,
  teoric_effectivenessOptions,
  management_typeOptions,
  application_frequencyOptions,
} from "@/utils/HelpersLib";
import { Controller } from "react-hook-form";

// Reutilizable: componente para Select controlado
const SelectField = ({ name, control, label, options, error }) => (
  <FormControl fullWidth error={!!error} >
    <InputLabel id={`${name}-label`}>{label}</InputLabel>
    <Controller
      name={name}
      control={control}
      rules={{ required: `El campo ${label} es obligatorio` }}
      render={({ field }) => (
        <Select
          labelId={`${name}-label`}
          label={label}
          {...field}
          value={field.value || ""}
        >
          {options.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      )}
    />
    <FormHelperText>{error?.message}</FormHelperText>
  </FormControl>
);

const ControlStep1 = ({ register, control, errors }) => {
  return (
    <>
      <Typography
        variant="h5"
        gutterBottom
        sx={{ textAlign: "center", fontWeight: "bold" }}
      >
        Información básica del control
      </Typography>
      <Typography variant="body2" color="text.secondary" textAlign="center">
        Escriba los campos básicos del control.
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

      <Box display="flex" gap={2} flexWrap="wrap">
        <Box flex={1}>
          <SelectField
            name="control_type"
            control={control}
            label="Tipo de control"
            options={control_typeOptions}
            error={errors.control_type}
          />
        </Box>

        <Box flex={1}>
          <SelectField
            name="teoric_effectiveness"
            control={control}
            label="Efectividad teorica"
            options={teoric_effectivenessOptions}
            error={errors.teoric_effectiveness}
          />
        </Box>
      </Box>

      <Box display="flex" gap={2} flexWrap="wrap">
        <Box flex={1}>
          <SelectField
            name="management_type"
            control={control}
            label="Tipo de gestión"
            options={management_typeOptions}
            error={errors.management_type}
          />
        </Box>

        <Box flex={1}>
          <SelectField
            name="application_frequency"
            control={control}
            label="Frecuencia de aplicación"
            options={application_frequencyOptions}
            error={errors.application_frequency}
          />
        </Box>
      </Box>
    </>
  );
};

export default ControlStep1;
