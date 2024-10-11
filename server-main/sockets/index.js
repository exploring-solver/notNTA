// sockets/index.js

const connectionHandler = require('./connectionHandler');
const lobbyHandlers = require('./lobbyHandlers');
const gameHandlers = require('./gameHandlers');
const resultsHandlers = require('./resultsHandlers');
const reconnectHandlers = require('./reconnectHandlers');
const hostHandlers = require('./hostHandlers');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('New connection:', socket.id);

    // Connection and disconnection handling
    connectionHandler(io, socket);

    // Lobby phase events
    lobbyHandlers(io, socket);

    // Game phase events
    gameHandlers(io, socket);

    // Results handling
    resultsHandlers(io, socket);

    // Reconnection handling
    reconnectHandlers(io, socket);

    // Host-specific controls
    hostHandlers(io, socket);
  });
};
