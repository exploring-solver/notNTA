// // src/components/game/GameRoom.js
// import React, { useEffect, useState, useCallback } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { useSocket } from '../../context/SocketContext';
// import { useDispatch, useSelector } from 'react-redux';
// import { setPlayers, setGameState, resetGame, handlePlayerJoined, handlePlayersUpdate } from '../../redux/slices/gameSlice';

// const PlayerCard = ({ player, isCurrentUser }) => {
//     return (
//         <div className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400">
//             <div className="absolute top-2 right-2">
//                 <div className={`h-3 w-3 rounded-full ${player.connected ? 'bg-green-500' : 'bg-red-500'
//                     }`} />
//             </div>
//             <div className="flex-shrink-0">
//                 <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center">
//                     <span className="text-white font-medium">
//                         {player.name[0]}
//                     </span>
//                 </div>
//             </div>
//             <div className="flex-1 min-w-0">
//                 <p className="text-sm font-medium text-gray-900 flex items-center">
//                     {player.name}
//                     {player.isHost && (
//                         <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
//                             Host
//                         </span>
//                     )}
//                     {isCurrentUser && (
//                         <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
//                             You
//                         </span>
//                     )}
//                 </p>
//                 <p className="text-sm text-gray-500 truncate">
//                     {player.team ? `Team ${player.team}` : 'No team'}
//                 </p>
//             </div>
//         </div>
//     );
// };

// const GameRoom = () => {
//     const { roomCode } = useParams();
//     const { socket, isConnected, connect ,disconnect} = useSocket();
//     const dispatch = useDispatch();
//     const navigate = useNavigate();

//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState('');
//     const [hasAttemptedReconnect, setHasAttemptedReconnect] = useState(false);

//     const user = JSON.parse(localStorage.getItem('user'));
//     const { players, gameState } = useSelector((state) => state.game);

//     const updatePlayerConnection = useCallback((userId, connected) => {
//         dispatch(setPlayers(
//             players.map(player =>
//                 player.userId === userId
//                     ? { ...player, connected }
//                     : player
//             )
//         ));
//     }, [players, dispatch]);

//     useEffect(() => {
//         connect();
//         const attemptConnection = () => {
//             if (!socket || !user) return;

//             const storedGameData = localStorage.getItem('gameData');
//             const parsedGameData = storedGameData ? JSON.parse(storedGameData) : null;

//             if (parsedGameData?.roomCode === roomCode && parsedGameData?.userId === user.id) {
//                 console.log('Attempting reconnection with stored data:', parsedGameData);
//                 socket.emit('reconnectToGame', {
//                     roomCode,
//                     userId: user.id,
//                     name: user.name,
//                 });
//             } else {
//                 console.log('Joining as new player');
//                 socket.emit('join', {
//                     token: localStorage.getItem('token'),
//                     roomCode,
//                     userId: user.id,
//                     name: user.name,
//                 });
//             }
//         };

//         if (isConnected && !hasAttemptedReconnect) {
//             attemptConnection();
//             setHasAttemptedReconnect(true);
//         }
//     }, [socket, isConnected, roomCode, user, hasAttemptedReconnect, connect]);

//     useEffect(() => {
//         if (socket) {

//             const handleUserJoined = ({ players: updatedPlayers }) => {
//                 console.log('User joined, updating players:', updatedPlayers);
//                 const playersWithConnection = updatedPlayers.map(player => ({
//                     ...player,
//                     connected: true
//                 }));
//                 dispatch(setPlayers(playersWithConnection));
//                 setLoading(false);
//             };

//             const handleUserLeft = ({ userId }) => {
//                 console.log('User left:', userId);
//                 dispatch(setPlayers(players.filter(p => p.userId !== userId)));
//             };

//             const handlePlayersUpdate = ({ players: updatedPlayers }) => {
//                 console.log('Players update:', updatedPlayers);
//                 dispatch(setPlayers(updatedPlayers));
//             };

//             const handleUserReconnected = ({ userId }) => {
//                 updatePlayerConnection(userId, true);
//             };

//             const handleGameStarted = () => {
//                 console.log('Game started');
//                 dispatch(setGameState('playing'));
//             };

//             const handleGameEnded = () => {
//                 console.log('Game ended');
//                 dispatch(setGameState('ended'));
//             };

//             const handleKicked = () => {
//                 console.log('You were kicked from the game');
//                 localStorage.removeItem('roomCode'); // Clean up stored room code
//                 dispatch(resetGame());
//                 navigate('/lobby');
//             };

//             const handleError = ({ message }) => {
//                 console.error('Game error:', message);
//                 setError(message);
//                 setLoading(false);
//             };

//             const handleReconnectSuccess = ({ gameState, players: updatedPlayers }) => {
//                 dispatch(setGameState(gameState));
//                 dispatch(setPlayers(updatedPlayers.map(player => ({
//                     ...player,
//                     connected: true
//                 }))));
//                 setLoading(false);
//             };

//             const handleReconnectFailed = () => {
//                 localStorage.removeItem('gameData');
//                 localStorage.removeItem('roomCode');
//                 setError('Failed to reconnect to game');
//                 setLoading(false);
//                 setTimeout(() => navigate('/lobby'), 2000);
//             };
//             const handleGameJoined = (data) => {
//                 console.log('Game joined successfully:', data);
//                 localStorage.setItem('gameData', JSON.stringify({
//                     roomCode: data.roomCode,
//                     userId: user.id,
//                     name: user.name,
//                     isHost: data.isHost
//                 }));
//                 setLoading(false);
//             };

