import React, { useState } from 'react';
import socket from '../sockets/socket';

const Reconnect = () => {
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');

  const handleReconnect = () => {
    socket.emit('reconnectToGame', { name, roomCode });
  };

  return (
    <div>
      <h1>Reconnect to Game</h1>
      <input
        type="text"
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Enter Room Code"
        value={roomCode}
        onChange={(e) => setRoomCode(e.target.value)}
      />
      <button onClick={handleReconnect}>Reconnect</button>
    </div>
  );
};

export default Reconnect;
