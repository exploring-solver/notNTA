// utils/gameUtils.js

const Game = require('../models/Game');
const Question = require('../models/Question');

exports.getCurrentGameState = (game) => {
  return {
    roomCode: game.roomCode,
    gameState: game.gameState,
    currentRound: game.currentRound,
    redTeamScore: game.redTeamScore,
    blueTeamScore: game.blueTeamScore,
    currentQuestionIndex: game.currentQuestionIndex,
    players: game.players.map(player => ({
      name: player.name,
      team: player.team,
      score: player.score,
      isHost: player.isHost
    })),
    settings: game.settings,
  };
};

exports.generateRoomCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let roomCode = '';
  for (let i = 0; i < 6; i++) {
    roomCode += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return roomCode;
};

// Create a new game in the database
exports.createNewGame = async (roomCode, hostName, hostSocketId) => {
  const newGame = new Game({
    roomCode,
    hostId: hostSocketId,
    players: [
      {
        socketId: hostSocketId,
        name: hostName,
        team: null,
        score: 0,
        isHost: true,
      },
    ],
    settings: {
      rounds: 3,
      timePerQuestion: 120,
      questionType: 'MCQ',
      maxPlayers: 10,
    },
    questions: await Question.aggregate([{ $sample: { size: 30 } }]), // Fetch 30 random questions
  });

  await newGame.save();
  return newGame;
};

// Retrieve a game by room code
exports.getGameByRoomCode = async (roomCode) => {
  return await Game.findOne({ roomCode }).populate('questions');
};

// Update game settings
exports.updateGameSettings = async (roomCode, settings) => {
  const game = await Game.findOneAndUpdate(
    { roomCode },
    { settings },
    { new: true }
  );
  return game;
};

// Other utility functions can be added here as needed
