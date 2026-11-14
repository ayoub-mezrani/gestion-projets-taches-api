// routes/authRoutes.js
// ----------------------------------------------------
// Routes mta3 l'authentification. Hedhom routes "publiques" (ma7tajouch
// token), 7it l'utilisateur mazel ma 3andouch token !
// ----------------------------------------------------

const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);

module.exports = router;
