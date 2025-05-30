const express = require('express');
const router = express.Router();
const LocationController = require('../controllers/locationController');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

const locationController = new LocationController();

// Obtener todas las ubicaciones (cualquier usuario autenticado)
router.get('/', auth, locationController.getLocations.bind(locationController));

// Obtener ubicación por ID (cualquier usuario autenticado)
router.get('/:id', auth, locationController.getLocationById.bind(locationController));

// Crear nueva ubicación (solo administradores)
router.post('/', auth, isAdmin, locationController.createLocation.bind(locationController));

// Actualizar ubicación (solo administradores)
router.put('/:id', auth, isAdmin, locationController.updateLocation.bind(locationController));

// Eliminar ubicación (solo administradores)
router.delete('/:id', auth, isAdmin, locationController.deleteLocation.bind(locationController));

module.exports = router;
