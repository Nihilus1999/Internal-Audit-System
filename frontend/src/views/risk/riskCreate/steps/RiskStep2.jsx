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
import { getActiveProcess } from "@/services/Company";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const RiskStep2 = ({ control, errors }) => {
  const [error, setError] = useState("");
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProcess();
  }, []);

  const fetchProcess = async () => {
    try {
      const data = await getActiveProcess();
      const processInstances = data.map((item) => new Risk(item));
      setProcesses(processInstances);
    } catch (error) {
      setError(error.message || "Error al obtener los procesos.");
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
        Procesos afectados relacionados a este riesgo
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        textAlign="center"
      >
        Agrega los procesos que esten afectados por este riesgo.
      </Typography>

      <Controller
        name="ids_process"
        control={control}
        rules={{ required: "Selecciona al menos un proceso" }}
        render={({ field: { onChange, value } }) => (
          <Autocomplete
            multiple
            options={processes}
            limitTags={2}
            disableCloseOnSelect
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, val) => option.id === val.id}
            value={processes.filter((r) => value?.includes(r.id))}
            onChange={(_, selectedOptions) => {
              const ids = selectedOptions.map((r) => r.id);
              const selectedData = selectedOptions.map((r) => ({
                id: r.id,
                name: r.name,
              }));

              // Guardar en localStorage
              localStorage.setItem(
                "selected_processes",
                JSON.stringify(selectedData)
              );

              onChange(ids);
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
                label="Procesos afectados"
                placeholder="Selecciona proceso"
                error={!!errors.ids_process}
                helperText={errors.ids_process?.message}
              />
            )}
          />
        )}
      />
      {error && (
        <Alert severity="error" sx={{ mt: 2, fontWeight: "bold" }}>
          {error}
        </Alert>
      )}
    </>
  );
};

export default RiskStep2;
