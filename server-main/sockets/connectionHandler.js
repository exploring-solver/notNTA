// sockets/connectionHandler.js

module.exports = (io, socket) => {
    // Handle user joining a room
    socket.on('join', ({ name, roomCode }) => {
      // Store user information in socket object
      socket.name = name;
      socket.roomCode = roomCode;
  
      // Join the room
      socket.join(roomCode);
  
      // Notify others in the room
      io.to(roomCode).emit('userJoined', { id: socket.id, name });
  
      console.log(`${name} joined room ${roomCode}`);
    });
  
    // Handle user disconnection
    socket.on('disconnect', () => {
      if (socket.roomCode) {
        io.to(socket.roomCode).emit('userDisconnected', { id: socket.id, name: socket.name });
        console.log(`${socket.name} disconnected from room ${socket.roomCode}`);
      }
    });
  };
  