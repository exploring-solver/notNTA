// src/context/SocketContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useDispatch } from 'react-redux';
import { setError, clearError } from '../redux/slices/errorSlice';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const dispatch = useDispatch();

  const logWithTimestamp = (message, ...args) => {
    console.log(`[${new Date().toISOString()}] ${message}`, ...args);
  };

  useEffect(() => {
    logWithTimestamp('Initializing socket connection...');
    const newSocket = io('http://localhost:5000', {
      autoConnect: false,
    });

    newSocket.on('connect', () => {
      logWithTimestamp('Socket connected');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      logWithTimestamp('Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('error', (error) => {
      logWithTimestamp('Socket error:', error);
      console.error(`[${new Date().toISOString()}] Error details:`, error);
      dispatch(setError(error.message));
    });

    setSocket(newSocket);

    return () => {
      logWithTimestamp('Cleaning up socket connection...');
      newSocket.close();
    };
  }, [dispatch]);

  const connect = () => {
    if (socket && !socket.connected) {
      logWithTimestamp('Attempting to connect socket...');
      socket.connect();
    } else {
      logWithTimestamp('Socket already connected or not initialized.');
    }
  };

  const disconnect = () => {
    if (socket) {
      logWithTimestamp('Disconnecting socket...');
      socket.disconnect();
    } else {
      logWithTimestamp('No socket to disconnect.');
    }
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, connect, disconnect }}>
      {children}
    </SocketContext.Provider>
  );
};
