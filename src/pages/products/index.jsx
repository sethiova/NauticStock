import { Box } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Token } from "../../theme";
import { mockDataStock } from "../../data/mockData";
import Header from "../../components/Header";
import { useTheme } from "@mui/material";

const Products = () => {
  const theme = useTheme();
  const colors = Token(theme.palette.mode);

  const columns = [
    { field: "id", headerName: "ID", flex: 0.3 },
    { field: "name", headerName: "Nombre del Producto", flex: 1 },
    { field: "description", headerName: "Descripción", flex: 2 },
    { field: "category", headerName: "Categoría", flex: 0.7 },
    { field: "type", headerName: "Tipo", flex: 1 },
    { field: "provider", headerName: "Proveedor", flex: 1 },
    { field: "stock", headerName: "Stock", type: "number", flex: 0.5 },
  ];

  return (
    <Box m="20px">
      <Header
        title="Products"
        subtitle="List of Products"
      />
      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .name-column--cell": {
            color: colors.greenAccent[300],
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${colors.grey[100]} !important`,
          },
        }}
      >
        <DataGrid
          rows={mockDataStock}
          columns={columns}
          slots={{ toolbar: GridToolbar }}
          />
      </Box>
    </Box>
  );
};

export default Products;