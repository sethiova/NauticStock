import React, { useState, useEffect, useMemo } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useTheme } from "@mui/material";
import { Token } from "../../theme";
import api from '../../api/axiosClient';
import Header from '../../components/Header';
import { useSearch } from '../../contexts/SearchContext'; // 👈 NUEVO IMPORT
import SearchHighlighter from '../../components/SearchHighlighter'; // 👈 NUEVO IMPORT

const POLL_INTERVAL = 5000; // ms

const History = () => {
  const theme = useTheme();
  const colors = Token(theme.palette.mode);
  
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // 👇 NUEVO: Contexto de búsqueda
  const { searchTerm, isSearching } = useSearch();

  // Manejo seguro de colores con fallbacks
  const safeColors = colors || {};

  // 👇 CORREGIR el filteredRows useMemo
const filteredRows = useMemo(() => {
  if (!isSearching || !searchTerm) {
    return rows;
  }
  
  return rows.filter(row => 
    (row.accion && row.accion.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (row.quien && row.quien.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (row.objetivo && row.objetivo.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (row.descripcion && row.descripcion.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (row.fecha && row.fecha.toLowerCase().includes(searchTerm.toLowerCase()))
  );
}, [rows, isSearching, searchTerm]);

  // Verificar autenticación y permisos al montar
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      
      console.log('History: Verificando auth...', { token: !!token, user });
      
      if (!token) {
        setError("No se encontró token de autenticación");
        setLoading(false);
        return;
      }
      
      if (!user || !user.id) {
        setError("No se encontró información de usuario");
        setLoading(false);
        return;
      }
      
      // Verificar si es admin (roleId === 1)
      if (user.roleId !== 1) {
        setError("No tienes permisos para ver el historial (solo administradores)");
        setLoading(false);
        return;
      }
      
      setIsAuthenticated(true);
      setIsAdmin(true);
    };
    
    // Verificar inmediatamente
    checkAuth();
    
    // Si no está autenticado, reintentamos después de un momento
    const timeoutId = setTimeout(checkAuth, 100);
    
    return () => clearTimeout(timeoutId);
  }, []);

 const fetchLogs = async () => {
    if (!isAuthenticated || !isAdmin) {
      console.log('History: No autenticado o no es admin, saltando fetchLogs');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('History: Obteniendo historial...');
      const response = await api.get('/api/history');
      console.log('History: Respuesta completa:', response);
      console.log('History: Tipo de response.data:', typeof response.data);
      console.log('History: Es array response.data:', Array.isArray(response.data));
      
      // 👇 VERIFICAR QUE LA RESPUESTA SEA UN ARRAY
      let dataArray = [];
      if (Array.isArray(response.data)) {
        dataArray = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        // Si viene envuelto en un objeto con propiedad data
        dataArray = response.data.data;
      } else if (response.data && typeof response.data === 'object') {
        console.warn('History: Respuesta no es un array, intentando convertir:', response.data);
        dataArray = [];
      } else {
        console.error('History: Formato de respuesta inválido:', response.data);
        dataArray = [];
      }
      
      console.log('History: Datos a mapear:', dataArray.length || 0);
      
      const mapped = dataArray.map(log => ({
        id:          log.id,
        fecha:       new Date(log.created_at).toLocaleString(),
        accion:      log.action_type || 'Sin acción',
        quien:       log.performed_by_name || 'Sistema',
        objetivo:    log.target_user_name || '-',
        descripcion: log.description || 'Sin descripción'
      }));
      
      setRows(mapped);
    } catch (err) {
      console.error('Error cargando historial:', err);
      console.error('Error response:', err.response);
      const errorMessage = err.response?.data?.error || err.message || 'Error desconocido';
      setError('Error al cargar el historial: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Ejecutar fetchLogs solo cuando esté autenticado y sea admin
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchLogs();
      const intervalId = setInterval(fetchLogs, POLL_INTERVAL);
      return () => clearInterval(intervalId);
    }
  }, [isAuthenticated, isAdmin]);

  // Función helper para obtener el color de la acción
  const getActionColor = (accion) => {
    const actionColors = {
      'Login': safeColors.blueAccent?.[400] || '#2196f3',
      'Logout': safeColors.orangeAccent?.[400] || '#ff9800',
      'Usuario Creado': safeColors.greenAccent?.[400] || '#4caf50',
      'Usuario Actualizado': safeColors.yellowAccent?.[400] || '#ffeb3b',
      'Usuario Eliminado': safeColors.redAccent?.[400] || '#f44336',
      'Producto Creado': safeColors.greenAccent?.[400] || '#4caf50',
      'Producto Actualizado': safeColors.yellowAccent?.[400] || '#ffeb3b',
      'Producto Eliminado': safeColors.redAccent?.[400] || '#f44336',
    };
    
    return actionColors[accion] || safeColors.grey?.[400] || '#9e9e9e';
  };

  // Memoizar columnas para evitar re-renders
  const columns = useMemo(() => [
    { 
      field: 'id',
      headerName: 'ID',
      width: 70,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          fontSize: '0.875rem'
        }}>
          {params.value}
        </Box>
      )
    },
    { 
      field: 'fecha', 
      headerName: 'Fecha y Hora', 
      width: 180,
      flex: 0.8,
      renderCell: (params) => (
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          height: '100%',
          fontSize: '0.875rem',
          fontFamily: 'monospace'
        }}>
          {/* 👇 NUEVO: Resaltar fecha */}
          <SearchHighlighter 
            text={params.value} 
            searchTerm={searchTerm}
          />
        </Box>
      )
    },
    { 
      field: 'accion', 
      headerName: 'Acción', 
      width: 160,
      flex: 0.7,
      renderCell: (params) => {
        const actionColor = getActionColor(params.value);
        return (
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            height: '100%'
          }}>
            <Box sx={{
              backgroundColor: actionColor + '20', // 20% opacity
              color: actionColor,
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '0.875rem',
              fontWeight: 'bold',
              border: `1px solid ${actionColor}40`
            }}>
              {/* 👇 NUEVO: Resaltar acción */}
              <SearchHighlighter 
                text={params.value} 
                searchTerm={searchTerm}
              />
            </Box>
          </Box>
        );
      }
    },
    { 
      field: 'quien', 
      headerName: 'Realizado por', 
      width: 200,
      flex: 1,
      cellClassName: "name-column--cell",
      renderCell: (params) => (
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          height: '100%',
          fontSize: '0.875rem',
          fontWeight: 'bold'
        }}>
          {/* 👇 NUEVO: Resaltar quien */}
          <SearchHighlighter 
            text={params.value} 
            searchTerm={searchTerm}
          />
        </Box>
      )
    },
    { 
      field: 'objetivo', 
      headerName: 'Usuario Afectado', 
      width: 200,
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          height: '100%',
          fontSize: '0.875rem',
          fontStyle: params.value === '-' ? 'italic' : 'normal',
          color: params.value === '-' ? safeColors.grey?.[500] || '#9e9e9e' : 'inherit'
        }}>
          {/* 👇 NUEVO: Resaltar objetivo */}
          <SearchHighlighter 
            text={params.value} 
            searchTerm={searchTerm}
          />
        </Box>
      )
    },
    { 
      field: 'descripcion', 
      headerName: 'Descripción', 
      width: 300,
      flex: 1.5,
      renderCell: (params) => (
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          height: '100%',
          padding: '8px 4px',
          whiteSpace: 'normal', 
          wordWrap: 'break-word',
          lineHeight: 1.3,
          fontSize: '0.875rem',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {/* 👇 NUEVO: Resaltar descripción */}
          <SearchHighlighter 
            text={params.value} 
            searchTerm={searchTerm}
          />
        </Box>
      )
    },
  ], [safeColors, searchTerm]); // 👈 AGREGAR searchTerm a las dependencias

  // Pantalla de carga inicial
  if (loading && !isAuthenticated) {
    return (
      <Box m="20px" display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress size={60} />
        <Box ml={2} fontSize="1.2rem">Verificando permisos...</Box>
      </Box>
    );
  }

  // Error de autenticación o permisos
  if (error && !isAuthenticated) {
    return (
      <Box m="20px">
        <Header
          title="Historial de Operaciones"
          subtitle="Registro de actividad del sistema"
        />
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box m="20px">
      <Header
        title="Historial de Operaciones"
        subtitle={`${rows.length} registros de actividad del sistema`}
      />
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box 
        m="40px 0 0 0" 
        height={{ xs: "70vh", sm: "75vh", md: "80vh" }}
        width="100%"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
            display: 'flex',
            alignItems: 'center',
            padding: '8px',
          },
          "& .name-column--cell": {
            color: safeColors.greenAccent?.[300] || '#4caf50',
            fontWeight: 'bold'
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: safeColors.blueAccent?.[700] || '#1976d2',
            borderBottom: "none",
            fontSize: '0.95rem',
            fontWeight: 'bold'
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: safeColors.primary?.[400] || '#f5f5f5',
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: safeColors.blueAccent?.[700] || '#1976d2',
          },
          "& .MuiCheckbox-root": {
            color: `${safeColors.greenAccent?.[200] || '#4caf50'} !important`,
          },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${safeColors.grey?.[100] || '#ffffff'} !important`,
          },
          "& .MuiDataGrid-row": {
            minHeight: '60px !important',
            "&:hover": {
              backgroundColor: (safeColors.primary?.[300] || '#e3f2fd') + "!important",
            },
          },
          // Responsividad
          [theme.breakpoints.down('md')]: {
            "& .MuiDataGrid-columnHeader": {
              fontSize: '0.8rem',
            },
            "& .MuiDataGrid-cell": {
              fontSize: '0.8rem',
              padding: '4px',
            },
          },
          [theme.breakpoints.down('sm')]: {
            "& .MuiDataGrid-toolbarContainer": {
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 1,
            },
            "& .MuiDataGrid-cell[data-field='id']": {
              display: 'none',
            },
            "& .MuiDataGrid-columnHeader[data-field='id']": {
              display: 'none',
            },
          },
        }}
      >
        <DataGrid
          rows={filteredRows} // 👈 CAMBIAR DE rows A filteredRows
          columns={columns}
          slots={{ toolbar: GridToolbar }}
          loading={loading}
          rowHeight={60}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 25 }
            },
            columns: {
              columnVisibilityModel: {
                id: window.innerWidth > 768,
              },
            },
          }}
          pageSizeOptions={[10, 25, 50, 100]}
          disableRowSelectionOnClick
          disableColumnMenu={window.innerWidth < 768}
          hideFooterSelectedRowCount
          sx={{
            '& .MuiDataGrid-cell': {
              display: 'flex',
              alignItems: 'center',
            },
            '& .MuiDataGrid-renderingZone': {
              maxHeight: 'none !important',
            },
            '& .MuiDataGrid-cell .MuiDataGrid-cellContent': {
              display: 'flex',
              alignItems: 'center',
              height: '100%',
            }
          }}
        />
      </Box>
    </Box>
  );
};

export default History;