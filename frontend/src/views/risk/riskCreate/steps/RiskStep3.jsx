import { useEffect, useState } from "react";
import {
  Typography,
  Box,
  TextField,
  Checkbox,
  Autocomplete,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Controller } from "react-hook-form";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import Control from "@/models/Control";
import { getActiveControls } from "@/services/Control";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const RiskStep3 = ({ control, errors }) => {
  const [error, setError] = useState("");
  const [controls, setControls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchControls();
  }, []);

  const fetchControls = async () => {
    try {
      const data = await getActiveControls();
      const controlInstances = data.map((item) => new Control(item));
      setControls(controlInstances);
    } catch (error) {
      setError(error.message || "Error al obtener los controles.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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
      <Typography
        variant="h5"
        gutterBottom
        sx={{
          textAlign: "center",
          fontWeight: "bold",
          mb: 3,
        }}
      >
        Controles asociados a este riesgo
      </Typography>
      <Typography variant="body2" color="text.secondary" textAlign="center">
        Agrega los controles que esten asociados a este riesgo.
      </Typography>

      <Controller
        name="ids_control"
        control={control}
        render={({ field: { onChange, value } }) => (
          <Autocomplete
            multiple
            options={controls}
            limitTags={2}
            disableCloseOnSelect
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, val) => option.id === val.id}
            value={controls.filter((r) => value?.includes(r.id))}
            onChange={(_, selectedOptions) => {
              const ids = selectedOptions.map((r) => r.id);
              onChange(ids);

              // Guardar id y name de controles seleccionados
              const selectedControls = selectedOptions.map((r) => ({
                id: r.id,
                name: r.name,
                teoric_effectiveness: r.teoric_effectiveness,
              }));
              localStorage.setItem(
                "selected_controls",
                JSON.stringify(selectedControls)
              );
            }}
            renderOption={(props, option, { selected }) => {
              const { key, ...rest } = props;
              return (
                <li key={key} {...rest}>
                  <Checkbox
                    icon={icon}
                    checkedIcon={checkedIcon}
                    style={{ marginRight: 8 }}
                    checked={selected}
                  />
                  {option.name}
                </li>
              );
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Controles asociados"
                placeholder="Selecciona controles"
                error={!!errors.ids_controls}
                helperText={errors.ids_controls?.message}
              />
            )}
          />
        )}
      />
      {error && (
        <Alert severity="error" sx={{ mt: 2, fontWeight: "bold"}}>
          {error}
        </Alert>
      )}
    </>
  );
};

export default RiskStep3;