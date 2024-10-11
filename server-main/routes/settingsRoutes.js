// routes/settingsRoutes.js

const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');

// Update game settings
router.put('/:roomCode', settingsController.updateGameSettings);

// Get current game settings
router.get('/:roomCode', settingsController.getGameSettings);

module.exports = router;
