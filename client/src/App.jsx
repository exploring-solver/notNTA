// App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import Home from './pages/Home';
import Lobby from './pages/Lobby';
import GameScreen from './pages/GameScreen';
import WinnerScreen from './pages/WinnerScreen';

const App = () => {
  return (
    <GameProvider>
      <Router>
        <Routes>
          {/* Home route */}
          <Route path="/" element={<Home />} />

          {/* Lobby route */}
          <Route path="/game/:gameId/lobby" element={<Lobby />} />

          {/* Game screen route */}
          <Route path="/game/:gameId" element={<GameScreen />} />

          {/* Winner screen route */}
          <Route path="/game/:gameId/winner" element={<WinnerScreen />} />

          {/* Redirect unknown routes to Home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </GameProvider>
  );
};

export default App;
