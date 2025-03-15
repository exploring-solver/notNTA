import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import gameReducer from './slices/gameSlice';
import gameStateReducer from './slices/gameStateSlice';
import errorReducer from './slices/errorSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    game: gameReducer,
    gameState: gameStateReducer,
    error: errorReducer,
  },
});