import InfoIcon from "@mui/icons-material/Info";
import WorkspacesIcon from "@mui/icons-material/Workspaces";
import DangerousIcon from '@mui/icons-material/Dangerous';
import DoneAllIcon from "@mui/icons-material/DoneAll";

import ControlStep1 from "./steps/ControlStep1";
import ControlStep2 from "./steps/ControlStep2";
import ControlStep3 from "./steps/ControlStep3";
import ControlStep4 from "./steps/ControlStep4";

export const steps = [
  { label: "Datos generales", component: ControlStep1, icon: InfoIcon },
  { label: "Procesos responsables", component: ControlStep2, icon: WorkspacesIcon },
  { label: "Riesgos", component: ControlStep3, icon: DangerousIcon },
  { label: "Finalización", component: ControlStep4, icon: DoneAllIcon },
];
