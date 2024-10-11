// sockets/hostHandlers.js

const { getGameByRoomCode, resetGameState, updateGameSettings } = require('../utils/gameUtils');

module.exports = (io, socket) => {
  // Restart the game
  socket.on('restartGame', async ({ roomCode }) => {
    if (!socket.isHost) {
      socket.emit('errorMessage', { message: 'Only the host can restart the game' });
      return;
    }

    const game = await getGameByRoomCode(roomCode);

    if (!game) {
      socket.emit('errorMessage', { message: 'Game not found' });
      return;
    }

    resetGameState(game);
    await game.save();

    io.to(roomCode).emit('gameRestarted');
    console.log(`Game restarted in room ${roomCode}`);
  });

  // Update game settings mid-game
  socket.on('updateGameSettings', async ({ roomCode, newSettings }) => {
    if (!socket.isHost) {
      socket.emit('errorMessage', { message: 'Only the host can update settings' });
      return;
    }

    const game = await updateGameSettings(roomCode, newSettings);

    if (game) {
      io.to(roomCode).emit('gameSettingsUpdated', game.settings);
      console.log(`Game settings updated in room ${roomCode}`);
    } else {
      socket.emit('errorMessage', { message: 'Failed to update settings' });
    }
  });

  // Kick a user
  socket.on('kickUser', async ({ roomCode, userId }) => {
    if (!socket.isHost) {
      socket.emit('errorMessage', { message: 'Only the host can kick users' });
      return;
    }

    const game = await getGameByRoomCode(roomCode);

    if (!game) {
      socket.emit('errorMessage', { message: 'Game not found' });
      return;
    }

    const playerIndex = game.players.findIndex((p) => p.socketId === userId);

    if (playerIndex !== -1) {
      const [removedPlayer] = game.players.splice(playerIndex, 1);
      await game.save();

      io.to(userId).emit('kicked');
      io.to(roomCode).emit('userKicked', { id: userId, name: removedPlayer.name });

      // Disconnect the kicked user
      const clientSocket = io.sockets.sockets.get(userId);
      if (clientSocket) {
        clientSocket.leave(roomCode);
      }

      console.log(`User ${removedPlayer.name} kicked from room ${roomCode}`);
    } else {
      socket.emit('errorMessage', { message: 'User not found in game' });
    }
  });
};
