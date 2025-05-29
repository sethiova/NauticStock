import React from "react";
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from "@mui/material";
import Header from "../../components/Header";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  LineChart, Line, CartesianGrid
} from "recharts";

const data = [
  { name: "Ene", uv: 4000, pv: 2400 },
  { name: "Feb", uv: 3000, pv: 1398 },
  { name: "Mar", uv: 2000, pv: 9800 },
  { name: "Abr", uv: 2780, pv: 3908 },
  { name: "May", uv: 1890, pv: 4800 },
];

// Datos ejemplo para la tabla, los borran 
const tableData = [
  { id: 1, nombre: "Juan Pérez", correo: "juan@example.com", rol: "Administrador" },
  { id: 2, nombre: "Ana Gómez", correo: "ana@example.com", rol: "Editor" },
  { id: 3, nombre: "Luis Martínez", correo: "luis@example.com", rol: "Usuario" },
  { id: 4, nombre: "Marta Sánchez", correo: "marta@example.com", rol: "Editor" },
  { id: 5, nombre: "Carlos Ruiz", correo: "carlos@example.com", rol: "Usuario" },
  { id: 6, nombre: "Elena Díaz", correo: "elena@example.com", rol: "Administrador" },
  { id: 7, nombre: "Pedro López", correo: "pedro@example.com", rol: "Usuario" },
  { id: 1, nombre: "Juan Pérez", correo: "juan@example.com", rol: "Administrador" },
  { id: 2, nombre: "Ana Gómez", correo: "ana@example.com", rol: "Editor" },
  { id: 3, nombre: "Luis Martínez", correo: "luis@example.com", rol: "Usuario" },
  { id: 4, nombre: "Marta Sánchez", correo: "marta@example.com", rol: "Editor" },
  { id: 5, nombre: "Carlos Ruiz", correo: "carlos@example.com", rol: "Usuario" },
  { id: 6, nombre: "Elena Díaz", correo: "elena@example.com", rol: "Administrador" },
  { id: 7, nombre: "Pedro López", correo: "pedro@example.com", rol: "Usuario" },
];

const Dashboard = () => {
  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="DASHBOARD" subtitle="Welcome to your dashboard" />
      </Box>

      {/* CONTENEDOR PRINCIPAL */}
      <Box display="flex" mt="0px" gap="20px" height="600px">
        {/* Gráficas lado izquierdo */}
        <Box flex={1} display="flex" flexDirection="column" justifyContent="space-between" alignItems="center">
          <BarChart width={620} height={300} data={data} margin={{ top: 5, right: 5, left: 5, bottom: 20 }}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="pv" fill="#3f51b5" />
            <Bar dataKey="uv" fill="#f50057" />
          </BarChart>

          <LineChart width={620} height={300} data={data} margin={{ top: 5, right: 5, left: 5, bottom: 20}}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="pv" stroke="#3f51b5" />
            <Line type="monotone" dataKey="uv" stroke="#f50057" />
          </LineChart>
        </Box>

        {/* Contenedor derecho con tabla y scroll */}
        <Box
          flex={1}
          bgcolor="rgba(0, 0, 0, 0.7)"
          borderRadius="20px"
          p="30px"
          color="#A5D6A7"
          boxShadow="0 4px 15px rgba(0, 0, 0, 0.5)"
          fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
          overflowY="auto"    
          height="100%" 
          maxHeight="100%"
          display="flex"
          flexDirection="column"
        >
          <Typography variant="h5" fontWeight="bold" mb={3}>
            Titulo referente a lo que contenga la peticion del maxi
          </Typography>

          <TableContainer 
            component={Paper} 
            sx={{ 
              backgroundColor: "rgba(255,255,255,0.1)", 
              flexGrow: 1,       
              overflowY: "auto" 
            }}
          >
            <Table stickyHeader aria-label="usuarios table" sx={{ minWidth: 350 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: "#A5D6A7", fontWeight: "bold" }}>Nombre</TableCell>
                  <TableCell sx={{ color: "#A5D6A7", fontWeight: "bold" }}>Correo</TableCell>
                  <TableCell sx={{ color: "#A5D6A7", fontWeight: "bold" }}>Rol</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tableData.map((row) => (
                  <TableRow key={row.id} hover sx={{ cursor: "pointer" }}>
                    <TableCell sx={{ color: "#C8E6C9" }}>{row.nombre}</TableCell>
                    <TableCell sx={{ color: "#C8E6C9" }}>{row.correo}</TableCell>
                    <TableCell sx={{ color: "#C8E6C9" }}>{row.rol}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
