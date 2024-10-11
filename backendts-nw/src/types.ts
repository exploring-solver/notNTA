export interface Player {
    id: string;
    name: string;
    team: 'red' | 'blue';
    score: number;
  }
  
  export interface Game {
    id: string;
    players: Player[];
    currentRound: number;
    // Other game properties
  }
  