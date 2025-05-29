// server.js
const express          = require('express');
const bodyParser       = require('body-parser');
const path             = require('path');
const historyRoutes    = require('./app/routes/historyRoutes');
const authRoutes       = require('./app/routes/authRoutes');
const userRoutes       = require('./app/routes/userRoutes');
const avatarRoutes     = require('./app/routes/avatarRoutes');
const productsRoutes   = require('./app/routes/productsRoutes');

const app  = express();
const port = process.env.PORT || 3000;

// 1) Parser JSON
app.use(bodyParser.json());

// 2) Servir uploads
const uploadDir = path.join(__dirname, 'public', 'uploads');
app.use('/uploads', express.static(uploadDir));

// 3) Montar routers - ORDEN CORREGIDO
app.use('/',            authRoutes);       // /login

// Rutas API principales (con middleware auth)
app.use('/api/users',   userRoutes);       // /api/users, /api/users/:id (con auth)
app.use('/api/history', historyRoutes);    // /api/history (con auth + admin)
app.use('/api/products', productsRoutes);  // /api/products (con auth)

// Rutas específicas sin conflicto
app.use('/users',       avatarRoutes);     // /users/:id/avatar (upload de avatares)

// 4) Servir React build
app.use(express.static(path.join(__dirname, 'build')));
app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, 'build', 'index.html'))
);

// 5) Arrancar servidor
app.listen(port, () => console.log(`Servidor en puerto ${port}`));