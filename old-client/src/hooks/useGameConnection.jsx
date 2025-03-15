import { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { useDispatch } from 'react-redux';
import { updatePlayers, updateGameStatus, resetGame } from '../redux/slices/gameSlice';

export const useGameConnection = (roomCode, user, navigate) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [hasAttemptedReconnect, setHasAttemptedReconnect] = useState(false);
    const { socket, isConnected, connect, disconnect } = useSocket();
    const dispatch = useDispatch();

    console.log('useGameConnection: Initializing with roomCode:', roomCode);

    // This effect handles initial socket connection
    useEffect(() => {
        if (!socket && roomCode) {
            console.log('Establishing initial socket connection');
            connect();
        }
    }, [socket, roomCode, connect]);

    // This effect handles joining/reconnecting to the game
    useEffect(() => {
        connect();
        if (!socket || !user || !roomCode) return;

        console.log('Connection effect triggered. Connection status:', isConnected);

        const attemptConnection = () => {
            const storedGameData = localStorage.getItem('gameData');
            if (storedGameData) {
                const parsedGameData = JSON.parse(storedGameData);
                console.log('Found stored game data:', parsedGameData);

                if (parsedGameData?.roomCode === roomCode && parsedGameData?.userId === user.id) {
                    console.log('Attempting reconnection with stored data');
                    socket.emit('reconnectToGame', {
                        roomCode,
                        userId: user.id,
                        name: user.name,
                    });
                    return;
                }
            }

            console.log('Joining as new player');
            socket.emit('join', {
                token: localStorage.getItem('token'),
                roomCode,
                userId: user.id,
                name: user.name,
            });
        };

        // Only attempt connection if socket is actually connected
        if (isConnected && !hasAttemptedReconnect) {
            attemptConnection();
            setHasAttemptedReconnect(true);
        }

        // Cleanup only on component unmount
        return () => {
            if (socket) {
                console.log('Cleaning up game connection');
                // socket.emit('leaveGame', { roomCode });
                // Note: Don't disconnect socket here, just leave the game
            }
        };
    }, [socket, isConnected, roomCode, user, hasAttemptedReconnect]);

    // Additional effect to handle disconnection on page unload
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (socket && isConnected) {
                socket.emit('leaveGame', { roomCode });
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [socket, isConnected, roomCode]);

    return {
        loading,
        setLoading,
        error,
        setError,
        hasAttemptedReconnect,
        isConnected,
        connect, // Expose connect function for lobby usage
        disconnect // Expose disconnect function for cleanup
    };
};
