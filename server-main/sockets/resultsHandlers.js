// sockets/resultsHandlers.js

const { getGameByRoomCode, calculateFinalScores, determineWinner } = require('../utils/gameUtils');

module.exports = (io, socket) => {
  // Handle game over
  socket.on('gameOver', async ({ roomCode }) => {
    const game = await getGameByRoomCode(roomCode);

    if (!game) {
      socket.emit('errorMessage', { message: 'Game not found' });
      return;
    }

    const finalScores = calculateFinalScores(game);
    const winner = determineWinner(finalScores);

    io.to(roomCode).emit('gameResults', { finalScores, winner });

    // Reset game state
    game.gameState = 'ended';
    await game.save();

    console.log(`Game over in room ${roomCode}. Winner: ${winner}`);
  });
};
