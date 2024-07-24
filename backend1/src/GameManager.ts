import { Game } from './Game';
import { User } from './SocketManager';

export class GameManager {
  private games: Map<string, Game> = new Map();

  addUser(user: User) {
    // Add user to a game
  }

  removeUser(ws: WebSocket) {
    // Remove user from a game
  }

  createGame() {
    const newGame = new Game();
    // Save to db and manage game logic
  }
}
