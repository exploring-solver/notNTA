// import React, { useState, useEffect, useContext } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { Box, Container, Grid, Paper, CircularProgress, Alert } from '@mui/material';
// import { useSocket } from '../../context/SocketContext';
// import { 
//   setPlayers, 
//   setGameState, 
//   resetGame, 
//   handlePlayerJoined, 
//   handlePlayersUpdate,
//   updatePlayer,
//   selectPlayers,
//   selectIsHost 
// } from '../../redux/slices/gameSlice';
// import { 
//   setCurrentQuestion, 
//   setCurrentRound, 
//   setRoundInProgress,
//   setTimeRemaining,
//   updateTeamScores,
//   setWinner, 
//   initializeGameState
// } from '../../redux/slices/gameStateSlice';
// import { HostControls, WinnerDisplay, PlayerCount } from './GameUtilComponents';
// import { TeamBox } from './TeamBox';
// import { GameStatus } from './GameStatus';
// import { PlayerList } from './PlayersList';

// const GameBoard = () => {
//   console.log('Rendering GameBoard component');
  
//   const dispatch = useDispatch();
//   const { socket, isConnected } = useSocket();
//   const [showPlayerList, setShowPlayerList] = useState(false);
//   const [error, setError] = useState('');

//   // Redux selectors
//   const players = useSelector(selectPlayers);
//   const gameState = useSelector(state => state.gameState);
//   console.log("gamestate", gameState);
//   const user = JSON.parse(localStorage.getItem('user'));
//   const isHost = useSelector(state => selectIsHost(state, user?.id));
//   const gameLoaded = useSelector(state => state.gameState.gameLoaded);

//   useEffect(() => {
//     console.log('GameBoard useEffect: Checking gameLoaded status');
//     if (!gameLoaded) {
//       console.log('Game is not loaded. Dispatching initializeGameState.');
//       dispatch(initializeGameState());
//     }
//   }, [gameLoaded, dispatch]);

//   if (!gameLoaded) {
//     console.log('Game is loading, displaying loader');
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
//         <CircularProgress />
//       </Box>
//     );
//   }

//   useEffect(() => {
//     console.log('Setting up socket listeners');
//     if (!socket) {
//       console.warn('No socket found, skipping setup');
//       return;
//     }

//     socket.on('roundStarted', ({ question, round, timeLimit }) => {
//       console.log('Socket event: roundStarted', { question, round, timeLimit });
//       dispatch(setCurrentQuestion(question));
//       dispatch(setCurrentRound(round));
//       dispatch(setRoundInProgress(true));
//       dispatch(setTimeRemaining(timeLimit));
//     });

//     socket.on('questionAnswered', ({ playerId, isCorrect, scoreChange }) => {
//       console.log('Socket event: questionAnswered', { playerId, isCorrect, scoreChange });
//       dispatch(updatePlayer({ 
//         userId: playerId, 
//         updates: { 
//           hasAnswered: true,
//           lastAnswer: { isCorrect, scoreChange }
//         }
//       }));
//     });

//     socket.on('roundComplete', ({ currentRound, scores }) => {
//       console.log('Socket event: roundComplete', { currentRound, scores });
//       dispatch(setRoundInProgress(false));
//       dispatch(updateTeamScores(scores));
//     });

//     socket.on('gameOver', ({ winner, finalScores }) => {
//       console.log('Socket event: gameOver', { winner, finalScores });
//       dispatch(setWinner(winner));
//       dispatch(updateTeamScores(finalScores));
//       dispatch(setGameState('ended'));
//     });

//     socket.on('timerUpdate', ({ timeRemaining }) => {
//       console.log('Socket event: timerUpdate', { timeRemaining });
//       dispatch(setTimeRemaining(timeRemaining));
//     });

//     socket.on('playerJoinedTeam', ({ player, team }) => {
//       console.log('Socket event: playerJoinedTeam', { player, team });
//       dispatch(updatePlayer({ userId: player.userId, updates: { team } }));
//     });

