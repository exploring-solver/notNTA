import WebSocket from 'ws';

export class User {
  constructor(public ws: WebSocket, public userId: string) {}
}

export class SocketManager {
  // User and room management logic
}
