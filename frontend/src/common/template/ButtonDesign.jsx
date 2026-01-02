// src/common/buttons/PrimaryButton.jsx
import { Button } from "@mui/material";

const ButtomDesign = ({ children, isSubmitting, ...props }) => {
  return (
    <Button
      fullWidth
      variant="contained"
      color="primary"
      type="submit"
      disabled={isSubmitting}
      sx={{
        mt: 2,
        borderRadius: "20px",
        px: "20px",
        py: "8px",
        fontWeight: "bold",
        textTransform: "uppercase",
        ...props.sx,
      }}
      {...props}
    >
      {children}
    </Button>
  );
};

export default ButtomDesign;
