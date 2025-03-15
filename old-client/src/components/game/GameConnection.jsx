import React, { useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useDispatch } from 'react-redux';
import { setGameState, setPlayers } from '../../redux/slices/gameSlice';
import { useNavigate } from 'react-router-dom';

const GameConnection = ({ roomCode }) => {
  const { socket, connect } = useSocket();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (roomCode && socket) {
      const handleReconnection = () => {
        console.log('Attempting to reconnect to game:', roomCode);
        const token = localStorage.getItem('token');
        
        socket.emit('reconnectToGame', {
          roomCode,
          token,
        });
      };

      const handleRejoinSuccess = (data) => {
        console.log('Successfully rejoined game:', data);
        dispatch(setGameState(data.gameState));
        dispatch(setPlayers(data.players));
      };

      const handleRejoinFailed = (error) => {
        console.error('Failed to rejoin game:', error);
        navigate('/lobby');
      };

      socket.on('rejoinSuccess', handleRejoinSuccess);
      socket.on('rejoinFailed', handleRejoinFailed);

      connect();
      handleReconnection();

      return () => {
        socket.off('rejoinSuccess', handleRejoinSuccess);
        socket.off('rejoinFailed', handleRejoinFailed);
      };
    }
  }, [socket, roomCode, dispatch, navigate, connect]);

  return null; // This is a utility component, no UI needed
};

export default GameConnection