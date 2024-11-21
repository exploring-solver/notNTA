import React from 'react';
import { useGameContext } from '../context/GameContext';

const WinnerScreen = () => {
  const { winner, setGameState } = useGameContext();

  const handleReturnToLobby = () => {
    setGameState('lobby');
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-4">Game Over!</h1>
      <h2 className="text-2xl mb-4">Winner: {winner}</h2>
      <button
        className="bg-blue-500 px-4 py-2 rounded"
        onClick={handleReturnToLobby}
      >
        Return to Lobby
      </button>
    </div>
  );
};

export default WinnerScreen;
