// routes/gameRoutes.js
const express = require('express');
const router = express.Router();
const Game = require('../models/game');

// Initialize a new game
router.post('/new', async (req, res) => {
  try {
    const newGame = new Game();
    await newGame.save();
    res.json(newGame);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// Get the current game state
router.get('/state', async (req, res) => {
  try {
    const game = await Game.findOne();
    res.json(game);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
