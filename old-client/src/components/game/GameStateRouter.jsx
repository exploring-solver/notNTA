// import React, { useEffect } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import { useSelector, useDispatch } from 'react-redux';
// import { useSocket } from '../../context/SocketContext';
// import GameRoom from './GameRoom';
// import GameBoard from './GameBoardOld';
// import WinnerScreen from './WinnerScreen';

// const GameStateRouter = () => {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const { roomCode } = useParams();
//   const { socket } = useSocket();
  
//   const gameState = useSelector(state => state.game.gameState);
//   const isAuthenticated = useSelector(state => state.auth.isAuthenticated);

//   useEffect(() => {
//     console.log('GameStateRouter: Current game state:', gameState);
//     console.log('GameStateRouter: Room code:', roomCode);
//     console.log('GameStateRouter: Authentication status:', isAuthenticated);

//     if (!isAuthenticated) {
//       console.log('GameStateRouter: User not authenticated, redirecting to login');
//       navigate('/login');
//       return;
//     }

//     if (!roomCode) {
//       console.log('GameStateRouter: No room code, redirecting to lobby');
//       navigate('/lobby');
//       return;
//     }

//     const handleGameState = (state) => {
//       console.log('GameStateRouter: Handling game state change:', state);
      
//       // Don't navigate if we're already on the correct route
//       const currentPath = window.location.pathname;
//       const targetPath = getTargetPath(state, roomCode);
      
//       if (currentPath !== targetPath) {
//         console.log(`GameStateRouter: Navigating from ${currentPath} to ${targetPath}`);
//         navigate(targetPath);
//       } else {
//         console.log('GameStateRouter: Already on correct route');
//       }
//     };

//     const getTargetPath = (state, roomCode) => {
//       switch (state) {
//         case 'playing':
//           return `/game/${roomCode}`;
//         case 'ended':
//           return `/winner/${roomCode}`;
//         case 'lobby':
//           return `/gameroom/${roomCode}`;
//         default:
//           return '/lobby';
//       }
//     };

//     handleGameState(gameState);

//     socket?.on('gameStateChanged', ({ newState }) => {
//       console.log('GameStateRouter: Received gameStateChanged event:', newState);
//       handleGameState(newState);
//     });

//     return () => {
//       console.log('GameStateRouter: Cleaning up socket listeners');
//       socket?.off('gameStateChanged');
//     };
//   }, [gameState, roomCode, navigate, socket, isAuthenticated]);

//   console.log('GameStateRouter: Rendering component for state:', gameState);
  
//   // Render appropriate component based on game state
//   switch (gameState) {
//     case 'playing':
//       return <GameBoard />;
//     case 'ended':
//       return <WinnerScreen />;
//     case 'lobby':
//     default:
//       return <GameRoom />;
//   }
// };


// export default GameStateRouter;