const socket = io('http://localhost:5000');
let team = null;
let game = null;
// Function to start a new game
function startGame() {
    fetch('http://localhost:5000/api/game/new', {
    method: 'POST'
  })
  .then(response => response.json())
  .then(data => {
    game = data;
    console.log('game id',game._id);
    console.log('Game created:', game);
    
    localStorage.setItem('gameId', game._id); // Store game._id in local storage
    // Hide the Start Game button
    document.querySelector('button[onclick="startGame()"]').style.display = 'none';
    // Show the join team buttons
    document.querySelector('button[onclick="joinTeam(\'red\')"]').style.display = 'inline-block';
    document.querySelector('button[onclick="joinTeam(\'blue\')"]').style.display = 'inline-block';
  })
  .catch(error => console.error('Error creating game:', error));
}

const storedGameId = localStorage.getItem('gameId');
// Function to join a team
function joinTeam(selectedTeam) {
  team = selectedTeam;
  socket.emit('joinGame', { team, gameId: storedGameId });
  // Hide the join team buttons
  document.querySelector('button[onclick="joinTeam(\'red\')"]').style.display = 'none';
  document.querySelector('button[onclick="joinTeam(\'blue\')"]').style.display = 'none';
  // Show the game info and question sections
  document.getElementById('gameInfo').style.display = 'block';
  document.getElementById('questionSection').style.display = 'block';
}

// Socket event listeners
socket.on('playerJoined', (data) => {
  console.log('Players:', data.players);
});

socket.on('updateGameState', (data) => {
  document.getElementById('currentRound').innerText = data.currentRound;
  document.getElementById('redTeamScore').innerText = data.redTeamScore;
  document.getElementById('blueTeamScore').innerText = data.blueTeamScore;
  document.getElementById('teamTurn').innerText = data.currentTeamTurn;
});

socket.on('gameOver', (data) => {
  document.getElementById('resultSection').innerText = `Game Over! Winner: ${data.winner}`;
});

// Function to submit an answer
function submitAnswer(isCorrect) {
  socket.emit('answerQuestion', { correct: isCorrect, gameId: storedGameId });
}
