import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  players: [],
};

const playerSlice = createSlice({
  name: 'players',
  initialState,
  reducers: {
    setPlayers: (state, action) => {
      state.players = action.payload;
    },
    addPlayer: (state, action) => {
      state.players.push(action.payload);
    },
    removePlayer: (state, action) => {
      state.players = state.players.filter((p) => p.socketId !== action.payload);
    },
  },
});

export const { setPlayers, addPlayer, removePlayer } = playerSlice.actions;
export default playerSlice.reducer;
