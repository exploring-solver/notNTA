import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentRound: 1,
  currentQuestion: null,
  timeRemaining: 0,
  redTeamScore: 0,
  blueTeamScore: 0,
  roundInProgress: false,
  winner: null,
  gameLoaded: false // New flag to track initialization
};

const gameStateSlice = createSlice({
  name: 'gameState',
  initialState,
  reducers: {
    initializeGameState: (state) => {
      console.log('Initializing game state');
      state.gameLoaded = true;
    },
    setCurrentRound: (state, action) => {
      console.log('Setting current round:', action.payload);
      state.currentRound = action.payload;
    },
    setCurrentQuestion: (state, action) => {
      console.log('Setting current question:', action.payload);
      state.currentQuestion = action.payload;
    },
    setTimeRemaining: (state, action) => {
      state.timeRemaining = action.payload;
    },
    updateTeamScores: (state, action) => {
      console.log('Updating team scores:', action.payload);
      const { redTeamScore, blueTeamScore } = action.payload;
      state.redTeamScore = redTeamScore;
      state.blueTeamScore = blueTeamScore;
    },
    setRoundInProgress: (state, action) => {
      console.log('Setting round in progress:', action.payload);
      state.roundInProgress = action.payload;
    },
    setWinner: (state, action) => {
      console.log('Setting winner:', action.payload);
      state.winner = action.payload;
    },
    resetGameState: () => {
      console.log('Resetting game state');
      return initialState;
    }
  }
});

export const {
    initializeGameState,
    setCurrentRound,
    setCurrentQuestion,
    setTimeRemaining,
    updateTeamScores,
    setRoundInProgress,
    setWinner,
    resetGameState
  } = gameStateSlice.actions;
  
  export default gameStateSlice.reducer;