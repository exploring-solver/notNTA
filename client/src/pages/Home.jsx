import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameContext } from '../context/GameContext';

const Home = () => {
  const {
    socket,
    gameState,
    gameData,
    setGameData,
    setIsActiveGame,
    isActiveGame,
  } = useGameContext();
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if there's stored game data for reconnection
    const storedGameData = JSON.parse(localStorage.getItem('gameData'));
    if (storedGameData && !isActiveGame) {
      const { roomCode } = storedGameData;
      setGameData(storedGameData);
      setIsActiveGame(true);
      navigate(`/lobby/${roomCode}`);
    }
  }, [setGameData, setIsActiveGame, navigate, isActiveGame]);

  useEffect(() => {
    if (gameState === 'lobby' && gameData?.roomCode) {
      navigate(`/lobby/${gameData.roomCode}`);
    }
  }, [gameState, gameData, navigate]);

  const handleCreateGame = () => {
    if (name.trim() === '') return;
    if (!socket) {
      console.error('Socket not connected');
      return;
    }

    // Store name separately in localStorage
    localStorage.setItem('playerName', name);

    // Emit 'createGame' event with player name
    socket.emit('createGame', { name });

    // Listen for the game creation response from the server
    socket.on('gameCreated', (data) => {
      const { roomCode } = data;
      const gameData = {
        roomCode,
        playerName: name,
        socketId: socket.id,
        isHost: true,  // This player is the host when creating a game
      };

      // Store game data in context
      setGameData(gameData);
      setIsActiveGame(true);

      // Navigate to the lobby
      navigate(`/lobby/${roomCode}`);
    });
  };

  const handleJoinGame = () => {
    if (name.trim() === '' || roomCode.trim() === '') return;
    if (!socket) {
      console.error('Socket not connected');
      return;
    }

    // Store name separately in localStorage
    localStorage.setItem('playerName', name);

    // Emit 'joinGame' event with player name and room code
    socket.emit('joinGame', { name, roomCode });

    // Listen for the game joining response from the server
    socket.on('gameJoined', (data) => {
      const gameData = {
        roomCode,
        playerName: name,
        socketId: socket.id,
        isHost: false,  // This player is not the host when joining a game
      };

      // Store game data in context
      setGameData(gameData);
      setIsActiveGame(true);

      // Navigate to the lobby
      navigate(`/lobby/${roomCode}`);
    });
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-800 text-white">
      <h1 className="text-4xl font-bold mb-8">Welcome to notNTA Game</h1>
      <input
        className="mb-4 p-2 rounded bg-gray-700"
        type="text"
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <div className="flex space-x-4">
        <button
          className="bg-blue-500 px-4 py-2 rounded"
          onClick={handleCreateGame}
        >
          Create Game
        </button>
        <div>
          <input
            className="mb-2 p-2 rounded bg-gray-700"
            type="text"
            placeholder="Room Code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
          />
          <button
            className="bg-green-500 px-4 py-2 rounded"
            onClick={handleJoinGame}
          >
            Join Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
