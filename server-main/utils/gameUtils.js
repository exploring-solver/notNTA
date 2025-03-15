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

exports.checkAnswer = async (questionId, answer, timeTaken) => {
  const question = await Question.findById(questionId);
  const isCorrect = question.correctAnswer === answer;
  
  // Calculate score based on time taken and correctness
  const baseScore = 1000;
  const timeMultiplier = Math.max(0, 1 - (timeTaken / 120)); // 120 seconds max
  const scoreChange = isCorrect ? Math.floor(baseScore * timeMultiplier) : 0;
  
  return { isCorrect, scoreChange };
};

exports.updatePlayerScore = (game, socketId, scoreChange) => {
  const player = game.players.find(p => p.socketId === socketId);
  if (player) {
    player.score += scoreChange;
    if (player.team === 'red') {
      game.redTeamScore += scoreChange;
    } else if (player.team === 'blue') {
      game.blueTeamScore += scoreChange;
    }
  }
};

exports.isRoundComplete = (game) => {
  return game.players.every(player => player.hasAnswered);
};

exports.startNextRound = async (io, game) => {
  game.currentRound++;
  game.players.forEach(player => {
    player.hasAnswered = false;
  });
  
  // Get next question
  const nextQuestion = game.questions[game.currentQuestionIndex];
  game.currentQuestionIndex++;
  
  io.to(game.roomCode).emit('roundStarted', {
    question: nextQuestion,
    round: game.currentRound
  });
  
  await game.save();
};

exports.isGameOver = (game) => {
  return game.currentRound >= game.settings.rounds;
};