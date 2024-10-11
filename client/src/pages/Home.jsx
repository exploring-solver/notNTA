import React, { useState } from 'react';
import { createGame, joinGame } from '../services/api';
import { useGameContext } from '../context/GameContext';

const Home = () => {
  const { setGameState, setGameData } = useGameContext();
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');

  const handleCreateGame = async () => {
    if (name.trim() === '') return;
    const data = await createGame(name);
    setGameData({ roomCode: data.roomCode, isHost: true });
    setGameState('lobby');
  };

  const handleJoinGame = async () => {
    if (name.trim() === '' || roomCode.trim() === '') return;
    const data = await joinGame(name, roomCode);
    setGameData({ roomCode, isHost: false });
    setGameState('lobby');
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
