import { WebSocket } from 'ws';
import { INIT_GAME } from './messages';
import { Game } from './Game';


//User, Game
export class GameManager{
    private games: Game[];
    private pendingUser: WebSocket;
    private users: WebSocket[];

    constructor(){
        this.games = [];
    }

    addUser(socket: WebSocket) {
        this.users.push(socket);
    }

    removeUser(socket: WebSocket){
        this.users = this.users.filter(user => user !== socket);
        //Stop the game here because the user left
    }

    private addHandler(socket: WebSocket){
        socket.on("message", (data) => {
            const message = JSON.parse(data.toString());

            if(message.type === INIT_GAME){
                if(this.pendingUser){
                    //start game
                } else{
                    this.pendingUser = socket;
                }
            }
        })

    }
}

