import React, { useState, useEffect } from "react";
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Button, CircularProgress, Alert, Chip, Card, CardContent, Grid } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosClient";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, CartesianGrid, PieChart, Pie, Cell
} from "recharts";

const Dashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Estados para gráficas
  const [inventoryData, setInventoryData] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [summaryData, setSummaryData] = useState({});
  const [chartsLoading, setChartsLoading] = useState(true);

  // Colores adaptativos para gráficas
  const chartColors = isDarkMode 
    ? {
        primary: '#90caf9',
        secondary: '#f48fb1', 
        grid: '#555555',
        text: '#ffffff',
        background: 'rgba(255,255,255,0.05)',
        tooltipBg: '#424242',
        lineColor: '#81c784',
        activeDot: '#a5d6a7'
      }
    : {
        primary: '#3f51b5',
        secondary: '#f50057',
        grid: '#e0e0e0', 
        text: '#333333',
        background: 'rgba(0,0,0,0.05)',
        tooltipBg: '#ffffff',
        lineColor: '#4caf50',
        activeDot: '#2e7d32'
      };

  useEffect(() => {
    // Verificar si es admin
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setIsAdmin(user.roleId === 1);
    
    // Cargar datos
    if (user.roleId === 1) {
      fetchRecentHistory();
      fetchChartData();
    } else {
      setLoading(false);
      setChartsLoading(false);
    }
  }, []);

  const fetchChartData = async () => {
    try {
      setChartsLoading(true);
      
      console.log('📊 Cargando datos del dashboard...');
      
      // Obtener datos de las APIs en paralelo
      const [inventoryResponse, activityResponse, summaryResponse] = await Promise.all([
        api.get('/api/dashboard/inventory-stats'),
        api.get('/api/dashboard/activity-stats'),
        api.get('/api/dashboard/summary')
      ]);

      // Procesar datos de inventario
      const inventoryStats = inventoryResponse.data?.data || [];
      console.log('📦 Datos de inventario:', inventoryStats);
      setInventoryData(inventoryStats);

      // Mejorar logging de actividad
      const activityStats = activityResponse.data?.data || [];
      console.log('📈 Datos de actividad RAW:', activityStats);
      console.log('📈 Total de días con datos:', activityStats.filter(d => d.actividad > 0).length);
      
      // Verificar si hay actividad real
      const totalActivity = activityStats.reduce((sum, day) => sum + day.actividad, 0);
      console.log('📈 Total de actividad en 30 días:', totalActivity);
      
      setActivityData(activityStats);

      // Procesar resumen
      const summary = summaryResponse.data?.data || {};
      console.log('📋 Resumen del sistema:', summary);
      setSummaryData(summary);
      
    } catch (err) {
      console.error('❌ Error cargando datos de dashboard:', err);
      console.error('❌ Detalles del error:', err.response?.data);
      setError('Error al cargar datos del dashboard: ' + (err.response?.data?.error || err.message));
    } finally {
      setChartsLoading(false);
    }
  };

  const fetchRecentHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Dashboard: Obteniendo historial reciente...');
      const response = await api.get('/api/history');
      
      // Procesar respuesta
      let dataArray = [];
      if (Array.isArray(response.data)) {
        dataArray = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        dataArray = response.data.data;
      }
      
      // Tomar solo los últimos 10 registros y mapear
      const recent = dataArray.slice(0, 10).map(log => ({
        id: log.id,
        fecha: new Date(log.created_at).toLocaleString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        accion: log.action_type || 'Sin acción',
        quien: log.performed_by_name || 'Sistema',
        descripcion: log.description || 'Sin descripción'
      }));
      
      setHistoryData(recent);
      console.log('Dashboard: Historial cargado:', recent.length, 'registros');
      
    } catch (err) {
      console.error('Error cargando historial:', err);
      setError('Error al cargar el historial');
    } finally {
      setLoading(false);
    }
  };

  // Función mejorada para colores de acciones con mejor contraste
  const getActionColor = (accion) => {
    const actionLower = accion.toLowerCase();
    
    if (actionLower.includes('crear')) return 'success';
    if (actionLower.includes('actualizar') || actionLower.includes('editar')) return isDarkMode ? 'info' : 'primary';
    if (actionLower.includes('eliminar')) return 'error';
    if (actionLower.includes('login') || actionLower.includes('logout')) return 'secondary';
    if (actionLower.includes('stock')) return 'warning';
    if (actionLower.includes('habilitar') || actionLower.includes('rehabilitar')) return 'info';
    
    return 'default';
  };

  const handleVerMas = () => {
    navigate('/history');
  };

  const handleRefresh = () => {
    if (isAdmin) {
      fetchRecentHistory();
      fetchChartData();
    }
  };

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="DASHBOARD" subtitle="Resumen del sistema NauticStock" />
        {isAdmin && (
          <Button
            variant="outlined"
            onClick={handleRefresh}
            disabled={loading || chartsLoading}
            sx={{
              borderColor: isDarkMode ? '#90caf9' : '#1976d2',
              color: isDarkMode ? '#90caf9' : '#1976d2',
              backgroundColor: isDarkMode ? 'rgba(144, 202, 249, 0.04)' : 'transparent',
              fontWeight: 'bold',
              minWidth: '120px',
              height: '40px',
              
              '&:hover': {
                borderColor: isDarkMode ? '#64b5f6' : '#1565c0',
                backgroundColor: isDarkMode ? 'rgba(144, 202, 249, 0.08)' : 'rgba(25, 118, 210, 0.04)',
                color: isDarkMode ? '#64b5f6' : '#1565c0',
              },
              
              '&:disabled': {
                borderColor: isDarkMode ? '#555555' : '#e0e0e0',
                color: isDarkMode ? '#888888' : '#cccccc',
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
              }
            }}
          >
            {(loading || chartsLoading) ? (
              <>
                <CircularProgress 
                  size={20} 
                  sx={{ 
                    color: isDarkMode ? '#90caf9' : '#1976d2',
                    mr: 1 
                  }} 
                />
                Cargando...
              </>
            ) : (
              "Actualizar"
            )}
          </Button>
        )}
      </Box>

      {/* TARJETAS DE RESUMEN */}
      {isAdmin && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Productos Total
                </Typography>
                <Typography variant="h4">
                  {chartsLoading ? <CircularProgress size={24} /> : summaryData.productos_total || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Stock Total
                </Typography>
                <Typography variant="h4">
                  {chartsLoading ? <CircularProgress size={24} /> : summaryData.stock_total || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Usuarios Activos
                </Typography>
                <Typography variant="h4">
                  {chartsLoading ? <CircularProgress size={24} /> : `${summaryData.usuarios_activos || 0}/${summaryData.usuarios_total || 0}`}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Actividad (7 días)
                </Typography>
                <Typography variant="h4">
                  {chartsLoading ? <CircularProgress size={24} /> : summaryData.actividad_semanal || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* CONTENEDOR PRINCIPAL - AUMENTADO */}
      <Box display="flex" mt="0px" gap="20px" height="800px"> {/* Aumentado de 700px a 800px */}
        {/* Gráficas lado izquierdo - MÁS ESPACIO */}
        <Box flex={1.5} display="flex" flexDirection="column" justifyContent="space-between" alignItems="center">
          
          {/* 📊 GRÁFICA DE INVENTARIO POR CATEGORÍA - MÁS ALTURA */}
          <Box width="100%" height="60%" display="flex" flexDirection="column" alignItems="center"> {/* Aumentado de 50% a 60% */}
            <Typography variant="h6" gutterBottom sx={{ color: chartColors.text, fontWeight: 'bold' }}>
              Inventario por Categoría
            </Typography>
            {!isAdmin ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <Typography variant="body2" color="text.secondary">
                  Solo administradores pueden ver las estadísticas
                </Typography>
              </Box>
            ) : chartsLoading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <CircularProgress size={40} />
              </Box>
            ) : inventoryData.length === 0 ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <Typography variant="body2" color="text.secondary">
                  No hay datos de inventario disponibles
                </Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={inventoryData} 
                  margin={{ top: 20, right: 30, left: 20, bottom: 120 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                  <XAxis 
                    dataKey="categoria" 
                    tick={{ fontSize: 11, fill: chartColors.text }}
                    angle={-45}
                    textAnchor="end"
                    height={120}
                    stroke={chartColors.text}
                    interval={0}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: chartColors.text }} 
                    stroke={chartColors.text}
                    width={60}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: chartColors.tooltipBg,
                      border: `1px solid ${chartColors.grid}`,
                      borderRadius: '8px',
                      color: chartColors.text,
                      fontSize: '14px'
                    }}
                    formatter={(value, name) => [
                      name === 'cantidad' ? `${value} unidades` : `${value} productos`,
                      name === 'cantidad' ? 'Total en Stock' : 'Productos Distintos'
                    ]}
                    labelFormatter={(label) => `Categoría: ${label}`}
                  />
                  <Legend 
                    wrapperStyle={{ 
                      color: chartColors.text,
                      fontSize: '14px',
                      paddingTop: '10px'
                    }} 
                  />
                  <Bar 
                    dataKey="cantidad" 
                    fill={chartColors.primary}
                    name="Total en Stock"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={60}
                  />
                  <Bar 
                    dataKey="productos" 
                    fill={chartColors.secondary}
                    name="Productos Distintos"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={60}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Box>

          {/* 📈 GRÁFICA DE ACTIVIDAD DEL SISTEMA - REDUCIDA */}
          <Box width="100%" height="35%" display="flex" flexDirection="column" alignItems="center"> {/* Reducido de 45% a 35% */}
            <Typography variant="h6" gutterBottom sx={{ color: chartColors.text, fontWeight: 'bold' }}>
              Actividad del Sistema (Últimos 30 días)
            </Typography>
            {!isAdmin ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <Typography variant="body2" color="text.secondary">
                  Solo administradores pueden ver las estadísticas
                </Typography>
              </Box>
            ) : chartsLoading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <CircularProgress size={40} />
              </Box>
            ) : activityData.length === 0 ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <Typography variant="body2" color="text.secondary">
                  No hay datos de actividad disponibles
                </Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activityData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}> {/* Reducido bottom margin */}
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                  <XAxis 
                    dataKey="fecha" 
                    tick={{ fontSize: 10, fill: chartColors.text }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    stroke={chartColors.text}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: chartColors.text }} 
                    stroke={chartColors.text}
                    width={45}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: chartColors.tooltipBg,
                      border: `1px solid ${chartColors.grid}`,
                      borderRadius: '8px',
                      color: chartColors.text,
                      fontSize: '13px' // Reducido
                    }}
                    formatter={(value, name) => [`${value} operaciones`, 'Actividad']}
                    labelFormatter={(label) => `Fecha: ${label}`}
                  />
                  <Legend 
                    wrapperStyle={{ 
                      color: chartColors.text,
                      fontSize: '13px' // Reducido
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="actividad" 
                    stroke={chartColors.lineColor}
                    strokeWidth={2}
                    dot={{ fill: chartColors.lineColor, strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 5, fill: chartColors.activeDot }}
                    name="Operaciones"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Box>
        </Box>

        {/* Contenedor derecho con historial */}
        <Box
          flex={1}
          bgcolor="rgba(0, 0, 0, 0.7)"
          borderRadius="20px"
          p="20px"
          color="#A5D6A7"
          boxShadow="0 4px 15px rgba(0, 0, 0, 0.5)"
          fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
          overflowY="auto"    
          height="100%" 
          maxHeight="100%"
          display="flex"
          flexDirection="column"
        >
          <Typography variant="h6" fontWeight="bold" mb={2}>
            Actividad Reciente del Sistema
          </Typography>

          {/* Mostrar contenido según el estado */}
          {!isAdmin ? (
            <Box display="flex" justifyContent="center" alignItems="center" flex={1}>
              <Typography variant="body2" color="#888">
                Solo los administradores pueden ver el historial de actividades
              </Typography>
            </Box>
          ) : loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" flex={1}>
              <CircularProgress size={30} sx={{ color: "#A5D6A7" }} />
              <Typography variant="body2" ml={2}>
                Cargando historial...
              </Typography>
            </Box>
          ) : error ? (
            <Box flex={1}>
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
              <Button 
                onClick={fetchRecentHistory} 
                variant="contained" 
                color="primary"
                size="small"
              >
                Reintentar
              </Button>
            </Box>
          ) : historyData.length === 0 ? (
            <Box display="flex" justifyContent="center" alignItems="center" flex={1}>
              <Typography variant="body2" color="#888">
                No hay actividades registradas
              </Typography>
            </Box>
          ) : (
            <>
              <TableContainer 
                component={Paper} 
                sx={{ 
                  backgroundColor: "rgba(255,255,255,0.1)", 
                  flexGrow: 1,       
                  overflowY: "auto",
                  mb: 2
                }}
              >
                <Table stickyHeader aria-label="historial reciente" sx={{ minWidth: 300 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: "#A5D6A7", fontWeight: "bold", fontSize: "0.8rem" }}>
                        Fecha
                      </TableCell>
                      <TableCell sx={{ color: "#A5D6A7", fontWeight: "bold", fontSize: "0.8rem" }}>
                        Acción
                      </TableCell>
                      <TableCell sx={{ color: "#A5D6A7", fontWeight: "bold", fontSize: "0.8rem" }}>
                        Usuario
                      </TableCell>
                      <TableCell sx={{ color: "#A5D6A7", fontWeight: "bold", fontSize: "0.8rem" }}>
                        Descripción
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {historyData.map((row) => (
                      <TableRow 
                        key={row.id} 
                        hover 
                        sx={{ 
                          cursor: "pointer",
                          "&:hover": {
                            backgroundColor: "rgba(255,255,255,0.1)"
                          }
                        }}
                      >
                        <TableCell sx={{ 
                          color: "#C8E6C9", 
                          fontSize: "0.7rem",
                          fontFamily: "monospace",
                          minWidth: "100px"
                        }}>
                          {row.fecha}
                        </TableCell>
                        <TableCell sx={{ 
                          color: "#C8E6C9", 
                          fontSize: "0.7rem",
                          minWidth: "100px"
                        }}>
                          <Chip
                            label={row.accion}
                            color={getActionColor(row.accion)}
                            size="small"
                            sx={{
                              fontSize: "0.65rem",
                              height: "22px",
                              fontWeight: "bold",
                              '& .MuiChip-label': {
                                color: '#ffffff',
                                fontWeight: 'bold',
                                textShadow: '1px 1px 2px rgba(0,0,0,0.7)'
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ 
                          color: "#C8E6C9", 
                          fontSize: "0.7rem",
                          fontWeight: "bold"
                        }}>
                          {row.quien}
                        </TableCell>
                        <TableCell sx={{ 
                          color: "#C8E6C9", 
                          fontSize: "0.7rem",
                          maxWidth: "150px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap"
                        }}>
                          {row.descripcion}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Botón Ver Más */}
              <Box display="flex" justifyContent="center">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleVerMas}
                  size="small"
                  sx={{
                    bgcolor: "#4caf50",
                    color: "white",
                    fontWeight: "bold",
                    px: 2,
                    py: 0.5,
                    "&:hover": {
                      bgcolor: "#45a049"
                    }
                  }}
                >
                  Ver Historial Completo
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;