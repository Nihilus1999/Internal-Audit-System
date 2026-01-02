import { useState } from "react";
import { Box, Tabs, Tab } from "@mui/material";
import ControlForm1 from "./forms/ControlForm1";
import ControlForm2 from "./forms/ControlForm2";
import ControlForm3 from "./forms/ControlForm3";

const ControlDetailsUpdate = () => {
  const [tabIndex, setTabIndex] = useState(0);

  const renderTabContent = () => {
    switch (tabIndex) {
      case 0:
        return <ControlForm1 />;
      case 1:
        return <ControlForm2 />;
      case 2:
        return <ControlForm3 />;
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
        <Tab label="Procesos responsables" sx={{ fontWeight: "bold" }} />
        <Tab label="Riesgos" sx={{ fontWeight: "bold" }} />
      </Tabs>
      {renderTabContent()}
    </Box>
  );
};

export default ControlDetailsUpdate;
