// routes/gameRoutes.js

const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const settingsRoutes = require('./settingsRoutes');
// Create a new game
router.post('/create', gameController.createGame);

// Join an existing game
router.post('/join', gameController.joinGame);

// Get game state
router.get('/state/:roomCode', gameController.getGameState);
router.use('/settings',settingsRoutes);

module.exports = router;