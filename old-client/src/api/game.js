// src/api/game.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const authHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const createGame = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        throw new Error('User not found');
      }
  
      const response = await axios.post(
        `${API_URL}/games/create`,
        {
          userId: user.id,
          name: user.name
        },
        { headers: authHeader() }
      );
      
      if (response.data.roomCode) {
        localStorage.setItem('roomCode', response.data.roomCode);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' };
    }
  };
  
  export const joinGame = async (roomCode) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        throw new Error('User not found');
      }
  
      const response = await axios.post(
        `${API_URL}/games/join`,
        {
          roomCode,
          userId: user.id,
          name: user.name
        },
        { headers: authHeader() }
      );
      
      if (response.data.gameState) {
        localStorage.setItem('roomCode', roomCode);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' };
    }
  };
  

export const getGameState = async (roomCode) => {
  try {
    const response = await axios.get(
      `${API_URL}/games/state/${roomCode}`,
      { headers: authHeader() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error occurred' };
  }
};

// Helper function to clean up game data when leaving
export const leaveGame = () => {
  localStorage.removeItem('roomCode');
};

// Function to check if user has an active game
export const checkActiveGame = () => {
  return localStorage.getItem('roomCode');
};

// Function to handle reconnection
export const reconnectToGame = async () => {
  const roomCode = localStorage.getItem('roomCode');
  if (!roomCode) return null;

  try {
    const gameState = await getGameState(roomCode);
    return { roomCode, gameState };
  } catch (error) {
    // If there's an error (e.g., game no longer exists), clean up stored room code
    localStorage.removeItem('roomCode');
    throw error.response?.data || { message: 'Failed to reconnect to game' };
  }
};