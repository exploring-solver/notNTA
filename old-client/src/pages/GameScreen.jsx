// pages/GameScreen.jsx

import React from 'react';
import { useGameContext } from '../context/GameContext';
import QuestionCard from '../components/QuestionCard';
import Timer from '../components/Timer';
import Scoreboard from '../components/Scoreboard';
import useSocket from '../hooks/useSocket';

const GameScreen = () => {
  const {
    currentQuestion,
    timer,
    gameData,
    setPlayers,
  } = useGameContext();
  
  const socket = useSocket();

  const handleAnswer = (answerId) => {
    // Emit the answerQuestion event to the server
    socket.emit('answerQuestion', {
      roomCode: gameData.roomCode,
      answer: answerId,
      questionId: currentQuestion._id,
      timeTaken: timer, // Assume timer is the time taken for this answer
    });
  };

  return (
    <div className="p-8 bg-gray-800 text-white min-h-screen">
      <Scoreboard />
      <Timer time={timer} />
      {currentQuestion && (
        <QuestionCard
          question={currentQuestion}
          onAnswer={handleAnswer}
        />
      )}
    </div>
  );
};

export default GameScreen;
