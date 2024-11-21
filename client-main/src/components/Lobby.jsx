import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setRoomCode, updateSettings } from '../redux/slices/gameSlice';
import { setPlayers, addPlayer } from '../redux/slices/playerSlice';
import socket from '../sockets/socket';

const Lobby = () => {
  const [name, setName] = useState('');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const dispatch = useDispatch();
  const { roomCode } = useSelector((state) => state.game);
  const { players } = useSelector((state) => state.players);

  useEffect(() => {
    // Listen for server events
    socket.on('gameCreated', ({ roomCode }) => {
      dispatch(setRoomCode(roomCode));
    });

    socket.on('userJoined', ({ players }) => {
      dispatch(setPlayers(players));
    });

    return () => {
      socket.off('gameCreated');
      socket.off('userJoined');
    };
  }, [dispatch]);

  const handleCreateGame = () => {
    socket.emit('createGame', { name });
  };

  const handleJoinGame = () => {
    socket.emit('joinGame', { name, roomCode: roomCodeInput });
  };

  return (
    <div>
      <h1>Lobby</h1>
      <input
        type="text"
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      {!roomCode ? (
        <div>
          <button onClick={handleCreateGame}>Create Game</button>
          <input
            type="text"
            placeholder="Enter Room Code"
            value={roomCodeInput}
            onChange={(e) => setRoomCodeInput(e.target.value)}
          />
          <button onClick={handleJoinGame}>Join Game</button>
        </div>
      ) : (
        <div>
          <h2>Room Code: {roomCode}</h2>
          <ul>
            {players.map((player) => (
              <li key={player.socketId}>{player.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Lobby;
