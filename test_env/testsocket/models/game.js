// models/game.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GameSchema = new Schema({
  redTeamScore: {
    type: Number,
    default: 0
  },
  blueTeamScore: {
    type: Number,
    default: 0
  },
  currentRound: {
    type: Number,
    default: 1
  },
  totalRounds: {
    type: Number,
    default: 5
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Game', GameSchema);
