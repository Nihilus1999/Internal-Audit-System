import InfoIcon from "@mui/icons-material/Info";
import WorkspacesIcon from "@mui/icons-material/Workspaces";
import ShieldIcon from "@mui/icons-material/Shield";
import AssessmentIcon from "@mui/icons-material/Assessment";
import DoneAllIcon from "@mui/icons-material/DoneAll";

import RiskStep1 from "./steps/RiskStep1";
import RiskStep2 from "./steps/RiskStep2";
import RiskStep3 from "./steps/RiskStep3";
import RiskStep4 from "./steps/RiskStep4";
import RiskStep5 from "./steps/RiskStep5";

export const steps = [
  { label: "Datos generales", component: RiskStep1, icon: InfoIcon },
  { label: "Procesos afectados", component: RiskStep2, icon: WorkspacesIcon },
  { label: "Controles", component: RiskStep3, icon: ShieldIcon },
  { label: "Evaluación", component: RiskStep4, icon: AssessmentIcon },
  { label: "Finalización", component: RiskStep5, icon: DoneAllIcon },
];
