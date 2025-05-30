const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/categoryController');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

const categoryController = new CategoryController();

// Obtener todas las categorías (cualquier usuario autenticado)
router.get('/', auth, categoryController.getCategories.bind(categoryController));

// Obtener categoría por ID (cualquier usuario autenticado)
router.get('/:id', auth, categoryController.getCategoryById.bind(categoryController));

// Crear nueva categoría (solo administradores)
router.post('/', auth, isAdmin, categoryController.createCategory.bind(categoryController));

// Actualizar categoría (solo administradores)
router.put('/:id', auth, isAdmin, categoryController.updateCategory.bind(categoryController));

// Eliminar categoría (solo administradores)
router.delete('/:id', auth, isAdmin, categoryController.deleteCategory.bind(categoryController));

module.exports = router;
