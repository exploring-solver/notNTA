import React from 'react';

const QuestionCard = ({ question, onAnswer }) => {
  return (
    <div className="bg-gray-700 p-6 rounded">
      <h3 className="text-xl mb-4">{question.questionText}</h3>
      <div className="grid grid-cols-2 gap-4">
        {question.options.map((option) => (
          <button
            key={option._id}
            className="bg-blue-500 p-2 rounded"
            onClick={() => onAnswer(option._id)}
          >
            {option.text}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuestionCard;
