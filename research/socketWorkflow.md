To implement this real-time game using Socket.IO and Express, we need a well-organized approach to Socket.IO event handling. The architecture should allow for clean separation of concerns while handling different stages of the game. Based on your project requirements, here’s how the socket handlers can be structured in a modular way:

### **Socket Handlers Folder Structure**

Let's break down the socket events according to different game states and phases:

```
backend/
├── sockets/
│   ├── index.js                # Main entry point to initialize Socket.IO handlers
│   ├── connectionHandler.js    # Handles connection and disconnection logic
│   ├── lobbyHandlers.js        # Handles events related to the lobby phase
│   ├── gameHandlers.js         # Handles events during the main game phase
│   ├── resultsHandlers.js      # Handles events related to showing the results and winner
│   ├── reconnectHandlers.js    # Handles reconnections for disconnected users
└── └── hostHandlers.js         # Specific events for host controls like kicking users, changing settings
```

### **Overview of Socket Handlers**

1. **`index.js` (Main Entry Point)**

   This file will be the main entry point for initializing Socket.IO in `server.js`. It will import all the handlers and use them appropriately for different events.

   ```javascript
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
   ```

2. **`connectionHandler.js`**

   Handles user connection, disconnection, and reconnection. It checks if a user is rejoining an existing room.

   ```javascript
   module.exports = (io, socket) => {
     // Handle user connection
     socket.on('join', ({ name, roomCode }) => {
       // Add user to the room
       socket.join(roomCode);
       // Broadcast to the room that a new user has joined
       io.to(roomCode).emit('userJoined', { id: socket.id, name });
     });

     // Handle disconnection
     socket.on('disconnect', () => {
       console.log('User disconnected:', socket.id);
       // Notify other users in the room
       io.emit('userDisconnected', socket.id);
     });
   };
   ```

3. **`lobbyHandlers.js`**

   Manages the lobby phase, including creating a game, joining a room, setting game settings, and kicking users.

   ```javascript
   module.exports = (io, socket) => {
     // Handle game creation
     socket.on('createGame', ({ name }) => {
       const roomCode = generateRoomCode(); // Generate random room code
       socket.join(roomCode);
       // Set the host
       const game = createNewGame(roomCode, name, socket.id);
       io.to(roomCode).emit('gameCreated', { roomCode, game });
     });

     // Handle setting game settings
     socket.on('setGameSettings', ({ roomCode, settings }) => {
       updateGameSettings(roomCode, settings);
       io.to(roomCode).emit('gameSettingsUpdated', settings);
     });

     // Host kicking a player
     socket.on('kickUser', ({ roomCode, userId }) => {
       io.to(userId).emit('kicked');
       io.to(roomCode).emit('userKicked', userId);
     });
   };
   ```

4. **`gameHandlers.js`**

   Deals with the main game phase, including answering questions, managing rounds, and scoring.

   ```javascript
   module.exports = (io, socket) => {
     // Handle the start of the game
     socket.on('startGame', ({ roomCode }) => {
       startGame(roomCode);
       io.to(roomCode).emit('gameStarted');
     });

     // Handle answering a question
     socket.on('answerQuestion', ({ roomCode, answer, questionId, timeTaken }) => {
       const { isCorrect, scoreChange } = checkAnswer(roomCode, questionId, answer, timeTaken);
       // Update score and question state
       updateScore(roomCode, socket.id, isCorrect, scoreChange);
       io.to(roomCode).emit('questionAnswered', { playerId: socket.id, isCorrect, scoreChange });
       // Check if the round is complete
       if (isRoundComplete(roomCode)) {
         io.to(roomCode).emit('roundComplete');
         startNextRound(roomCode);
       }
     });

     // Handle end of a round
     socket.on('endRound', ({ roomCode }) => {
       if (isGameOver(roomCode)) {
         io.to(roomCode).emit('gameOver');
       } else {
         startNextRound(roomCode);
       }
     });
   };
   ```

5. **`resultsHandlers.js`**

   Handles the result phase, calculating final scores and announcing the winner.

   ```javascript
   module.exports = (io, socket) => {
     // Handle game over
     socket.on('gameOver', ({ roomCode }) => {
       const finalScores = calculateFinalScores(roomCode);
       const winner = determineWinner(finalScores);
       io.to(roomCode).emit('gameResults', { finalScores, winner });
       // Return players to the lobby
       io.to(roomCode).emit('returnToLobby');
     });
   };
   ```

6. **`reconnectHandlers.js`**

   Handles reconnections, ensuring users return to the same game state.

   ```javascript
   module.exports = (io, socket) => {
     socket.on('reconnectToGame', ({ roomCode, playerId }) => {
       if (isPlayerInGame(roomCode, playerId)) {
         socket.join(roomCode);
         const gameState = getCurrentGameState(roomCode);
         io.to(socket.id).emit('rejoinSuccess', gameState);
       } else {
         io.to(socket.id).emit('rejoinFailed');
       }
     });
   };
   ```

7. **`hostHandlers.js`**

   Manages host-specific functionalities, such as changing settings and restarting the game.

   ```javascript
   module.exports = (io, socket) => {
     // Host restarts the game
     socket.on('restartGame', ({ roomCode }) => {
       resetGameState(roomCode);
       io.to(roomCode).emit('gameRestarted');
     });

     // Host changes settings mid-game
     socket.on('updateGameSettings', ({ roomCode, newSettings }) => {
       updateGameSettings(roomCode, newSettings);
       io.to(roomCode).emit('gameSettingsUpdated', newSettings);
     });
   };
   ```

### **How Events Will Work Across Game Stages**

1. **Starting Screen**
   - User connects to the server (`connectionHandler`).
   - They can create a game (`lobbyHandlers` for `createGame`) or join an existing game by entering a room code.

2. **Lobby Phase**
   - Once in the lobby, the host can change game settings (`lobbyHandlers` for `setGameSettings`).
   - The host can kick users or change their roles (`hostHandlers` for `kickUser`).
   - Players can see other players joining or leaving (`connectionHandler`).

3. **Main Game**
   - The host starts the game (`gameHandlers` for `startGame`).
   - Players take turns answering questions (`gameHandlers` for `answerQuestion`).
   - Each round is tracked, and the game moves to the next round after all players answer (`gameHandlers` for `endRound`).

4. **Winner Screen**
   - After all rounds, final scores are calculated (`resultsHandlers` for `gameOver`).
   - The game results and winner are announced (`resultsHandlers` for `gameResults`).

5. **Reconnecting Players**
   - If a player disconnects, they can rejoin using the room code (`reconnectHandlers` for `reconnectToGame`).
   - The player will be returned to the current state of the game.

6. **Returning to Lobby**
   - Once the game is over, players can return to the lobby and wait for the host to start a new game or adjust settings.

### **Additional Notes**

- **Data Persistence**: The game state should be stored in the database, including active players, scores, settings, and current round. This will facilitate reconnecting players and persistent game state management.
- **Validation**: Each socket handler should validate incoming data to avoid errors or exploits. This includes checking if players belong to the correct room and have permission to perform actions.

This approach will ensure that your socket event handling remains modular, making the code easier to maintain and extend as you add more features in future phases.