//     socket.on('error', ({ message }) => {
//       console.error('Socket event: error', message);
//       setError(message);
//     });

//     return () => {
//       console.log('Cleaning up socket listeners');
//       socket.off('roundStarted');
//       socket.off('questionAnswered');
//       socket.off('roundComplete');
//       socket.off('gameOver');
//       socket.off('timerUpdate');
//       socket.off('playerJoinedTeam');
//       socket.off('error');
//     };
//   }, [socket, dispatch]);

//   const handleAnswer = (answer) => {
//     console.log('handleAnswer called with', { answer });
//     if (!socket || !isConnected) {
//       console.warn('Socket not connected, cannot send answer');
//       return;
//     }

//     const questionId = gameState.currentQuestion?.id;
//     const timeTaken = 120 - gameState.timeRemaining; // Assuming 120s is max time

//     console.log('Emitting answerQuestion event', { answer, questionId, timeTaken });

//     socket.emit('answerQuestion', {
//       roomCode: localStorage.getItem('roomCode'),
//       answer,
//       questionId,
//       timeTaken
//     });
//   };
  
//   return (
//     <Container maxWidth="xl">
//       <Box sx={{ position: 'relative', p: 4, minHeight: '100vh' }}>
//         <Box sx={{ position: 'absolute', top: 16, left: 16 }}>
//           <PlayerCount 
//             count={players.length} 
//             onClick={() => {
//               console.log('Toggling player list visibility');
//               setShowPlayerList(!showPlayerList);
//             }}
//           />
//         </Box>

//         {showPlayerList && (
//           <Box sx={{ 
//             position: 'absolute', 
//             top: 80, 
//             left: 16, 
//             zIndex: 10,
//             width: 300 
//           }}>
//             <PlayerList 
//               players={players}
//               currentUserId={user?.id}
//             />
//           </Box>
//         )}
        
//         {error && (
//           <Alert 
//             severity="error" 
//             onClose={() => {
//               console.log('Clearing error message');
//               setError('');
//             }}
//             sx={{ mb: 2 }}
//           >
//             {error}
//           </Alert>
//         )}
        
//         <Grid 
//           container 
//           spacing={3} 
//           sx={{ 
//             mt: 8,
//             justifyContent: 'space-between',
//             alignItems: 'flex-start'
//           }}
//         >
//           <Grid item xs={12} md={3}>
//             <TeamBox 
//               team="blue" 
//               players={players.filter(p => p.team === 'blue')}
//               score={gameState.blueTeamScore}
//               socket={socket}
//               isConnected={isConnected}
//               currentUserId={user?.id}
//             />
//           </Grid>
          
//           <Grid item xs={12} md={5}>
//             <Paper 
//               elevation={3} 
//               sx={{ 
//                 p: 3,
//                 textAlign: 'center',
//                 minHeight: 400
//               }}
//             >
//               <GameStatus 
//                 currentRound={gameState.currentRound}
//                 timeRemaining={gameState.timeRemaining}
//                 question={gameState.currentQuestion}
//                 onAnswer={handleAnswer}
//                 isRoundInProgress={gameState.roundInProgress}
//               />
//             </Paper>
//           </Grid>
          
//           <Grid item xs={12} md={3}>
//             <TeamBox 
//               team="red" 
//               players={players.filter(p => p.team === 'red')}
//               score={gameState.redTeamScore}
//               socket={socket}
//               isConnected={isConnected}
//               currentUserId={user?.id}
//             />
//           </Grid>
//         </Grid>
        
//         {isHost && (
//           <HostControls 
//             socket={socket}
//             isConnected={isConnected}
//             players={players}
//           />
//         )}
        
//         {gameState.winner && (
//           <WinnerDisplay 
//             winner={gameState.winner}
//             blueTeamScore={gameState.blueTeamScore}
//             redTeamScore={gameState.redTeamScore}
//           />
//         )}
//       </Box>
//     </Container>
//   );
// };

// export default GameBoard;
