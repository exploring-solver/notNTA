import { WebSocketServer } from "ws";


export class Game{

    private player1: WebSocketServer;
    private player2: WebSocketServer;
    private player3: WebSocketServer;
    private player4: WebSocketServer;
    private player5: WebSocketServer;
    private player6: WebSocketServer;
    private player7: WebSocketServer;
    private player8: WebSocketServer;
    private player9: WebSocketServer;
    private player10: WebSocketServer;

    constructor(player1: WebSocketServer, player2: WebSocketServer, player3: WebSocketServer, player4: WebSocketServer, player5: WebSocketServer, player6: WebSocketServer, player7: WebSocketServer, player8: WebSocketServer, player9: WebSocketServer, player10: WebSocketServer){
        this.player1 = player1;
        this.player2 = player2;
        this.player3 = player3;
        this.player4 = player4;
        this.player5 = player5;
        this.player6 = player6;
        this.player7 = player7;
        this.player8 = player8;
        this.player9 = player9;
        this.player10 = player10;
    }
}