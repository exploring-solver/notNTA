import React, { useEffect, useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  setRoomCode,
  updatePlayers,
  updateGameStatus,
  initializeGame,
  selectPlayers,
  selectGameState
} from '../../redux/slices/gameSlice';
import { createGame, joinGame } from '../../api/game';
import { useGameData } from '../../context/GameDataContext';

const GameLobby = () => {
    const [inputRoomCode, setInputRoomCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const { socket, connect } = useSocket();
    const { storeGameData, clearGameData } = useGameData();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const user = JSON.parse(localStorage.getItem('user'));
    const players = useSelector(selectPlayers);
    const { roomCode } = useSelector(selectGameState);
  
    useEffect(() => {
      // Initialize game state when component mounts
      dispatch(initializeGame());
    }, [dispatch]);

    const handleCreateGame = async () => {
      if (!user) {
        setError('User not logged in');
        return;
      }
  
      console.log('Creating game with user:', user);
      setLoading(true);
      setError('');
  
      try {
        const response = await createGame();
        console.log('Game created:', response);
        
        dispatch(setRoomCode(response.roomCode));
        // dispatch(updateGameStatus('lobby'));
        connect();
        
        socket.emit('join', {
          token: localStorage.getItem('token'),
          roomCode: response.roomCode,
          userId: user.id,
          name: user.name,
          isHost: true
        });
  
        // Store initial game data
        storeGameData({
          roomCode: response.roomCode,
          userId: user.id,
          name: user.name,
          isHost: true
        });
        
        navigate(`/game/${response.roomCode}`);
      } catch (err) {
        console.error('Error creating game:', err);
        setError(err.message || 'Failed to create game');
        clearGameData();
      } finally {
        setLoading(false);
      }
    };
  
    const handleJoinGame = async (e) => {
      e.preventDefault();
      if (!user) {
        setError('User not logged in');
        return;
      }
  
      console.log('Joining game with code:', inputRoomCode, 'user:', user);
      setLoading(true);
      setError('');
  
      try {
        const response = await joinGame(inputRoomCode);
        console.log('Join game response:', response);
  
        dispatch(setRoomCode(inputRoomCode));
        // dispatch(updateGameStatus('lobby'));
        connect();
        
        socket.emit('join', {
          token: localStorage.getItem('token'),
          roomCode: inputRoomCode,
          userId: user.id,
          name: user.name,
          isHost: false
        });
  
        // Store initial game data
        storeGameData({
          roomCode: inputRoomCode,
          userId: user.id,
          name: user.name,
          isHost: false
        });
  
        navigate(`/game/${inputRoomCode}`);
      } catch (err) {
        console.error('Error joining game:', err);
        setError(err.message || 'Failed to join game');
        clearGameData();
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      if (!socket) return;

      const handlePlayerUpdate = ({ players: updatedPlayers }) => {
        dispatch(updatePlayers(updatedPlayers));
      };

      socket.on('userJoined', handlePlayerUpdate);
      socket.on('userLeft', handlePlayerUpdate);

      return () => {
        socket.off('userJoined', handlePlayerUpdate);
        socket.off('userLeft', handlePlayerUpdate);
      };
    }, [socket, dispatch]);

    // Return to login if no user
    if (!user) {
      return null;
    }

    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Game Lobby</h2>
            <p className="mt-2 text-gray-600">Welcome, {user.name}</p>
            <p className="mt-1 text-sm text-gray-500">@{user.username}</p>
          </div>

          <div className="space-y-6">
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <button
              onClick={handleCreateGame}
              disabled={loading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                loading
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              }`}
            >
              {loading ? 'Creating...' : 'Create New Game'}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or join existing</span>
              </div>
            </div>

            <form onSubmit={handleJoinGame} className="space-y-4">
              <div>
                <label htmlFor="roomCode" className="sr-only">Room Code</label>
                <input
                  id="roomCode"
                  type="text"
                  placeholder="Enter Room Code"
                  value={inputRoomCode}
                  onChange={(e) => setInputRoomCode(e.target.value.toUpperCase())}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                disabled={loading || !inputRoomCode}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  loading || !inputRoomCode
                    ? 'bg-indigo-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                }`}
              >
                {loading ? 'Joining...' : 'Join Game'}
              </button>
            </form>

            {players.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900">Players</h3>
                <ul className="mt-3 space-y-2">
                  {players.map((player) => (
                    <li
                      key={player.userId}
                      className="px-4 py-2 bg-gray-50 rounded-md flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{player.name}</span>
                      </div>
                      {player.isHost && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                          Host
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    );
};

export default GameLobby;