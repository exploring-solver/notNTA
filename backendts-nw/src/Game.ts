export class Game {
    players: Player[] = [];
    currentRound: number = 0;
    maxRounds: number = 3;
  
    constructor(public id: string) {}
  
    addPlayer(player: Player) {
      this.players.push(player);
    }
  
    removePlayer(playerId: string) {
      this.players = this.players.filter(player => player.id !== playerId);
    }
  
    startGame() {
      // Logic to start the game
    }
  
    nextRound() {
      this.currentRound++;
      if (this.currentRound > this.maxRounds) {
        this.endGame();
      }
    }
  
    endGame() {
      // Logic to end the game and declare the winner
    }
  
    // Other game methods...
  }
  