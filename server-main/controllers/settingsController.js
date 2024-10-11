// controllers/settingsController.js

const Game = require('../models/Game');

// Update game settings
exports.updateGameSettings = async (req, res) => {
  try {
    const { roomCode } = req.params;
    const { rounds, timePerQuestion, questionType, maxPlayers } = req.body;

    // Find the game and update settings
    const game = await Game.findOneAndUpdate(
      { roomCode },
      {
        'settings.rounds': rounds,
        'settings.timePerQuestion': timePerQuestion,
        'settings.questionType': questionType,
        'settings.maxPlayers': maxPlayers,
      },
      { new: true }
    );

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    res.status(200).json({ message: 'Game settings updated successfully', settings: game.settings });
  } catch (error) {
    res.status(500).json({ message: 'Error updating game settings', error });
  }
};

// Get current game settings
exports.getGameSettings = async (req, res) => {
  try {
    const { roomCode } = req.params;

    const game = await Game.findOne({ roomCode });

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    res.status(200).json({ settings: game.settings });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching game settings', error });
  }
};
