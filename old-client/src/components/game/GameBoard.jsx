import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Container, Grid, Paper, Alert, CircularProgress, Button } from '@mui/material';
import { useSocket } from '../../context/SocketContext';

// Import custom hooks
import { useGameConnection } from '../../hooks/useGameConnection';
import { useGameSocketHandlers } from '../../hooks/useGameSocketHandlers';

import {
    selectGameState,
    selectPlayers,
    selectTeams,
    selectGameStatus,
    selectIsHost,
    initializeGame,
    updatePlayers,
    updateGameStatus,
    updateGameState,
    updateScores,
    updatePlayerStatus,
    setWinner,
    resetGame
} from '../../redux/slices/gameSlice';

// Import components
import { TeamBox } from './TeamBox';
import { GameStatus } from './GameStatus';
import { HostControls, WinnerDisplay, PlayerCount, PlayerCard } from './GameUtilComponents';

const GameBoard = () => {
    const { roomCode } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { socket, isConnected, disconnect, connect } = useSocket();

    // Local state
    const [showPlayerList, setShowPlayerList] = useState(false);
    const user = JSON.parse(localStorage.getItem('user'));
    // If no user, redirect to login
    useEffect(() => {
        if (!user) {
            navigate('/login', { state: { redirectTo: `/game/${roomCode}` } });
        }
    }, [user, navigate, roomCode]);
    
    // Use our custom hooks
    const {
        loading,
        setLoading,
        error,
        setError,
        hasAttemptedReconnect,
        isConnected: connectionStatus,
        handleGameConnection,
    } = useGameConnection(roomCode, user, navigate);
    
    // Add retry connection button if connection fails
    const handleRetryConnection = useCallback(() => {
        handleGameConnection();
    }, [handleGameConnection]);
    // Set up socket handlers
    useGameSocketHandlers(socket, setLoading, setError, navigate);

    // Redux state
    const gameState = useSelector(selectGameState);
    const players = useSelector(selectPlayers);
    const teams = useSelector(selectTeams);
    const gameStatus = useSelector(selectGameStatus);
    const isHost = useSelector(state => selectIsHost(state, user?.id));

    // Initialize game state
    useEffect(() => {
        console.log("Initializing game...");
        dispatch(initializeGame());
    }, [dispatch]);

    // Handlers
    const handleAnswer = useCallback((answer) => {
        console.log("Answer submitted:", answer);
        if (!socket || !isConnected) {
            console.log("Socket not connected. Cannot submit answer.");
            return;
        }
        socket.emit('answerQuestion', {
            roomCode,
            answer,
            questionId: gameState.currentQuestion?.id,
            timeTaken: 120 - gameState.timeRemaining
        });
    }, [socket, isConnected, roomCode, gameState]);

    const handleLeaveGame = useCallback(() => {
        console.log("Leaving game...");
        if (socket && isConnected) {
            socket.emit('leaveGame', { roomCode });
            dispatch(updatePlayers(players.filter(p => p.userId !== user?.id)));
            // disconnect();
        }
        localStorage.removeItem('roomCode');
        localStorage.removeItem('gameData');
        dispatch(resetGame());
        navigate('/lobby');
    }, [socket, isConnected, roomCode, user?.id, players, dispatch, disconnect, navigate]);

    const renderContent = () => {
        console.log("Rendering content. Loading state:", loading);
        if (loading) {
            return (
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh'
                }}>
                    <CircularProgress />
                    <Box sx={{ mt: 2 }}>
                        {hasAttemptedReconnect ? 'Reconnecting to game...' : 'Connecting to game...'}
                    </Box>
                </Box>
            );
        }
        // Render connection error with retry button
        if (error) {
            return (
                <Box sx={{ textAlign: 'center', mt: 4 }}>
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                    <Button variant="contained" onClick={handleRetryConnection}>
                        Retry Connection
                    </Button>
                </Box>
            );
        } 
        return (
            <Container maxWidth="xl">
                <Box sx={{ position: 'relative', p: 4, minHeight: '100vh' }}>
                    {/* Header */}
                    <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <PlayerCount
                            count={players.length}
                            onClick={() => setShowPlayerList(!showPlayerList)}
                        />
                        <Box sx={{ textAlign: 'center' }}>
                            <h3>Room Code: {roomCode}</h3>
                            {!isConnected && (
                                <Alert severity="warning" sx={{ mt: 1 }}>
                                    Connecting to server...
                                </Alert>
                            )}
                        </Box>
                        <Box>
                            <button onClick={handleLeaveGame}>Leave Game</button>
                        </Box>
                    </Box>

                    {/* Error Display */}
                    {error && (
                        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {/* Main Game Area */}
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={3}>
                            <TeamBox
                                team="blue"
                                players={teams.blue.players}
                                score={teams.blue.score}
                                socket={socket}
                                isConnected={isConnected}
                                currentUserId={user?.id}
                                gameStatus={gameStatus}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            {showPlayerList ? (
                                <Paper elevation={3} sx={{ p: 3 }}>
                                    <h4>Players</h4>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        {players.map((player) => (
                                            <PlayerCard
                                                key={player.userId}
                                                player={player}
                                                isCurrentUser={player.userId === user?.id}
                                            />
                                        ))}
                                    </div>
                                </Paper>
                            ) : (
                                <Paper elevation={3} sx={{ p: 3 }}>
                                    <GameStatus
                                        currentRound={gameState.currentRound}
                                        timeRemaining={gameState.timeRemaining}
                                        question={gameState.currentQuestion}
                                        onAnswer={handleAnswer}
                                        isRoundInProgress={gameState.roundInProgress}
                                        gameStatus={gameStatus}
                                    />
                                </Paper>
                            )}
                        </Grid>

                        <Grid item xs={12} md={3}>
                            <TeamBox
                                team="red"
                                players={teams.red.players}
                                score={teams.red.score}
                                socket={socket}
                                isConnected={isConnected}
                                currentUserId={user?.id}
                                gameStatus={gameStatus}
                            />
                        </Grid>
                    </Grid>

                    {/* Host Controls */}
                    {isHost && gameStatus === 'lobby' && (
                        <HostControls
                            socket={socket}
                            isConnected={isConnected}
                            players={players}
                            roomCode={roomCode}
                        />
                    )}

                    {/* Winner Display */}
                    {gameState.winner && (
                        <WinnerDisplay
                            winner={gameState.winner}
                            blueTeamScore={teams.blue.score}
                            redTeamScore={teams.red.score}
                            onPlayAgain={isHost ? () => socket.emit('startGame', { roomCode }) : undefined}
                        />
                    )}
                </Box>
            </Container>
        );
    };

    return renderContent();
};

export default GameBoard;