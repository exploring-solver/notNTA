import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Lobby from './components/Lobby';
import Game from './components/Game';
import Reconnect from './components/Reconnect';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/game" element={<Game />} />
        <Route path="/reconnect" element={<Reconnect />} />
      </Routes>
    </Router>
  );
};

export default App;
