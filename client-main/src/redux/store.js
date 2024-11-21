import { configureStore } from '@reduxjs/toolkit';
import gameReducer from './slices/gameSlice';
import playerReducer from './slices/playerSlice';

const store = configureStore({
  reducer: {
    game: gameReducer,
    players: playerReducer,
  },
});

export default store;
