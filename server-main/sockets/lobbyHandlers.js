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

    // Notify the client
    socket.emit('gameCreated', { roomCode, playerName: name });

    console.log(`Game created by ${name} with room code ${roomCode}`);
  });

  // Handle joining a game
  socket.on('joinGame', async ({ name, roomCode }) => {
    const game = await getGameByRoomCode(roomCode);

    if (!game) {
      socket.emit('errorMessage', { message: 'Game not found' });
      return;
    }

    // Additional checks...

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

    // Notify the client
    socket.emit('gameJoined', { roomCode, playerName: name });

    // Notify other players
    io.to(roomCode).emit('userJoined', { players: game.players });

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
