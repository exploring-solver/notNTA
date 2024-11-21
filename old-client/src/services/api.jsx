import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api'; // Adjust as needed

export const createGame = async (name) => {
  const response = await axios.post(`${API_BASE_URL}/game/create`, { name });
  return response.data;
};

export const joinGame = async (name, roomCode) => {
  const response = await axios.post(`${API_BASE_URL}/game/join`, {
    name,
    roomCode,
  });
  return response.data;
};

export const getGameState = async (roomCode) => {
  const response = await axios.get(`${API_BASE_URL}/game/state/${roomCode}`);
  return response.data;
};

export const updateGameSettings = async (roomCode, settings) => {
  const response = await axios.put(`${API_BASE_URL}/settings/${roomCode}`, settings);
  return response.data;
};

export const reconnectToGame = async (roomCode, playerName, isHost) => {
  try {
    const response = await fetch('/api/reconnect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ roomCode, playerName, isHost }),
    });
    if (!response.ok) {
      throw new Error('Failed to reconnect to game');
    }
    return await response.json();
  } catch (error) {
    console.error('Error reconnecting to game:', error);
    throw error;
  }
};