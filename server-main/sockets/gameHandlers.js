// sockets/gameHandlers.js

const {
    getGameByRoomCode,
    checkAnswer,
    updatePlayerScore,
    isRoundComplete,
    startNextRound,
    isGameOver,
  } = require('../utils/gameUtils');
  
  module.exports = (io, socket) => {
    // Handle starting the game
    socket.on('startGame', async ({ roomCode }) => {
      if (!socket.isHost) {
        socket.emit('errorMessage', { message: 'Only the host can start the game' });
        return;
      }
  
      const game = await getGameByRoomCode(roomCode);
  
      if (!game) {
        socket.emit('errorMessage', { message: 'Game not found' });
        return;
      }
  
      // Update game state
      game.gameState = 'playing';
      game.currentRound = 1;
      await game.save();
  
      // Start the first round
      startNextRound(io, game);
  
      io.to(roomCode).emit('gameStarted', { currentRound: game.currentRound });
      console.log(`Game started in room ${roomCode}`);
    });
  
    // Handle answering a question
    socket.on('answerQuestion', async ({ roomCode, answer, questionId, timeTaken }) => {
      const game = await getGameByRoomCode(roomCode);
  
      if (!game) {
        socket.emit('errorMessage', { message: 'Game not found' });
        return;
      }
  
      const player = game.players.find((p) => p.socketId === socket.id);
  
      if (!player) {
        socket.emit('errorMessage', { message: 'Player not found in game' });
        return;
      }
  
      const { isCorrect, scoreChange } = await checkAnswer(questionId, answer, timeTaken);
  
      // Update player's score
      updatePlayerScore(game, player.socketId, scoreChange);
  
      await game.save();
  
      io.to(roomCode).emit('questionAnswered', {
        playerId: socket.id,
        isCorrect,
        scoreChange,
      });
  
      // Check if the round is complete
      if (isRoundComplete(game)) {
        if (isGameOver(game)) {
          io.to(roomCode).emit('gameOver', { game });
          console.log(`Game over in room ${roomCode}`);
        } else {
          startNextRound(io, game);
          io.to(roomCode).emit('roundComplete', { currentRound: game.currentRound });
          console.log(`Round ${game.currentRound} started in room ${roomCode}`);
        }
      }
    });
  };
  