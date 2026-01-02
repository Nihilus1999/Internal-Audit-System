import { useState } from "react";
import { Box, Tabs, Tab } from "@mui/material";
import RisklForm1 from "./forms/RiskForm1";
import RiskForm2 from "./forms/RiskForm2";
import RiskForm3 from "./forms/RiskForm3";
import RiskForm4 from "./forms/RiskForm4";

const RiskDetailsUpdate = () => {
  const [tabIndex, setTabIndex] = useState(0);

  const renderTabContent = () => {
    switch (tabIndex) {
      case 0:
        return <RisklForm1 />;
      case 1:
        return <RiskForm2 />;
      case 2:
        return <RiskForm3 />;
      case 3:
        return <RiskForm4 />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ mb: 2, p: 2 }}>
      <Tabs
        value={tabIndex}
        onChange={(e, newValue) => setTabIndex(newValue)}
        indicatorColor="primary"
        textColor="primary"
        centered
        sx={{
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Tab label="Datos generales" sx={{ fontWeight: "bold" }} />
        <Tab label="Procesos afectados" sx={{ fontWeight: "bold" }} />
        <Tab label="Controles" sx={{ fontWeight: "bold" }} />
        <Tab label="Evaluación" sx={{ fontWeight: "bold" }} />
      </Tabs>
      {renderTabContent()}
    </Box>
  );
};

export default RiskDetailsUpdate;
