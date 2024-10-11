import React, { useEffect, useState } from 'react';

const Timer = ({ time }) => {
  const [seconds, setSeconds] = useState(time);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return <div className="text-2xl mb-4">Time Left: {seconds}s</div>;
};

export default Timer;
