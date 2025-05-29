// app/middleware/auth.js
const jwt    = require('jsonwebtoken');
const config = require('../config/config');

module.exports = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }
  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.user = payload;   // { id, name, roleId }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};
