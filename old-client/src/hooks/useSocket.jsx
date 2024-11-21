// hooks/useSocket.js

import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import { useGameContext } from '../context/GameContext';

const SOCKET_SERVER_URL = 'http://localhost:5000';

const useSocket = () => {
  const { gameId } = useParams();
  const {
    gameState,
    setGameState,
    setPlayers,
    setCurrentQuestion,
    setTimer,
    setWinner,
  } = useGameContext();

  useEffect(() => {
    if (!gameId) return; // Do nothing if no gameId is present

    const socket = io(SOCKET_SERVER_URL);

    socket.emit('join', { gameId });

    // Handle connection events
    socket.on('connect', () => {
      console.log('Connected to socket server for game:', gameId);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });

    // Handle custom events
    socket.on('userJoined', (data) => {
      setPlayers(data.players);
    });

    socket.on('gameStarted', (data) => {
      setGameState('playing');
      setCurrentQuestion(data.question);
      setTimer(data.time);
    });

    socket.on('questionAnswered', (data) => {
      setPlayers(data.players);
    });

    socket.on('gameOver', (data) => {
      setGameState('ended');
      setWinner(data.winner);
    });

    // Clean up on unmount
    return () => {
      socket.disconnect();
    };
  }, [gameId, setGameState, setPlayers, setCurrentQuestion, setTimer, setWinner]);

  return null;
};

export default useSocket;
