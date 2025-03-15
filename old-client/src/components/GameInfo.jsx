import React from 'react';
import { useGameContext } from '../context/GameDataContext';

const GameInfo = () => {
  const { gameData } = useGameContext();

  return (
    <div className="flex justify-between mb-4">
      <div>Round: {gameData.currentRound}</div>
      <div>
        Red Team: {gameData.redTeamScore} | Blue Team: {gameData.blueTeamScore}
      </div>
    </div>
  );
};

export default GameInfo;
