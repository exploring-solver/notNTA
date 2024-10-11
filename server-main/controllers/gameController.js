const Game = require('../models/Game');
const Question = require('../models/Question');
const { generateRoomCode } = require('../utils/gameUtils');

// Create a new game
exports.createGame = async (req, res) => {
  try {
    const { name } = req.body;
    const roomCode = generateRoomCode();

    const newGame = new Game({
      roomCode,
      hostId: null, // Will be set when the host connects via Socket.IO
      players: [],
      settings: {},
      questions: [],
    });

    await newGame.save();

    res.status(201).json({ roomCode, message: 'Game created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating game', error });
  }
};

// Join an existing game
exports.joinGame = async (req, res) => {
  try {
    const { roomCode } = req.body;
    const game = await Game.findOne({ roomCode });

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    res.status(200).json({ message: 'Joined game successfully', gameState: game.gameState });
  } catch (error) {
    res.status(500).json({ message: 'Error joining game', error });
  }
};

// Get game state
exports.getGameState = async (req, res) => {
  try {
    const { roomCode } = req.params;
    const game = await Game.findOne({ roomCode }).populate('questions');

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    res.status(200).json(game);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching game state', error });
  }
};
