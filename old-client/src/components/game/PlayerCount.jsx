const PlayerCount = ({ count, onClick }) => (
    <button 
      onClick={onClick}
      className="absolute top-4 left-4 bg-gray-800 text-white px-4 py-2 rounded-lg"
    >
      Players: {count}
    </button>
  );