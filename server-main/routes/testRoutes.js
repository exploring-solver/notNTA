const express = require('express');
const router = express.Router();
const Game = require('../models/Game');

class MonitoringController {
    constructor(io) {
        this.io = io;
    }

    // Get all active socket connections
    async getActiveConnections(req, res) {
        try {
            const connectedSockets = await this.io.fetchSockets();
            const connections = connectedSockets.map(socket => ({
                id: socket.id,
                userId: socket.userId || null,
                name: socket.name || null,
                roomCode: socket.roomCode || null,
                isHost: socket.isHost || false,
                handshake: {
                    time: socket.handshake.time,
                    address: socket.handshake.address,
                    headers: socket.handshake.headers['user-agent']
                }
            }));

            res.status(200).json({
                total: connections.length,
                connections
            });
        } catch (error) {
            console.error('Error fetching socket connections:', error);
            res.status(500).json({ message: 'Error fetching socket connections', error: error.message });
        }
    }

    // Get all active games with their players
    async getActiveGames(req, res) {
        try {
            const games = await Game.find({ gameState: { $ne: 'ended' } });
            
            const activeGames = games.map(game => ({
                roomCode: game.roomCode,
                gameState: game.gameState,
                playerCount: game.players.length,
                players: game.players.map(player => ({
                    userId: player.userId,
                    name: player.name,
                    isHost: player.isHost,
                    team: player.team,
                    connected: player.connected,
                    lastActive: player.lastActive
                })),
                settings: game.settings,
                createdAt: game.createdAt
            }));

            res.status(200).json({
                total: activeGames.length,
                games: activeGames
            });
        } catch (error) {
            console.error('Error fetching active games:', error);
            res.status(500).json({ message: 'Error fetching active games', error: error.message });
        }
    }

    // Get specific game details with real-time socket information
    async getGameDetails(req, res) {
        try {
            const { roomCode } = req.params;
            const game = await Game.findOne({ roomCode });

            if (!game) {
                return res.status(404).json({ message: 'Game not found' });
            }

            // Get all sockets in this room
            const sockets = await this.io.in(roomCode).fetchSockets();
            const connectedSocketIds = new Set(sockets.map(s => s.id));

            const players = game.players.map(player => ({
                userId: player.userId,
                name: player.name,
                isHost: player.isHost,
                team: player.team,
                socketId: player.socketId,
                isConnected: connectedSocketIds.has(player.socketId),
                lastActive: player.lastActive
            }));

            res.status(200).json({
                roomCode: game.roomCode,
                gameState: game.gameState,
                players,
                settings: game.settings,
                createdAt: game.createdAt,
                currentRound: game.currentRound,
                scores: {
                    redTeam: game.redTeamScore,
                    blueTeam: game.blueTeamScore
                },
                connectedSockets: sockets.map(socket => ({
                    id: socket.id,
                    userId: socket.userId,
                    name: socket.name
                }))
            });
        } catch (error) {
            console.error('Error fetching game details:', error);
            res.status(500).json({ message: 'Error fetching game details', error: error.message });
        }
    }

    // Get room statistics
    async getRoomStats(req, res) {
        try {
            const rooms = this.io.sockets.adapter.rooms;
            const roomStats = [];

            for (const [roomId, room] of rooms) {
                // Skip socket ID rooms
                if (roomId.length < 6) continue; 

                const game = await Game.findOne({ roomCode: roomId });
                if (game) {
                    roomStats.push({
                        roomCode: roomId,
                        connectedClients: room.size,
                        gameState: game.gameState,
                        totalPlayers: game.players.length,
                        activePlayers: game.players.filter(p => p.connected).length,
                        teams: {
                            red: game.players.filter(p => p.team === 'red').length,
                            blue: game.players.filter(p => p.team === 'blue').length,
                            unassigned: game.players.filter(p => !p.team).length
                        }
                    });
                }
            }

            res.status(200).json({
                totalRooms: roomStats.length,
                rooms: roomStats
            });
        } catch (error) {
            console.error('Error fetching room stats:', error);
            res.status(500).json({ message: 'Error fetching room stats', error: error.message });
        }
    }

    // Force disconnect a socket
    async forceDisconnectSocket(req, res) {
        try {
            const { socketId } = req.params;
            const socket = this.io.sockets.sockets.get(socketId);

            if (!socket) {
                return res.status(404).json({ message: 'Socket not found' });
            }

            socket.disconnect(true);
            res.status(200).json({ message: 'Socket disconnected successfully' });
        } catch (error) {
            console.error('Error disconnecting socket:', error);
            res.status(500).json({ message: 'Error disconnecting socket', error: error.message });
        }
    }

    // Close a game room
    async closeGameRoom(req, res) {
        try {
            const { roomCode } = req.params;
            const game = await Game.findOne({ roomCode });

            if (!game) {
                return res.status(404).json({ message: 'Game not found' });
            }

            // Notify all players and close the room
            this.io.to(roomCode).emit('gameForceClose', {
                message: 'Game room has been closed by admin'
            });

            // Disconnect all sockets from the room
            const sockets = await this.io.in(roomCode).fetchSockets();
            sockets.forEach(socket => {
                socket.leave(roomCode);
            });

            // Update game state
            game.gameState = 'ended';
            await game.save();

            res.status(200).json({ message: 'Game room closed successfully' });
        } catch (error) {
            console.error('Error closing game room:', error);
            res.status(500).json({ message: 'Error closing game room', error: error.message });
        }
    }
}

// Initialize routes
module.exports = (io) => {
    const controller = new MonitoringController(io);

    // Get all active socket connections
    router.get('/connections', controller.getActiveConnections.bind(controller));

    // Get all active games
    router.get('/games', controller.getActiveGames.bind(controller));

    // Get specific game details
    router.get('/games/:roomCode', controller.getGameDetails.bind(controller));

    // Get room statistics
    router.get('/rooms', controller.getRoomStats.bind(controller));

    // Force disconnect a socket
    router.post('/disconnect/:socketId', controller.forceDisconnectSocket.bind(controller));

    // Close a game room
    router.post('/rooms/:roomCode/close', controller.closeGameRoom.bind(controller));

    return router;
};