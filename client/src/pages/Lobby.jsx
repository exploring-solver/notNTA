import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameContext } from '../context/GameContext';

const Lobby = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const {
    socket,
    gameData,
    setGameData,
    players,
    setPlayers,
    gameState,
    setGameState,
    leaveGame,
  } = useGameContext();

  useEffect(() => {
    if (!socket || !gameData) {
      console.log('Socket or gameData not available', { socket, gameData });
      return;
    }

    console.log('Emitting reconnectToGame event', {
      name: gameData.playerName,
      roomCode: roomCode,
      socketId: gameData.socketId,
    });

    // Emit reconnection event
    socket.emit('reconnectToGame', {
      name: gameData.playerName,
      roomCode: roomCode,
      socketId: gameData.socketId,
    });

    // Handle socket events
    socket.on('userJoined', (data) => {
      console.log('User joined:', data);
      setPlayers(data.players);
    });

    socket.on('gameStarted', (data) => {
      console.log('Game started:', data);
      setGameState('playing');
      navigate(`/game/${roomCode}`);
    });

    socket.on('userDisconnected', (data) => {
      console.log('User disconnected:', data);
      setPlayers((prevPlayers) =>
        prevPlayers.filter((player) => player.socketId !== data.id)
      );
    });

    socket.on('gameSettingsUpdated', (newSettings) => {
      console.log('Game settings updated:', newSettings);
      setGameData((prevData) => ({
        ...prevData,
        settings: newSettings,
      }));
    });

    // Clean up on unmount
    return () => {
      console.log('Cleaning up socket listeners');
      socket.off('userJoined');
      socket.off('gameStarted');
      socket.off('userDisconnected');
      socket.off('gameSettingsUpdated');
    };
  }, [socket, gameData, roomCode, setPlayers, setGameState, navigate]);

  const handleStartGame = () => {
    if (gameData && gameData.isHost) {
      console.log('Starting game for roomCode:', roomCode);
      socket.emit('startGame', { roomCode });
    } else {
      console.log('Start game attempt by non-host.');
    }
  };

  const handleLeaveGame = () => {
    console.log('Leaving game with roomCode:', roomCode);
    leaveGame();
    navigate('/');
  };

  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen">
      <h2 className="text-2xl font-bold mb-4">
        Lobby - Room Code: {roomCode || 'N/A'}
      </h2>
      <ul className="mb-4">
        {players && players.length > 0 ? (
          players.map((player) => (
            <li key={player.socketId} className="mb-2">
              {player.name} {player.isHost ? '(Host)' : ''}
            </li>
          ))
        ) : (
          <li>No players connected yet.</li>
        )}
      </ul>
      {gameData?.isHost && (
        <button
          className="bg-blue-500 px-4 py-2 rounded mr-4"
          onClick={handleStartGame}
        >
          Start Game
        </button>
      )}
      <button
        className="bg-red-500 px-4 py-2 rounded"
        onClick={handleLeaveGame}
      >
        Leave Game
      </button>
    </div>
  );
};

export default Lobby;
