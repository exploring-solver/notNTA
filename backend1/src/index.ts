import { WebSocketServer } from 'ws';
import url from 'url';
import { extractUserId } from './auth';
import { connectDB } from './db';
import { User } from './SocketManager';
import { GameManager } from './GameManager';

const wss = new WebSocketServer({ port: 8080 });
const gameManager = new GameManager();

connectDB().then(() => {
  wss.on('connection', function connection(ws, req) {
    //@ts-ignore
    const token: string = url.parse(req.url, true).query.token;
    const userId = extractUserId(token);
    gameManager.addUser(new User(ws, userId));

    ws.on('close', () => {
      gameManager.removeUser(ws);
    });
  });

  console.log('WebSocket server is running on ws://localhost:8080');
});
