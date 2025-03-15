// sockets/reconnectHandlers.js
const { getGameByRoomCode, getCurrentGameState } = require('../utils/gameUtils');

module.exports = (io, socket) => {
  // Handle reconnection
  socket.on('reconnectToGame', async ({ roomCode, userId, name }) => {
    console.log('Reconnection attempt:', { roomCode, userId, name });
  
    try {
      const game = await getGameByRoomCode(roomCode);
      console.log(`Game found: ${game ? 'Yes' : 'No'} for roomCode: ${roomCode}`);
  
      if (!game) {
        socket.emit('reconnectFailed', { message: 'Game not found' });
        console.log(`Game not found for room code: ${roomCode}`);
        return;
      }
  
      const player = game.players.find(p => p.userId && p.userId.toString() === userId);
      console.log(`Player found in game: ${player ? 'Yes' : 'No'}`);
  
      if (player) {
        console.log('Reconnecting player:', {
          name: player.name,
          userId: player.userId,
          oldSocketId: player.socketId,
          newSocketId: socket.id
        });
  
        player.socketId = socket.id;
        player.connected = true; // Mark as connected
        await game.save();
  
        socket.join(roomCode);
        socket.userId = userId;
        socket.name = name;
        socket.roomCode = roomCode;
        socket.isHost = player.isHost;
  
        socket.emit('reconnectSuccess', {
          roomCode: game.roomCode,
          gameState: game.gameState,
          players: game.players,
          currentPlayer: {
            userId: player.userId,
            name: player.name,
            isHost: player.isHost,
            team: player.team
          }
        });
  
        io.to(roomCode).emit('playerReconnected', {
          userId: player.userId,
          name: player.name,
          players: game.players
        });
  
        console.log(`${name} (${userId}) successfully reconnected to room ${roomCode}`);
      } else {
        console.log(`Player ${name} (${userId}) not found in game`);
        socket.emit('reconnectFailed', {
          message: 'Not in game',
          detail: 'You are not part of this game. Please join as a new player.'
        });
        socket.emit('clearGameData');
      }
    } catch (error) {
      console.error(`Error during reconnection for room ${roomCode}:`, error);
      socket.emit('reconnectFailed', {
        message: 'Failed to reconnect to game',
        detail: error.message
      });
    }
  });

  // Handle disconnection
  // socket.on('disconnect', async () => {
  //   try {
  //     if (socket.roomCode) {
  //       const game = await getGameByRoomCode(socket.roomCode);
  //       if (game) {
  //         // Mark player as disconnected but don't remove them
  //         const player = game.players.find(p => p.socketId === socket.id);
  //         if (player) {
  //           player.disconnectedAt = new Date();
  //           await game.save();

  //           // Notify other players about the disconnection
  //           io.to(socket.roomCode).emit('playerDisconnected', {
  //             userId: player.userId,
  //             name: player.name,
  //             temporary: true // Indicate this might be temporary
  //           });
  //         }
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Error handling disconnection:', error);
  //   }
  // });

  // Optional: Handle explicit leave game
  // socket.on('leaveGame', async ({ roomCode }) => {
  //   try {
  //     if (!roomCode) return;

  //     const game = await getGameByRoomCode(roomCode);
  //     if (game) {
  //       // Remove player completely when they explicitly leave
  //       game.players = game.players.filter(p => p.socketId !== socket.id);
  //       await game.save();

  //       // Leave the socket room
  //       socket.leave(roomCode);

  //       // Notify other players
  //       io.to(roomCode).emit('playerLeft', {
  //         userId: socket.userId,
  //         name: socket.name,
  //         players: game.players
  //       });

  //       // Clean up socket properties
  //       socket.roomCode = null;
  //       socket.userId = null;
  //       socket.name = null;
  //       socket.isHost = null;
  //     }
  //   } catch (error) {
  //     console.error('Error handling leave game:', error);
  //   }
  // });
};