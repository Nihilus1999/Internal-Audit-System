import { useState } from "react";
import { Box, Grid, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

const TableDocument = ({ title, rows, columns, limit, rowHeight }) => {
  const [page, setPage] = useState(0);
  const handlePageChange = (newPage) => {
    setPage(newPage);
    onPageChange?.(newPage + 1);
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
      {/* Header responsivo */}
      <Grid
        container
        direction={{ xs: "column", sm: "row" }}
        alignItems="center"
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 2, textAlign: { xs: "center", sm: "left" } }}
      >
        <Grid>
          <Typography
            fontWeight="bold"
            sx={{
              fontSize: { xs: "16px", sm: "24px" },
              color: "#ffffff",
              ml: { xs: 0, md: 6 },
            }}
          >
            {title}
          </Typography>
        </Grid>

        <Grid
          sx={{
            display: "flex",
            justifyContent: { xs: "center", sm: "flex-end" },
            mr: { xs: 0, md: 6 },
          }}
        >
        </Grid>
      </Grid>

      {/* Contenedor con scroll horizontal */}
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
    </Box>
  );
};

export default TableDocument;
