const { getGameByRoomCode, isPlayerInGame, getCurrentGameState } = require('../utils/gameUtils');

module.exports = (io, socket) => {
  // Handle reconnection
  socket.on('reconnectToGame', async ({ roomCode, name }) => {
    console.log('Reconnection attempt:', { roomCode, name });

    try {
      const game = await getGameByRoomCode(roomCode);
      console.log(`Game found: ${game ? 'Yes' : 'No'} for roomCode: ${roomCode}`);

      if (!game) {
        socket.emit('rejoinFailed', { message: 'Game not found' });
        console.log(`Game not found for room code: ${roomCode}`);
        return;
      }

      const player = game.players.find((p) => p.name === name);
      console.log(`Player found in game: ${player ? 'Yes' : 'No'}`);

      if (player) {
        // Update socket ID
        console.log('Updating player socketId:', { oldSocketId: player.socketId, newSocketId: socket.id });
        player.socketId = socket.id;
        await game.save();

        socket.join(roomCode);
        socket.name = name;
        socket.roomCode = roomCode;
        socket.isHost = player.isHost;

        const gameState = getCurrentGameState(game);
        socket.emit('rejoinSuccess', gameState);

        console.log(`${name} successfully rejoined room ${roomCode}`);
      } else {
        socket.emit('rejoinFailed', { message: 'Player not found in game' });
        console.log(`Player ${name} not found in game for room ${roomCode}`);
      }
    } catch (error) {
      console.error(`Error during reconnection for room ${roomCode}:`, error);
      socket.emit('rejoinFailed', { message: 'Internal server error' });
    }
  });
};
