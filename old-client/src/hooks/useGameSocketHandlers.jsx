import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
    updatePlayers,
    updateGameStatus,
    updateGameState,
    updatePlayerStatus,
    updateScores,
    setWinner,
    resetGame
} from '../redux/slices/gameSlice';

export const useGameSocketHandlers = (socket, setLoading, setError, navigate) => {
    const dispatch = useDispatch();

    useEffect(() => {
        if (!socket) return;

        console.log('Setting up socket event handlers');

        const handlers = {
            userJoined: ({ players }) => {
                console.log('User joined, updating players:', players);
                dispatch(updatePlayers(players.map(p => ({ ...p, connected: true }))));
                setLoading(false);
            },

            userLeft: ({ userId }) => {
                console.log('User left:', userId);
                dispatch(updatePlayers(currentPlayers => 
                    currentPlayers.filter(p => p.userId !== userId)
                ));
            },

            userReconnected: ({ userId }) => {
                console.log('User reconnected:', userId);
                dispatch(updatePlayerStatus({ userId, updates: { connected: true } }));
            },

            gameStateUpdate: ({ round, question, timeRemaining, roundInProgress }) => {
                console.log('Game state update received');
                dispatch(updateGameState({ round, question, timeRemaining, roundInProgress }));
            },

            roundStarted: ({ question, round, timeLimit }) => {
                console.log('Round started:', { round, timeLimit });
                dispatch(updateGameState({
                    round,
                    question,
                    timeRemaining: timeLimit,
                    roundInProgress: true
                }));
            },

            questionAnswered: ({ userId, isCorrect, scoreChange }) => {
                console.log('Question answered:', { userId, isCorrect, scoreChange });
                dispatch(updatePlayerStatus({
                    userId,
                    updates: {
                        hasAnswered: true,
                        lastAnswer: { isCorrect, scoreChange }
                    }
                }));
            },

            roundComplete: ({ scores }) => {
                console.log('Round complete:', scores);
                dispatch(updateGameState({ roundInProgress: false }));
                dispatch(updateScores(scores));
            },

            gameStarted: () => {
                console.log('Game started');
                dispatch(updateGameStatus('playing'));
            },

            gameEnded: () => {
                console.log('Game ended');
                dispatch(updateGameStatus('ended'));
            },

            kicked: () => {
                console.log('Player kicked');
                localStorage.removeItem('roomCode');
                dispatch(resetGame());
                navigate('/lobby');
            },

            reconnectSuccess: ({ gameState, players }) => {
                console.log('Reconnection successful');
                dispatch(updateGameStatus(gameState));
                dispatch(updatePlayers(players));
                setLoading(false);
            },

            reconnectFailed: () => {
                console.log('Reconnection failed');
                localStorage.removeItem('gameData');
                localStorage.removeItem('roomCode');
                setError('Failed to reconnect to game');
                setLoading(false);
                setTimeout(() => navigate('/lobby'), 2000);
            },

            error: ({ message }) => {
                console.error('Game error:', message);
                setError(message);
                setLoading(false);
            }
        };

        // Register all handlers
        Object.entries(handlers).forEach(([event, handler]) => {
            console.log(`Registering handler for ${event}`);
            socket.on(event, handler);
        });

        // Cleanup function
        return () => {
            console.log('Cleaning up socket handlers');
            Object.entries(handlers).forEach(([event]) => {
                socket.off(event);
            });
        };
    }, [socket, dispatch, navigate, setLoading, setError]);
};