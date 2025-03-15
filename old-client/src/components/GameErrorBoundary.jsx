import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert } from '@mui/material';
import { useSocket } from '../context/SocketContext';

export const GameErrorBoundary = ({ children }) => {
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!socket) return;

    const handleError = ({ message }) => {
      setError(message);
      setTimeout(() => {
        navigate('/lobby');
      }, 3000);
    };

    const handleDisconnect = () => {
      setError('Lost connection to server. Redirecting to lobby...');
      setTimeout(() => {
        navigate('/lobby');
      }, 3000);
    };

    socket.on('error', handleError);
    socket.on('disconnect', handleDisconnect);

    return () => {
      socket.off('error', handleError);
      socket.off('disconnect', handleDisconnect);
    };
  }, [socket, navigate]);

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return children;
};