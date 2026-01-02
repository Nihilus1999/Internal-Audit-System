import { useState } from "react";
import { Box } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

const ExecutionMainTable = ({
  rows,
  columns,
  limit,
  rowHeight,
}) => {
  const [page, setPage] = useState(0);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    onPageChange?.(newPage + 1);
  };

  return (
    <>
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
    </>
  );
};

export default ExecutionMainTable;
