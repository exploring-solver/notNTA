// sockets/reconnectHandlers.js

const { getGameByRoomCode, isPlayerInGame, getCurrentGameState } = require('../utils/gameUtils');

module.exports = (io, socket) => {
  // Handle reconnection
  socket.on('reconnectToGame', async ({ roomCode, name }) => {
    const game = await getGameByRoomCode(roomCode);

    if (!game) {
      socket.emit('rejoinFailed', { message: 'Game not found' });
      return;
    }

    const player = game.players.find((p) => p.name === name);

    if (player) {
      // Update socket ID
      player.socketId = socket.id;
      await game.save();

      socket.join(roomCode);
      socket.name = name;
      socket.roomCode = roomCode;
      socket.isHost = player.isHost;

      const gameState = getCurrentGameState(game);

      socket.emit('rejoinSuccess', gameState);
      console.log(`${name} rejoined room ${roomCode}`);
    } else {
      socket.emit('rejoinFailed', { message: 'Player not found in game' });
      console.log(`Rejoin failed for ${name} in room ${roomCode}`);
    }
  });
};
