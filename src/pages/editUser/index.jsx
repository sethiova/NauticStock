import React, { useEffect, useState } from "react";
import api from "../../api/axiosClient";
import { 
  Box, 
  TextField, 
  Button, 
  useTheme, 
  Alert,
  CircularProgress,
  Typography 
} from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import { Token } from "../../theme";

const schema = yup.object().shape({
  name: yup.string().required("Requerido"),
  account: yup.string().required("Requerido"),
  email: yup.string().email("Inválido").required("Requerido"),
  ranks: yup.string().required("Requerido"),
  password: yup.string().min(8, "Mínimo 8 caracteres"),
  confirm_password: yup
    .string()
    .oneOf([yup.ref("password"), null], "Las contraseñas no coinciden")
});

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = Token(theme.palette.mode);
  
  const [initVals, setInitVals] = useState(null);
  const [originalData, setOriginalData] = useState(null); // 👈 NUEVO: Datos originales
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false); // 👈 NUEVO: Estado de envío

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 👇 CORREGIR: Usar /api/users/
        const { data } = await api.get(`/api/users/${id}`);
        
        const userData = {
          name: data.name || '',
          account: data.account || '',
          email: data.email || '',
          ranks: data.ranks || '',
          password: "",
          confirm_password: ""
        };
        
        setInitVals(userData);
        // 👇 NUEVO: Guardar datos originales para comparación
        setOriginalData({
          name: data.name || '',
          account: data.account || '',
          email: data.email || '',
          ranks: data.ranks || ''
        });
        
      } catch (err) {
        console.error('Error cargando usuario:', err);
        setError(err.response?.data?.error || 'Error al cargar usuario');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  // 👇 NUEVA FUNCIÓN: Verificar si hay cambios
  const hasChanges = (values) => {
    if (!originalData) return false;
    
    // Verificar cambios en campos básicos
    const basicFieldsChanged = 
      values.name !== originalData.name ||
      values.account !== originalData.account ||
      values.email !== originalData.email ||
      values.ranks !== originalData.ranks;
    
    // Verificar si se está cambiando la contraseña
    const passwordChanged = values.password && values.password.length > 0;
    
    return basicFieldsChanged || passwordChanged;
  };

  const handleSubmit = async (values) => {
    // 👇 NUEVO: Validar que hay cambios
    if (!hasChanges(values)) {
      setError("No se han realizado cambios para guardar");
      return;
    }

    // 👇 NUEVO: Validar contraseñas si se están cambiando
    if (values.password || values.confirm_password) {
      if (!values.password) {
        setError("Debes ingresar una nueva contraseña");
        return;
      }
      if (values.password !== values.confirm_password) {
        setError("Las contraseñas no coinciden");
        return;
      }
      if (values.password.length < 8) {
        setError("La contraseña debe tener al menos 8 caracteres");
        return;
      }
    }

    try {
      setSubmitting(true);
      setError(null);

      // 👇 PREPARAR PAYLOAD SOLO CON CAMPOS MODIFICADOS
      const payload = {};
      
      // Solo incluir campos que cambiaron
      if (values.name !== originalData.name) payload.name = values.name;
      if (values.account !== originalData.account) payload.account = values.account;
      if (values.email !== originalData.email) payload.email = values.email;
      if (values.ranks !== originalData.ranks) payload.ranks = values.ranks;
      
      // Solo incluir contraseña si se está cambiando
      if (values.password) payload.password = values.password;

      console.log('Enviando payload:', payload);

      // 👇 CORREGIR: Usar /api/users/
      await api.put(`/api/users/${id}`, payload);
      
      // Redirigir con éxito
      navigate("/team", { 
        state: { 
          message: "Usuario actualizado exitosamente",
          severity: "success" 
        }
      });
      
    } catch (err) {
      console.error('Error actualizando usuario:', err);
      setError(err.response?.data?.error || 'Error al actualizar usuario');
    } finally {
      setSubmitting(false);
    }
  };

  // 👇 PANTALLA DE CARGA
  if (loading) {
    return (
      <Box m="20px" display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress size={60} />
        <Box ml={2} fontSize="1.2rem">Cargando usuario...</Box>
      </Box>
    );
  }

  // 👇 PANTALLA DE ERROR
  if (error && !initVals) {
    return (
      <Box m="20px">
        <Header title="Error" subtitle="No se pudo cargar el usuario" />
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="outlined" 
          onClick={() => navigate("/team")}
          sx={{ mt: 2 }}
        >
          Volver al Equipo
        </Button>
      </Box>
    );
  }

  if (!initVals) return null;

  return (
    <Box m="20px">
      <Header title="Editar Usuario" subtitle={`ID ${id} - ${initVals.name}`} />
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box
        m="40px auto"
        p="30px"
        borderRadius="12px"
        maxWidth="600px"
        boxShadow={4}
        sx={{ backgroundColor: colors.primary[400] }}
      >
        <Formik
          initialValues={initVals}
          validationSchema={schema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, errors, touched, handleBlur, handleChange, handleSubmit, dirty }) => (
            <form onSubmit={handleSubmit}>
              <Box 
                display="grid" 
                gap="20px" 
                gridTemplateColumns="repeat(12,1fr)"
                sx={{ "& > div": { gridColumn: "span 6" } }}
              >
                <TextField
                  fullWidth 
                  variant="filled" 
                  label="Nombre"
                  name="name" 
                  onBlur={handleBlur} 
                  onChange={handleChange}
                  value={values.name}
                  error={!!touched.name && !!errors.name}
                  helperText={touched.name && errors.name}
                />
                
                <TextField
                  fullWidth 
                  variant="filled" 
                  label="Matrícula"
                  name="account" 
                  onBlur={handleBlur} 
                  onChange={handleChange}
                  value={values.account}
                  error={!!touched.account && !!errors.account}
                  helperText={touched.account && errors.account}
                />
                
                <TextField
                  fullWidth 
                  variant="filled" 
                  label="Email"
                  name="email" 
                  onBlur={handleBlur} 
                  onChange={handleChange}
                  value={values.email}
                  error={!!touched.email && !!errors.email}
                  helperText={touched.email && errors.email}
                />
                
                <TextField
                  fullWidth 
                  variant="filled" 
                  label="Rango"
                  name="ranks" 
                  onBlur={handleBlur} 
                  onChange={handleChange}
                  value={values.ranks}
                  error={!!touched.ranks && !!errors.ranks}
                  helperText={touched.ranks && errors.ranks}
                />

                {/* 👇 SECCIÓN DE CONTRASEÑA MEJORADA */}
                <Box sx={{ gridColumn: "span 12", mt: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Cambiar Contraseña (Opcional)
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Deja estos campos vacíos si no deseas cambiar la contraseña
                  </Typography>
                </Box>

                <TextField
                  fullWidth 
                  variant="filled" 
                  type="password"
                  label="Nueva contraseña"
                  name="password" 
                  onBlur={handleBlur} 
                  onChange={handleChange}
                  value={values.password}
                  error={!!touched.password && !!errors.password}
                  helperText={touched.password && errors.password}
                />
                
                <TextField
                  fullWidth 
                  variant="filled" 
                  type="password"
                  label="Confirmar contraseña"
                  name="confirm_password"
                  onBlur={handleBlur} 
                  onChange={handleChange}
                  value={values.confirm_password}
                  error={!!touched.confirm_password && !!errors.confirm_password}
                  helperText={touched.confirm_password && errors.confirm_password}
                />
              </Box>

              {/* 👇 BOTONES MEJORADOS */}
              <Box display="flex" justifyContent="space-between" alignItems="center" mt="30px">
                <Typography variant="body2" color="text.secondary">
                  {hasChanges(values) ? 
                    "✓ Hay cambios pendientes por guardar" : 
                    "Sin cambios"
                  }
                </Typography>
                
                <Box display="flex" gap="10px">
                  <Button
                    type="button"
                    color="secondary"
                    variant="outlined"
                    onClick={() => navigate("/team")}
                    disabled={submitting}
                    sx={{ px: 4, py: 1.5 }}
                  >
                    Cancelar
                  </Button>
                  
                  <Button
                    type="submit"
                    color="secondary"
                    variant="contained"
                    disabled={!hasChanges(values) || submitting} // 👈 NUEVO: Deshabilitar si no hay cambios
                    sx={{ px: 4, py: 1.5 }}
                  >
                    {submitting ? (
                      <>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        Guardando...
                      </>
                    ) : (
                      "Guardar Cambios"
                    )}
                  </Button>
                </Box>
              </Box>
            </form>
          )}
        </Formik>
      </Box>
    </Box>
  );
};

export default EditUser;