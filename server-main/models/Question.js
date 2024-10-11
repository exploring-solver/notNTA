// models/Question.js

const mongoose = require('mongoose');

const OptionSchema = new mongoose.Schema({
  text: String,
  isCorrect: Boolean,
});

const QuestionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [OptionSchema],
  subject: String,
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
  year: Number, // Year of PYQ
});

module.exports = mongoose.model('Question', QuestionSchema);
