// sockets/lobbyHandlers.js

const { createNewGame, getGameByRoomCode, updateGameSettings, generateRoomCode } = require('../utils/gameUtils');

module.exports = (io, socket) => {
  // Handle game creation
  socket.on('createGame', async ({ name }) => {
    const roomCode = generateRoomCode();
    socket.join(roomCode);
    socket.name = name; 
    socket.roomCode = roomCode;
    socket.isHost = true;

    const game = await createNewGame(roomCode, name, socket.id);

    io.to(roomCode).emit('gameCreated', { roomCode, game });
    console.log(`Game created by ${name} with room code ${roomCode}`);
  });

  // Handle joining a game
  socket.on('joinGame', async ({ name, roomCode }) => {
    const game = await getGameByRoomCode(roomCode);

    if (!game) {
      socket.emit('errorMessage', { message: 'Game not found' });
      return;
    }

    // Check if game is in lobby state
    if (game.gameState !== 'lobby') {
      socket.emit('errorMessage', { message: 'Game has already started' });
      return;
    }

    // Check for max players
    if (game.players.length >= game.settings.maxPlayers) {
      socket.emit('errorMessage', { message: 'Game is full' });
      return;
    }

    socket.join(roomCode);
    socket.name = name;
    socket.roomCode = roomCode;
    socket.isHost = false;

    // Add player to game
    game.players.push({
      socketId: socket.id,
      name,
      team: null,
      score: 0,
      isHost: false,
    });

    await game.save();

    io.to(roomCode).emit('userJoined', { id: socket.id, name });
    console.log(`${name} joined room ${roomCode}`);
  });

  // Handle setting game settings
  socket.on('setGameSettings', async ({ roomCode, settings }) => {
    if (!socket.isHost) {
      socket.emit('errorMessage', { message: 'Only the host can change settings' });
      return;
    }

    const game = await updateGameSettings(roomCode, settings);

    if (game) {
      io.to(roomCode).emit('gameSettingsUpdated', game.settings);
      console.log(`Settings updated for room ${roomCode}`);
    } else {
      socket.emit('errorMessage', { message: 'Failed to update settings' });
    }
  });
};
