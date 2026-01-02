import { useState } from "react";
import { Box, Grid, Typography, IconButton, Button, Stack } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import UploadIcon from "@mui/icons-material/Upload";
import EvidenceUploadDocumentsModal from "@/views/auditProgram/execution/evidence/EvidenceUploadDocumentsModal";
import EvidenceConclusionsModal from "@/views/auditProgram/execution/evidence/EvidenceConclusionsModal";

const EvidenceTableDocument = ({
  title,
  rows,
  columns,
  limit,
  rowHeight,
  onUploadSuccess,
}) => {
  const [page, setPage] = useState(0);
  const [openUploadModal, setOpenUploadModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  return (
    <Box
      sx={{
        backgroundColor: "#4a4a4a",
        border: "1px solid #444",
        borderRadius: 2,
        p: 3,
        maxWidth: "100%",
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <Grid
        container
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        {/* Título con ancho máximo */}
        <Typography
          fontWeight="bold"
          sx={{
            fontSize: { xs: "16px", sm: "24px" },
            color: "#ffffff",
            wordBreak: "break-word",
            maxWidth: "60%",
          }}
        >
          {title}
        </Typography>

        {/* Contenedor de botones */}
        <Stack direction="row" spacing={2} alignItems="center" sx={{  mr: { xs: 0, md: 6 },}}>
          <Button
            variant="contained"
            onClick={() => setOpenEditModal(true)}
            sx={{
              backgroundColor: "#1976d2",
              color: "#ffffff",
              borderRadius: "20px",
              px: "20px",
              py: "8px",
              fontWeight: "bold",
              textTransform: "uppercase",
              "&:hover": {
                backgroundColor: "#1976d2",
              },
            }}
          >
            Editar conclusiones
          </Button>

          <IconButton
            onClick={() => setOpenUploadModal(true)}
            sx={{
              backgroundColor: "#ffffff",
              color: "#000000",
              borderRadius: "16px",
              "&:hover": {
                backgroundColor: "#f0f0f0",
              },
            }}
          >
            <UploadIcon sx={{ fontSize: "36px" }} />
          </IconButton>
        </Stack>
      </Grid>

      {/* Tabla */}
      <Box
        sx={{
          overflowX: "auto",
          borderRadius: "12px",
          backgroundColor: "#fff",
          boxShadow: "0 5px 10px rgba(0,0,0,0.1)",
        }}
      >
        <Box sx={{ minWidth: "800px" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            getRowId={(row) => row.id}
            pageSizeOptions={[limit]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: limit, page: 0 },
              },
            }}
            pagination
            onPageChange={handlePageChange}
            getRowHeight={() => rowHeight}
            sx={{
              border: "none",
              fontFamily: "Arial, sans-serif",
              fontSize: "12px",
              "& .MuiDataGrid-cell": {
                fontSize: "14px",
                borderBottom: "1px solid #eee",
                textAlign: "center",
                whiteSpace: "normal !important",
                wordBreak: "break-word",
                lineHeight: "1.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              },
              "& .MuiDataGrid-row": {
                minHeight: "60px",
                maxHeight: "auto",
              },
              "& .MuiDataGrid-columnHeader": {
                fontSize: "20px",
                fontFamily: "'Roboto', sans-serif",
                backgroundColor: "#f0f0f0",
                color: "#333",
                wordBreak: "break-word",
                whiteSpace: "normal !important",
                textAlign: "center",
              },
              "& .MuiDataGrid-footerContainer": {
                borderTop: "1px solid #ccc",
                backgroundColor: "#fafafa",
              },
              "& .MuiDataGrid-row:hover": {
                backgroundColor: "#f5f5f5",
              },
            }}
          />
        </Box>
      </Box>

      {/* Modales */}
      <EvidenceUploadDocumentsModal
        open={openUploadModal}
        onClose={() => setOpenUploadModal(false)}
        onUploadSuccess={onUploadSuccess}
      />

      <EvidenceConclusionsModal
        open={openEditModal}
        onClose={() => setOpenEditModal(false)}
      />
    </Box>
  );
};

export default EvidenceTableDocument;
