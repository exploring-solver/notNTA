const Game = require('../models/Game');
const Question = require('../models/Question');
const { generateRoomCode } = require('../utils/gameUtils');

// Create a new game
exports.createGame = async (req, res) => {
  try {
    const { name } = req.body;
    const roomCode = generateRoomCode();

    // Generate a temporary hostId
    const temporaryHostId = `temp_${Date.now()}`;

    const newGame = new Game({
      roomCode,
      hostId: temporaryHostId, // Set a temporary hostId
      players: [{
        socketId: temporaryHostId,
        name: name,
        isHost: true
      }],
      settings: {},
      questions: [],
      gameState: 'lobby'
    });

    await newGame.save();

    res.status(201).json({ 
      roomCode, 
      temporaryHostId,
      message: 'Game created successfully' 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating game', error: error.message });
  }
};

// Join an existing game
exports.joinGame = async (req, res) => {
  try {
    const { roomCode, name } = req.body;
    const game = await Game.findOne({ roomCode });

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    // Add the player to the game
    game.players.push({
      socketId: `temp_${Date.now()}`,
      name: name,
      isHost: false
    });

    await game.save();

    res.status(200).json({ message: 'Joined game successfully', gameState: game.gameState });
  } catch (error) {
    res.status(500).json({ message: 'Error joining game', error: error.message });
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
    res.status(500).json({ message: 'Error fetching game state', error: error.message });
  }
};