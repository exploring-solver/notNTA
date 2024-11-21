import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GameProvider, useGameContext } from './context/GameContext';
import Home from './pages/Home';
import Lobby from './pages/Lobby';
import GameScreen from './pages/GameScreen';
import WinnerScreen from './pages/WinnerScreen';

const GameStateRouter = () => {
  const { gameState, gameData, isActiveGame } = useGameContext();

  if (!isActiveGame) {
    return <Home />;
  }

  switch (gameState) {
    case 'lobby':
      return <Navigate to={`/lobby/${gameData?.roomCode}`} />;
    case 'playing':
      return <Navigate to={`/game/${gameData?.roomCode}`} />;
    case 'ended':
      return <Navigate to={`/winner/${gameData?.roomCode}`} />;
    default:
      return <Navigate to="/" />;
  }
};

const App = () => {
  return (
    <GameProvider>
      <Router>
        <Routes>
          <Route path="/" element={<GameStateRouter />} />
          <Route path="/lobby/:roomCode" element={<Lobby />} />
          <Route path="/game/:roomCode" element={<GameScreen />} />
          <Route path="/winner/:roomCode" element={<WinnerScreen />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </GameProvider>
  );
};

export default App;