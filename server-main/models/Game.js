// models/Game.js

const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
  socketId: String,
  name: String,
  team: { type: String, enum: ['red', 'blue'], default: null },
  score: { type: Number, default: 0 },
  isHost: { type: Boolean, default: false },
});

const GameSettingsSchema = new mongoose.Schema({
  rounds: { type: Number, default: 3 },
  timePerQuestion: { type: Number, default: 120 }, // in seconds
  questionType: { type: String, default: 'MCQ' },
  maxPlayers: { type: Number, default: 10 },
});

const GameSchema = new mongoose.Schema({
  roomCode: { type: String, unique: true },
  hostId: { type: String, required: true },
  players: [PlayerSchema],
  settings: GameSettingsSchema,
  currentRound: { type: Number, default: 1 },
  gameState: { type: String, enum: ['lobby', 'playing', 'ended'], default: 'lobby' },
  redTeamScore: { type: Number, default: 0 },
  blueTeamScore: { type: Number, default: 0 },
  currentQuestionIndex: { type: Number, default: 0 },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  isActive: { type: Boolean, default: true },
});

module.exports = mongoose.model('Game', GameSchema);