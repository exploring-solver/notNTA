import { WebSocketServer } from 'ws';
import { GameManager } from './GameManager'
// const server = createServer({
//   cert: readFileSync('/path/to/cert.pem'),
//   key: readFileSync('/path/to/key.pem')
// });
const wss = new WebSocketServer({ port : 8080 });

const gameManager = new GameManager();

wss.on('connection', function connection(ws) {

  gameManager.addUser(ws)
  ws.on("disconnect" , () => gameManager.removeUser(ws))
});
