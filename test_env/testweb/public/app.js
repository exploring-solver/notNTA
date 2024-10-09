const socket = io('http://localhost:5000');
let team = null;

document.getElementById('joinRed').addEventListener('click', () => {
    team = 'red';
    socket.emit('joinGame', { team });
});

document.getElementById('joinBlue').addEventListener('click', () => {
    team = 'blue';
    socket.emit('joinGame', { team });
});

socket.on('playerJoined', (data) => {
    console.log('Players:', data.players);
});

socket.on('updateGameState', (data) => {
    document.getElementById('currentRound').innerText = data.currentRound;
    document.getElementById('redTeamScore').innerText = data.redTeamScore;
    document.getElementById('blueTeamScore').innerText = data.blueTeamScore;
    document.getElementById('teamTurn').innerText = team;
});

socket.on('gameOver', (data) => {
    document.getElementById('resultSection').innerText = `Game Over! Winner: ${data.winner}`;
});

function submitAnswer(isCorrect) {
    socket.emit('answerQuestion', { correct: isCorrect });
}
