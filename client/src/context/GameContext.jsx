// context/GameContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import io from 'socket.io-client';

const GameContext = createContext();

export const useGameContext = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [gameState, setGameState] = useState('home');
  const [gameData, setGameData] = useState(null);
  const [players, setPlayers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [timer, setTimer] = useState(null);
  const [winner, setWinner] = useState(null);
  const [isActiveGame, setIsActiveGame] = useState(false);

  // Initialize socket connection and handle reconnection
  useEffect(() => {
    const newSocket = io('http://localhost:5000'); // Replace with your server URL
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to socket server');
      
      // Check if there's stored game data for reconnection
      const storedGameData = JSON.parse(localStorage.getItem('gameData'));
      if (storedGameData) {
        const { name, roomCode, socketId } = storedGameData;
        
        // Emit a reconnect event
        newSocket.emit('reconnectToGame', { name, roomCode, socketId });
      }
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });

    // Clean up on unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Handle socket events
  useEffect(() => {
    if (!socket) return;

    // Game created
    socket.on('gameCreated', (data) => {
      const gameData = {
        roomCode: data.roomCode,
        isHost: true,
        playerName: data.playerName,
        socketId: socket.id,  // Store socketId here
      };
      setGameData(gameData);
      setIsActiveGame(true);
      localStorage.setItem('gameData', JSON.stringify(gameData)); // Save to localStorage
      setGameState('lobby');
    });

    // Game joined
    socket.on('gameJoined', (data) => {
      const gameData = {
        roomCode: data.roomCode,
        isHost: false,
        playerName: data.playerName,
        socketId: socket.id,  // Store socketId here
      };
      setGameData(gameData);
      setIsActiveGame(true);
      localStorage.setItem('gameData', JSON.stringify(gameData)); // Save to localStorage
      setGameState('lobby');
    });

    // Reconnection successful
    socket.on('rejoinSuccess', (gameData) => {
      setGameData({
        roomCode: gameData.roomCode,
        playerName: gameData.playerName,
        socketId: socket.id,
      });
      setGameState(gameData.gameState);
      setIsActiveGame(true);
      localStorage.setItem('gameData', JSON.stringify(gameData)); // Update localStorage
    });

    socket.on('rejoinFailed', (data) => {
      alert(data.message);
      localStorage.removeItem('gameData');
      setGameData(null);
      setGameState('home');
    });

    return () => {
      socket.off('gameCreated');
      socket.off('gameJoined');
      socket.off('rejoinSuccess');
      socket.off('rejoinFailed');
    };
  }, [socket]);

  const leaveGame = () => {
    setGameState('home');
    setGameData(null);
    setPlayers([]);
    setMessages([]);
    setCurrentQuestion(null);
    setTimer(null);
    setWinner(null);
    setIsActiveGame(false);
    localStorage.removeItem('gameData'); // Clear localStorage on leave
    if (socket && gameData) {
      socket.emit('leaveGame', { roomCode: gameData.roomCode });
    }
  };

  return (
    <GameContext.Provider
      value={{
        socket,
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
        isActiveGame,
        setIsActiveGame,
        leaveGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
