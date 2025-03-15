import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { SocketProvider } from './context/SocketContext';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import GameLobby from './components/game/GameLobby';
// import GameRoom from './components/game/GameRoom';
import GameBoard from './components/game/GameBoard';
import PrivateRoute from './components/common/PrivateRoute';
// import GameStateRouter from './components/game/GameStateRouter';
import { GameDataProvider } from './context/GameDataContext';
import { GameErrorBoundary } from './components/GameErrorBoundary';
import WinnerScreen from './components/game/WinnerScreen';

const App = () => {
  return (
    <Provider store={store}>
      <GameDataProvider>
        <SocketProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<LoginForm />} />
              <Route path="/register" element={<RegisterForm />} />
              <Route
                path="/lobby"
                element={
                  <PrivateRoute>
                    <GameLobby />
                  </PrivateRoute>
                }
              />
              {/* <Route
                path="/gameroom/:roomCode"
                element={
                  <PrivateRoute>
                    <GameErrorBoundary>
                      <GameStateRouter />
                      <GameRoom/>
                    </GameErrorBoundary>
                  </PrivateRoute>
                }
              /> */}
              <Route
                path="/game/:roomCode"
                element={
                  <PrivateRoute>
                    {/* <GameStateRouter /> */}
                    <GameBoard/>
                  </PrivateRoute>
                }
              />
              <Route
                path="/winner/:roomCode"
                element={
                  <PrivateRoute>
                    <WinnerScreen />
                  </PrivateRoute>
                }
              />
              <Route path="/" element={<Navigate to="/lobby" replace />} />
              <Route path="*" element={<Navigate to="/lobby" replace />} />
            </Routes>
          </Router>
        </SocketProvider>
      </GameDataProvider>
    </Provider>
  );
};

export default App;