// context/GameContext.js

import React, { createContext, useContext, useState } from 'react';

const GameContext = createContext();

export const useGameContext = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
  const [gameState, setGameState] = useState('home'); // 'home', 'lobby', 'playing', 'ended'
  const [gameData, setGameData] = useState(null);
  const [players, setPlayers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [timer, setTimer] = useState(null);
  const [winner, setWinner] = useState(null);

  return (
    <GameContext.Provider
      value={{
        gameState,
        setGameState,
        gameData,
        setGameData,
        players,
        setPlayers,
        messages,
        setMessages,
        currentQuestion,
        setCurrentQuestion,
        timer,
        setTimer,
        winner,
        setWinner,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
