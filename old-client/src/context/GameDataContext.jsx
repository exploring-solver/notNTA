import React, { createContext, useContext, useCallback } from 'react';

const GameDataContext = createContext();

export const useGameData = () => {
  const context = useContext(GameDataContext);
  if (!context) {
    throw new Error('useGameData must be used within a GameDataProvider');
  }
  return context;
};

export const GameDataProvider = ({ children }) => {
  const storeGameData = useCallback((data) => {
    const gameData = {
      roomCode: data.roomCode,
      userId: data.userId,
      name: data.name,
      isHost: data.isHost,
      joinedAt: new Date().toISOString()
    };
    localStorage.setItem('gameData', JSON.stringify(gameData));
    localStorage.setItem('roomCode', data.roomCode);
    console.log('Game data stored:', gameData);
  }, []);

  const getGameData = useCallback(() => {
    try {
      const gameData = localStorage.getItem('gameData');
      return gameData ? JSON.parse(gameData) : null;
    } catch (error) {
      console.error('Error parsing game data:', error);
      return null;
    }
  }, []);

  const clearGameData = useCallback(() => {
    console.log('Clearing game data');
    localStorage.removeItem('gameData');
    localStorage.removeItem('roomCode');
  }, []);

  const updateGameData = useCallback((updates) => {
    const currentData = getGameData();
    if (currentData) {
      const updatedData = { ...currentData, ...updates };
      localStorage.setItem('gameData', JSON.stringify(updatedData));
      console.log('Game data updated:', updatedData);
    }
  }, [getGameData]);

  const value = {
    storeGameData,
    getGameData,
    clearGameData,
    updateGameData
  };

  return (
    <GameDataContext.Provider value={value}>
      {children}
    </GameDataContext.Provider>
  );
};
