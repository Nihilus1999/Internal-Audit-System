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
import Risk from "@/models/Risk";
import { getActiveRisks } from "@/services/Risk";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const ControlStep3 = ({ control, errors }) => {
  const [error, setError] = useState("");
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRisks();
  }, []);

  const fetchRisks = async () => {
    try {
      const data = await getActiveRisks();
      const riskInstances = data.map((item) => new Risk(item));
      setRisks(riskInstances);
    } catch (error) {
      setError(error.message || "Error al obtener los riesgos.");
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
        Riesgos relacionados a este control
      </Typography>
      <Typography variant="body2" color="text.secondary" textAlign="center">
        Agrega los riesgos que esten relacionados a este control
      </Typography>

      <Controller
        name="ids_risk"
        control={control}
        rules={{ required: "Selecciona al menos un riesgo" }}
        render={({ field: { onChange, value } }) => (
          <Autocomplete
            multiple
            options={risks}
            limitTags={2}
            disableCloseOnSelect
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, val) => option.id === val.id}
            value={risks.filter((r) => value?.includes(r.id))}
            onChange={(_, selectedOptions) => {
              const ids = selectedOptions.map((r) => r.id);
              onChange(ids);
              // Guardar id y name de riesgos seleccionados
              const selectedRisks = selectedOptions.map((r) => ({
                id: r.id,
                name: r.name,
              }));
              localStorage.setItem(
                "selected_risks",
                JSON.stringify(selectedRisks)
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
                label="Riesgos relacionados"
                placeholder="Selecciona riesgos"
                error={!!errors.ids_risk}
                helperText={errors.ids_risk?.message}
              />
            )}
          />
        )}
      />
      {error && (
        <Alert severity="error" sx={{ mt: 2,  fontWeight: "bold" }}>
          {error}
        </Alert>
      )}
    </>
  );
};

export default ControlStep3;
