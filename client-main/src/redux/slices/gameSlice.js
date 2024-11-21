import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  roomCode: null,
  gameState: 'lobby', // 'lobby', 'playing', 'completed'
  currentRound: 0,
  questions: [],
  settings: {},
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setGameState: (state, action) => {
      state.gameState = action.payload;
    },
    setRoomCode: (state, action) => {
      state.roomCode = action.payload;
    },
    updateSettings: (state, action) => {
      state.settings = action.payload;
    },
    loadQuestions: (state, action) => {
      state.questions = action.payload;
    },
    nextRound: (state) => {
      state.currentRound += 1;
    },
  },
});

export const { setGameState, setRoomCode, updateSettings, loadQuestions, nextRound } = gameSlice.actions;
export default gameSlice.reducer;
