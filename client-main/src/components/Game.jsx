import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import socket from '../sockets/socket';

const Game = () => {
  const { roomCode, gameState, currentRound } = useSelector((state) => state.game);

  useEffect(() => {
    // Listen for game events
    socket.on('gameStarted', ({ currentRound }) => {
      console.log(`Game started: Round ${currentRound}`);
    });

    socket.on('roundComplete', ({ currentRound }) => {
      console.log(`Round completed. Starting round ${currentRound}`);
    });

    return () => {
      socket.off('gameStarted');
      socket.off('roundComplete');
    };
  }, []);

  return (
    <div>
      <h1>Game</h1>
      <h2>Room Code: {roomCode}</h2>
      <p>Game State: {gameState}</p>
      <p>Current Round: {currentRound}</p>
    </div>
  );
};

export default Game;