//             const handleClearGameData = () => {
//                 localStorage.removeItem('gameData');
//                 localStorage.removeItem('roomCode');
//             };

//             socket.on('playerJoined', (data) => {
//                 dispatch(handlePlayerJoined(data));
//               });
          
//               socket.on('playersUpdate', (data) => {
//                 dispatch(handlePlayersUpdate(data));
//               });
//             // Set up event listeners
//             socket.on('userJoined', handleUserJoined);
//             socket.on('userLeft', handleUserLeft);
//             socket.on('gameStarted', handleGameStarted);
//             socket.on('gameEnded', handleGameEnded);
//             socket.on('playersUpdated', handlePlayersUpdate);
//             socket.on('kicked', handleKicked);
//             socket.on('error', handleError);
//             socket.on('reconnectSuccess', handleReconnectSuccess);
//             socket.on('reconnectFailed', handleReconnectFailed);
//             socket.on('gameJoined', handleGameJoined);
//             socket.on('clearGameData', handleClearGameData);
//             socket.on('userReconnected', handleUserReconnected);
//             // Cleanup function
//             return () => {
//                 socket.off('userJoined', handleUserJoined);
//                 socket.off('userLeft', handleUserLeft);
//                 socket.off('gameStarted', handleGameStarted);
//                 socket.off('gameEnded', handleGameEnded);
//                 socket.off('userReconnected', handleUserReconnected);
//                 socket.off('kicked', handleKicked);
//                 socket.off('error', handleError);
//                 socket.off('reconnectSuccess', handleReconnectSuccess);
//                 socket.off('reconnectFailed', handleReconnectFailed);
//                 socket.off('gameJoined', handleGameJoined);
//                 socket.off('clearGameData', handleClearGameData);
//                 socket.off('playerJoined');
//                 socket.off('playersUpdate');
//                 socket.off('playersUpdated', handlePlayersUpdate);
//             };
//         }
//     }, [socket, dispatch, navigate]);

//     const handleStartGame = () => {
//         if (!socket || !isConnected) {
//             setError('Not connected to server');
//             return;
//         }
//         console.log('Attempting to start game');
//         socket.emit('startGame', { roomCode });
//     };

//     const handleLeaveGame = () => {
//         if (socket && isConnected) {
//             console.log('Leaving game:', roomCode);
//             socket.emit('leaveGame', { roomCode });
//             dispatch(setPlayers(players.filter(p => p.userId !== user.id)));
//             disconnect();
//         }
//         localStorage.removeItem('roomCode');
//         localStorage.removeItem('gameData');
//         dispatch(resetGame());
//         navigate('/lobby');
//     };

//     if (loading) {
//         return (
//             <div className="min-h-screen flex items-center justify-center bg-gray-100">
//                 <div className="text-center">
//                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
//                     <p className="mt-4 text-gray-600">
//                         {hasAttemptedReconnect ? 'Reconnecting to game...' : 'Connecting to game...'}
//                     </p>
//                 </div>
//             </div>
//         );
//     }
//     console.log(players)
//     return (
//         <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
//             <div className="max-w-3xl mx-auto">
//                 <div className="bg-white shadow rounded-lg overflow-hidden">
//                     {/* Connection Status */}
//                     {!isConnected && (
//                         <div className="bg-yellow-50 px-4 py-2 text-sm text-yellow-700">
//                             Connecting to server...
//                         </div>
//                     )}

//                     {/* Header */}
//                     <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
//                         <div className="flex justify-between items-center">
//                             <div>
//                                 <h3 className="text-lg leading-6 font-medium text-gray-900">
//                                     Game Room
//                                 </h3>
//                                 <p className="mt-1 text-sm text-gray-500">Room Code: {roomCode}</p>
//                             </div>
//                             <button
//                                 onClick={handleLeaveGame}
//                                 className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
//                             >
//                                 Leave Game
//                             </button>
//                         </div>
//                     </div>

//                     {/* Error Display */}
//                     {error && (
//                         <div className="px-4 py-3 bg-red-50 border-b border-red-200">
//                             <div className="text-sm text-red-700">{error}</div>
//                         </div>
//                     )}

//                     {/* Players List */}
//                     <div className="px-4 py-5 sm:p-6">
//                         <h4 className="text-lg font-medium text-gray-900 mb-4">Players</h4>
//                         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//                             {players.map((player) => (
//                                 <PlayerCard
//                                     key={player.userId}
//                                     player={player}
//                                     isCurrentUser={player.userId === user?.id}
//                                 />
//                             ))}
//                         </div>
//                     </div>

//                     {/* Game Controls */}
//                     <div className="px-4 py-4 sm:px-6 bg-gray-50 border-t border-gray-200">
//                         {players.find((p) => p.userId === user?.id)?.isHost && (
//                             <button
//                                 onClick={handleStartGame}
//                                 disabled={players.length < 2 || !isConnected}
//                                 className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${players.length < 2 || !isConnected
//                                     ? 'bg-indigo-400 cursor-not-allowed'
//                                     : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
//                                     }`}
//                             >
//                                 {!isConnected
//                                     ? 'Connecting...'
//                                     : players.length < 2
//                                         ? 'Waiting for Players...'
//                                         : 'Start Game'}
//                             </button>
//                         )}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default GameRoom;