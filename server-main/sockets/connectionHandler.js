const Game = require("../models/Game");
const User = require("../models/User");
const { getGameByRoomCode } = require("../utils/gameUtils");

module.exports = (io, socket) => {
  socket.on('join', async ({ token, roomCode, userId, name }) => {
    try {
      const game = await getGameByRoomCode(roomCode);
  
      if (!game) {
        socket.emit('joinFailed', { message: 'Game not found' });
        return;
      }
  
      // Check if the user is already in the game
      const existingPlayer = game.players.find(p => p.userId && p.userId.toString() === userId);
      if (existingPlayer) {
        socket.emit('joinFailed', {
          message: 'Already in game',
          detail: 'Please refresh to reconnect if disconnected'
        });
        return;
      }
  
      // Reject players without a valid `userId`
      if (!userId) {
        socket.emit('joinFailed', { message: 'Invalid player data' });
        return;
      }
  
      const newPlayer = {
        userId,
        socketId: socket.id,
        name,
        isHost: game.players.length === 0,
        team: null,
        score: 0,
        connected: true
      };
  
      game.players.push(newPlayer);
      await game.save();
  
      socket.join(roomCode);
      socket.userId = userId;
      socket.name = name;
      socket.roomCode = roomCode;
      socket.isHost = newPlayer.isHost;
  
      socket.emit('gameJoined', {
        roomCode: game.roomCode,
        userId,
        name,
        isHost: newPlayer.isHost
      });
  
      io.to(roomCode).emit('playerJoined', { player: newPlayer });
      io.to(roomCode).emit('playersUpdate', { players: game.players });
    } catch (error) {
      socket.emit('joinFailed', { message: 'Failed to join game' });
      console.error('Error during join:', error);
    }
  });

  socket.on('leaveGame', async ({ roomCode }) => {
    try {
      console.log(`User leaving game: socketId=${socket.id}, roomCode=${roomCode}`);
      const game = await getGameByRoomCode(roomCode);
      if (game) {
        console.log(`Game found for roomCode=${roomCode}, removing user socketId=${socket.id}`);
        console.log("game players",game.players)
        game.players = game.players.filter(p => p.socketId !== socket.id);
        await game.save();
        console.log("socket of leaving user: ",socket.userId)
        console.log(`User socketId=${socket.id} removed from game, broadcasting updates`);
        io.to(roomCode).emit('userLeft', {
          userId: socket.userId,
          name: socket.name
        });

        io.to(roomCode).emit('playersUpdate', {
          players: game.players
        });

        console.log(`User socketId=${socket.id} leaving room`);
        socket.leave(roomCode);
        socket.disconnect(true);
      } else {
        console.log(`No game found for roomCode=${roomCode}`);
      }
    } catch (error) {
      console.error('Error handling leave game:', error);
    }
  });

  socket.on('disconnect', async () => {
    try {
      console.log(`Socket disconnected: socketId=${socket.id}`);
      if (socket.roomCode) {
        console.log(`User was in room: roomCode=${socket.roomCode}`);
        const game = await getGameByRoomCode(socket.roomCode);
        if (game) {
          const player = game.players.find(p => p.socketId === socket.id);
          if (player) {
            console.log(`Player found: userId=${player.userId}, marking as disconnected`);
            player.connected = false;
            await game.save();

            console.log(`Broadcasting player disconnected: userId=${player.userId}`);
            io.to(socket.roomCode).emit('userLeft', {
              userId: player.userId,
              name: player.name
            });

            io.to(socket.roomCode).emit('playersUpdate', {
              players: game.players
            });
          } else {
            console.log(`No player found with socketId=${socket.id} in game`);
          }
        } else {
          console.log(`No game found for roomCode=${socket.roomCode}`);
        }
      } else {
        console.log(`Socket disconnect without roomCode`);
      }
    } catch (error) {
      console.error('Error handling disconnection:', error);
    }
  });
};