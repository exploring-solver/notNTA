const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const config = require('./config');
const Game = require('./models/game');
const gameRoutes = require('./routes/gameRoutes');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ["GET", "POST"]
  }
});

// Connect to MongoDB
mongoose.connect(config.mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Allow CORS for all origins
app.use(cors({
  origin: true, // Allow all origins
  methods: ["GET", "POST"]
}));

// Middleware
app.use(express.json());
app.use('/api/game', gameRoutes);

let currentPlayers = []; // Track the current players in the game
let currentTeamTurn = 'red'; // Start with the red team

// Configure Socket.IO
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle player joining the game
  socket.on('joinGame', async (data) => {
    console.log('Join game initiated:', data);
    const { team, gameId } = data;
    currentPlayers.push({ id: socket.id, team: team, gameId: gameId });
    io.emit('playerJoined', { players: currentPlayers });
    console.log(`Player joined - ID: ${socket.id}, Team: ${team}, Game ID: ${gameId}`);
  });
  

  // Handle answering a question
  socket.on('answerQuestion', async (data) => {
    console.log('Answer received:', data);
    try {
      const { correct, gameId } = data;
      const game = await Game.findById(gameId);
      if (!game) {
        console.error('Game not found.');
        socket.emit('errorMessage', { message: 'Game not found' });
        return;
      }

      if (correct) {
        if (currentTeamTurn === 'red') {
          game.redTeamScore += 1;
        } else {
          game.blueTeamScore += 1;
        }
      }

      if (game.currentRound < game.totalRounds) {
        game.currentRound += 1;
        currentTeamTurn = currentTeamTurn === 'red' ? 'blue' : 'red';
        await game.save();
        io.emit('updateGameState', game);
        console.log(`Game state updated - Round: ${game.currentRound}, Red Score: ${game.redTeamScore}, Blue Score: ${game.blueTeamScore}`);
      } else {
        game.isActive = false;
        await game.save();
        io.emit('gameOver', {
          redTeamScore: game.redTeamScore,
          blueTeamScore: game.blueTeamScore,
          winner: game.redTeamScore > game.blueTeamScore ? 'Red Team' : 'Blue Team'
        });
        console.log('Game over:', {
          redTeamScore: game.redTeamScore,
          blueTeamScore: game.blueTeamScore,
          winner: game.redTeamScore > game.blueTeamScore ? 'Red Team' : 'Blue Team'
        });
      }
    } catch (err) {
      console.error('Error handling answerQuestion:', err);
      socket.emit('errorMessage', { message: 'An error occurred while processing your answer' });
    }
  });

  // Handle player disconnection
  socket.on('disconnect', () => {
    currentPlayers = currentPlayers.filter(player => player.id !== socket.id);
    io.emit('playerLeft', { players: currentPlayers });
    console.log('A user disconnected:', socket.id);
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
