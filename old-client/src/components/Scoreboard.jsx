import React from 'react';
import { useGameContext } from '../context/GameContext';

const Scoreboard = () => {
  const { gameData } = useGameContext();

  return (
    <div className="flex justify-between mb-4">
      <div className="text-red-500">Red Team: {gameData.redTeamScore}</div>
      <div className="text-blue-500">Blue Team: {gameData.blueTeamScore}</div>
    </div>
  );
};

export default Scoreboard;
