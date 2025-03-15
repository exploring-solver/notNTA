const authController = require('../controllers/authController');
const gameController = require('../controllers/gameController');
const express = require('express');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/games/create', auth, gameController.createGame);

module.exports = router;