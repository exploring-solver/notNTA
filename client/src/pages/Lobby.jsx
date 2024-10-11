// pages/Lobby.jsx

import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useGameContext } from '../context/GameContext';
import useSocket from '../hooks/useSocket';
import { getGameState } from '../services/api'; // Import the API function

const Lobby = () => {
  const { gameId } = useParams();
  const {
    gameData,
    setGameData,
    players,
    setPlayers,
    setGameState,
  } = useGameContext();
  const socket = useSocket();

  useEffect(() => {
    // Fetch the initial players list and game data
    const fetchGameData = async () => {
      try {
        const data = await getGameState(gameId);
        setGameData(data); // Set the game data in context
        setPlayers(data.players); // Set the players list in context
      } catch (error) {
        console.error('Error fetching game data:', error);
      }
    };

    if (gameId) {
      fetchGameData();
    }
  }, [gameId, setGameData, setPlayers]);

  const handleStartGame = () => {
    if (gameData && gameData.isHost) {
      socket.emit('startGame', { roomCode: gameData.roomCode });
    }
  };

  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Lobby - Room Code: {gameData?.roomCode}</h2>
      <ul className="mb-4">
        {players.map((player) => (
          <li key={player.socketId} className="mb-2">
            {player.name}
          </li>
        ))}
      </ul>
      {gameData?.isHost && (
        <button
          className="bg-blue-500 px-4 py-2 rounded"
          onClick={handleStartGame}
        >
          Start Game
        </button>
      )}
    </div>
  );
};

export default Lobby;
