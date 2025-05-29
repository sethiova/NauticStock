// app/routes/authRoutes.js
const express        = require('express');
const router         = express.Router();
const UserController = require('../controllers/userController');
const userCtrl       = new UserController();

// POST /login
router.post('/login', async (req, res, next) => {
  try {
    const { token, user } = await userCtrl.login(req.body);
    res.json({ token, user });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

module.exports = router;
