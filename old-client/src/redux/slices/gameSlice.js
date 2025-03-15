import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Game session state
  roomCode: localStorage.getItem('roomCode') || null,
  gameStatus: 'lobby', // lobby, playing, ended
  loading: false,
  error: null,
  
  // Game mechanics state
  currentRound: 1,
  currentQuestion: null,
  timeRemaining: 0,
  roundInProgress: false,
  gameLoaded: false,
  
  // Players and scores
  players: [],
  teams: {
    red: { score: 0, players: [] },
    blue: { score: 0, players: [] }
  },
  winner: null,
  settings: {}
};

const logWithTimestamp = (message, ...args) => {
  console.log(`[${new Date().toISOString()}] ${message}`, ...args);
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    initializeGame: (state) => {
      logWithTimestamp('Initializing game with state:', state);
      state.gameLoaded = true;
      state.gameStatus = 'lobby';
      if (!state.roomCode) {
        state.players = [];
        state.teams = {
          red: { score: 0, players: [] },
          blue: { score: 0, players: [] }
        };
      }
    },

    setRoomCode: (state, action) => {
      logWithTimestamp('Setting room code:', action.payload);
      state.roomCode = action.payload;
      localStorage.setItem('roomCode', action.payload);
    },

    updateGameStatus: (state, action) => {
      logWithTimestamp('Updating game status to:', action.payload);
      state.gameStatus = action.payload;
      if (action.payload === 'ended') {
        state.roundInProgress = false;
      }
    },

    updatePlayers: (state, action) => {
      logWithTimestamp('Updating players list. New players:', action.payload);
      const newPlayers = action.payload;
      state.players = newPlayers.map(newPlayer => {
        const existingPlayer = state.players.find(p =>
          p.userId?.toString() === newPlayer.userId?.toString()
        );
        return {
          ...newPlayer,
          connected: newPlayer.connected ?? existingPlayer?.connected ?? true
        };
      });

      state.teams.red.players = state.players.filter(p => p.team === 'red');
      state.teams.blue.players = state.players.filter(p => p.team === 'blue');
    },

    updatePlayerStatus: (state, action) => {
      const { userId, updates } = action.payload;
      logWithTimestamp('Updating player status for userId:', userId, 'Updates:', updates);
      const playerIndex = state.players.findIndex(p =>
        p.userId?.toString() === userId?.toString()
      );
      if (playerIndex !== -1) {
        state.players[playerIndex] = {
          ...state.players[playerIndex],
          ...updates
        };
      }
    },

    updateGameState: (state, action) => {
      const { round, question, timeRemaining, roundInProgress } = action.payload;
      logWithTimestamp('Updating game state:', action.payload);
      if (round !== undefined) state.currentRound = round;
      if (question !== undefined) state.currentQuestion = question;
      if (timeRemaining !== undefined) state.timeRemaining = timeRemaining;
      if (roundInProgress !== undefined) state.roundInProgress = roundInProgress;
    },

    updateScores: (state, action) => {
      const { red, blue } = action.payload;
      logWithTimestamp('Updating scores. Red:', red, 'Blue:', blue);
      state.teams.red.score = red;
      state.teams.blue.score = blue;
    },

    setWinner: (state, action) => {
      logWithTimestamp('Setting winner:', action.payload);
      state.winner = action.payload;
      state.gameStatus = 'ended';
    },

    resetGame: (state) => {
      logWithTimestamp('Resetting game. Preserving roomCode and players.');
      const preservedData = {
        roomCode: state.roomCode,
        players: state.players.map(p => ({
          ...p,
          hasAnswered: false,
          lastAnswer: null
        }))
      };
      return {
        ...initialState,
        ...preservedData
      };
    }
  }
});

// Selectors
export const selectGameState = (state) => state.game;
export const selectPlayers = (state) => state.game.players;
export const selectTeams = (state) => state.game.teams;
export const selectGameStatus = (state) => state.game.gameStatus;
export const selectCurrentRound = (state) => state.game.currentRound;
export const selectIsHost = (state, userId) =>
  state.game.players.some(p => p.userId?.toString() === userId?.toString() && p.isHost);

export const {
  initializeGame,
  setRoomCode,
  updateGameStatus,
  updatePlayers,
  updatePlayerStatus,
  updateGameState,
  updateScores,
  setWinner,
  resetGame
} = gameSlice.actions;

export default gameSlice.reducer;
