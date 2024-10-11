const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true }, // (optional)
  gamesPlayed: { type: Number, default: 0 },
  totalScore: { type: Number, default: 0 },
});

module.exports = mongoose.model('User', UserSchema);
